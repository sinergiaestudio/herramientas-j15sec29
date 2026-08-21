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

    function integratedViewMarkup({ route, title, cardCopy, url, frameId, tool, icon, calculation }) {
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
                        <small>La primera apertura puede demorar mientras se preparan los componentes de lectura documental.</small>
                    </div>
                    <iframe
                        id="${frameId}"
                        class="integrated-app-frame"
                        data-external-frame
                        data-tool="${tool}"
                        data-src="${url}"
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
            cardCopy: "Vista continua: el desplazamiento pertenece a la página principal y no a una ventana interior.",
            url: CEDULAS_URL,
            frameId: "cedulasEjeFrame",
            tool: "cedulas",
            icon: "✉",
            calculation: false
        }));

        main.insertAdjacentHTML("beforeend", integratedViewMarkup({
            route: "confronte-liquidaciones",
            title: "Confronte de Liquidaciones EJF",
            cardCopy: "Vista continua: carga, revisión y resultados forman parte del desplazamiento general de la suite.",
            url: CONFRONTE_URL,
            frameId: "confronteEJFrame",
            tool: "confronte",
            icon: "≋",
            calculation: true
        }));
    }

    function updateShellMetadata() {
        const version = document.querySelector(".site-header__version");
        if (version) version.textContent = "v6.1";
    }

    function prepareV61Shell() {
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

    function injectedFrameCss(tool) {
        const common = `
            html, body {
                min-height: 0 !important;
                height: auto !important;
                overflow: hidden !important;
                background: transparent !important;
                overscroll-behavior: none !important;
            }
            body { margin: 0 !important; }
            .topbar { display: none !important; }
            .app-shell { min-height: 0 !important; }
            footer.footer { display: none !important; }
        `;

        if (tool === "cedulas") {
            return common + `
                .app-shell > .hero {
                    padding-top: 34px !important;
                    border-top: 0 !important;
                }
            `;
        }

        return common;
    }

    function integrateFrame(frame) {
        try {
            const childWindow = frame.contentWindow;
            const childDocument = frame.contentDocument;
            if (!childWindow || !childDocument?.documentElement || !childDocument.body) {
                throw new Error("Documento integrado no disponible");
            }

            frame._sec29Cleanup?.();

            let style = childDocument.getElementById("sec29-integrated-style");
            if (!style) {
                style = childDocument.createElement("style");
                style.id = "sec29-integrated-style";
                childDocument.head.appendChild(style);
            }
            style.textContent = injectedFrameCss(frame.dataset.tool);

            let pending = false;
            const resizeFrame = () => {
                pending = false;
                const body = childDocument.body;
                const html = childDocument.documentElement;
                if (!body || !html) return;

                // Se mide con un alto mínimo temporal para permitir tanto crecimiento como reducción.
                frame.style.height = "1px";
                const measured = Math.max(
                    body.scrollHeight,
                    body.offsetHeight,
                    html.scrollHeight,
                    html.offsetHeight,
                    body.getBoundingClientRect().height,
                    html.getBoundingClientRect().height
                );
                frame.style.height = `${Math.max(680, Math.ceil(measured) + 2)}px`;
            };

            const scheduleResize = () => {
                if (pending) return;
                pending = true;
                requestAnimationFrame(resizeFrame);
            };

            const resizeObserver = new ResizeObserver(scheduleResize);
            resizeObserver.observe(childDocument.documentElement);
            resizeObserver.observe(childDocument.body);

            const mutationObserver = new MutationObserver(scheduleResize);
            mutationObserver.observe(childDocument.body, {
                subtree: true,
                childList: true,
                attributes: true,
                characterData: true
            });

            const forwardWheel = (event) => {
                if (event.ctrlKey) return;
                window.scrollBy({
                    top: event.deltaY,
                    left: event.deltaX,
                    behavior: "auto"
                });
                event.preventDefault();
            };

            let touchPoint = null;
            const rememberTouch = (event) => {
                if (event.touches.length !== 1) {
                    touchPoint = null;
                    return;
                }
                touchPoint = {
                    x: event.touches[0].clientX,
                    y: event.touches[0].clientY
                };
            };

            const forwardTouch = (event) => {
                if (!touchPoint || event.touches.length !== 1) return;
                const current = event.touches[0];
                const deltaX = touchPoint.x - current.clientX;
                const deltaY = touchPoint.y - current.clientY;

                if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 1) {
                    window.scrollBy({ top: deltaY, left: 0, behavior: "auto" });
                    touchPoint = { x: current.clientX, y: current.clientY };
                    event.preventDefault();
                }
            };

            const forwardKeys = (event) => {
                const tag = event.target?.tagName?.toLowerCase();
                if (["input", "textarea", "select", "button"].includes(tag)) return;

                const movements = {
                    PageDown: Math.round(window.innerHeight * 0.86),
                    PageUp: -Math.round(window.innerHeight * 0.86),
                    ArrowDown: 48,
                    ArrowUp: -48,
                    " ": event.shiftKey ? -Math.round(window.innerHeight * 0.86) : Math.round(window.innerHeight * 0.86)
                };

                if (Object.prototype.hasOwnProperty.call(movements, event.key)) {
                    window.scrollBy({ top: movements[event.key], behavior: "auto" });
                    event.preventDefault();
                } else if (event.key === "Home") {
                    window.scrollTo({ top: 0, behavior: "auto" });
                    event.preventDefault();
                } else if (event.key === "End") {
                    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "auto" });
                    event.preventDefault();
                }
            };

            childDocument.addEventListener("wheel", forwardWheel, { passive: false });
            childDocument.addEventListener("touchstart", rememberTouch, { passive: true });
            childDocument.addEventListener("touchmove", forwardTouch, { passive: false });
            childDocument.addEventListener("touchend", () => { touchPoint = null; }, { passive: true });
            childDocument.addEventListener("keydown", forwardKeys, true);
            childDocument.addEventListener("click", scheduleResize, true);
            childDocument.addEventListener("change", scheduleResize, true);
            childWindow.addEventListener("resize", scheduleResize);
            window.addEventListener("resize", scheduleResize);

            frame._sec29Cleanup = () => {
                resizeObserver.disconnect();
                mutationObserver.disconnect();
                childDocument.removeEventListener("wheel", forwardWheel);
                childDocument.removeEventListener("touchstart", rememberTouch);
                childDocument.removeEventListener("touchmove", forwardTouch);
                childDocument.removeEventListener("keydown", forwardKeys, true);
                childDocument.removeEventListener("click", scheduleResize, true);
                childDocument.removeEventListener("change", scheduleResize, true);
                childWindow.removeEventListener("resize", scheduleResize);
                window.removeEventListener("resize", scheduleResize);
            };

            scheduleResize();
            [60, 250, 800, 1800].forEach((delay) => setTimeout(scheduleResize, delay));
            setFrameStatus(frame, true);
        } catch (error) {
            // Respaldo: si el navegador impide acceder al documento integrado,
            // la herramienta sigue disponible mediante “Abrir aparte”.
            frame.style.height = "82vh";
            frame.setAttribute("scrolling", "yes");
            setFrameStatus(frame, true);
            console.warn("No se pudo activar la vista continua:", error);
        }
    }

    function loadFrame(frame, force = false) {
        const source = frame.dataset.src;
        if (!source || (!force && frame.dataset.loaded === "true")) return;

        frame._sec29Cleanup?.();
        setFrameStatus(frame, false);
        frame.dataset.loaded = "true";
        frame.src = force
            ? source + (source.includes("?") ? "&" : "?") + "sec29_reload=" + Date.now()
            : source;
    }

    function initializeExternalFrames() {
        document.querySelectorAll("[data-external-frame]").forEach((frame) => {
            frame.addEventListener("load", () => integrateFrame(frame));
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
        prepareV61Shell();
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
