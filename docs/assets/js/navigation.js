(function () {
    "use strict";

    const ROUTES = {
        procesadores: {
            label: "Actuaciones y vencimientos",
            title: "Herramientas SEC29 · Actuaciones y vencimientos"
        },
        "cargador-eje": {
            label: "Cargador EJE",
            title: "Herramientas SEC29 · Cargador EJE"
        }
    };

    const OPEN_CLASS = "sidebar-is-open";

    function normalizeRoute(hash) {
        const candidate = String(hash || "")
            .replace(/^#/, "")
            .trim()
            .toLocaleLowerCase("es-AR");

        return Object.prototype.hasOwnProperty.call(ROUTES, candidate)
            ? candidate
            : "procesadores";
    }

    function initializeNavigation() {
        const body = document.body;
        const toggle = document.querySelector("[data-sidebar-toggle]");
        const sidebar = document.getElementById("app-sidebar");
        const closeControls = Array.from(document.querySelectorAll("[data-sidebar-close]"));
        const moduleLabel = document.querySelector("[data-current-module]");
        const routeLinks = Array.from(document.querySelectorAll("[data-route]"));
        const views = Array.from(document.querySelectorAll("[data-view]"));

        if (!toggle || !sidebar || routeLinks.length === 0 || views.length === 0) return;

        function isSidebarOpen() {
            return body.classList.contains(OPEN_CLASS);
        }

        function setToggleState() {
            const expanded = isSidebarOpen();
            toggle.setAttribute("aria-expanded", String(expanded));
            toggle.setAttribute(
                "aria-label",
                expanded ? "Cerrar menú de herramientas" : "Abrir menú de herramientas"
            );
            sidebar.setAttribute("aria-hidden", String(!expanded));
            if (expanded) {
                sidebar.removeAttribute("inert");
            } else {
                sidebar.setAttribute("inert", "");
            }
        }

        function openSidebar() {
            body.classList.add(OPEN_CLASS);
            setToggleState();
        }

        function closeSidebar(options = {}) {
            const wasOpen = isSidebarOpen();
            body.classList.remove(OPEN_CLASS);
            setToggleState();

            if (wasOpen && options.returnFocus) {
                toggle.focus();
            }
        }

        function toggleSidebar() {
            if (isSidebarOpen()) {
                closeSidebar();
            } else {
                openSidebar();
            }
        }

        function applyRoute(route, options = {}) {
            const normalizedRoute = normalizeRoute(route);

            views.forEach((view) => {
                const active = view.dataset.view === normalizedRoute;
                view.hidden = !active;
                view.setAttribute("aria-hidden", String(!active));
            });

            routeLinks.forEach((link) => {
                const active = link.dataset.route === normalizedRoute;
                link.classList.toggle("is-active", active);

                if (active) {
                    link.setAttribute("aria-current", "page");
                } else {
                    link.removeAttribute("aria-current");
                }
            });

            const routeMeta = ROUTES[normalizedRoute];
            document.title = routeMeta.title;
            if (moduleLabel) moduleLabel.textContent = routeMeta.label;

            if (options.updateHash !== false && location.hash !== `#${normalizedRoute}`) {
                history.replaceState(null, "", `#${normalizedRoute}`);
            }

            if (options.scroll !== false) {
                window.scrollTo({ top: 0, behavior: "auto" });
            }

            // El menú funciona como un panel de selección: luego de elegir un módulo,
            // vuelve a quedar completamente minimizado.
            closeSidebar();
        }

        toggle.addEventListener("click", toggleSidebar);
        closeControls.forEach((control) => {
            control.addEventListener("click", () => closeSidebar({ returnFocus: true }));
        });

        routeLinks.forEach((link) => {
            link.addEventListener("click", (event) => {
                event.preventDefault();
                const route = normalizeRoute(link.dataset.route);
                history.pushState(null, "", `#${route}`);
                applyRoute(route, { updateHash: false });
            });
        });

        window.addEventListener("hashchange", () => {
            applyRoute(location.hash, { updateHash: false });
        });

        window.addEventListener("popstate", () => {
            applyRoute(location.hash, { updateHash: false });
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && isSidebarOpen()) {
                closeSidebar({ returnFocus: true });
            }
        });

        // Estado inicial deliberadamente cerrado en cada carga, sin persistencia local.
        body.classList.remove(OPEN_CLASS);
        applyRoute(location.hash, {
            updateHash: !location.hash,
            scroll: true
        });
        setToggleState();
    }

    document.addEventListener("DOMContentLoaded", initializeNavigation);
})();
