(function () {
    "use strict";

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

    function initializeCargadorEje() {
        const api = window.SEC29CargadorEJE;
        const link = document.getElementById("ejeBookmarklet");
        const copyBookmarkletButton = document.getElementById("copyEjeBookmarklet");
        const copySourceButton = document.getElementById("copyEjeSource");
        const notice = document.getElementById("ejeNotice");

        if (!api || !link || !copyBookmarkletButton || !copySourceButton || !notice) return;

        const bookmarklet = api.toBookmarklet();
        link.href = bookmarklet;

        let noticeTimeout = null;

        function showNotice(message, type = "success") {
            window.clearTimeout(noticeTimeout);
            notice.textContent = message;
            notice.dataset.type = type;
            notice.hidden = false;
            noticeTimeout = window.setTimeout(() => {
                notice.hidden = true;
            }, 4200);
        }

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

    document.addEventListener("DOMContentLoaded", initializeCargadorEje);
})();
