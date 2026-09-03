const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "docs/index.html"), "utf8");
const script = fs.readFileSync(
    path.join(root, "docs/assets/js/processor-popup.js"),
    "utf8"
);
const css = fs.readFileSync(
    path.join(root, "docs/assets/css/processor-popup.css"),
    "utf8"
);
const app = fs.readFileSync(path.join(root, "docs/assets/js/app.js"), "utf8");


test("la página carga el acceso rápido sin reemplazar el procesador existente", () => {
    assert.match(html, /processor-popup\.css/);
    assert.match(html, /processor-popup\.js/);
    assert.match(html, /data-processor="actuaciones"/);
    assert.match(script, /querySelector\('\[data-processor="actuaciones"\]'\)/);
    assert.doesNotMatch(script, /class ProcessorPanel/);
    assert.match(app, /class ProcessorPanel/);
});


test("el marcador abre o enfoca una única ventana persistente", () => {
    assert.match(script, /SEC29_PROCESADOR_ACTUACIONES/);
    assert.match(script, /modo=procesador-actuaciones#procesadores/);
    assert.match(script, /window\.open\("", name, features\)/);
    assert.match(script, /popup\.location\.href === "about:blank"/);
    assert.match(script, /popup\.location\.replace\(url\)/);
    assert.match(script, /popup\.focus\(\)/);
    assert.match(script, /resizable=yes/);
    assert.match(script, /scrollbars=yes/);
});


test("la ventana rápida muestra únicamente el Procesador de actuaciones", () => {
    assert.match(script, /processor-popup-mode/);
    assert.match(script, /view\.dataset\.view === "procesadores"/);
    assert.match(css, /\[data-processor="vencimientos"\]/);
    assert.match(css, /\[data-view\]:not\(\[data-view="procesadores"\]\)/);
    assert.match(css, /\.hero,/);
    assert.match(css, /\.site-footer,/);
    assert.match(css, /\.tools-grid\s*\{[\s\S]*display:\s*block;/);
    assert.doesNotMatch(script, /iframe/i);
});


test("el modo compacto conserva visible el selector claro y oscuro", () => {
    assert.match(css, /\.site-header \.theme-toggle\s*\{/);
    assert.match(css, /display:\s*grid !important/);
    assert.match(css, /\.site-header \.menu-toggle,/);
    assert.match(css, /\.site-header \.brand,/);
});


test("el script de acceso rápido tiene sintaxis JavaScript válida", () => {
    assert.doesNotThrow(() => new Function(script));
});
