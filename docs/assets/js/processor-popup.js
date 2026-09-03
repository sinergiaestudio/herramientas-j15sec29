(function () {
    "use strict";

    const POPUP_MODE_KEY = "modo";
    const POPUP_MODE_VALUE = "procesador-actuaciones";
    const POPUP_NAME = "SEC29_PROCESADOR_ACTUACIONES";
    const POPUP_URL = "https://sinergiaestudio.github.io/herramientas-j15sec29/?modo=procesador-actuaciones#procesadores";
    const INSTALLER_ID = "processorActuacionesBookmarklet";

    function isPopupMode() {
        return new URLSearchParams(window.location.search).get(POPUP_MODE_KEY) === POPUP_MODE_VALUE;
    }

    function popupSource() {
        return `(() => {
            const url = ${JSON.stringify(POPUP_URL)};
            const name = ${JSON.stringify(POPUP_NAME)};
            const availableHeight = Number(window.screen?.availHeight) || 900;
            const availableWidth = Number(window.screen?.availWidth) || 1366;
            const height = Math.max(640, Math.min(900, availableHeight - 40));
            const left = Math.max(12, availableWidth - 552);
            const features = [
                "popup=yes",
                "width=520",
                "height=" + height,
                "left=" + left,
                "top=20",
                "resizable=yes",
                "scrollbars=yes"
            ].join(",");

            let popup = null;

            try {
                popup = window.open("", name, features);
                if (!popup) {
                    window.alert("Chrome bloqueó la ventana. Permití las ventanas emergentes para abrir el Procesador de actuaciones.");
                    return;
                }

                try {
                    if (popup.location.href === "about:blank") {
                        popup.location.replace(url);
                    }
                } catch (_error) {
                    // La ventana ya está abierta en GitHub Pages. Se conserva su estado y solo se trae al frente.
                }

                popup.focus();
            } catch (_error) {
                popup = window.open(url, name, features);
                if (popup) popup.focus();
                else window.alert("No fue posible abrir el Procesador de actuaciones.");
            }
        })();`;
    }

    function toBookmarklet() {
        return `javascript:${encodeURIComponent(popupSource())}`;
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
        title.textContent = "Ventana rápida";

        const help = document.createElement("small");
        help.textContent = "Arrastrá el botón a la barra de marcadores. Después, un clic abre o enfoca siempre la misma ventana.";

        copy.append(title, help);

        const link = document.createElement("a");
        link.id = INSTALLER_ID;
        link.className = "processor-popup-bookmarklet";
        link.href = toBookmarklet();
        link.title = "Arrastrá este botón a la barra de marcadores de Chrome";
        link.setAttribute(
            "aria-label",
            "Procesador de actuaciones. Arrastrar a la barra de marcadores o hacer clic para abrir la ventana rápida."
        );
        link.innerHTML = '<span aria-hidden="true">▤</span><span>Procesador de actuaciones</span>';

        access.append(copy, link);
        header.insertAdjacentElement("afterend", access);
    }

    function activatePopupMode() {
        document.documentElement.classList.add("processor-popup-mode");
        document.body.classList.add("processor-popup-mode");
        document.body.classList.remove("sidebar-is-open");

        try {
            window.name = POPUP_NAME;
        } catch (_error) {
            // El nombre de la ventana no es indispensable para el procesamiento.
        }

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
        card?.setAttribute("aria-label", "Procesador de actuaciones en ventana rápida");

        const sidebar = document.getElementById("app-sidebar");
        sidebar?.setAttribute("aria-hidden", "true");
        sidebar?.setAttribute("inert", "");
    }

    function updateVersion() {
        const version = document.querySelector(".site-header__version");
        if (version) version.textContent = "v6.7";
    }

    function initialize() {
        if (isPopupMode()) activatePopupMode();
        else installQuickAccess();

        updateVersion();
    }

    if (isPopupMode()) {
        document.documentElement.classList.add("processor-popup-mode");
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialize, { once: true });
    } else {
        initialize();
    }
})();
