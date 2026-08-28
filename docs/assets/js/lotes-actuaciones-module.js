(function () {
    "use strict";

    const ROUTE = "lotes-actuaciones";
    const MODULE_TITLE = "Creador de Lotes - Actuaciones";

    function copyText(text) {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(text);
        }

        return new Promise((resolve, reject) => {
            const helper = document.createElement("textarea");
            helper.value = text;
            helper.setAttribute("readonly", "");
            helper.style.position = "fixed";
            helper.style.opacity = "0";
            helper.style.pointerEvents = "none";
            document.body.appendChild(helper);
            helper.select();

            const copied = document.execCommand("copy");
            helper.remove();

            if (copied) resolve();
            else reject(new Error("El navegador no permitió copiar el contenido."));
        });
    }

    function closeSidebar() {
        const body = document.body;
        const toggle = document.querySelector("[data-sidebar-toggle]");
        const sidebar = document.getElementById("app-sidebar");

        body.classList.remove("sidebar-is-open");
        toggle?.setAttribute("aria-expanded", "false");
        toggle?.setAttribute("aria-label", "Abrir menú de herramientas");
        sidebar?.setAttribute("aria-hidden", "true");
        sidebar?.setAttribute("inert", "");
    }

    function moduleMarkup() {
        return `
            <section class="app-view" data-view="${ROUTE}" hidden aria-hidden="true">
                <section class="hero">
                    <div>
                        <p class="hero__eyebrow">Automatización EJE · Crear lote</p>
                        <h1>${MODULE_TITLE}</h1>
                        <p class="hero__lead">
                            Recorre una lista de expedientes dentro de Crear lote y ejecuta la secuencia
                            Expediente → Aplicar y agregar → Limpiar, manteniendo el filtro en BORRADOR.
                        </p>
                    </div>
                    <div class="privacy-chip">
                        <span aria-hidden="true">🔒</span>
                        <span>Opera dentro de la pestaña autenticada de EJE; no almacena credenciales ni presiona el botón final Agregar.</span>
                    </div>
                </section>

                <section class="eje-layout">
                    <article class="module-card">
                        <header class="module-card__header">
                            <div class="module-card__identity">
                                <span class="module-card__icon" aria-hidden="true">▦</span>
                                <div>
                                    <p class="module-card__eyebrow">Paso 1</p>
                                    <h2>Instalá el marcador</h2>
                                </div>
                            </div>
                            <span class="module-card__tag">Chrome</span>
                        </header>

                        <div class="module-card__body">
                            <p class="module-copy">
                                Mostrá la barra de marcadores con <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>B</kbd>
                                y arrastrá el botón.
                            </p>

                            <div class="bookmarklet-zone">
                                <span class="bookmarklet-zone__label">Arrastrar a la barra</span>
                                <a id="lotesActuacionesBookmarklet" class="eje-bookmarklet" href="#">
                                    ▦ Lotes - Actuaciones
                                </a>
                                <p>El marcador debe ejecutarse dentro de la pantalla Crear lote de EJE.</p>
                            </div>

                            <div class="actions eje-actions">
                                <button id="copyLotesActuacionesBookmarklet" class="button button--primary" type="button">
                                    📋 Copiar dirección
                                </button>
                                <button id="copyLotesActuacionesSource" class="button button--secondary" type="button">
                                    &lt;/&gt; Copiar código
                                </button>
                            </div>

                            <div id="lotesActuacionesNotice" class="inline-notice" role="status" aria-live="polite" hidden></div>

                            <div class="security-panel">
                                <span class="security-panel__icon" aria-hidden="true">✓</span>
                                <span>
                                    <strong>Control preventivo</strong>
                                    Verifica BORRADOR, el campo Expediente, el resultado de Aplicar y agregar y la limpieza antes de continuar.
                                </span>
                            </div>
                        </div>
                    </article>

                    <aside class="module-card">
                        <header class="module-card__header module-card__header--simple">
                            <div class="module-card__identity">
                                <span class="module-card__icon module-card__icon--neutral" aria-hidden="true">1·2·3</span>
                                <div>
                                    <p class="module-card__eyebrow">Paso 2</p>
                                    <h2>Usalo en Crear lote</h2>
                                </div>
                            </div>
                        </header>

                        <div class="module-card__body">
                            <ol class="eje-steps">
                                <li>Abrí <strong>Actuaciones → Crear lote</strong>.</li>
                                <li>Confirmá que el estado visible sea <strong>BORRADOR</strong>.</li>
                                <li>Dejá visible el campo <strong>Expediente — CUIJ o Número, Año y Sufijo</strong>.</li>
                                <li>Ejecutá el marcador y pegá los expedientes, uno por línea.</li>
                                <li>Probá primero con cinco expedientes o menos.</li>
                            </ol>

                            <div class="warning-panel">
                                <span aria-hidden="true">⚠</span>
                                <span>
                                    El proceso se detiene si no puede comprobar BORRADOR, si falta Aplicar y agregar o Limpiar,
                                    o si el expediente no aparece en el resultado.
                                </span>
                            </div>

                            <p class="module-footnote">
                                El marcador nunca presiona el botón inferior <strong>Agregar</strong>. La revisión y el cierre del lote permanecen bajo control humano.
                            </p>
                        </div>
                    </aside>
                </section>

                <p class="module-disclaimer">
                    Secuencia automatizada: Expediente → Aplicar y agregar → verificación → Limpiar → siguiente expediente.
                </p>
            </section>
        `;
    }

    function ensureModuleInDom() {
        if (document.querySelector(`[data-view="${ROUTE}"]`)) return;

        const nav = document.querySelector(".sidebar__nav");
        const groups = Array.from(nav?.querySelectorAll(".sidebar__group") || []);
        const automationGroup = groups.find((group) =>
            group.querySelector(".sidebar__group-label")?.textContent.includes("Automatización")
        );

        if (automationGroup && !automationGroup.querySelector(`[data-route="${ROUTE}"]`)) {
            automationGroup.insertAdjacentHTML("beforeend", `
                <a class="nav-item" href="#${ROUTE}" data-route="${ROUTE}">
                    <span class="nav-item__icon" aria-hidden="true">▦</span>
                    <span class="nav-item__copy">
                        <strong>${MODULE_TITLE}</strong>
                        <small>Borradores por expediente</small>
                    </span>
                    <span class="nav-item__badge nav-item__badge--new">Nuevo</span>
                </a>
            `);
        }

        const main = document.querySelector(".workspace__content main.app-shell");
        main?.insertAdjacentHTML("beforeend", moduleMarkup());
    }

    function activateRoute(options = {}) {
        ensureModuleInDom();

        document.querySelectorAll("[data-view]").forEach((view) => {
            const active = view.dataset.view === ROUTE;
            view.hidden = !active;
            view.setAttribute("aria-hidden", String(!active));
        });

        document.querySelectorAll("[data-route]").forEach((link) => {
            const active = link.dataset.route === ROUTE;
            link.classList.toggle("is-active", active);
            if (active) link.setAttribute("aria-current", "page");
            else link.removeAttribute("aria-current");
        });

        document.title = `Herramientas SEC29 · ${MODULE_TITLE}`;
        const label = document.querySelector("[data-current-module]");
        if (label) label.textContent = MODULE_TITLE;

        if (options.updateHash !== false && location.hash !== `#${ROUTE}`) {
            history.pushState(null, "", `#${ROUTE}`);
        }

        window.scrollTo({ top: 0, behavior: "auto" });
        closeSidebar();
        initializeInstaller();
    }

    function leaveRoute() {
        const view = document.querySelector(`[data-view="${ROUTE}"]`);
        if (!view) return;
        view.hidden = true;
        view.setAttribute("aria-hidden", "true");
    }

    function showNotice(message, type = "success") {
        const notice = document.getElementById("lotesActuacionesNotice");
        if (!notice) return;

        window.clearTimeout(showNotice.timeout);
        notice.textContent = message;
        notice.dataset.type = type;
        notice.hidden = false;
        showNotice.timeout = window.setTimeout(() => {
            notice.hidden = true;
        }, 4600);
    }

    function initializeInstaller() {
        const api = window.SEC29LotesActuaciones;
        const link = document.getElementById("lotesActuacionesBookmarklet");
        const copyBookmarkletButton = document.getElementById("copyLotesActuacionesBookmarklet");
        const copySourceButton = document.getElementById("copyLotesActuacionesSource");

        if (!api || !link || !copyBookmarkletButton || !copySourceButton) return;
        if (link.dataset.ready === "true") return;

        link.dataset.ready = "true";
        const bookmarklet = api.toBookmarklet();
        link.href = bookmarklet;

        link.addEventListener("click", (event) => {
            event.preventDefault();
            showNotice("Este botón debe arrastrarse a la barra de marcadores de Chrome.", "info");
        });

        copyBookmarkletButton.addEventListener("click", async () => {
            try {
                await copyText(bookmarklet);
                showNotice("Dirección del marcador copiada. Pegala en el campo URL de un marcador de Chrome.");
            } catch (error) {
                showNotice(error.message, "error");
            }
        });

        copySourceButton.addEventListener("click", async () => {
            try {
                await copyText(api.source);
                showNotice("Código alternativo copiado.");
            } catch (error) {
                showNotice(error.message, "error");
            }
        });
    }

    function handleCurrentHash() {
        const route = String(location.hash || "")
            .replace(/^#/, "")
            .trim()
            .toLocaleLowerCase("es-AR");

        if (route === ROUTE) {
            window.setTimeout(() => activateRoute({ updateHash: false }), 0);
        } else {
            leaveRoute();
        }
    }

    function initialize() {
        ensureModuleInDom();

        document.addEventListener("click", (event) => {
            const link = event.target instanceof Element
                ? event.target.closest(`[data-route="${ROUTE}"]`)
                : null;
            if (!link) return;

            event.preventDefault();
            event.stopImmediatePropagation();
            history.pushState(null, "", `#${ROUTE}`);
            activateRoute({ updateHash: false });
        }, true);

        window.addEventListener("hashchange", handleCurrentHash);
        window.addEventListener("popstate", handleCurrentHash);

        document.addEventListener("click", (event) => {
            const otherRoute = event.target instanceof Element
                ? event.target.closest("[data-route]")
                : null;
            if (!otherRoute || otherRoute.dataset.route === ROUTE) return;
            leaveRoute();
        }, true);

        initializeInstaller();
        handleCurrentHash();

        const version = document.querySelector(".site-header__version");
        if (version) version.textContent = "v6.5";
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialize, { once: true });
    } else {
        initialize();
    }
})();
