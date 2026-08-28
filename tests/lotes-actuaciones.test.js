const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const sourcePath = path.join(__dirname, "..", "docs", "assets", "js", "lotes-actuaciones-source.js");
const modulePath = path.join(__dirname, "..", "docs", "assets", "js", "lotes-actuaciones-module.js");

const api = require(sourcePath);
const source = api.source;
const moduleCode = fs.readFileSync(modulePath, "utf8");

test("valida expedientes, CUIJ, duplicados e inválidos", () => {
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