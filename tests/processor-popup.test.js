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


test("el marcador despliega una única herramienta flotante sobre la página actual", () => {
    assert.match(script, /__sec29_procesador_actuaciones_panel__/);
    assert.match(script, /attachShadow\(\{ mode: "open" \}\)/);
    assert.match(script, /data-sec29-processor-panel/);
    assert.match(script, /data-panel-frame/);
    assert.match(script, /<iframe/);
    assert.match(script, /restoreExisting\(\)/);
    assert.match(script, /panel\?\.focus/);
    assert.doesNotMatch(script, /window\.open\(/);
});


test("el panel puede moverse, redimensionarse, minimizarse y conservar su geometría", () => {
    assert.match(script, /resize: both/);
    assert.match(script, /data-panel-drag-handle/);
    assert.match(script, /setPointerCapture/);
    assert.match(script, /pointermove/);
    assert.match(script, /data-panel-minimize/);
    assert.match(script, /is-minimized/);
    assert.match(script, /ResizeObserver/);
    assert.match(script, /localStorage\.setItem\(stateKey/);
    assert.match(script, /localStorage\.getItem\(stateKey/);
});


test("la vista interna muestra únicamente el Procesador de actuaciones", () => {
    assert.match(script, /processor-popup-mode/);
    assert.match(script, /view\.dataset\.view === "procesadores"/);
    assert.match(css, /\[data-processor="vencimientos"\]/);
    assert.match(css, /\[data-view\]:not\(\[data-view="procesadores"\]\)/);
    assert.match(css, /\.hero,/);
    assert.match(css, /\.site-footer,/);
    assert.match(css, /\.tools-grid\s*\{[\s\S]*display:\s*block;/);
});


test("el modo compacto conserva visible el selector claro y oscuro", () => {
    assert.match(css, /\.site-header \.theme-toggle\s*\{/);
    assert.match(css, /display:\s*grid !important/);
    assert.match(css, /\.site-header \.menu-toggle,/);
    assert.match(css, /\.site-header \.brand,/);
});


test("el acceso describe el comportamiento como panel sobre la página actual", () => {
    assert.match(script, /Panel flotante/);
    assert.match(script, /despliega el procesador sobre la página actual/);
    assert.match(script, /moverlo, redimensionarlo y minimizarlo/);
});


test("el script de acceso rápido tiene sintaxis JavaScript válida", () => {
    assert.doesNotThrow(() => new Function(script));
});