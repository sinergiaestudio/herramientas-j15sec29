const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "docs/index.html"), "utf8");
const theme = fs.readFileSync(path.join(root, "docs/assets/js/theme.js"), "utf8");
const css = fs.readFileSync(path.join(root, "docs/assets/css/styles-theme.css"), "utf8");

test("el tema se aplica antes del primer render y conserva la preferencia", () => {
    assert.match(html, /localStorage\.getItem\("sec29-theme"\)/);
    assert.match(html, /prefers-color-scheme: dark/);
    assert.match(theme, /localStorage\.setItem\(STORAGE_KEY, theme\)/);
});

test("el control de tema queda junto al menú y es accesible", () => {
    assert.match(theme, /className = "theme-toggle"/);
    assert.match(theme, /button\.dataset\.themeToggle/);
    assert.match(theme, /Activar modo oscuro/);
    assert.match(theme, /Activar modo claro/);
    assert.match(css, /\.theme-toggle\s*\{/);
});

test("el tema se propaga a las aplicaciones integradas", () => {
    assert.match(theme, /postMessage\(\{ type: "sec29-theme", theme \}/);
    assert.match(theme, /sec29-theme-request/);
    assert.match(css, /html\[data-theme="dark"\]/);
});
