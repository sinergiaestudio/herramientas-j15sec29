const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const sourcePath = path.join(__dirname, "..", "docs", "assets", "js", "lotes-actuaciones-source.js");
const modulePath = path.join(__dirname, "..", "docs", "assets", "js", "lotes-actuaciones-module.js");

const api = require(sourcePath);
const source = api.source;
const moduleCode = fs.readFileSync(modulePath, "utf8");

test("acepta el formato operativo de números de expediente", () => {
    const input = [
        "313123/2025-0",
        "496223/2020-0",
        "192793/2025-0",
        "149554/2025-0",
        "240153/2022-0",
    ].join("\n");

    const result = api.parseExpedientes(input);

    assert.deepEqual(result.valid, [
        "313123/2025-0",
        "496223/2020-0",
        "192793/2025-0",
        "149554/2025-0",
        "240153/2022-0",
    ]);
    assert.deepEqual(result.invalid, []);
    assert.deepEqual(result.duplicates, []);
    assert.equal(result.total, 5);
});

test("admite cientos de expedientes sin recortar la cola", () => {
    const values = Array.from({ length: 500 }, (_, index) => `${300000 + index}/2025-0`);
    const result = api.parseExpedientes(values.join("\n"));

    assert.equal(result.total, 500);
    assert.equal(result.valid.length, 500);
    assert.deepEqual(result.invalid, []);
    assert.deepEqual(result.duplicates, []);
    assert.equal(result.valid[0], "300000/2025-0");
    assert.equal(result.valid[499], "300499/2025-0");
});

test("normaliza espacios, detecta duplicados y rechaza valores inválidos", () => {
    const result = api.parseExpedientes([
        "12463/2020-0",
        " 12463 / 2020 - 0 ",
        "EXP J-01-00360301-2/2020-0",
        "dato incorrecto",
    ].join("\n"));

    assert.deepEqual(result.valid, [
        "12463/2020-0",
        "EXP J-01-00360301-2/2020-0",
    ]);
    assert.deepEqual(result.duplicates, ["12463/2020-0"]);
    assert.deepEqual(result.invalid, ["dato incorrecto"]);
    assert.equal(result.total, 4);
});

test("el bookmarklet exige EJE y trabaja con BORRADOR y Expediente", () => {
    assert.match(source, /eje\.jusbaires\.gob\.ar/);
    assert.match(source, /BORRADOR detectado/);
    assert.match(source, /CUIJ, Número, Año y Sufijo/);
    assert.match(source, /Aplicar y agregar/);
    assert.match(source, /No se encontró el botón “Limpiar”/);
});

test("el bookmarklet verifica cada expediente antes de limpiar", () => {
    const applyIndex = source.indexOf('findControl("Aplicar y agregar"');
    const verifyIndex = source.indexOf("pageHasExpediente(expediente)");
    const clearIndex = source.indexOf('findControl("Limpiar", targetField)', applyIndex);

    assert.ok(applyIndex >= 0);
    assert.ok(verifyIndex >= 0);
    assert.ok(clearIndex > applyIndex);
    assert.match(source, /No pudo comprobarse que las actuaciones del expediente fueran agregadas/);
});

test("el ciclo continúa después de Limpiar y vuelve al siguiente expediente", () => {
    assert.match(source, /clearButton\.click\(\)/);
    assert.match(source, /EJE no limpió el campo Expediente/);
    assert.match(source, /index \+= 1/);
    assert.match(source, /while \(running && index < queue\.length\)/);
    assert.match(source, /Secuencia: Expediente → Aplicar y agregar → comprobar resultado → Limpiar → siguiente/);
});

test("el bookmarklet no presiona el botón final Agregar", () => {
    assert.doesNotMatch(source, /findControl\("Agregar",/);
    assert.match(source, /El botón final “Agregar” no será presionado/);
});

test("la interfaz ofrece pausa, detención, omisión, tema y CSV", () => {
    assert.match(source, /id="pause"/);
    assert.match(source, /id="stop"/);
    assert.match(source, /id="skip"/);
    assert.match(source, /sec29-eje-tool-theme/);
    assert.match(source, /registro_lotes_actuaciones_/);
});

test("el módulo se incorpora a la suite con una ruta propia", () => {
    assert.match(moduleCode, /const ROUTE = "lotes-actuaciones"/);
    assert.match(moduleCode, /Creador de Lotes - Actuaciones/);
    assert.match(moduleCode, /Borradores por expediente/);
    assert.match(moduleCode, /lotesActuacionesBookmarklet/);
});
