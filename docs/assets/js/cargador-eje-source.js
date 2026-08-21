(function (root) {
    "use strict";

    if (typeof module === "object" && module.exports && !(root.SEC29EJESourceParts || []).length) {
        require("./cargador-eje-part1.js");
        require("./cargador-eje-part2.js");
        require("./cargador-eje-part3.js");
    }

    const source = (root.SEC29EJESourceParts || []).join("");
    const api = Object.freeze({
        source,
        toBookmarklet() {
            return "javascript:" + encodeURIComponent(source);
        }
    });

    root.SEC29CargadorEJE = api;
    if (typeof module === "object" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
