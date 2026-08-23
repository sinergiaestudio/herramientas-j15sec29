(function () {
    "use strict";

    const BASE = "https://sinergiaestudio.github.io";
    const EXTERNAL_ROUTES = Object.freeze({
        "lotes-cedulas": `${BASE}/Cedulas-EJE-v1.0/`,
        cedulas: `${BASE}/Cedulas-EJE-v1.0/`,
        "confronte-liquidaciones": `${BASE}/Confronte-Liquidaciones-EJF-v2.1.0/`,
        confronte: `${BASE}/Confronte-Liquidaciones-EJF-v2.1.0/`
    });

    function routeFromHash() {
        return String(location.hash || "")
            .replace(/^#/, "")
            .trim()
            .toLocaleLowerCase("es-AR");
    }

    function navigateToExternal(route, replace = false) {
        const target = EXTERNAL_ROUTES[route];
        if (!target) return false;

        if (replace) location.replace(target);
        else location.assign(target);
        return true;
    }

    // Si alguien conserva un enlace histórico con hash, se lo lleva al módulo real
    // antes de que la suite intente construir una vista embebida.
    if (navigateToExternal(routeFromHash(), true)) return;

    // Delegación en captura: funciona también con los enlaces que navigation.js
    // incorpora dinámicamente al menú lateral.
    document.addEventListener("click", (event) => {
        const link = event.target instanceof Element
            ? event.target.closest("[data-route]")
            : null;
        if (!link) return;

        const route = String(link.dataset.route || "")
            .trim()
            .toLocaleLowerCase("es-AR");
        if (!EXTERNAL_ROUTES[route]) return;

        event.preventDefault();
        event.stopImmediatePropagation();
        navigateToExternal(route);
    }, true);
})();
