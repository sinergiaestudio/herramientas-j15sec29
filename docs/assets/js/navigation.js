(function () {
    "use strict";

    const ROUTES = {
        procesadores: {
            label: "Actuaciones y vencimientos",
            title: "Herramientas SEC29 · Actuaciones y vencimientos"
        },
        "actuaciones-lote": {
            label: "Creador de actuaciones en lote",
            title: "Herramientas SEC29 · Creador de actuaciones en lote"
        },
        "lotes-cedulas": {
            label: "Creador de Lotes - Cédulas",
            title: "Herramientas SEC29 · Creador de Lotes - Cédulas"
        },
        "confronte-liquidaciones": {
            label: "Confronte de Liquidaciones EJF",
            title: "Herramientas SEC29 · Confronte de Liquidaciones EJF"
        }
    };

    const ROUTE_ALIASES = {
        "cargador-eje": "actuaciones-lote",
        cedulas: "lotes-cedulas",
        confronte: "confronte-liquidaciones"
    };

    const OPEN_CLASS = "sidebar-is-open";
    const CEDULAS_URL = "https://sinergiaestudio.github.io/Cedulas-EJE-v1.0/";
    const CONFRONTE_URL = "https://sinergiaestudio.github.io/Confronte-Liquidaciones-EJF-v2.1.0/";

    function normalizeRoute(hash) {
        const candidate = String(hash || "")
            .replace(/^#/, "")
            .trim()
            .toLocaleLowerCase("es-AR");

        const resolved = ROUTE_ALIASES[candidate] || candidate;
        return Object.prototype.hasOwnProperty.call(ROUTES, resolved)
            ? resolved
            : "procesadores";
    }

    function ensureStyles() {
        if (document.querySelector('link[href$="styles-v6.css"]')) return;
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "./assets/css/styles-v6.css";
        document.head.appendChild(link);
    }

    function renameActuacionesModule() {
        const link = document.querySelector('[data-route="cargador-eje"]');
        if (link) {
            link.dataset.route = "actuaciones-lote";
            link.href = "#actuaciones-lote";
            const title = link.querySelector("strong");
            const subtitle = link.querySelector("small");
            const badge = link.querySelector(".nav-item__badge");
            if (title) title.textContent = "Creador de actuaciones en lote";
            if (subtitle) subtitle.textContent = "Carga secuencial de expedientes";
            if (badge) {
                badge.textContent = "EJE";
                badge.classList.remove("nav-item__badge--new");
            }
        }

        const view = document.querySelector('[data-view="cargador-eje"]');
        if (!view) return;
        view.dataset.view = "actuaciones-lote";

        const heroEyebrow = view.querySelector(".hero__eyebrow");
        const heroTitle = view.querySelector(".hero h1");
        const heroLead = view.querySelector(".hero__lead");
        const bookmarklet = view.querySelector("#ejeBookmarklet");
        const disclaimer = view.querySelector(".module-disclaimer");

        if (heroEyebrow) heroEyebrow.textContent = "Automatización operativa · Crear actuación";
        if (heroTitle) heroTitle.textContent = "Creador de actuaciones en lote";
        if (heroLead) {
            heroLead.textContent = "Carga una lista de expedientes de manera secuencial en la pantalla Crear actuación de una sesión autenticada de EJE.";
        }
        if (bookmarklet) bookmarklet.textContent = "⇩ Actuaciones en lote";
        if (disclaimer) {
            disclaimer.textContent = "No crea actuaciones, no selecciona modelos y no confirma decisiones: solo carga números de expediente en la pantalla actual.";
        }
    }

    function addMenuEntries() {
        const nav = document.querySelector(".sidebar__nav");
        if (!nav || nav.querySelector('[data-route="lotes-cedulas"]')) return;

        const groups = Array.from(nav.querySelectorAll(".sidebar__group"));
        const automationGroup = groups.find((group) =>
            group.querySelector(".sidebar__group-label")?.textContent.includes("Automatización")
        ) || groups[groups.length - 1];

        automationGroup?.insertAdjacentHTML("beforeend", `
            <a class="nav-item" href="#lotes-cedulas" data-route="lotes-cedulas">
                <span class="nav-item__icon" aria-hidden="true">✉</span>
                <span class="nav-item__copy">
                    <strong>Creador de Lotes - Cédulas</strong>
                    <small>Del PDF al lote de notificaciones</small>
                </span>
                <span class="nav-item__badge nav-item__badge--new">Nuevo</span>
            </a>
        `);

        nav.insertAdjacentHTML("beforeend", `
            <div class="sidebar__group">
                <p class="sidebar__group-label">Control y cálculo</p>
                <a class="nav-item" href="#confronte-liquidaciones" data-route="confronte-liquidaciones">
                    <span class="nav-item__icon" aria-hidden="true">≋</span>
                    <span class="nav-item__copy">
                        <strong>Confronte de Liquidaciones EJF</strong>
                        <small>Control documental e intereses</small>
                    </span>
                    <span class="nav-item__badge">2.1</span>
                </a>
            </div>
        `);
    }

    function externalViewMarkup({ route, eyebrow, title, lead, privacy, cardTitle, cardCopy, url, frameId, tall, icon }) {
        return `
            <section class="app-view external-app-view" data-view="${route}" hidden aria-hidden="true">
                <section class="hero hero--compact">
                    <div>
                        <p class="hero__eyebrow">${eyebrow}</p>
                        <h1>${title}</h1>
                        <p class="hero__lead">${lead}</p>
                    </div>
                    <div class="privacy-chip"><span aria-hidden="true">🔒</span><span>${privacy}</span></div>
                </section>
                <section class="embedded-tool-card">
                    <header class="embedded-tool-card__header">
                        <div class="embedded-tool-card__identity">
                            <span class="embedded-tool-card__icon${tall ? " embedded-tool-card__icon--calculation" : ""}" aria-hidden="true">${icon}</span>
                            <div>
                                <p class="embedded-tool-card__eyebrow">Aplicación integrada</p>
                                <h2>${cardTitle}</h2>
                                <p>${cardCopy}</p>
                            </div>
                        </div>
                        <div class="embedded-tool-card__actions">
                            <button class="button button--secondary button--compact" type="button" data-frame-reload="${frameId}">↻ Recargar</button>
                            <a class="button button--primary button--compact" href="${url}" target="_blank" rel="noopener noreferrer">↗ Abrir aparte</a>
                        </div>
                    </header>
                    <div class="embedded-tool-shell${tall ? " embedded-tool-shell--tall" : ""}" data-frame-shell>
                        <div class="embedded-tool-status" data-frame-status>
                            <span class="embedded-tool-status__spinner" aria-hidden="true"></span>
                            <strong>Cargando ${title}…</strong>
                            <small>La primera apertura puede demorar mientras se preparan los componentes de lectura documental.</small>
                        </div>
                        <iframe id="${frameId}" class="embedded-tool-frame" data-external-frame data-src="${url}" title="${title}" allow="clipboard-read; clipboard-write" referrerpolicy="strict-origin-when-cross-origin"></iframe>
                    </div>
                </section>
                <p class="module-disclaimer">Herramienta de asistencia interna. La revisión profesional y la confirmación final permanecen a cargo del usuario.</p>
            </section>
        `;
    }

    function addExternalViews() {
        const main = document.querySelector(".workspace__content main.app-shell");
        if (!main || main.querySelector('[data-view="lotes-cedulas"]')) return;

        main.insertAdjacentHTML("beforeend", externalViewMarkup({
            route: "lotes-cedulas",
            eyebrow: "Automatización EJE · Notificaciones",
            title: "Creador de Lotes - Cédulas",
            lead: "Analiza actuaciones en PDF, identifica las cédulas remitidas a la Oficina de Notificaciones y prepara su incorporación controlada en Crear lote de EJE.",
            privacy: "El PDF se procesa localmente y la creación definitiva del lote permanece bajo control humano.",
            cardTitle: "Cédulas EJE",
            cardCopy: "Detecta remisiones válidas, separa cédulas observadas y excluye los casos que no corresponden al circuito de la Oficina de Notificaciones.",
            url: CEDULAS_URL,
            frameId: "cedulasEjeFrame",
            tall: false,
            icon: "✉"
        }));

        main.insertAdjacentHTML("beforeend", externalViewMarkup({
            route: "confronte-liquidaciones",
            eyebrow: "Control judicial · Ejecuciones fiscales",
            title: "Confronte de Liquidaciones EJF",
            lead: "Compara constancias de deuda y liquidaciones mandatarias, permite revisar la lectura de los PDFs y recalcula intereses con trazabilidad por período.",
            privacy: "Los PDFs se procesan en el navegador y no se envían a un servidor.",
            cardTitle: "Confronte de Liquidaciones EJF · v2.1",
            cardCopy: "Controla identidad e integridad nominal, reconoce ejecuciones especiales y expone el desarrollo del cálculo por posición y por tramo.",
            url: CONFRONTE_URL,
            frameId: "confronteEJFrame",
            tall: true,
            icon: "≋"
        }));
    }

    function updateShellMetadata() {
        const version = document.querySelector(".site-header__version");
        if (version) version.textContent = "v6.0";
    }

    function prepareV6Shell() {
        ensureStyles();
        renameActuacionesModule();
        addMenuEntries();
        addExternalViews();
        updateShellMetadata();
    }

    function setFrameStatus(frame, ready) {
        const shell = frame.closest("[data-frame-shell]");
        const status = shell?.querySelector("[data-frame-status]");
        if (!status) return;
        status.hidden = ready;
    }

    function loadFrame(frame, force = false) {
        const source = frame.dataset.src;
        if (!source || (!force && frame.dataset.loaded === "true")) return;
        setFrameStatus(frame, false);
        frame.dataset.loaded = "true";
        frame.src = force
            ? source + (source.includes("?") ? "&" : "?") + "sec29_reload=" + Date.now()
            : source;
    }

    function initializeExternalFrames() {
        document.querySelectorAll("[data-external-frame]").forEach((frame) => {
            frame.addEventListener("load", () => setFrameStatus(frame, true));
        });

        document.querySelectorAll("[data-frame-reload]").forEach((button) => {
            button.addEventListener("click", () => {
                const frame = document.getElementById(button.dataset.frameReload);
                if (frame) loadFrame(frame, true);
            });
        });
    }

    function loadFramesForRoute(route) {
        document.querySelectorAll(`[data-view="${route}"] [data-external-frame]`)
            .forEach((frame) => loadFrame(frame));
    }

    function initializeNavigation() {
        prepareV6Shell();
        initializeExternalFrames();

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
            toggle.setAttribute("aria-label", expanded ? "Cerrar menú de herramientas" : "Abrir menú de herramientas");
            sidebar.setAttribute("aria-hidden", String(!expanded));
            if (expanded) sidebar.removeAttribute("inert");
            else sidebar.setAttribute("inert", "");
        }

        function openSidebar() {
            body.classList.add(OPEN_CLASS);
            setToggleState();
        }

        function closeSidebar(options = {}) {
            const wasOpen = isSidebarOpen();
            body.classList.remove(OPEN_CLASS);
            setToggleState();
            if (wasOpen && options.returnFocus) toggle.focus();
        }

        function toggleSidebar() {
            if (isSidebarOpen()) closeSidebar();
            else openSidebar();
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
                if (active) link.setAttribute("aria-current", "page");
                else link.removeAttribute("aria-current");
            });

            const routeMeta = ROUTES[normalizedRoute];
            document.title = routeMeta.title;
            if (moduleLabel) moduleLabel.textContent = routeMeta.label;

            if (options.updateHash !== false && location.hash !== `#${normalizedRoute}`) {
                history.replaceState(null, "", `#${normalizedRoute}`);
            }

            if (options.scroll !== false) window.scrollTo({ top: 0, behavior: "auto" });
            loadFramesForRoute(normalizedRoute);
            closeSidebar();
        }

        toggle.addEventListener("click", toggleSidebar);
        closeControls.forEach((control) => control.addEventListener("click", () => closeSidebar({ returnFocus: true })));

        routeLinks.forEach((link) => {
            link.addEventListener("click", (event) => {
                event.preventDefault();
                const route = normalizeRoute(link.dataset.route);
                history.pushState(null, "", `#${route}`);
                applyRoute(route, { updateHash: false });
            });
        });

        window.addEventListener("hashchange", () => applyRoute(location.hash, { updateHash: false }));
        window.addEventListener("popstate", () => applyRoute(location.hash, { updateHash: false }));
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && isSidebarOpen()) closeSidebar({ returnFocus: true });
        });

        body.classList.remove(OPEN_CLASS);
        applyRoute(location.hash, { updateHash: !location.hash, scroll: true });
        setToggleState();
    }

    document.addEventListener("DOMContentLoaded", initializeNavigation);
})();
