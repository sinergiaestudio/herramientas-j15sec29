(function (root, factory) {
    const api = factory();

    if (typeof module === "object" && module.exports) {
        module.exports = api;
    } else {
        root.SEC29Processors = api;
    }
})(typeof self !== "undefined" ? self : this, function () {
    "use strict";

    class ProcessorError extends Error {
        constructor(message, code = "PROCESSOR_ERROR") {
            super(message);
            this.name = "ProcessorError";
            this.code = code;
        }
    }

    function cleanCell(value) {
        if (value === null || value === undefined) return "";

        return String(value)
            .replace(/\u00a0/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    }

    function normalizeText(value) {
        return cleanCell(value)
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLocaleLowerCase("es-AR")
            .trim();
    }

    function compactText(value) {
        return normalizeText(value).replace(/[^a-z0-9]/g, "");
    }

    function lowerEs(value) {
        return cleanCell(value).toLocaleLowerCase("es-AR");
    }

    function escapeRegExp(value) {
        return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

    function extractExpteFromText(value) {
        const text = cleanCell(value);
        if (!text) return "";

        const match = text.match(/\b(\d+\/\d{4}-\d+)\b/);
        return match ? match[1] : "";
    }

    function findExpteInRow(row) {
        for (const cell of row || []) {
            const expte = extractExpteFromText(cell);
            if (expte) return expte;
        }
        return "";
    }

    function findHeaderIndex(headers, predicate) {
        for (let index = 0; index < headers.length; index += 1) {
            if (predicate(headers[index], index)) return index;
        }
        return -1;
    }

    function findExpteHeader(headers) {
        let bestIndex = -1;
        let bestScore = -1;

        headers.forEach((header, index) => {
            const normalized = normalizeText(header);
            const compact = compactText(header);

            if (!normalized || compact.includes("tipoexp")) return;

            let score = -1;

            if (compact.includes("numeroexpediente")) score = 10;
            else if (compact.includes("nroexpediente")) score = 9;
            else if (compact.includes("nexpediente")) score = 8;
            else if (compact === "expediente") score = 7;
            else if (compact.includes("expediente")) score = 5;
            else if (compact === "expte" || compact.includes("nroexpte")) score = 4;

            if (score > bestScore) {
                bestScore = score;
                bestIndex = index;
            }
        });

        return bestIndex;
    }

    function findActuacionesHeader(rows) {
        const scanLimit = Math.min(rows.length, 40);

        for (let rowIndex = 0; rowIndex < scanLimit; rowIndex += 1) {
            const row = rows[rowIndex] || [];
            const headers = row.map(normalizeText);

            const idxCaratula = findHeaderIndex(headers, (header) => header.includes("carat"));
            const idxTitulo = findHeaderIndex(headers, (header) => header.includes("titulo"));

            if (idxCaratula >= 0 && idxTitulo >= 0) {
                return {
                    rowIndex,
                    idxCaratula,
                    idxTitulo,
                    idxExpte: findExpteHeader(row)
                };
            }
        }

        return null;
    }

    function findVencimientosHeader(rows) {
        const scanLimit = Math.min(rows.length, 40);

        for (let rowIndex = 0; rowIndex < scanLimit; rowIndex += 1) {
            const row = rows[rowIndex] || [];
            const headers = row.map(normalizeText);

            const idxCaratula = findHeaderIndex(headers, (header) => header.includes("carat"));
            const idxDescripcion = findHeaderIndex(headers, (header) => header.includes("descrip"));
            const idxExpte = findExpteHeader(row);

            if (idxCaratula >= 0 && idxDescripcion >= 0 && idxExpte >= 0) {
                return {
                    rowIndex,
                    idxCaratula,
                    idxDescripcion,
                    idxExpte
                };
            }
        }

        return null;
    }

    function cleanActuacionTitle(rawTitle, expte) {
        let title = cleanCell(rawTitle);

        title = title
            .replace(/^escrit(?:o)?\s+normal\s*[-–—:]?\s*/i, "")
            .trim();

        if (expte) {
            title = title.replace(new RegExp(escapeRegExp(expte), "gi"), "").trim();
        }

        title = title
            .replace(/^[\s\-–—:;,]+/, "")
            .replace(/[\s\-–—:;,]+$/, "")
            .trim();

        return lowerEs(title);
    }

    function isHeaderLikeActuacion(caratula, title) {
        const normalizedCaratula = normalizeText(caratula);
        const normalizedTitle = normalizeText(title);

        return normalizedCaratula === "caratula" || normalizedTitle === "titulo";
    }

    function parseActuacionesRows(rows) {
        if (!Array.isArray(rows) || rows.length === 0) {
            throw new ProcessorError("El archivo está vacío o no pudo ser leído.", "EMPTY_FILE");
        }

        const header = findActuacionesHeader(rows);

        if (!header) {
            throw new ProcessorError(
                "No se encontraron las columnas de Carátula y Título en las primeras filas del archivo.",
                "ACTUACIONES_HEADERS_NOT_FOUND"
            );
        }

        const items = [];
        const skipped = {
            empty: 0,
            headerLike: 0,
            incomplete: 0
        };

        for (let rowIndex = header.rowIndex + 1; rowIndex < rows.length; rowIndex += 1) {
            const row = rows[rowIndex] || [];
            const caratula = cleanCell(row[header.idxCaratula]);
            const rawTitle = cleanCell(row[header.idxTitulo]);
            const rawExpte = header.idxExpte >= 0 ? cleanCell(row[header.idxExpte]) : "";

            if (!caratula && !rawTitle && !rawExpte) {
                skipped.empty += 1;
                continue;
            }

            if (isHeaderLikeActuacion(caratula, rawTitle)) {
                skipped.headerLike += 1;
                continue;
            }

            const expte = extractExpteFromText(rawExpte) || findExpteInRow(row) || rawExpte;
            const titulo = cleanActuacionTitle(rawTitle, expte);

            if (!caratula || !expte) {
                skipped.incomplete += 1;
                continue;
            }

            items.push({
                caratula,
                expte,
                titulo,
                sourceRow: rowIndex + 1
            });
        }

        return {
            items,
            skipped,
            headerRowIndex: header.rowIndex,
            columns: {
                caratula: header.idxCaratula,
                expte: header.idxExpte,
                titulo: header.idxTitulo
            }
        };
    }

    function isGenericVto(description) {
        const normalized = normalizeText(description)
            .replace(/[.\-_:;]+$/g, "")
            .trim();

        return normalized === "vto";
    }

    function isHeaderLikeVencimiento(caratula, expte, description) {
        const normalizedCaratula = normalizeText(caratula);
        const normalizedExpte = normalizeText(expte);
        const normalizedDescription = normalizeText(description);

        return (
            normalizedCaratula === "caratula" ||
            normalizedExpte.includes("expediente") ||
            normalizedDescription === "descripcion"
        );
    }

    function parseVencimientosRows(rows) {
        if (!Array.isArray(rows) || rows.length === 0) {
            throw new ProcessorError("El archivo está vacío o no pudo ser leído.", "EMPTY_FILE");
        }

        const header = findVencimientosHeader(rows);

        if (!header) {
            throw new ProcessorError(
                "No se encontraron las columnas de Carátula, Número de expediente y Descripción en las primeras filas del archivo.",
                "VENCIMIENTOS_HEADERS_NOT_FOUND"
            );
        }

        const items = [];
        const skipped = {
            empty: 0,
            genericVto: 0,
            headerLike: 0,
            incomplete: 0
        };

        for (let rowIndex = header.rowIndex + 1; rowIndex < rows.length; rowIndex += 1) {
            const row = rows[rowIndex] || [];
            const caratula = cleanCell(row[header.idxCaratula]);
            const rawExpte = cleanCell(row[header.idxExpte]);
            const rawDescription = cleanCell(row[header.idxDescripcion]);

            if (!caratula && !rawExpte && !rawDescription) {
                skipped.empty += 1;
                continue;
            }

            if (!rawDescription) {
                skipped.empty += 1;
                continue;
            }

            if (isGenericVto(rawDescription)) {
                skipped.genericVto += 1;
                continue;
            }

            if (isHeaderLikeVencimiento(caratula, rawExpte, rawDescription)) {
                skipped.headerLike += 1;
                continue;
            }

            const expte = extractExpteFromText(rawExpte) || rawExpte;

            if (!caratula || !expte) {
                skipped.incomplete += 1;
                continue;
            }

            items.push({
                caratula,
                expte,
                descripcion: lowerEs(rawDescription),
                sourceRow: rowIndex + 1
            });
        }

        return {
            items,
            skipped,
            headerRowIndex: header.rowIndex,
            columns: {
                caratula: header.idxCaratula,
                expte: header.idxExpte,
                descripcion: header.idxDescripcion
            }
        };
    }

    function formatItems(items, lineBuilder) {
        if (!Array.isArray(items) || items.length === 0) return "";

        const shouldNumber = items.length > 1;

        return items
            .map((item, index) => {
                const prefix = shouldNumber ? `${index + 1}) ` : "";
                return `${prefix}${lineBuilder(item)}`;
            })
            .join("\n");
    }

    function formatActuacionesOutput(items) {
        return formatItems(
            items,
            (item) => `*${item.caratula} - Expte. Nro ${item.expte}* (${item.titulo})`
        );
    }

    function formatVencimientosOutput(items) {
        return formatItems(
            items,
            (item) => `*${item.caratula} - Expte. N° ${item.expte}* (${item.descripcion})`
        );
    }

    return Object.freeze({
        ProcessorError,
        cleanCell,
        normalizeText,
        extractExpteFromText,
        parseActuacionesRows,
        parseVencimientosRows,
        formatActuacionesOutput,
        formatVencimientosOutput
    });
});
