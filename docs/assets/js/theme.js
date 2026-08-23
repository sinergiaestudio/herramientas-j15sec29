(function () {
    "use strict";

    const STORAGE_KEY = "sec29-theme";
    const PAGES_ORIGIN = "https://sinergiaestudio.github.io";
    const EXTERNAL_ROUTES = Object.freeze({
        "lotes-cedulas": `${PAGES_ORIGIN}/Cedulas-EJE-v1.0/`,
        cedulas: `${PAGES_ORIGIN}/Cedulas-EJE-v1.0/`,
        "confronte-liquidaciones": `${PAGES_ORIGIN}/Confronte-Liquidaciones-EJF-v2.1.0/`,
        confronte: `${PAGES_ORIGIN}/Confronte-Liquidaciones-EJF-v2.1.0/`
    });
    const root = document.documentElement;
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
    const observedFrames = new WeakSet();

    function externalRouteFromHash() {
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

    // Los módulos complejos ya no se ejecutan dentro de iframes. Se abren como
    // páginas completas de la misma suite, con idéntica cabecera, menú y tema.
    if (navigateToExternal(externalRouteFromHash(), true)) return;

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

    function readStoredTheme() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored === "dark" || stored === "light" ? stored : null;
        } catch {
            return null;
        }
    }

    function preferredTheme() {
        return readStoredTheme() || (systemTheme.matches ? "dark" : "light");
    }

    function currentTheme() {
        return root.dataset.theme === "dark" ? "dark" : "light";
    }

    function storeTheme(theme) {
        try {
            localStorage.setItem(STORAGE_KEY, theme);
        } catch {
            // La interfaz continúa funcionando aunque el navegador bloquee el almacenamiento local.
        }
    }

    function updateThemeColor(theme) {
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute("content", theme === "dark" ? "#3f0914" : "#821529");
    }

    function updateToggle(theme) {
        const button = document.querySelector("[data-theme-toggle]");
        if (!button) return;

        const icon = button.querySelector("[data-theme-icon]");
        const nextIsDark = theme !== "dark";
        if (icon) icon.textContent = nextIsDark ? "☾" : "☀";

        const label = nextIsDark ? "Activar modo oscuro" : "Activar modo claro";
        button.setAttribute("aria-label", label);
        button.setAttribute("title", label);
        button.setAttribute("aria-pressed", String(theme === "dark"));
    }

    function sendTheme(frame, theme = currentTheme()) {
        try {
            frame.contentWindow?.postMessage({ type: "sec29-theme", theme }, PAGES_ORIGIN);
        } catch {
            // La herramienta integrada puede seguir abierta en una pestaña independiente.
        }
    }

    function synchronizeFrames() {
        document.querySelectorAll("[data-external-frame]").forEach((frame) => {
            if (!observedFrames.has(frame)) {
                observedFrames.add(frame);
                frame.addEventListener("load", () => {
                    window.setTimeout(() => sendTheme(frame), 30);
                    window.setTimeout(() => sendTheme(frame), 280);
                });
            }
            sendTheme(frame);
        });
    }

    function applyTheme(theme, options = {}) {
        const normalized = theme === "dark" ? "dark" : "light";
        root.dataset.theme = normalized;
        root.style.colorScheme = normalized;
        updateThemeColor(normalized);
        updateToggle(normalized);
        synchronizeFrames();

        if (options.persist !== false) storeTheme(normalized);
    }

    function createToggle() {
        if (document.querySelector("[data-theme-toggle]")) return;

        const left = document.querySelector(".site-header__left");
        const menu = document.querySelector("[data-sidebar-toggle]");
        if (!left) return;

        const button = document.createElement("button");
        button.type = "button";
        button.className = "theme-toggle";
        button.dataset.themeToggle = "";
        button.innerHTML = '<span class="theme-toggle__icon" data-theme-icon aria-hidden="true">☾</span>';
        button.addEventListener("click", () => {
            applyTheme(currentTheme() === "dark" ? "light" : "dark");
        });

        if (menu?.nextSibling) left.insertBefore(button, menu.nextSibling);
        else left.prepend(button);
    }

    function initialize() {
        createToggle();
        applyTheme(preferredTheme(), { persist: false });

        const observer = new MutationObserver(() => synchronizeFrames());
        observer.observe(document.body, { childList: true, subtree: true });

        window.addEventListener("message", (event) => {
            if (event.origin !== PAGES_ORIGIN) return;
            if (event.data?.type !== "sec29-theme-request") return;

            const frame = Array.from(document.querySelectorAll("[data-external-frame]"))
                .find((candidate) => candidate.contentWindow === event.source);
            if (frame) sendTheme(frame);
        });

        systemTheme.addEventListener?.("change", (event) => {
            if (readStoredTheme()) return;
            applyTheme(event.matches ? "dark" : "light", { persist: false });
        });

        const version = document.querySelector(".site-header__version");
        if (version) version.textContent = "v6.4";
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialize, { once: true });
    } else {
        initialize();
    }
})();
