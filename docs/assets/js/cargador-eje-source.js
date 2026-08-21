(function (root) {
    "use strict";

    if (typeof module === "object" && module.exports && !(root.SEC29EJESourceParts || []).length) {
        require("./cargador-eje-part1.js");
        require("./cargador-eje-part2.js");
        require("./cargador-eje-part3.js");
    }

    const originalSource = (root.SEC29EJESourceParts || []).join("");
    const source = originalSource
        .replaceAll("El Cargador EJE ya está abierto", "El Creador de actuaciones en lote ya está abierto")
        .replaceAll("Cargador masivo de expedientes", "Creador de actuaciones en lote")
        .replaceAll("Cargador EJE", "Creador de actuaciones en lote");

    const api = Object.freeze({
        source,
        toBookmarklet() {
            return "javascript:" + encodeURIComponent(source);
        }
    });

    root.SEC29CargadorEJE = api;
    if (typeof module === "object" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
