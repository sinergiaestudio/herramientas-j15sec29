# Historial de cambios

## 5.1.0 — 2026-08-21

- El menú lateral inicia completamente minimizado en cada carga.
- El botón de la cabecera despliega el panel completo sin reservar espacio ni desplazar el área principal.
- Al seleccionar un módulo, hacer clic fuera del panel o presionar `Escape`, el menú vuelve a cerrarse.
- Se elimina la persistencia del estado para evitar que una sesión anterior deje el menú abierto.
- Se mejora la accesibilidad mediante `aria-expanded`, `aria-hidden` e `inert`.
- Se actualizan versión, documentación, caché del service worker y pruebas de navegación.

## 5.0.0 — 2026-08-21

- Se incorpora una arquitectura modular con menú lateral contraíble.
- Se agregan rutas internas para abrir cada conjunto de herramientas por separado.
- Se integra el **Cargador EJE sin instalación** como tercer módulo de la suite.
- Se conserva íntegramente el código operativo del marcador Cargador EJE v1.0.
- Se homogeneiza la interfaz del cargador con el lenguaje visual de Herramientas SEC29.
- Se adapta el menú a escritorio, tablet y teléfono.
- Se actualizan manifest, service worker, documentación y pruebas automáticas.
- Se amplía el cache del lector de Excel para contemplar el CDN oficial de SheetJS.

## 4.0.0 — 2026-08-21

- Unificación de los procesadores de actuaciones y vencimientos.
- Nueva interfaz responsive y publicable en GitHub Pages.
- Detección flexible de encabezados y hojas.
- Descarga de resultados en TXT.
- Regla especial: una sola actuación o vencimiento se exporta sin `1)`.
- Incorporación de pruebas automáticas y GitHub Actions.
