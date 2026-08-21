(function () {
    "use strict";

    function setStatus(frame, state, message) {
        const shell = frame.closest("[data-frame-shell]");
        const status = shell?.querySelector("[data-frame-status]");
        if (!shell || !status) return;

        shell.dataset.frameState = state;
        status.hidden = state === "ready";
        if (message) {
            const strong = status.querySelector("strong");
            if (strong) strong.textContent = message;
        }
    }

    function loadFrame(frame, force = false) {
        const source = frame.dataset.src;
        if (!source) return;
        if (!force && frame.dataset.loaded === "true") return;

        setStatus(frame, "loading");
        frame.dataset.loaded = "true";
        frame.src = force
            ? source + (source.includes("?") ? "&" : "?") + "sec29_reload=" + Date.now()
            : source;
    }

    function loadRoute(route) {
        const view = document.querySelector(`[data-view="${route}"]`);
        if (!view) return;
        view.querySelectorAll("[data-external-frame]").forEach((frame) => loadFrame(frame));
    }

    function initializeExternalTools() {
        const frames = Array.from(document.querySelectorAll("[data-external-frame]"));

        frames.forEach((frame) => {
            frame.addEventListener("load", () => setStatus(frame, "ready"));
        });

        document.querySelectorAll("[data-frame-reload]").forEach((button) => {
            button.addEventListener("click", () => {
                const frame = document.getElementById(button.dataset.frameReload);
                if (frame) loadFrame(frame, true);
            });
        });

        document.addEventListener("sec29:routechange", (event) => {
            loadRoute(event.detail?.route || "");
        });

        const initialRoute = String(location.hash || "").replace(/^#/, "");
        if (initialRoute) loadRoute(initialRoute);
    }

    document.addEventListener("DOMContentLoaded", initializeExternalTools);
})();
