(function () {
    "use strict";

    const SHEET_JS_SOURCES = [
        "https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js",
        "https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js"
    ];

    const PROCESSORS = {
        actuaciones: {
            labelSingular: "actuación",
            labelPlural: "actuaciones",
            filenamePrefix: "actuaciones-whatsapp",
            extensions: ["csv", "xlsx", "xls"],
            parser: window.SEC29Processors.parseActuacionesRows,
            formatter: window.SEC29Processors.formatActuacionesOutput
        },
        vencimientos: {
            labelSingular: "vencimiento",
            labelPlural: "vencimientos",
            filenamePrefix: "vencimientos-whatsapp",
            extensions: ["xlsx", "xls"],
            parser: window.SEC29Processors.parseVencimientosRows,
            formatter: window.SEC29Processors.formatVencimientosOutput
        }
    };

    function loadScript(source) {
        return new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = source;
            script.async = true;
            script.crossOrigin = "anonymous";
            script.onload = resolve;
            script.onerror = () => reject(new Error(`No se pudo cargar ${source}`));
            document.head.appendChild(script);
        });
    }

    async function ensureSheetJs() {
        if (window.XLSX) return;

        let lastError = null;

        for (const source of SHEET_JS_SOURCES) {
            try {
                await loadScript(source);
                if (window.XLSX) return;
            } catch (error) {
                lastError = error;
            }
        }

        throw lastError || new Error("No se pudo cargar el lector de archivos Excel.");
    }

    function getExtension(filename) {
        const parts = String(filename || "").toLocaleLowerCase("es-AR").split(".");
        return parts.length > 1 ? parts.pop() : "";
    }

    function decodeCsv(arrayBuffer) {
        try {
            return new TextDecoder("utf-8", { fatal: true }).decode(arrayBuffer);
        } catch (_error) {
            return new TextDecoder("windows-1252").decode(arrayBuffer);
        }
    }

    async function readWorkbookSheets(file) {
        const extension = getExtension(file.name);
        const buffer = await file.arrayBuffer();
        let workbook;

        if (extension === "csv") {
            const text = decodeCsv(buffer);
            workbook = window.XLSX.read(text, {
                type: "string",
                raw: false
            });
        } else {
            workbook = window.XLSX.read(new Uint8Array(buffer), {
                type: "array",
                raw: false,
                cellDates: false
            });
        }

        return workbook.SheetNames.map((sheetName) => {
            const worksheet = workbook.Sheets[sheetName];
            const rows = window.XLSX.utils.sheet_to_json(worksheet, {
                header: 1,
                raw: false,
                defval: "",
                blankrows: true
            });

            return { sheetName, rows };
        });
    }

    function processBestSheet(sheets, parser) {
        const candidates = [];
        const errors = [];

        for (const sheet of sheets) {
            try {
                const parsed = parser(sheet.rows);
                candidates.push({ ...parsed, sheetName: sheet.sheetName });
            } catch (error) {
                errors.push(error);
            }
        }

        if (candidates.length === 0) {
            throw errors[0] || new Error("No se encontró una hoja con la estructura esperada.");
        }

        candidates.sort((a, b) => b.items.length - a.items.length);
        return candidates[0];
    }

    function formatBytes(bytes) {
        if (!Number.isFinite(bytes) || bytes <= 0) return "0 KB";

        const units = ["B", "KB", "MB", "GB"];
        const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
        const value = bytes / 1024 ** index;
        const decimals = index === 0 || value >= 10 ? 0 : 1;

        return `${value.toFixed(decimals)} ${units[index]}`;
    }

    function todayStamp() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    function pluralize(count, singular, plural) {
        return count === 1 ? singular : plural;
    }

    async function copyText(text) {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return;
        }

        const helper = document.createElement("textarea");
        helper.value = text;
        helper.setAttribute("readonly", "");
        helper.style.position = "fixed";
        helper.style.opacity = "0";
        helper.style.pointerEvents = "none";
        document.body.appendChild(helper);
        helper.select();

        const copied = document.execCommand("copy");
        helper.remove();

        if (!copied) throw new Error("El navegador no permitió copiar el texto.");
    }

    function downloadText(text, filename) {
        const blob = new Blob(["\ufeff", text], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    }

    function showToast(message, type = "success") {
        const toast = document.getElementById("toast");
        const toastMessage = toast.querySelector("[data-toast-message]");

        toastMessage.textContent = message;
        toast.dataset.type = type;
        toast.hidden = false;

        window.clearTimeout(showToast.timeoutId);
        showToast.timeoutId = window.setTimeout(() => {
            toast.hidden = true;
        }, 2600);
    }

    class ProcessorPanel {
        constructor(element) {
            this.element = element;
            this.kind = element.dataset.processor;
            this.config = PROCESSORS[this.kind];
            this.input = element.querySelector("[data-file-input]");
            this.dropZone = element.querySelector("[data-drop-zone]");
            this.selectButton = element.querySelector("[data-select-file]");
            this.output = element.querySelector("[data-output]");
            this.count = element.querySelector("[data-result-count]");
            this.fileInfo = element.querySelector("[data-file-info]");
            this.fileName = element.querySelector("[data-file-name]");
            this.fileMeta = element.querySelector("[data-file-meta]");
            this.status = element.querySelector("[data-status]");
            this.copyButton = element.querySelector("[data-copy]");
            this.downloadButton = element.querySelector("[data-download]");
            this.clearButton = element.querySelector("[data-clear]");
            this.dragDepth = 0;
            this.currentOutput = "";
            this.bindEvents();
            this.reset();
        }

        bindEvents() {
            this.selectButton.addEventListener("click", () => this.input.click());
            this.input.addEventListener("change", () => {
                const [file] = this.input.files;
                this.handleFile(file);
            });

            this.dropZone.addEventListener("click", (event) => {
                if (event.target.closest("button")) return;
                this.input.click();
            });

            this.dropZone.addEventListener("keydown", (event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    this.input.click();
                }
            });

            this.dropZone.addEventListener("dragenter", (event) => {
                event.preventDefault();
                this.dragDepth += 1;
                this.dropZone.classList.add("is-dragover");
            });

            this.dropZone.addEventListener("dragover", (event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = "copy";
            });

            this.dropZone.addEventListener("dragleave", (event) => {
                event.preventDefault();
                this.dragDepth -= 1;
                if (this.dragDepth <= 0) {
                    this.dragDepth = 0;
                    this.dropZone.classList.remove("is-dragover");
                }
            });

            this.dropZone.addEventListener("drop", (event) => {
                event.preventDefault();
                this.dragDepth = 0;
                this.dropZone.classList.remove("is-dragover");
                const [file] = event.dataTransfer.files;
                this.handleFile(file);
            });

            this.copyButton.addEventListener("click", async () => {
                try {
                    await copyText(this.currentOutput);
                    showToast("Texto copiado al portapapeles.");
                } catch (error) {
                    showToast(error.message, "error");
                }
            });

            this.downloadButton.addEventListener("click", () => {
                const filename = `${this.config.filenamePrefix}-${todayStamp()}.txt`;
                downloadText(this.currentOutput, filename);
                showToast("Archivo TXT generado.");
            });

            this.clearButton.addEventListener("click", () => this.reset());
        }

        validateFile(file) {
            if (!file) return false;

            const extension = getExtension(file.name);

            if (!this.config.extensions.includes(extension)) {
                this.setError(
                    `Formato no admitido. Usá ${this.config.extensions.map((item) => `.${item.toUpperCase()}`).join(", ")}.`
                );
                return false;
            }

            return true;
        }

        async handleFile(file) {
            if (!this.validateFile(file)) return;

            this.setProcessing(file);

            try {
                await ensureSheetJs();
                const sheets = await readWorkbookSheets(file);
                const parsed = processBestSheet(sheets, this.config.parser);
                const formatted = this.config.formatter(parsed.items);
                this.setResult(file, parsed, formatted);
            } catch (error) {
                this.setError(error.message || "No fue posible procesar el archivo.", file);
            }
        }

        setProcessing(file) {
            this.element.dataset.state = "processing";
            this.output.value = "Procesando archivo…";
            this.currentOutput = "";
            this.count.textContent = "Procesando";
            this.status.dataset.type = "info";
            this.status.textContent = "Leyendo la estructura del archivo…";
            this.fileInfo.hidden = false;
            this.fileName.textContent = file.name;
            this.fileMeta.textContent = formatBytes(file.size);
            this.setActionsEnabled(false);
        }

        setResult(file, parsed, formatted) {
            const count = parsed.items.length;
            const label = pluralize(count, this.config.labelSingular, this.config.labelPlural);
            const skippedGeneric = parsed.skipped.genericVto || 0;
            const skippedIncomplete = parsed.skipped.incomplete || 0;
            const details = [];

            if (count === 1) {
                details.push(`Se procesó 1 ${label}, sin numeración inicial.`);
            } else if (count > 1) {
                details.push(`Se procesaron ${count} ${label}, con numeración correlativa.`);
            } else {
                details.push(`No se encontraron ${this.config.labelPlural} válidos para exportar.`);
            }

            if (skippedGeneric > 0) {
                details.push(`${skippedGeneric} fila${skippedGeneric === 1 ? "" : "s"} “VTO” omitida${skippedGeneric === 1 ? "" : "s"}.`);
            }

            if (skippedIncomplete > 0) {
                details.push(`${skippedIncomplete} fila${skippedIncomplete === 1 ? "" : "s"} incompleta${skippedIncomplete === 1 ? "" : "s"} omitida${skippedIncomplete === 1 ? "" : "s"}.`);
            }

            this.element.dataset.state = count > 0 ? "success" : "empty";
            this.currentOutput = formatted;
            this.output.value = formatted;
            this.count.textContent = `${count} ${label}`;
            this.fileInfo.hidden = false;
            this.fileName.textContent = file.name;
            this.fileMeta.textContent = `${formatBytes(file.size)} · Hoja: ${parsed.sheetName}`;
            this.status.dataset.type = count > 0 ? "success" : "warning";
            this.status.textContent = details.join(" ");
            this.setActionsEnabled(count > 0);
        }

        setError(message, file = null) {
            this.element.dataset.state = "error";
            this.currentOutput = "";
            this.output.value = "";
            this.count.textContent = "Sin resultados";
            this.status.dataset.type = "error";
            this.status.textContent = `Error: ${message}`;

            if (file) {
                this.fileInfo.hidden = false;
                this.fileName.textContent = file.name;
                this.fileMeta.textContent = formatBytes(file.size);
            }

            this.setActionsEnabled(false);
        }

        setActionsEnabled(enabled) {
            this.copyButton.disabled = !enabled;
            this.downloadButton.disabled = !enabled;
        }

        reset() {
            this.element.dataset.state = "idle";
            this.input.value = "";
            this.output.value = "";
            this.currentOutput = "";
            this.count.textContent = "0 resultados";
            this.fileInfo.hidden = true;
            this.fileName.textContent = "";
            this.fileMeta.textContent = "";
            this.status.dataset.type = "neutral";
            this.status.textContent = "Esperando un archivo para procesar.";
            this.dropZone.classList.remove("is-dragover");
            this.dragDepth = 0;
            this.setActionsEnabled(false);
        }
    }

    function initialize() {
        document.querySelectorAll("[data-processor]").forEach((element) => {
            new ProcessorPanel(element);
        });

        if ("serviceWorker" in navigator && location.protocol !== "file:") {
            navigator.serviceWorker.register("./sw.js").catch(() => {
                // La aplicación sigue funcionando aunque el navegador no habilite el modo instalable.
            });
        }
    }

    document.addEventListener("DOMContentLoaded", initialize);
})();
