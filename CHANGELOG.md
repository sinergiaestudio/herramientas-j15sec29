# Historial de cambios

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
- La rueda del mouse, el gesto táctil vertical y las teclas de navegación desplazan la página principal incluso cuando el puntero o el foco están dentro de la aplicación integrada.
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
