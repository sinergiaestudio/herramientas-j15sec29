const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "docs/index.html"), "utf8");
const css = ["styles.css", "styles-v5a.css", "styles-v5b.css", "styles-v6.css"]
    .map((file) => fs.readFileSync(path.join(root, "docs/assets/css", file), "utf8"))
    .join("\n");
const navigation = fs.readFileSync(path.join(root, "docs/assets/js/navigation.js"), "utf8");
const theme = fs.readFileSync(path.join(root, "docs/assets/js/theme.js"), "utf8");

test("el menú inicia completamente cerrado y con ARIA consistente", () => {
    assert.match(html, /data-sidebar-toggle[^>]+aria-expanded="false"/);
    assert.match(html, /id="app-sidebar"[^>]+aria-hidden="true"/);
    assert.match(css, /\.sidebar\s*\{[\s\S]*opacity:\s*0;[\s\S]*visibility:\s*hidden;[\s\S]*pointer-events:\s*none;/);
});

test("el botón abre un panel lateral y no conserva estados anteriores", () => {
    assert.match(navigation, /const OPEN_CLASS = "sidebar-is-open"/);
    assert.match(navigation, /body\.classList\.add\(OPEN_CLASS\)/);
    assert.match(navigation, /body\.classList\.remove\(OPEN_CLASS\)/);
    assert.doesNotMatch(navigation, /localStorage/);
    assert.match(css, /\.sidebar-is-open \.sidebar\s*\{[\s\S]*opacity:\s*1;[\s\S]*visibility:\s*visible;/);
});

test("seleccionar un módulo interno y presionar Escape cierran el menú", () => {
    assert.match(navigation, /applyRoute[\s\S]*closeSidebar\(\);/);
    assert.match(navigation, /event\.key === "Escape"[\s\S]*closeSidebar/);
});

test("Cédulas y Confronte se abren como páginas completas, sin iframe ni puente de scroll", () => {
    assert.match(theme, /Cedulas-EJE-v1\.0/);
    assert.match(theme, /Confronte-Liquidaciones-EJF-v2\.1\.0/);
    assert.match(theme, /location\.assign\(target\)/);
    assert.match(theme, /location\.replace\(target\)/);
    assert.match(theme, /event\.stopImmediatePropagation\(\)/);
    assert.doesNotMatch(theme, /sec29-embed-scroll/);
    assert.doesNotMatch(theme, /window\.scrollBy/);
});

test("se preservan nombres y rutas de los cuatro módulos", () => {
    assert.match(navigation, /Creador de actuaciones en lote/);
    assert.match(navigation, /Creador de Lotes - Cédulas/);
    assert.match(navigation, /Confronte de Liquidaciones EJF/);
    assert.match(navigation, /"cargador-eje": "actuaciones-lote"/);
    assert.match(theme, /"lotes-cedulas"/);
    assert.match(theme, /"confronte-liquidaciones"/);
});
