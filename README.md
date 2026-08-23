# Herramientas SEC29

Aplicación web modular para tareas operativas del Juzgado N.º 15, Secretaría N.º 29. La versión 6.3 reúne cuatro accesos principales dentro de un menú lateral que siempre comienza completamente minimizado:

1. **Actuaciones y vencimientos:** procesa exportaciones del EJE y genera listados listos para WhatsApp.
2. **Creador de actuaciones en lote:** instala un marcador que carga expedientes secuencialmente en la pantalla Crear actuación de EJE.
3. **Creador de Lotes - Cédulas:** analiza PDFs de confronte, identifica las piezas remitidas a la Oficina de Notificaciones y asiste su incorporación en Crear lote.
4. **Confronte de Liquidaciones EJF:** compara documentación, permite revisar la lectura y recalcula intereses con trazabilidad.

## Navegación modular

```text
#procesadores
#actuaciones-lote
#lotes-cedulas
#confronte-liquidaciones
```

La ruta histórica `#cargador-eje` continúa funcionando y redirige internamente a `#actuaciones-lote`.

## Desplazamiento único y estable

Cédulas EJE y Confronte de Liquidaciones EJF conservan sus repositorios y motores especializados, pero dentro de la suite se comportan como parte de una sola página.

La versión 6.3 elimina el ciclo de realimentación que hacía crecer indefinidamente la altura del documento. Cada aplicación mide únicamente su contenido intrínseco —no la altura del propio `iframe` ni la del documento exterior— y comunica ese valor a la suite mediante un puente explícito. De este modo:

- la página deja de agrandarse hacia abajo sin límite;
- la barra lateral mantiene una proporción normal;
- la rueda del mouse, el trackpad, los gestos táctiles y las teclas de navegación desplazan la página principal;
- las tablas o controles con desplazamiento propio lo conservan únicamente mientras todavía tengan contenido interno por recorrer;
- los resultados, auditorías y paneles desplegables actualizan la altura sin generar bucles.

## Modo oscuro obligatorio

La suite incluye un selector de tema siempre visible junto al botón del menú, en el sector superior izquierdo.

- `☾` activa el modo oscuro.
- `☀` vuelve al modo claro.
- La elección se conserva en el navegador.
- Sin una elección previa, se respeta la preferencia del sistema operativo.
- El tema se sincroniza con Actuaciones y vencimientos, Creador de actuaciones en lote, Creador de Lotes - Cédulas y Confronte de Liquidaciones EJF.

Este selector constituye un componente obligatorio para los módulos que se incorporen en adelante.

## Regla de numeración

- Un único resultado se exporta **sin** `1)`.
- Dos o más resultados se exportan como `1)`, `2)`, `3)`, etc.

```text
*CARÁTULA - Expte. Nro 12345/2026-0* (título de la actuación)
```

```text
*CARÁTULA - Expte. N° 12345/2026-0* (descripción del vencimiento)
```

## Privacidad y alcance

Las planillas y PDFs se procesan en el navegador. No se incorporan a este repositorio ni se almacenan en la suite. Los marcadores operan sobre sesiones ya autenticadas de EJE y no guardan credenciales.

La creación de actuaciones, lotes y decisiones definitivas permanece bajo control humano. Estas herramientas son desarrollos de asistencia interna y no constituyen sistemas oficiales del Consejo de la Magistratura de la Ciudad Autónoma de Buenos Aires.

## Publicación

GitHub Pages publica la carpeta `/docs` de la rama `main`:

```text
https://sinergiaestudio.github.io/herramientas-j15sec29/
```

## Pruebas

```bash
npm test
```

## Autoría

Diseño y desarrollo: **Marcelo Gómez**  
Juzgado N.º 15 · Secretaría N.º 29  
Biblioteca de Mero Trámite · innovación aplicada a la gestión judicial.
