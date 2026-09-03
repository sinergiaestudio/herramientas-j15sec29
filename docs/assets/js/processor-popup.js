(function () {
    "use strict";

    const COMPACT_MODE_KEY = "modo";
    const COMPACT_MODE_VALUE = "procesador-actuaciones";
    const COMPACT_URL = "https://sinergiaestudio.github.io/herramientas-j15sec29/?modo=procesador-actuaciones&panel=1#procesadores";
    const PANEL_HOST_ID = "__sec29_procesador_actuaciones_panel__";
    const PANEL_STATE_KEY = "sec29-procesador-actuaciones-panel-v1";
    const INSTALLER_ID = "processorActuacionesBookmarklet";

    function isCompactMode() {
        return new URLSearchParams(window.location.search).get(COMPACT_MODE_KEY) === COMPACT_MODE_VALUE;
    }

    function floatingPanelBookmarklet(frameUrl, hostId, stateKey) {
        "use strict";

        const MAX_Z_INDEX = "2147483647";
        const MIN_WIDTH = 360;
        const MIN_HEIGHT = 420;
        const EDGE = 10;
        const HEADER_HEIGHT = 54;

        function viewport() {
            return {
                width: Math.max(document.documentElement?.clientWidth || 0, window.innerWidth || 0, 320),
                height: Math.max(document.documentElement?.clientHeight || 0, window.innerHeight || 0, 480)
            };
        }

        function clamp(value, minimum, maximum) {
            return Math.min(Math.max(value, minimum), Math.max(minimum, maximum));
        }

        function restoreExisting() {
            const existing = document.getElementById(hostId);
            if (!existing) return false;

            existing.style.display = "block";
            existing.style.zIndex = MAX_Z_INDEX;

            const shadow = existing.shadowRoot;
            const panel = shadow?.querySelector("[data-sec29-processor-panel]");
            const frame = shadow?.querySelector("iframe");

            if (panel?.classList.contains("is-minimized")) {
                const expandedHeight = Number(panel.dataset.expandedHeight) || Math.min(790, viewport().height - EDGE * 2);
                panel.classList.remove("is-minimized");
                panel.style.height = `${expandedHeight}px`;
                panel.style.resize = "both";
                const minimizeButton = shadow.querySelector("[data-panel-minimize]");
                if (minimizeButton) {
                    minimizeButton.textContent = "—";
                    minimizeButton.setAttribute("aria-label", "Minimizar panel");
                    minimizeButton.title = "Minimizar";
                }
            }

            panel?.focus({ preventScroll: true });
            frame?.focus({ preventScroll: true });
            return true;
        }

        if (restoreExisting()) return;

        const host = document.createElement("div");
        host.id = hostId;
        host.setAttribute("data-sec29-tool", "procesador-actuaciones");
        Object.assign(host.style, {
            all: "initial",
            position: "fixed",
            inset: "0",
            display: "block",
            zIndex: MAX_Z_INDEX,
            pointerEvents: "none"
        });

        const mount = document.documentElement || document.body;
        if (!mount) {
            window.alert("No fue posible abrir el Procesador de actuaciones en esta página.");
            return;
        }
        mount.appendChild(host);

        const shadow = host.attachShadow({ mode: "open" });
        shadow.innerHTML = `
            <style>
                :host {
                    all: initial;
                    color-scheme: light;
                    font-family: Inter, "Segoe UI", Roboto, Arial, sans-serif;
                }

                * {
                    box-sizing: border-box;
                }

                .panel {
                    position: fixed;
                    top: 72px;
                    left: 24px;
                    width: 520px;
                    height: 790px;
                    min-width: min(${MIN_WIDTH}px, calc(100vw - ${EDGE * 2}px));
                    min-height: min(${MIN_HEIGHT}px, calc(100vh - ${EDGE * 2}px));
                    max-width: calc(100vw - ${EDGE * 2}px);
                    max-height: calc(100vh - ${EDGE * 2}px);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    resize: both;
                    pointer-events: auto;
                    color: #2b2f36;
                    border: 1px solid rgba(104, 16, 31, .28);
                    border-radius: 17px;
                    background: #f3f1ed;
                    box-shadow:
                        0 28px 78px rgba(24, 14, 17, .28),
                        0 8px 24px rgba(24, 14, 17, .16);
                    outline: none;
                    isolation: isolate;
                }

                .panel:focus-visible {
                    box-shadow:
                        0 0 0 3px rgba(159, 29, 52, .2),
                        0 28px 78px rgba(24, 14, 17, .28);
                }

                .panel.is-minimized {
                    min-height: ${HEADER_HEIGHT}px !important;
                    height: ${HEADER_HEIGHT}px !important;
                    resize: none !important;
                }

                .panel.is-minimized .panel__body,
                .panel.is-minimized .resize-cue {
                    display: none;
                }

                .panel__header {
                    min-height: ${HEADER_HEIGHT}px;
                    flex: 0 0 ${HEADER_HEIGHT}px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    padding: 8px 10px 8px 13px;
                    color: #fff;
                    border-bottom: 1px solid rgba(255, 255, 255, .13);
                    background: linear-gradient(115deg, #7a1428, #9f1d34 70%, #ad243c);
                    cursor: move;
                    user-select: none;
                    touch-action: none;
                }

                .panel__identity {
                    min-width: 0;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .panel__mark {
                    width: 34px;
                    height: 34px;
                    flex: 0 0 34px;
                    display: grid;
                    place-items: center;
                    border: 1px solid rgba(255, 255, 255, .22);
                    border-radius: 10px;
                    background: rgba(255, 255, 255, .1);
                    font-size: 17px;
                    font-weight: 800;
                }

                .panel__copy {
                    min-width: 0;
                    display: grid;
                    gap: 2px;
                    line-height: 1.12;
                }

                .panel__copy strong {
                    overflow: hidden;
                    font-size: 12.5px;
                    font-weight: 800;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .panel__copy small {
                    overflow: hidden;
                    color: rgba(255, 255, 255, .76);
                    font-size: 9.5px;
                    font-weight: 600;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .panel__controls {
                    flex: 0 0 auto;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .panel__control,
                .panel__external {
                    width: 31px;
                    height: 31px;
                    display: grid;
                    place-items: center;
                    padding: 0;
                    color: #fff;
                    border: 1px solid rgba(255, 255, 255, .23);
                    border-radius: 9px;
                    background: rgba(255, 255, 255, .08);
                    cursor: pointer;
                    font: 700 15px/1 "Segoe UI Symbol", "Segoe UI", sans-serif;
                    text-decoration: none;
                }

                .panel__control:hover,
                .panel__control:focus-visible,
                .panel__external:hover,
                .panel__external:focus-visible {
                    border-color: rgba(255, 255, 255, .42);
                    background: rgba(255, 255, 255, .17);
                    outline: none;
                }

                .panel__body {
                    position: relative;
                    min-height: 0;
                    flex: 1 1 auto;
                    overflow: hidden;
                    background: #f3f1ed;
                }

                .panel__loading {
                    position: absolute;
                    inset: 0;
                    z-index: 0;
                    display: grid;
                    place-items: center;
                    padding: 24px;
                    color: #656d78;
                    background:
                        radial-gradient(circle at 50% 22%, rgba(159, 29, 52, .09), transparent 18rem),
                        linear-gradient(180deg, #f8f7f4, #efede8);
                    text-align: center;
                    font: 650 11px/1.5 Inter, "Segoe UI", sans-serif;
                }

                .panel__loading a {
                    display: inline-flex;
                    margin-top: 10px;
                    color: #821529;
                    font-weight: 800;
                    text-underline-offset: 2px;
                }

                .panel__body.is-ready .panel__loading {
                    display: none;
                }

                iframe {
                    position: relative;
                    z-index: 1;
                    width: 100%;
                    height: 100%;
                    display: block;
                    border: 0;
                    background: transparent;
                }

                .resize-cue {
                    position: absolute;
                    right: 5px;
                    bottom: 3px;
                    z-index: 3;
                    width: 16px;
                    height: 16px;
                    display: grid;
                    place-items: center;
                    pointer-events: none;
                    color: rgba(104, 16, 31, .52);
                    font-size: 16px;
                    line-height: 1;
                    transform: rotate(-1deg);
                }

                @media (max-width: 560px) {
                    .panel {
                        width: calc(100vw - ${EDGE * 2}px);
                        height: calc(100vh - ${EDGE * 2}px);
                    }

                    .panel__copy small,
                    [data-panel-reset],
                    .panel__external {
                        display: none;
                    }
                }
            </style>

            <section
                class="panel"
                data-sec29-processor-panel
                role="dialog"
                aria-label="Procesador de actuaciones"
                tabindex="-1"
            >
                <header class="panel__header" data-panel-drag-handle>
                    <div class="panel__identity">
                        <span class="panel__mark" aria-hidden="true">▤</span>
                        <span class="panel__copy">
                            <strong>Procesador de actuaciones</strong>
                            <small>SEC29 · procesamiento local</small>
                        </span>
                    </div>
                    <div class="panel__controls">
                        <a
                            class="panel__external"
                            href="${frameUrl}"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Abrir en una pestaña"
                            title="Abrir en pestaña"
                        >↗</a>
                        <button
                            class="panel__control"
                            type="button"
                            data-panel-reset
                            aria-label="Restablecer posición y tamaño"
                            title="Restablecer"
                        >↺</button>
                        <button
                            class="panel__control"
                            type="button"
                            data-panel-minimize
                            aria-label="Minimizar panel"
                            title="Minimizar"
                        >—</button>
                        <button
                            class="panel__control"
                            type="button"
                            data-panel-close
                            aria-label="Cerrar panel"
                            title="Cerrar"
                        >×</button>
                    </div>
                </header>
                <div class="panel__body" data-panel-body>
                    <div class="panel__loading" data-panel-loading>
                        <span>
                            Cargando el procesador…
                            <br>
                            <a href="${frameUrl}" target="_blank" rel="noopener noreferrer">Abrir en pestaña</a>
                        </span>
                    </div>
                    <iframe
                        data-panel-frame
                        title="Procesador de actuaciones SEC29"
                        allow="clipboard-read; clipboard-write"
                        referrerpolicy="strict-origin-when-cross-origin"
                    ></iframe>
                </div>
                <span class="resize-cue" aria-hidden="true">◢</span>
            </section>
        `;

        const panel = shadow.querySelector("[data-sec29-processor-panel]");
        const header = shadow.querySelector("[data-panel-drag-handle]");
        const frame = shadow.querySelector("[data-panel-frame]");
        const body = shadow.querySelector("[data-panel-body]");
        const loading = shadow.querySelector("[data-panel-loading]");
        const minimizeButton = shadow.querySelector("[data-panel-minimize]");
        const closeButton = shadow.querySelector("[data-panel-close]");
        const resetButton = shadow.querySelector("[data-panel-reset]");

        let dragState = null;
        let resizeTimer = 0;
        let loadingTimer = 0;

        function defaultState() {
            const size = viewport();
            const width = Math.min(520, size.width - EDGE * 2);
            const height = Math.min(790, size.height - EDGE * 2);
            return {
                width,
                height,
                left: Math.max(EDGE, size.width - width - 18),
                top: clamp(72, EDGE, size.height - HEADER_HEIGHT - EDGE)
            };
        }

        function readState() {
            try {
                const parsed = JSON.parse(window.localStorage.getItem(stateKey) || "null");
                if (!parsed || typeof parsed !== "object") return defaultState();
                return parsed;
            } catch (_error) {
                return defaultState();
            }
        }

        function normalizedState(candidate) {
            const size = viewport();
            const defaults = defaultState();
            const width = clamp(Number(candidate.width) || defaults.width, Math.min(MIN_WIDTH, size.width - EDGE * 2), size.width - EDGE * 2);
            const height = clamp(Number(candidate.height) || defaults.height, Math.min(MIN_HEIGHT, size.height - EDGE * 2), size.height - EDGE * 2);
            const left = clamp(Number(candidate.left), EDGE, size.width - Math.min(width, 120));
            const top = clamp(Number(candidate.top), EDGE, size.height - HEADER_HEIGHT - EDGE);
            return { width, height, left, top };
        }

        function applyState(candidate) {
            const state = normalizedState(candidate);
            panel.style.width = `${state.width}px`;
            panel.style.height = `${state.height}px`;
            panel.style.left = `${state.left}px`;
            panel.style.top = `${state.top}px`;
            panel.style.right = "auto";
            panel.style.bottom = "auto";
            panel.dataset.expandedHeight = String(state.height);
        }

        function currentState() {
            const rect = panel.getBoundingClientRect();
            const expandedHeight = panel.classList.contains("is-minimized")
                ? Number(panel.dataset.expandedHeight) || MIN_HEIGHT
                : rect.height;

            return normalizedState({
                width: rect.width,
                height: expandedHeight,
                left: rect.left,
                top: rect.top
            });
        }

        function saveState() {
            try {
                window.localStorage.setItem(stateKey, JSON.stringify(currentState()));
            } catch (_error) {
                // El panel funciona aunque la página bloquee el almacenamiento local.
            }
        }

        function constrainToViewport() {
            applyState(currentState());
            saveState();
        }

        function bringToFront() {
            host.style.zIndex = MAX_Z_INDEX;
            panel.focus({ preventScroll: true });
        }

        function toggleMinimize() {
            if (panel.classList.contains("is-minimized")) {
                const restored = normalizedState({
                    ...currentState(),
                    height: Number(panel.dataset.expandedHeight) || MIN_HEIGHT
                });
                panel.classList.remove("is-minimized");
                panel.style.height = `${restored.height}px`;
                panel.style.resize = "both";
                minimizeButton.textContent = "—";
                minimizeButton.setAttribute("aria-label", "Minimizar panel");
                minimizeButton.title = "Minimizar";
            } else {
                const rect = panel.getBoundingClientRect();
                panel.dataset.expandedHeight = String(rect.height);
                panel.classList.add("is-minimized");
                panel.style.height = `${HEADER_HEIGHT}px`;
                panel.style.resize = "none";
                minimizeButton.textContent = "□";
                minimizeButton.setAttribute("aria-label", "Restaurar panel");
                minimizeButton.title = "Restaurar";
            }
            saveState();
        }

        function cleanup() {
            window.clearTimeout(resizeTimer);
            window.clearTimeout(loadingTimer);
            resizeObserver.disconnect();
            window.removeEventListener("resize", constrainToViewport);
            host.remove();
        }

        applyState(readState());

        header.addEventListener("pointerdown", (event) => {
            if (event.button !== 0 || event.target.closest("button, a")) return;

            const rect = panel.getBoundingClientRect();
            dragState = {
                pointerId: event.pointerId,
                offsetX: event.clientX - rect.left,
                offsetY: event.clientY - rect.top
            };

            header.setPointerCapture(event.pointerId);
            bringToFront();
            event.preventDefault();
        });

        header.addEventListener("pointermove", (event) => {
            if (!dragState || dragState.pointerId !== event.pointerId) return;

            const size = viewport();
            const rect = panel.getBoundingClientRect();
            const left = clamp(event.clientX - dragState.offsetX, EDGE, size.width - Math.min(rect.width, 120));
            const top = clamp(event.clientY - dragState.offsetY, EDGE, size.height - HEADER_HEIGHT - EDGE);

            panel.style.left = `${left}px`;
            panel.style.top = `${top}px`;
            panel.style.right = "auto";
            panel.style.bottom = "auto";
        });

        function endDrag(event) {
            if (!dragState || dragState.pointerId !== event.pointerId) return;
            try {
                header.releasePointerCapture(event.pointerId);
            } catch (_error) {
                // El navegador puede haber liberado la captura al cambiar de pestaña.
            }
            dragState = null;
            saveState();
        }

        header.addEventListener("pointerup", endDrag);
        header.addEventListener("pointercancel", endDrag);
        panel.addEventListener("pointerdown", bringToFront);

        minimizeButton.addEventListener("click", toggleMinimize);
        closeButton.addEventListener("click", cleanup);
        resetButton.addEventListener("click", () => {
            panel.classList.remove("is-minimized");
            panel.style.resize = "both";
            minimizeButton.textContent = "—";
            minimizeButton.setAttribute("aria-label", "Minimizar panel");
            minimizeButton.title = "Minimizar";
            applyState(defaultState());
            saveState();
        });

        const resizeObserver = new ResizeObserver(() => {
            if (panel.classList.contains("is-minimized")) return;
            window.clearTimeout(resizeTimer);
            resizeTimer = window.setTimeout(saveState, 140);
        });
        resizeObserver.observe(panel);

        window.addEventListener("resize", constrainToViewport);

        frame.addEventListener("load", () => {
            window.clearTimeout(loadingTimer);
            body.classList.add("is-ready");
        });

        frame.addEventListener("error", () => {
            window.clearTimeout(loadingTimer);
            loading.innerHTML = `<span>No fue posible cargar el panel en esta página.<br><a href="${frameUrl}" target="_blank" rel="noopener noreferrer">Abrir en pestaña</a></span>`;
        });

        loadingTimer = window.setTimeout(() => {
            if (body.classList.contains("is-ready")) return;
            loading.innerHTML = `<span>La página está demorando en permitir el panel.<br><a href="${frameUrl}" target="_blank" rel="noopener noreferrer">Abrir en pestaña</a></span>`;
        }, 9000);

        frame.src = frameUrl;
        bringToFront();
    }

    function panelSource() {
        return `(${floatingPanelBookmarklet.toString()})(${JSON.stringify(COMPACT_URL)}, ${JSON.stringify(PANEL_HOST_ID)}, ${JSON.stringify(PANEL_STATE_KEY)});`;
    }

    function toBookmarklet() {
        return `javascript:${encodeURIComponent(panelSource())}`;
    }

    function installQuickAccess() {
        const card = document.querySelector('[data-processor="actuaciones"]');
        const header = card?.querySelector(".tool-card__header");

        if (!card || !header || document.getElementById(INSTALLER_ID)) return;

        const access = document.createElement("div");
        access.className = "processor-popup-access";

        const copy = document.createElement("span");
        copy.className = "processor-popup-access__copy";

        const title = document.createElement("strong");
        title.textContent = "Panel flotante";

        const help = document.createElement("small");
        help.textContent = "Arrastrá el botón a la barra de marcadores. Después, un clic despliega el procesador sobre la página actual; podés moverlo, redimensionarlo y minimizarlo.";

        copy.append(title, help);

        const link = document.createElement("a");
        link.id = INSTALLER_ID;
        link.className = "processor-popup-bookmarklet";
        link.href = toBookmarklet();
        link.title = "Arrastrá este botón a la barra de marcadores de Chrome";
        link.setAttribute(
            "aria-label",
            "Procesador de actuaciones. Arrastrar a la barra de marcadores o hacer clic para desplegar el panel flotante."
        );
        link.innerHTML = '<span aria-hidden="true">▤</span><span>Procesador de actuaciones</span>';

        access.append(copy, link);
        header.insertAdjacentElement("afterend", access);
    }

    function activateCompactMode() {
        document.documentElement.classList.add("processor-popup-mode");
        document.body.classList.add("processor-popup-mode");
        document.body.classList.remove("sidebar-is-open");

        if (window.location.hash !== "#procesadores") {
            window.history.replaceState(
                null,
                "",
                `${window.location.pathname}${window.location.search}#procesadores`
            );
        }

        document.title = "Procesador de actuaciones · SEC29";

        document.querySelectorAll("[data-view]").forEach((view) => {
            const active = view.dataset.view === "procesadores";
            view.hidden = !active;
            view.setAttribute("aria-hidden", String(!active));
        });

        const card = document.querySelector('[data-processor="actuaciones"]');
        card?.setAttribute("aria-label", "Procesador de actuaciones en modo compacto");

        const sidebar = document.getElementById("app-sidebar");
        sidebar?.setAttribute("aria-hidden", "true");
        sidebar?.setAttribute("inert", "");
    }

    function updateVersion() {
        const version = document.querySelector(".site-header__version");
        if (version) version.textContent = "v6.7.1";
    }

    function initialize() {
        if (isCompactMode()) activateCompactMode();
        else installQuickAccess();

        updateVersion();
    }

    if (isCompactMode()) {
        document.documentElement.classList.add("processor-popup-mode");
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialize, { once: true });
    } else {
        initialize();
    }
})();