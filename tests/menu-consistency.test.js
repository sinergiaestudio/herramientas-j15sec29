const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const menu = fs.readFileSync(
    path.join(root, "docs/assets/js/menu-consistency.js"),
    "utf8"
);
const theme = fs.readFileSync(
    path.join(root, "docs/assets/js/theme.js"),
    "utf8"
);
const serviceWorker = fs.readFileSync(path.join(root, "docs/sw.js"), "utf8");
const indexHtml = fs.readFileSync(path.join(root, "docs/index.html"), "utf8");
const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));

test("el menú principal conserva el orden canónico de automatización EJE", () => {
    const actuaciones = menu.indexOf('"actuaciones-lote"');
    const lotesActuaciones = menu.indexOf('"lotes-actuaciones"');
    const lotesCedulas = menu.indexOf('"lotes-cedulas"');

    assert.ok(actuaciones >= 0, "falta Creador de actuaciones en lote");
    assert.ok(lotesActuaciones > actuaciones, "Lotes - Actuaciones debe ir después de actuaciones en lote");
    assert.ok(lotesCedulas > lotesActuaciones, "Lotes - Cédulas debe ir después de Lotes - Actuaciones");
});

test("la suite carga y cachea el sincronizador de menú", () => {
    assert.match(theme, /menu-consistency\.js/);
    assert.match(serviceWorker, /menu-consistency\.js/);
    assert.match(serviceWorker, /sec29-tools-v6\.7\.1/);
    assert.equal(packageJson.version, "6.7.1");
});

test("la suite enlaza la entrada unificada de IA JUDICIAL sin compartir estado", () => {
    assert.match(indexHtml, /Sistema de Actuaciones Judiciales/);
    assert.match(indexHtml, /biblioteca-judicial-inteligente\.arielmarcelogomez7\.chatgpt\.site/);
    assert.match(indexHtml, /Entrada unificada · acceso autenticado/);
});

test("el sincronizador reutiliza los enlaces existentes sin duplicar herramientas", () => {
    assert.match(menu, /new Map\(/);
    assert.match(menu, /group\.appendChild\(link\)/);
    assert.match(menu, /ROUTE_ORDER\.every/);
    assert.doesNotMatch(menu, /insertAdjacentHTML/);
});
