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
    const PAGES_ORIGIN = "https://sinergiaestudio.github.io";
    const CEDULAS_URL = `${PAGES_ORIGIN}/Cedulas-EJE-v1.0/`;
    const CONFRONTE_URL = `${PAGES_ORIGIN}/Confronte-Liquidaciones-EJF-v2.1.0/`;

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

    function addEmbedParameters(url, tool) {
        const target = new URL(url);
        target.searchParams.set("sec29_embed", "1");
        target.searchParams.set("sec29_tool", tool);
        return target.toString();
    }

    function integratedViewMarkup({ route, title, cardCopy, url, frameId, tool, icon, calculation }) {
        const embedUrl = addEmbedParameters(url, tool);

        return `
            <section class="app-view external-app-view" data-view="${route}" hidden aria-hidden="true">
                <div class="integrated-app-bar">
                    <div class="integrated-app-bar__identity">
                        <span class="integrated-app-bar__icon${calculation ? " integrated-app-bar__icon--calculation" : ""}" aria-hidden="true">${icon}</span>
                        <span class="integrated-app-bar__copy">
                            <strong>${title}</strong>
                            <small>${cardCopy}</small>
                        </span>
                    </div>
                    <div class="integrated-app-bar__actions">
                        <button class="button button--secondary button--compact" type="button" data-frame-reload="${frameId}">↻ Recargar</button>
                        <a class="button button--primary button--compact" href="${url}" target="_blank" rel="noopener noreferrer">↗ Abrir aparte</a>
                    </div>
                </div>

                <div class="integrated-app-canvas" data-frame-shell>
                    <div class="integrated-app-status" data-frame-status>
                        <span class="integrated-app-status__spinner" aria-hidden="true"></span>
                        <strong>Cargando ${title}…</strong>
                        <small>Preparando una vista continua, sin una barra de desplazamiento interior.</small>
                    </div>

                    <iframe
                        id="${frameId}"
                        class="integrated-app-frame"
                        data-external-frame
                        data-tool="${tool}"
                        data-src="${embedUrl}"
                        title="${title}"
                        scrolling="no"
                        allow="clipboard-read; clipboard-write"
                        referrerpolicy="strict-origin-when-cross-origin"
                    ></iframe>
                </div>

                <p class="module-disclaimer">Herramienta de asistencia interna. La revisión profesional y la confirmación final permanecen a cargo del usuario.</p>
            </section>
        `;
    }

    function addExternalViews() {
        const main = document.querySelector(".workspace__content main.app-shell");
        if (!main || main.querySelector('[data-view="lotes-cedulas"]')) return;

        main.insertAdjacentHTML("beforeend", integratedViewMarkup({
            route: "lotes-cedulas",
            title: "Creador de Lotes - Cédulas",
            cardCopy: "Vista continua: el desplazamiento vertical pertenece a la página principal.",
            url: CEDULAS_URL,
            frameId: "cedulasEjeFrame",
            tool: "cedulas",
            icon: "✉",
            calculation: false
        }));

        main.insertAdjacentHTML("beforeend", integratedViewMarkup({
            route: "confronte-liquidaciones",
            title: "Confronte de Liquidaciones EJF",
            cardCopy: "Vista continua: carga, revisión y resultados comparten un único desplazamiento.",
            url: CONFRONTE_URL,
            frameId: "confronteEJFrame",
            tool: "confronte",
            icon: "≋",
            calculation: true
        }));
    }

    function updateShellMetadata() {
        const version = document.querySelector(".site-header__version");
        if (version) version.textContent = "v6.2";
    }

    function prepareShell() {
        ensureStyles();
        renameActuacionesModule();
        addMenuEntries();
        addExternalViews();
        updateShellMetadata();
    }

    function setFrameStatus(frame, ready, message) {
        const shell = frame.closest("[data-frame-shell]");
        const status = shell?.querySelector("[data-frame-status]");
        if (!status) return;

        status.hidden = ready;
        if (message) {
            const strong = status.querySelector("strong");
            if (strong) strong.textContent = message;
        }
    }

    function setFrameHeight(frame, rawHeight) {
        const value = Number(rawHeight);
        if (!Number.isFinite(value)) return;

        const minimum = window.matchMedia("(max-width: 620px)").matches ? 620 : 680;
        const height = Math.max(minimum, Math.min(60000, Math.ceil(value)));
        const shell = frame.closest("[data-frame-shell]");

        frame.style.height = `${height}px`;
        frame.style.minHeight = `${height}px`;
        if (shell) shell.style.minHeight = `${height}px`;
        frame.dataset.bridgeReady = "true";
        frame.setAttribute("scrolling", "no");
        setFrameStatus(frame, true);
    }

    function frameFromSource(source) {
        return Array.from(document.querySelectorAll("[data-external-frame]"))
            .find((frame) => frame.contentWindow === source);
    }

    function initializeFrameBridge() {
        window.addEventListener("message", (event) => {
            if (event.origin !== PAGES_ORIGIN) return;

            const frame = frameFromSource(event.source);
            if (!frame || !event.data || typeof event.data !== "object") return;

            const message = event.data;

            if (message.type === "sec29-embed-ready") {
                frame.dataset.bridgeReady = "true";
                frame.setAttribute("scrolling", "no");
                setFrameStatus(frame, true);
                return;
            }

            if (message.type === "sec29-embed-height") {
                setFrameHeight(frame, message.height);
                return;
            }

            if (message.type === "sec29-embed-scroll") {
                const x = Number(message.x) || 0;
                const y = Number(message.y) || 0;
                if (x || y) {
                    window.scrollBy({ left: x, top: y, behavior: "auto" });
                }
                return;
            }

            if (message.type === "sec29-embed-scroll-to") {
                const top = message.position === "end"
                    ? document.documentElement.scrollHeight
                    : 0;
                window.scrollTo({ top, behavior: "auto" });
            }
        });
    }

    function loadFrame(frame, force = false) {
        const source = frame.dataset.src;
        if (!source || (!force && frame.dataset.loaded === "true")) return;

        setFrameStatus(frame, false);
        frame.dataset.loaded = "true";
        frame.dataset.bridgeReady = "false";
        frame.setAttribute("scrolling", "no");

        const target = new URL(source);
        if (force) target.searchParams.set("sec29_reload", String(Date.now()));
        frame.src = target.toString();

        window.setTimeout(() => {
            if (frame.dataset.bridgeReady === "true") return;

            // Respaldo operativo: si la aplicación especializada todavía no publicó
            // el puente, sigue siendo utilizable con desplazamiento propio.
            frame.style.height = "82vh";
            frame.style.minHeight = "680px";
            frame.setAttribute("scrolling", "yes");
            setFrameStatus(frame, true);
        }, 12000);
    }

    function initializeExternalFrames() {
        initializeFrameBridge();

        document.querySelectorAll("[data-external-frame]").forEach((frame) => {
            frame.addEventListener("load", () => {
                window.setTimeout(() => {
                    if (frame.dataset.bridgeReady !== "true") {
                        setFrameStatus(frame, false, "Terminando de preparar la vista continua…");
                    }
                }, 250);
            });
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
        prepareShell();
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
            toggle.setAttribute(
                "aria-label",
                expanded ? "Cerrar menú de herramientas" : "Abrir menú de herramientas"
            );
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

            if (options.scroll !== false) {
                window.scrollTo({ top: 0, behavior: "auto" });
            }

            loadFramesForRoute(normalizedRoute);
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

        body.classList.remove(OPEN_CLASS);
        applyRoute(location.hash, {
            updateHash: !location.hash,
            scroll: true
        });
        setToggleState();
    }

    document.addEventListener("DOMContentLoaded", initializeNavigation);
})();
