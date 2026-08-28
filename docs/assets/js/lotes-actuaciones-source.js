(function (root) {
    "use strict";

    function parseExpedientes(raw) {
        const normalizeCell = (value) => String(value || "")
            .replace(/\u00a0/g, " ")
            .trim()
            .replace(/\s+/g, " ")
            .replace(/\s*\/\s*/g, "/")
            .replace(/\s*-\s*/g, "-")
            .replace(/^exp\s+/i, "EXP ");

        const cells = String(raw || "")
            .split(/[\r\n\t]+/)
            .map(normalizeCell)
            .filter(Boolean);

        const simplePattern = /^\d{1,12}\/(?:19|20)\d{2}-[A-Za-z0-9]+$/;
        const cuijPattern = /^(?:EXP )?[A-Za-z]-\d{2}-\d{6,12}-\d\/(?:19|20)\d{2}-[A-Za-z0-9]+$/i;
        const valid = [];
        const invalid = [];
        const duplicates = [];
        const seen = new Set();

        for (const cell of cells) {
            if (!simplePattern.test(cell) && !cuijPattern.test(cell)) {
                invalid.push(cell);
                continue;
            }

            const canonical = cell.toUpperCase();
            if (seen.has(canonical)) {
                duplicates.push(cell);
                continue;
            }

            seen.add(canonical);
            valid.push(cell);
        }

        return { total: cells.length, valid, invalid, duplicates };
    }

    function ejeLotesActuacionesLoader(parseExpedientes) {
        "use strict";

        const ALLOWED_HOST = "eje.jusbaires.gob.ar";
        const TOOL_ID = "__sec29_lotes_actuaciones_v1__";
        const THEME_KEY = "sec29-eje-tool-theme";

        if (location.hostname !== ALLOWED_HOST) {
            alert("Esta herramienta solo puede ejecutarse dentro de EJE.");
            return;
        }

        const existing = document.getElementById(TOOL_ID);
        if (existing) {
            existing.style.display = "block";
            return;
        }

        const normalize = (value) => String(value || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, " ")
            .trim()
            .toLowerCase();

        const compact = (value) => normalize(value).replace(/\s/g, "");

        const visible = (element) => {
            if (!element || !element.isConnected) return false;
            const html = element;
            const style = getComputedStyle(html);
            const rect = html.getBoundingClientRect();
            return style.display !== "none"
                && style.visibility !== "hidden"
                && Number(style.opacity) !== 0
                && rect.width > 2
                && rect.height > 2;
        };

        const elementText = (element) => {
            const selected = element instanceof HTMLSelectElement
                ? Array.from(element.selectedOptions).map((option) => option.textContent || "").join(" ")
                : "";
            return normalize([
                element.getAttribute?.("placeholder"),
                element.getAttribute?.("aria-label"),
                element.getAttribute?.("name"),
                element.id,
                element instanceof HTMLInputElement ? element.value : "",
                selected,
                element.innerText,
                element.textContent,
            ].filter(Boolean).join(" "));
        };

        const host = document.createElement("div");
        host.id = TOOL_ID;
        host.style.position = "fixed";
        host.style.inset = "0";
        host.style.zIndex = "2147483647";
        host.style.pointerEvents = "none";
        document.documentElement.appendChild(host);

        const shadow = host.attachShadow({ mode: "open" });
        shadow.innerHTML = `
            <style>
                :host {
                    all: initial;
                    --wine: #8f1d35;
                    --wine-dark: #72162a;
                    --paper: #f8f6f1;
                    --surface: #ffffff;
                    --surface-soft: #eeeae2;
                    --ink: #1d2430;
                    --muted: #69635b;
                    --border: #d7d0c6;
                    --success: #21725c;
                    --warning: #986916;
                    --danger: #a02c38;
                    --shadow: 0 24px 70px rgba(24, 19, 17, .32);
                }

                :host([data-theme="dark"]) {
                    --paper: #11161c;
                    --surface: #192029;
                    --surface-soft: #222b35;
                    --ink: #edf2f7;
                    --muted: #aab4c0;
                    --border: #394552;
                    --success: #73d3ad;
                    --warning: #efbf68;
                    --danger: #ef8798;
                    --shadow: 0 26px 80px rgba(0, 0, 0, .52);
                }

                *, *::before, *::after { box-sizing: border-box; }

                .panel {
                    pointer-events: auto;
                    position: fixed;
                    right: 18px;
                    top: 18px;
                    width: min(480px, calc(100vw - 36px));
                    max-height: calc(100vh - 36px);
                    overflow: auto;
                    color: var(--ink);
                    background: var(--paper);
                    border: 1px solid var(--border);
                    border-radius: 18px;
                    box-shadow: var(--shadow);
                    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
                    font-size: 14px;
                    line-height: 1.45;
                }

                .head {
                    position: sticky;
                    top: 0;
                    z-index: 3;
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 12px;
                    padding: 16px 18px;
                    color: #fff;
                    background: linear-gradient(105deg, #68101f, #a91b36);
                    border-radius: 17px 17px 0 0;
                }

                .head strong { display: block; font-size: 15px; letter-spacing: .01em; }
                .head small { display: block; margin-top: 2px; color: rgba(255,255,255,.78); font-size: 11px; }

                .head-actions { display: flex; gap: 7px; }

                .icon-button {
                    width: 32px;
                    height: 32px;
                    flex: 0 0 auto;
                    border: 1px solid rgba(255,255,255,.28);
                    border-radius: 10px;
                    color: #fff;
                    background: rgba(255,255,255,.08);
                    font-size: 18px;
                    line-height: 1;
                    cursor: pointer;
                }

                .icon-button:hover { background: rgba(255,255,255,.16); }

                .body { padding: 17px 18px 18px; }

                .privacy {
                    display: flex;
                    gap: 9px;
                    margin-bottom: 14px;
                    padding: 10px 11px;
                    border: 1px solid var(--border);
                    border-radius: 11px;
                    color: var(--muted);
                    background: var(--surface);
                    font-size: 12px;
                }

                .privacy b { color: var(--success); }

                label {
                    display: block;
                    margin: 0 0 7px;
                    color: var(--muted);
                    font-size: 12px;
                    font-weight: 760;
                }

                textarea {
                    width: 100%;
                    min-height: 132px;
                    resize: vertical;
                    padding: 11px 12px;
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    outline: none;
                    color: var(--ink);
                    background: var(--surface);
                    font: 650 14px/1.55 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
                }

                textarea:focus {
                    border-color: #a72a43;
                    box-shadow: 0 0 0 3px rgba(167,42,67,.13);
                }

                textarea:disabled { opacity: .65; }

                .metrics {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 7px;
                    margin: 10px 0 12px;
                }

                .metric {
                    min-width: 0;
                    padding: 8px;
                    border: 1px solid var(--border);
                    border-radius: 10px;
                    background: var(--surface);
                }

                .metric strong { display: block; font-size: 16px; line-height: 1.1; }
                .metric span { display: block; margin-top: 2px; color: var(--muted); font-size: 9px; }

                .check {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 10px;
                    margin: 9px 0;
                    padding: 10px 11px;
                    border: 1px solid var(--border);
                    border-radius: 11px;
                    background: var(--surface-soft);
                }

                .check-state { min-width: 0; }
                .check-state span { display: block; color: var(--muted); font-size: 10px; }
                .check-state strong {
                    display: block;
                    overflow: hidden;
                    margin-top: 1px;
                    color: var(--ink);
                    font-size: 12px;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .dot {
                    display: inline-block;
                    width: 8px;
                    height: 8px;
                    margin-right: 6px;
                    border-radius: 50%;
                    background: var(--warning);
                }

                .dot.ok { background: var(--success); }
                .dot.error { background: var(--danger); }

                button { font: inherit; }

                .mini, .secondary, .primary, .danger {
                    border-radius: 10px;
                    cursor: pointer;
                    transition: transform .12s ease, opacity .12s ease, background .12s ease;
                }

                .mini:active, .secondary:active, .primary:active, .danger:active {
                    transform: translateY(1px);
                }

                .mini {
                    padding: 7px 9px;
                    border: 1px solid var(--border);
                    color: var(--ink);
                    background: var(--surface);
                    font-size: 10px;
                    font-weight: 720;
                }

                .actions {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
                    margin-top: 12px;
                }

                .primary {
                    padding: 11px 12px;
                    border: 1px solid var(--wine);
                    color: #fff;
                    background: var(--wine);
                    font-weight: 800;
                }

                .primary:hover { background: var(--wine-dark); }

                .secondary {
                    padding: 10px 11px;
                    border: 1px solid var(--border);
                    color: var(--ink);
                    background: var(--surface);
                    font-weight: 700;
                }

                .danger {
                    padding: 10px 11px;
                    border: 1px solid color-mix(in srgb, var(--danger) 35%, var(--border));
                    color: var(--danger);
                    background: var(--surface);
                    font-weight: 750;
                }

                button:disabled { cursor: not-allowed; opacity: .45; }

                .message {
                    display: none;
                    margin: 10px 0 0;
                    padding: 9px 10px;
                    border: 1px solid var(--border);
                    border-radius: 10px;
                    color: var(--muted);
                    background: var(--surface);
                    font-size: 11px;
                }

                .message.show { display: block; }
                .message.error { color: var(--danger); }
                .message.warning { color: var(--warning); }

                .progress-wrap { margin-top: 14px; }

                .progress-meta {
                    display: flex;
                    justify-content: space-between;
                    gap: 10px;
                    margin-bottom: 6px;
                    color: var(--muted);
                    font-size: 11px;
                    font-weight: 700;
                }

                .track {
                    height: 8px;
                    overflow: hidden;
                    border-radius: 999px;
                    background: var(--border);
                }

                .bar {
                    width: 0;
                    height: 100%;
                    border-radius: inherit;
                    background: linear-gradient(90deg, #8f1d35, #c83c57);
                    transition: width .2s ease;
                }

                .current {
                    min-height: 48px;
                    margin-top: 11px;
                    padding: 10px 11px;
                    border: 1px solid var(--border);
                    border-radius: 11px;
                    color: var(--muted);
                    background: var(--surface);
                    font-size: 12px;
                }

                .current strong {
                    color: var(--wine);
                    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
                }

                :host([data-theme="dark"]) .current strong { color: #ef9daf; }

                .log-title {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-top: 14px;
                }

                .log-title strong { font-size: 12px; }

                .log {
                    max-height: 160px;
                    overflow: auto;
                    margin: 7px 0 0;
                    padding: 0;
                    list-style: none;
                }

                .log li {
                    display: grid;
                    grid-template-columns: 122px 1fr;
                    gap: 8px;
                    padding: 7px 0;
                    border-top: 1px solid var(--border);
                    font-size: 10px;
                }

                .log code { color: var(--ink); font-weight: 800; }
                .ok-text { color: var(--success); }
                .warn-text { color: var(--warning); }
                .error-text { color: var(--danger); }

                .foot {
                    margin-top: 12px;
                    color: var(--muted);
                    font-size: 10px;
                }

                @media (max-width: 560px) {
                    .panel { right: 8px; top: 8px; width: calc(100vw - 16px); max-height: calc(100vh - 16px); }
                    .metrics { grid-template-columns: repeat(2, 1fr); }
                }
            </style>

            <aside class="panel" role="dialog" aria-label="Creador de Lotes - Actuaciones">
                <header class="head">
                    <div>
                        <strong>Creador de Lotes - Actuaciones</strong>
                        <small>EJE · borradores por expediente · v1.0</small>
                    </div>
                    <div class="head-actions">
                        <button class="icon-button" id="theme" type="button" title="Cambiar tema" aria-label="Cambiar tema">☾</button>
                        <button class="icon-button" id="close" type="button" title="Cerrar" aria-label="Cerrar">×</button>
                    </div>
                </header>

                <div class="body">
                    <div class="privacy">
                        <span>●</span>
                        <div><b>Todo ocurre en esta pestaña.</b><br>No se envían datos y nunca se presiona el botón final “Agregar”.</div>
                    </div>

                    <label for="expedientes">Expedientes — uno por línea</label>
                    <textarea id="expedientes" spellcheck="false" placeholder="12463/2020-0&#10;163321/2020-0&#10;376302/2024-0"></textarea>

                    <div class="metrics" aria-live="polite">
                        <div class="metric"><strong id="total">0</strong><span>celdas</span></div>
                        <div class="metric"><strong id="valid">0</strong><span>válidas</span></div>
                        <div class="metric"><strong id="duplicates">0</strong><span>duplicadas</span></div>
                        <div class="metric"><strong id="invalid">0</strong><span>con error</span></div>
                    </div>

                    <div id="validation" class="message error"></div>
                    <div id="duplicates-message" class="message warning"></div>

                    <div class="check">
                        <div class="check-state">
                            <span><i class="dot" id="status-dot"></i>Estado del lote</span>
                            <strong id="status-label">Comprobando BORRADOR…</strong>
                        </div>
                        <button class="mini" id="refresh-status" type="button">Comprobar</button>
                    </div>

                    <div class="check">
                        <div class="check-state">
                            <span><i class="dot" id="field-dot"></i>Campo Expediente</span>
                            <strong id="field-label">Buscando CUIJ, Número, Año y Sufijo…</strong>
                        </div>
                        <button class="mini" id="pick-field" type="button">Elegir campo</button>
                    </div>

                    <div class="actions">
                        <button class="primary" id="start" type="button">Iniciar carga</button>
                        <button class="secondary" id="pause" type="button" disabled>Pausar</button>
                        <button class="danger" id="stop" type="button" disabled>Detener</button>
                        <button class="secondary" id="skip" type="button" disabled>Omitir actual</button>
                    </div>

                    <div class="progress-wrap">
                        <div class="progress-meta"><span id="progress-text">0 de 0</span><span id="state">Listo</span></div>
                        <div class="track"><div class="bar" id="bar"></div></div>
                    </div>

                    <div class="current" id="current">Pegá la lista, confirmá BORRADOR y verificá el campo detectado.</div>

                    <div class="log-title">
                        <strong>Registro</strong>
                        <button class="mini" id="export" type="button">Exportar CSV</button>
                    </div>
                    <ul class="log" id="log"></ul>

                    <div class="foot">
                        Secuencia: Expediente → Aplicar y agregar → comprobar resultado → Limpiar → siguiente. Se detiene ante una respuesta dudosa.
                    </div>
                </div>
            </aside>
        `;

        const get = (selector) => shadow.querySelector(selector);
        const textarea = get("#expedientes");
        const startButton = get("#start");
        const pauseButton = get("#pause");
        const stopButton = get("#stop");
        const skipButton = get("#skip");
        const stateLabel = get("#state");
        const currentLabel = get("#current");
        const progressText = get("#progress-text");
        const progressBar = get("#bar");
        const fieldLabel = get("#field-label");
        const fieldDot = get("#field-dot");
        const statusLabel = get("#status-label");
        const statusDot = get("#status-dot");
        const validationBox = get("#validation");
        const duplicatesBox = get("#duplicates-message");
        const logList = get("#log");
        const themeButton = get("#theme");

        let targetField = null;
        let queue = [];
        let index = 0;
        let running = false;
        let paused = false;
        let stopRequested = false;
        let skipRequested = false;
        let picking = false;
        let parsed = { total: 0, valid: [], invalid: [], duplicates: [] };
        const records = [];

        const detectTheme = () => {
            try {
                const stored = localStorage.getItem(THEME_KEY);
                if (stored === "dark" || stored === "light") return stored;
            } catch {
                // Sigue con la preferencia del sistema.
            }
            return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        };

        const applyTheme = (theme) => {
            const normalizedTheme = theme === "dark" ? "dark" : "light";
            host.dataset.theme = normalizedTheme;
            themeButton.textContent = normalizedTheme === "dark" ? "☀" : "☾";
            themeButton.title = normalizedTheme === "dark" ? "Activar modo claro" : "Activar modo oscuro";
            try {
                localStorage.setItem(THEME_KEY, normalizedTheme);
            } catch {
                // El tema permanece durante la ejecución actual.
            }
        };

        const describeField = (field) => {
            const placeholder = field.getAttribute("placeholder")
                || field.getAttribute("aria-label")
                || field.getAttribute("name")
                || "Campo sin etiqueta";
            return placeholder.length > 62 ? `${placeholder.slice(0, 59)}…` : placeholder;
        };

        const fieldScore = (field) => {
            const own = elementText(field);
            const parent = normalize(field.parentElement?.innerText || "");
            const grand = normalize(field.parentElement?.parentElement?.innerText || "");
            const context = `${parent} ${grand}`;
            let score = 0;

            if (own.includes("cuij")) score += 8;
            if (own.includes("numero")) score += 5;
            if (own.includes("ano")) score += 5;
            if (own.includes("sufijo")) score += 12;
            if (own.includes("expediente")) score += 11;
            if (context.includes("expediente")) score += 10;
            if (context.includes("aplicar y agregar")) score += 5;
            if (own.includes("caratula")) score -= 8;
            if (own.includes("cod") && own.includes("barra")) score -= 18;
            if (context.includes("actuacion") && !context.includes("expediente")) score -= 8;
            if (field.type === "search") score -= 5;

            const rect = field.getBoundingClientRect();
            if (rect.top > 90) score += 2;
            return score;
        };

        const detectField = () => {
            const candidates = Array.from(document.querySelectorAll("input, textarea"))
                .filter((field) => visible(field) && !field.disabled && !field.readOnly)
                .map((field) => ({ field, score: fieldScore(field) }))
                .sort((a, b) => b.score - a.score);

            return candidates[0]?.score >= 20 ? candidates[0].field : null;
        };

        const setTarget = (field) => {
            if (targetField && targetField !== field) {
                targetField.style.removeProperty("outline");
                targetField.style.removeProperty("outline-offset");
            }

            targetField = field;
            if (field) {
                field.style.setProperty("outline", "3px solid rgba(35,131,106,.58)", "important");
                field.style.setProperty("outline-offset", "2px", "important");
                fieldLabel.textContent = describeField(field);
                fieldDot.classList.add("ok");
                fieldDot.classList.remove("error");
            } else {
                fieldLabel.textContent = "No detectado";
                fieldDot.classList.remove("ok");
                fieldDot.classList.add("error");
            }
        };

        const candidateStatusControls = () => Array.from(document.querySelectorAll(
            "select, [role='combobox'], [aria-haspopup='listbox'], input, button"
        )).filter(visible);

        const findDraftStatus = () => {
            const controls = candidateStatusControls()
                .map((control) => {
                    const text = elementText(control);
                    const rect = control.getBoundingClientRect();
                    let score = 0;
                    if (text === "borrador") score += 20;
                    if (text.includes("borrador")) score += 12;
                    if (rect.top < 380) score += 3;
                    if (rect.left < innerWidth * .55) score += 2;
                    return { control, score, text };
                })
                .sort((a, b) => b.score - a.score);

            if (controls[0]?.score >= 15) return controls[0].control;

            const textCandidates = Array.from(document.querySelectorAll("div, span"))
                .filter((element) => visible(element) && elementText(element) === "borrador")
                .filter((element) => {
                    const rect = element.getBoundingClientRect();
                    return rect.top < 380 && rect.left < innerWidth * .55;
                });

            return textCandidates[0] || null;
        };

        const verifyDraftStatus = () => {
            const control = findDraftStatus();
            const ok = Boolean(control);
            statusLabel.textContent = ok
                ? "BORRADOR detectado"
                : "No pude confirmar BORRADOR. Seleccionalo y volvé a comprobar.";
            statusDot.classList.toggle("ok", ok);
            statusDot.classList.toggle("error", !ok);
            return ok;
        };

        const distance = (a, b) => {
            const ar = a.getBoundingClientRect();
            const br = b.getBoundingClientRect();
            const ax = ar.left + ar.width / 2;
            const ay = ar.top + ar.height / 2;
            const bx = br.left + br.width / 2;
            const by = br.top + br.height / 2;
            return Math.hypot(ax - bx, ay - by);
        };

        const findControl = (label, near) => {
            const wanted = normalize(label);
            return Array.from(document.querySelectorAll(
                "button, [role='button'], input[type='button'], input[type='submit'], a"
            ))
                .filter((element) => visible(element))
                .filter((element) => {
                    const text = normalize(
                        element instanceof HTMLInputElement
                            ? element.value
                            : element.innerText || element.textContent || ""
                    );
                    return text === wanted;
                })
                .sort((a, b) => distance(a, near) - distance(b, near))[0] || null;
        };

        const nativeSetValue = (field, value) => {
            const prototype = field instanceof HTMLTextAreaElement
                ? HTMLTextAreaElement.prototype
                : HTMLInputElement.prototype;
            const setter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;
            if (!setter) throw new Error("No se encontró el setter nativo del campo.");
            setter.call(field, value);
            field.dispatchEvent(new InputEvent("input", {
                bubbles: true,
                inputType: "insertText",
                data: value,
            }));
            field.dispatchEvent(new Event("change", { bubbles: true }));
        };

        const pageTextCompact = () => compact(document.body.innerText || "");

        const pageHasExpediente = (expediente) => {
            const needle = compact(expediente);
            return needle.length > 0 && pageTextCompact().includes(needle);
        };

        const pageError = () => {
            const text = normalize(document.body.innerText || "");
            const messages = [
                "no se encontraron",
                "sin resultados",
                "ocurrio un error",
                "dato invalido",
                "no se pudo",
                "error al aplicar",
            ];
            return messages.find((message) => text.includes(message)) || "";
        };

        const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

        const waitUntil = async (predicate, timeout = 16000, interval = 220) => {
            const started = performance.now();
            while (performance.now() - started < timeout) {
                if (predicate()) return true;
                if (stopRequested || skipRequested) return false;
                await delay(interval);
            }
            return false;
        };

        const renderAnalysis = () => {
            parsed = parseExpedientes(textarea.value);
            get("#total").textContent = String(parsed.total);
            get("#valid").textContent = String(parsed.valid.length);
            get("#duplicates").textContent = String(parsed.duplicates.length);
            get("#invalid").textContent = String(parsed.invalid.length);

            validationBox.classList.toggle("show", parsed.invalid.length > 0);
            validationBox.textContent = parsed.invalid.length
                ? `Corregí o quitá estos valores: ${parsed.invalid.slice(0, 6).join(", ")}${parsed.invalid.length > 6 ? "…" : ""}`
                : "";

            duplicatesBox.classList.toggle("show", parsed.duplicates.length > 0);
            duplicatesBox.textContent = parsed.duplicates.length
                ? `Se omitirán ${parsed.duplicates.length} valores duplicados dentro de esta lista.`
                : "";

            startButton.disabled = running || parsed.valid.length === 0 || parsed.invalid.length > 0;
        };

        const addLog = (expediente, status, detail) => {
            const item = document.createElement("li");
            const code = document.createElement("code");
            const text = document.createElement("span");
            code.textContent = expediente;
            text.textContent = detail;
            text.className = status === "ok"
                ? "ok-text"
                : status === "warn"
                    ? "warn-text"
                    : "error-text";
            item.append(code, text);
            logList.prepend(item);

            records.push({
                expediente,
                status,
                detail,
                time: new Date().toISOString(),
            });
        };

        const updateProgress = () => {
            const total = queue.length;
            const finished = Math.min(index, total);
            progressText.textContent = `${finished} de ${total}`;
            progressBar.style.width = total
                ? `${Math.round((finished / total) * 100)}%`
                : "0%";
        };

        const setControls = () => {
            startButton.disabled = running || parsed.valid.length === 0 || parsed.invalid.length > 0;
            pauseButton.disabled = !running;
            stopButton.disabled = !running;
            skipButton.disabled = !running;
            textarea.disabled = running;
            pauseButton.textContent = paused ? "Continuar" : "Pausar";
        };

        const stopWithError = (expediente, detail) => {
            running = false;
            paused = false;
            addLog(expediente, "error", detail);
            stateLabel.textContent = "Detenido por control";
            currentLabel.innerHTML = `Revisá <strong>${expediente}</strong>. Corregí la pantalla y volvé a iniciar para continuar con los pendientes.`;
            setControls();
        };

        const prepareField = async () => {
            if (!targetField || !targetField.isConnected || !visible(targetField)) {
                setTarget(detectField());
            }
            if (!targetField) return false;

            if (compact(targetField.value || "")) {
                const clear = findControl("Limpiar", targetField);
                if (!clear) return false;
                clear.click();
                await waitUntil(() => targetField && compact(targetField.value || "") === "", 5000);
            }

            return Boolean(targetField && compact(targetField.value || "") === "");
        };

        const processQueue = async () => {
            while (running && index < queue.length) {
                while (paused && running && !stopRequested) await delay(180);
                if (!running || stopRequested) break;

                const expediente = queue[index];
                skipRequested = false;
                currentLabel.innerHTML = `Procesando <strong>${expediente}</strong>…`;
                stateLabel.textContent = "Preparando pantalla";

                if (!verifyDraftStatus()) {
                    stopWithError(expediente, "El estado BORRADOR no pudo confirmarse.");
                    return;
                }

                const fieldReady = await prepareField();
                if (!fieldReady || !targetField) {
                    stopWithError(expediente, "No se encontró o no pudo limpiarse el campo Expediente.");
                    return;
                }

                if (pageHasExpediente(expediente)) {
                    addLog(expediente, "warn", "Ya figuraba en la pantalla; se omitió para evitar repetirlo.");
                    index += 1;
                    updateProgress();
                    continue;
                }

                try {
                    targetField.scrollIntoView({ block: "center", behavior: "smooth" });
                    targetField.focus();
                    nativeSetValue(targetField, expediente);
                    await delay(360);

                    if (compact(targetField.value) !== compact(expediente)) {
                        throw new Error("EJE no conservó el expediente en el campo.");
                    }

                    const applyButton = findControl("Aplicar y agregar", targetField);
                    if (!applyButton) {
                        throw new Error("No se encontró el botón “Aplicar y agregar”.");
                    }

                    stateLabel.textContent = "Esperando a EJE";
                    applyButton.click();

                    const confirmed = await waitUntil(
                        () => pageHasExpediente(expediente) || Boolean(pageError()),
                        18000
                    );

                    if (skipRequested) {
                        addLog(expediente, "warn", "Omitido por el usuario.");
                        index += 1;
                        updateProgress();
                        continue;
                    }

                    const error = pageError();
                    if (error && !pageHasExpediente(expediente)) {
                        throw new Error(`EJE informó: ${error}.`);
                    }

                    if (!confirmed || !pageHasExpediente(expediente)) {
                        throw new Error("No pudo comprobarse que las actuaciones del expediente fueran agregadas.");
                    }

                    stateLabel.textContent = "Limpiando filtros";
                    const clearButton = findControl("Limpiar", targetField);
                    if (!clearButton) {
                        throw new Error("No se encontró el botón “Limpiar”.");
                    }

                    clearButton.click();
                    const cleared = await waitUntil(() => {
                        if (!targetField || !targetField.isConnected || !visible(targetField)) {
                            setTarget(detectField());
                        }
                        return Boolean(targetField && compact(targetField.value || "") === "");
                    }, 6000);

                    if (!cleared) {
                        throw new Error("EJE no limpió el campo Expediente.");
                    }

                    if (!verifyDraftStatus()) {
                        throw new Error("Después de limpiar, el estado BORRADOR dejó de estar confirmado.");
                    }

                    addLog(expediente, "ok", "Aplicar y agregar confirmado; filtros limpiados.");
                    index += 1;
                    updateProgress();
                    await delay(600);
                } catch (error) {
                    stopWithError(
                        expediente,
                        error instanceof Error ? error.message : "Respuesta inesperada de EJE."
                    );
                    return;
                }
            }

            if (stopRequested) {
                running = false;
                paused = false;
                stateLabel.textContent = "Detenido";
                currentLabel.textContent = `Carga detenida. Quedan ${Math.max(queue.length - index, 0)} expedientes pendientes.`;
            } else if (index >= queue.length) {
                running = false;
                paused = false;
                stateLabel.textContent = "Completado";
                currentLabel.innerHTML = `<strong>${queue.length}</strong> expedientes recorridos. Revisá el lote y completá manualmente el paso final.`;
            }

            setControls();
        };

        const start = () => {
            renderAnalysis();
            if (running || startButton.disabled) return;

            if (!verifyDraftStatus()) {
                currentLabel.textContent = "Seleccioná BORRADOR en EJE y presioná “Comprobar”.";
                stateLabel.textContent = "Falta BORRADOR";
                return;
            }

            setTarget(targetField?.isConnected ? targetField : detectField());
            if (!targetField) {
                currentLabel.textContent = "No pude identificar el campo Expediente. Presioná “Elegir campo” y hacé clic en CUIJ, Número, Año y Sufijo.";
                stateLabel.textContent = "Falta elegir campo";
                return;
            }

            const nextQueue = [...parsed.valid];
            const confirmed = confirm(
                `Se recorrerán ${nextQueue.length} expedientes.\n\n`
                + "Secuencia: Expediente → Aplicar y agregar → Limpiar.\n"
                + "El estado debe permanecer en BORRADOR.\n"
                + "El botón final “Agregar” no será presionado.\n\n"
                + "Para la primera prueba se recomiendan cinco expedientes o menos.\n\n"
                + "¿Comenzar?"
            );
            if (!confirmed) return;

            if (!queue.length || nextQueue.join("|") !== queue.join("|")) {
                queue = nextQueue;
                index = 0;
                logList.innerHTML = "";
                records.length = 0;
            }

            running = true;
            paused = false;
            stopRequested = false;
            skipRequested = false;
            stateLabel.textContent = "En curso";
            setControls();
            updateProgress();
            void processQueue();
        };

        textarea.addEventListener("input", renderAnalysis);
        startButton.addEventListener("click", start);

        pauseButton.addEventListener("click", () => {
            paused = !paused;
            stateLabel.textContent = paused ? "Pausado" : "En curso";
            setControls();
        });

        stopButton.addEventListener("click", () => {
            stopRequested = true;
            paused = false;
            stateLabel.textContent = "Deteniendo…";
        });

        skipButton.addEventListener("click", () => {
            skipRequested = true;
        });

        get("#refresh-status").addEventListener("click", () => {
            verifyDraftStatus();
        });

        get("#pick-field").addEventListener("click", () => {
            if (picking) return;
            picking = true;
            host.style.pointerEvents = "none";
            currentLabel.textContent = "Hacé clic una vez en el campo CUIJ, Número, Año y Sufijo.";

            const choose = (event) => {
                const path = event.composedPath();
                if (path.includes(host)) return;

                const element = event.target;
                const field = element?.closest?.("input, textarea");
                if (!field) return;

                event.preventDefault();
                event.stopPropagation();
                document.removeEventListener("click", choose, true);
                host.style.pointerEvents = "none";
                shadow.querySelector(".panel").style.pointerEvents = "auto";
                picking = false;
                setTarget(field);
                currentLabel.textContent = "Campo registrado. Ya podés iniciar la carga.";
            };

            document.addEventListener("click", choose, true);
        });

        get("#export").addEventListener("click", () => {
            if (!records.length) {
                currentLabel.textContent = "Todavía no hay registros para exportar.";
                return;
            }

            const escapeCsv = (value) => `"${String(value).replace(/"/g, '""')}"`;
            const rows = [
                ["expediente", "estado", "detalle", "fecha"],
                ...records.map((record) => [
                    record.expediente,
                    record.status,
                    record.detail,
                    record.time,
                ]),
            ];

            const csv = "\uFEFF" + rows
                .map((row) => row.map(escapeCsv).join(";"))
                .join("\r\n");

            const url = URL.createObjectURL(new Blob([csv], {
                type: "text/csv;charset=utf-8",
            }));
            const link = document.createElement("a");
            link.href = url;
            link.download = `registro_lotes_actuaciones_${new Date().toISOString().slice(0, 10)}.csv`;
            link.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        });

        themeButton.addEventListener("click", () => {
            applyTheme(host.dataset.theme === "dark" ? "light" : "dark");
        });

        get("#close").addEventListener("click", () => {
            if (running) {
                const shouldClose = confirm("Hay una carga en curso. ¿Detener y cerrar?");
                if (!shouldClose) return;
                stopRequested = true;
                running = false;
            }

            if (targetField) {
                targetField.style.removeProperty("outline");
                targetField.style.removeProperty("outline-offset");
            }
            host.remove();
        });

        applyTheme(detectTheme());
        renderAnalysis();
        setTarget(detectField());
        verifyDraftStatus();
        textarea.focus();
    }

    const source = `(${ejeLotesActuacionesLoader.toString()})(${parseExpedientes.toString()});`;

    const api = Object.freeze({
        source,
        parseExpedientes,
        toBookmarklet() {
            return "javascript:" + encodeURIComponent(source);
        },
    });

    root.SEC29LotesActuaciones = api;
    if (typeof module === "object" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
