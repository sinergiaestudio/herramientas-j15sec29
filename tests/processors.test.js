const test = require("node:test");
const assert = require("node:assert/strict");
const {
    parseActuacionesRows,
    parseVencimientosRows,
    formatActuacionesOutput,
    formatVencimientosOutput
} = require("../docs/assets/js/processors.js");

test("una actuación no lleva 1) al comienzo", () => {
    const output = formatActuacionesOutput([
        {
            caratula: "GCBA CONTRA EJEMPLO SOBRE EJECUCIÓN FISCAL",
            expte: "12345/2026-0",
            titulo: "acompaña constancia"
        }
    ]);

    assert.equal(
        output,
        "*GCBA CONTRA EJEMPLO SOBRE EJECUCIÓN FISCAL - Expte. Nro 12345/2026-0* (acompaña constancia)"
    );
});

test("dos actuaciones se numeran desde 1)", () => {
    const output = formatActuacionesOutput([
        { caratula: "A", expte: "1/2026-0", titulo: "uno" },
        { caratula: "B", expte: "2/2026-0", titulo: "dos" }
    ]);

    assert.equal(
        output,
        "1) *A - Expte. Nro 1/2026-0* (uno)\n2) *B - Expte. Nro 2/2026-0* (dos)"
    );
});

test("actuaciones detecta la fila de encabezado y limpia 'escrit normal-'", () => {
    const rows = [
        ["Metadato"],
        ["Metadato"],
        ["Metadato"],
        ["Metadato"],
        ["Metadato"],
        ["Carátula", "Tipo expediente", "Título"],
        ["GCBA CONTRA EJEMPLO", "EXP", "Escrit normal-412124/2024-0 ACOMPAÑA DOCUMENTACIÓN"]
    ];

    const parsed = parseActuacionesRows(rows);

    assert.equal(parsed.items.length, 1);
    assert.deepEqual(parsed.items[0], {
        caratula: "GCBA CONTRA EJEMPLO",
        expte: "412124/2024-0",
        titulo: "acompaña documentación",
        sourceRow: 7
    });
});

test("vencimientos omite VTO y una sola salida no se numera", () => {
    const rows = [
        ["Metadato"],
        ["Metadato"],
        ["Metadato"],
        ["Metadato"],
        ["Metadato"],
        ["Metadato"],
        ["Carátula", "Número Expediente", "Descripción"],
        ["CAUSA GENÉRICA", "100/2026-0", "VTO "],
        ["CAUSA ÚTIL", "101/2026-0", "11 HS, VENCE PLAZO PARA CONTESTAR"]
    ];

    const parsed = parseVencimientosRows(rows);
    const output = formatVencimientosOutput(parsed.items);

    assert.equal(parsed.items.length, 1);
    assert.equal(parsed.skipped.genericVto, 1);
    assert.equal(
        output,
        "*CAUSA ÚTIL - Expte. N° 101/2026-0* (11 hs, vence plazo para contestar)"
    );
});

test("vencimientos detecta columnas aunque estén en D, G e I", () => {
    const rows = [
        ["", "", "", "Descripción", "", "", "Número Expediente", "", "Carátula"],
        ["", "", "", "Despachar presentación", "", "", "230106/2025-0", "", "DEL ROSARIO, EVA CONTRA GCBA"]
    ];

    const parsed = parseVencimientosRows(rows);

    assert.equal(parsed.items.length, 1);
    assert.deepEqual(parsed.items[0], {
        caratula: "DEL ROSARIO, EVA CONTRA GCBA",
        expte: "230106/2025-0",
        descripcion: "despachar presentación",
        sourceRow: 2
    });
});

test("dos vencimientos conservan el formato N° y se numeran", () => {
    const output = formatVencimientosOutput([
        { caratula: "A", expte: "1/2026-0", descripcion: "primero" },
        { caratula: "B", expte: "2/2026-0", descripcion: "segundo" }
    ]);

    assert.equal(
        output,
        "1) *A - Expte. N° 1/2026-0* (primero)\n2) *B - Expte. N° 2/2026-0* (segundo)"
    );
});
