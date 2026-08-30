(function () {
    "use strict";

    const ROUTE_ORDER = [
        "actuaciones-lote",
        "lotes-actuaciones",
        "lotes-cedulas"
    ];

    function automationGroup() {
        return Array.from(document.querySelectorAll(".sidebar__group"))
            .find((group) => group.querySelector(".sidebar__group-label")
                ?.textContent
                ?.toLocaleLowerCase("es-AR")
                .includes("automatización"));
    }

    function synchronize() {
        const group = automationGroup();
        if (!group) return false;

        const links = new Map(
            Array.from(group.querySelectorAll("[data-route]"))
                .map((link) => [link.dataset.route, link])
        );

        if (!ROUTE_ORDER.every((route) => links.has(route))) return false;

        const canonicalHref = {
            "actuaciones-lote": "#actuaciones-lote",
            "lotes-actuaciones": "#lotes-actuaciones",
            "lotes-cedulas": "#lotes-cedulas"
        };

        ROUTE_ORDER.forEach((route) => {
            const link = links.get(route);
            link.href = canonicalHref[route];
            group.appendChild(link);
        });

        group.dataset.sec29MenuOrder = "6.5.1";
        return true;
    }

    function initialize() {
        if (synchronize()) return;

        const observer = new MutationObserver(() => {
            if (synchronize()) observer.disconnect();
        });

        observer.observe(document.body, { childList: true, subtree: true });
        window.setTimeout(() => observer.disconnect(), 8000);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialize, { once: true });
    } else {
        initialize();
    }
})();
