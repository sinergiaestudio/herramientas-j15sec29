const test = require("node:test");
const assert = require("node:assert/strict");
const {
    source,
    toBookmarklet
} = require("../docs/assets/js/cargador-eje-source.js");

test("el Cargador EJE conserva el identificador y la detección del campo CUIJ", () => {
    assert.match(source, /mg-eje-bulk-loader/);
    assert.match(source, /placeholder\.includes\('cuij'\)/);
    assert.match(source, /Campo de EJE detectado correctamente/);
});

test("el marcador se codifica como javascript y puede reconstruirse sin pérdida", () => {
    const bookmarklet = toBookmarklet();

    assert.ok(bookmarklet.startsWith("javascript:"));
    assert.equal(
        decodeURIComponent(bookmarklet.slice("javascript:".length)),
        source
    );
});

test("el Cargador EJE mantiene validación, detención preventiva y registro CSV", () => {
    assert.match(source, /validPattern = \/\^\\d\{1,12\}\\\/\\d\{4\}-\[A-Za-z0-9\]\+\$\//);
    assert.match(source, /waitUntilFieldClears/);
    assert.match(source, /Descargar registro CSV/);
    assert.match(source, /EJE no vació el campo/);
});

test("el código operativo no realiza llamadas fetch ni XMLHttpRequest", () => {
    assert.doesNotMatch(source, /\bfetch\s*\(/);
    assert.doesNotMatch(source, /XMLHttpRequest/);
});
