(function (root) {
    "use strict";

    let base = root.SEC29LotesActuaciones;

    if (typeof module === "object" && module.exports && !base) {
        base = require("./lotes-actuaciones-source.js");
    }

    if (!base || typeof base.source !== "string") {
        throw new Error("No se encontró el código base de Creador de Lotes - Actuaciones.");
    }

    function replaceOnce(source, pattern, replacement, label) {
        const updated = source.replace(pattern, replacement);
        if (updated === source) {
            throw new Error(`No pudo aplicarse la corrección: ${label}.`);
        }
        return updated;
    }

    let source = base.source;

    source = replaceOnce(
        source,
        /        const pageTextCompact = \(\) =>[\s\S]*?        const delay =/,
        `        const selectedTable = () => {
            const selector = "table, [role='table'], .mat-table, .p-datatable, .ui-table";
            const candidates = Array.from(document.querySelectorAll(selector))
                .filter(visible)
                .map((element) => {
                    const text = normalize(element.innerText || element.textContent || "");
                    let score = 0;
                    if (text.includes("nro. expediente")) score += 22;
                    if (text.includes("quitar")) score += 22;
                    if (text.includes("caratula")) score += 4;
                    if (text.includes("codigo") && text.includes("titulo")) score += 3;
                    if (text.includes("fecha creacion")) score += 2;
                    return { element, score };
                })
                .sort((a, b) => b.score - a.score);

            if (candidates[0]?.score >= 30) return candidates[0].element;

            const heading = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6, p, strong, span, div"))
                .filter(visible)
                .find((element) => {
                    const text = normalize(element.textContent || "");
                    return text.length < 140
                        && text.includes("se creara un lote con las siguientes actuaciones");
                });

            if (!heading) return null;

            return Array.from(document.querySelectorAll(selector))
                .filter(visible)
                .find((element) => Boolean(
                    heading.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING
                )) || null;
        };

        const selectedRows = () => {
            const table = selectedTable();
            if (!table) return [];

            const rows = Array.from(table.querySelectorAll("tbody tr, [role='row']"))
                .filter(visible)
                .map((row) => normalize(row.innerText || row.textContent || ""))
                .filter((text) => /\\d{1,12}\\/(?:19|20)\\d{2}-[a-z0-9]+/.test(text));

            if (rows.length) return rows;

            const fallback = normalize(table.innerText || table.textContent || "");
            return fallback ? [fallback] : [];
        };

        const selectedCount = () => {
            const text = normalize(document.body.innerText || "");
            const match = text.match(/cantidad seleccionada\\s*:?\\s*(\\d+)/);
            return match ? Number(match[1]) : selectedRows().length;
        };

        const selectedLotSnapshot = (expediente) => {
            const needle = compact(expediente);
            const rows = selectedRows();
            return {
                count: selectedCount(),
                has: rows.some((row) => compact(row).includes(needle)),
                rows,
            };
        };

        const selectedLotHasExpediente = (expediente) =>
            selectedLotSnapshot(expediente).has;

        const selectedLotConfirmed = (expediente, before) => {
            const after = selectedLotSnapshot(expediente);
            if (after.count > before.count) return true;
            if (!before.has && after.has) return true;

            const needle = compact(expediente);
            return after.rows.some((row) =>
                compact(row).includes(needle) && !before.rows.includes(row)
            );
        };

        const pageError = () => {
            const selectors = [
                "[role='alert']",
                "[aria-live='assertive']",
                ".mat-snack-bar-container",
                ".p-toast-message",
                ".toast",
                ".alert",
                ".notification",
                ".swal2-popup",
            ].join(",");

            const messages = [
                "no se encontraron",
                "sin resultados",
                "ocurrio un error",
                "dato invalido",
                "no se pudo",
                "error al aplicar",
            ];

            for (const element of Array.from(document.querySelectorAll(selectors)).filter(visible)) {
                const text = normalize(element.innerText || element.textContent || "");
                const match = messages.find((message) => text.includes(message));
                if (match) return text || match;
            }

            return "";
        };

        const delay =`,
        "verificación de la tabla seleccionada"
    );

    source = replaceOnce(
        source,
        "                if (pageHasExpediente(expediente)) {",
        "                if (selectedLotHasExpediente(expediente)) {",
        "detección de expedientes previamente seleccionados"
    );

    source = replaceOnce(
        source,
        /                    stateLabel\.textContent = "Esperando a EJE";[\s\S]*?                    stateLabel\.textContent = "Limpiando filtros";/,
        `                    const selectionBefore = selectedLotSnapshot(expediente);
                    stateLabel.textContent = "Esperando incorporación al lote";
                    applyButton.click();

                    const confirmed = await waitUntil(
                        () => selectedLotConfirmed(expediente, selectionBefore) || Boolean(pageError()),
                        30000,
                        250
                    );

                    if (skipRequested) {
                        addLog(expediente, "warn", "Omitido por el usuario.");
                        index += 1;
                        updateProgress();
                        continue;
                    }

                    const selectionAfter = selectedLotSnapshot(expediente);
                    const error = pageError();
                    if (error && !selectedLotConfirmed(expediente, selectionBefore)) {
                        throw new Error(`EJE informó: ${error}.`);
                    }

                    if (!confirmed || !selectedLotConfirmed(expediente, selectionBefore)) {
                        throw new Error(
                            "No pudo comprobarse la incorporación en la tabla inferior del lote. "
                            + `Cantidad anterior: ${selectionBefore.count}; cantidad actual: ${selectionAfter.count}.`
                        );
                    }

                    stateLabel.textContent = "Estabilizando resultado";
                    await delay(900);
                    stateLabel.textContent = "Limpiando filtros";`,
        "confirmación posterior a Aplicar y agregar"
    );

    source = replaceOnce(
        source,
        `                    if (!cleared) {
                        throw new Error("EJE no limpió el campo Expediente.");
                    }

                    if (!verifyDraftStatus()) {`,
        `                    if (!cleared) {
                        throw new Error("EJE no limpió el campo Expediente.");
                    }

                    stateLabel.textContent = "Preparando siguiente expediente";
                    await delay(800);

                    if (!verifyDraftStatus()) {`,
        "pausa de estabilización después de Limpiar"
    );

    source = source
        .replace("borradores por expediente · v1.0", "borradores por expediente · v1.1")
        .replace(
            "No pudo comprobarse que las actuaciones del expediente fueran agregadas.",
            "No pudo comprobarse la incorporación del expediente en el lote."
        );

    const api = Object.freeze({
        source,
        parseExpedientes: base.parseExpedientes,
        toBookmarklet() {
            return "javascript:" + encodeURIComponent(source);
        },
    });

    root.SEC29LotesActuaciones = api;

    if (typeof module === "object" && module.exports) {
        module.exports = api;
    }
})(typeof globalThis !== "undefined" ? globalThis : this);
