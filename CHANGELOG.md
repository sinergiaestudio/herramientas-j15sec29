# Historial de cambios

## 6.5.1 — 2026-08-28

- Se corrige una condición de carrera en **Creador de Lotes - Actuaciones**.
- La herramienta deja de considerar como confirmación el número visible dentro del propio campo de filtro.
- La incorporación se verifica contra la tabla inferior **“Se creará un lote con las siguientes actuaciones”** y contra el incremento de **Cantidad seleccionada**.
- Se contemplan lotes de más de 30 documentos, aun cuando el expediente recién incorporado quede fuera de la página visible de la tabla.
- Se amplía la espera verificable hasta 30 segundos y se agregan pausas de estabilización antes y después de `Limpiar`.
- Los mensajes de error informan la cantidad seleccionada anterior y actual para facilitar el diagnóstico.
- Se renueva la caché y se identifica el marcador como v1.1.

## 6.5.0 — 2026-08-28

- Se incorpora **Creador de Lotes - Actuaciones**.
- Acepta listas extensas de expedientes con formato `313123/2025-0`.
- Ejecuta el circuito `Expediente → Aplicar y agregar → verificación → Limpiar → siguiente`.
- Mantiene el estado en **BORRADOR**.
- Incluye pausa, omisión, detención, selección manual del campo, tema claro/oscuro y registro CSV.
- Nunca presiona el botón final `Agregar` o `Crear lote`.

## 6.4.0 — 2026-08-23

- Se elimina definitivamente la integración mediante `iframe` de Cédulas y Confronte.
- Ambos módulos se abren como páginas completas con desplazamiento nativo del navegador.
- Se incorpora en las aplicaciones especializadas el mismo shell institucional de Herramientas SEC29.
- El menú lateral comienza cerrado y ofrece acceso cruzado a los cuatro módulos.
- El selector `☾ / ☀` permanece visible en el ángulo superior izquierdo y comparte la preferencia entre repositorios.
- Se conservan nombres, rutas históricas, privacidad local y crédito de autoría.
- Se elimina de la ruta efectiva todo puente de rueda, redimensionamiento o altura automática.
- El service worker principal pasa a actualizar por red los activos críticos para evitar que una caché antigua reactive la integración anterior.

## 6.3.0 — 2026-08-23

- Se corrige el crecimiento indefinido de la página en Cédulas y Confronte.
- La altura integrada se calcula exclusivamente a partir del contenido intrínseco y deja de tomar como referencia el alto del `iframe`, del `body` o del documento exterior.
- Se elimina la transición de altura que contribuía a retroalimentar el redimensionamiento.
- La rueda del mouse, el trackpad, los gestos táctiles y las teclas de navegación desplazan la página principal mediante un puente estable de mensajes.
- Se mantiene el desplazamiento propio de tablas y controles solamente mientras todavía tengan recorrido interno.
- Se incorpora modo oscuro global y persistente.
- El botón `☾ / ☀` permanece siempre visible junto al menú, en el ángulo superior izquierdo.
- El tema se sincroniza con todas las pantallas y aplicaciones integradas.
- El modo oscuro queda establecido como requisito para las herramientas que se incorporen en adelante.
- Se renuevan las cachés para forzar la carga del puente y de los estilos corregidos.

## 6.2.0 — 2026-08-23

- Se reemplaza la interceptación directa del `iframe` por un puente explícito de mensajes entre la suite y las aplicaciones especializadas.
- Cédulas EJE y Confronte EJF comunican su altura real y actualizan el espacio disponible cuando cambia el contenido.
- La rueda del mouse, el gesto táctil vertical y las teclas de navegación desplazan de forma confiable la página principal.
- Los controles con desplazamiento propio conservan su comportamiento únicamente mientras todavía tengan contenido interno por recorrer.
- Se elimina el bloqueo que impedía continuar hacia abajo cuando el puntero estaba dentro de una herramienta integrada.
- Se renueva la caché offline y se actualizan las pruebas del módulo de navegación.

## 6.1.0 — 2026-08-21

- Se elimina la apariencia de “ventana dentro de otra ventana” en Cédulas y Confronte.
- Las dos aplicaciones integradas ajustan su altura al contenido y dejan de tener desplazamiento vertical propio.
- La rueda del mouse, el gesto vertical y las teclas de navegación desplazan la página principal incluso cuando el puntero o el foco están dentro de la aplicación integrada.
- Se ocultan las cabeceras internas redundantes y se conserva una única cabecera institucional.
- Se reemplaza el contenedor con bordes por una integración continua, sin partición visual.
- Se mantienen los accesos Recargar y Abrir aparte.
- Se actualiza la caché offline para forzar la renovación de la interfaz.

## 6.0.0 — 2026-08-21

- Se renombra **Cargador EJE** como **Creador de actuaciones en lote**.
- Se incorpora **Creador de Lotes - Cédulas** como módulo del menú lateral.
- Se incorpora **Confronte de Liquidaciones EJF** como módulo del menú lateral.
- Las aplicaciones especializadas se cargan de manera diferida dentro de marcos integrados y mantienen un acceso directo en pestaña independiente.
- Se preserva `#cargador-eje` como alias retrocompatible de `#actuaciones-lote`.
- El menú continúa completamente minimizado en cada apertura.

## 5.1.0 — 2026-08-21

- El menú lateral inicia completamente minimizado en cada carga.
- El botón de la cabecera despliega el panel completo sin reservar espacio ni desplazar el área principal.
- Al seleccionar un módulo, hacer clic fuera del panel o presionar `Escape`, el menú vuelve a cerrarse.
- Se elimina la persistencia del estado para evitar que una sesión anterior deje el menú abierto.

## 5.0.0 — 2026-08-21

- Se incorpora una arquitectura modular con menú lateral contraíble.
- Se integra el Creador de actuaciones en lote.

## 4.0.0 — 2026-08-21

- Unificación de los procesadores de actuaciones y vencimientos.
- Nueva interfaz responsive y publicable en GitHub Pages.
- Regla especial: una sola actuación o vencimiento se exporta sin `1)`.
