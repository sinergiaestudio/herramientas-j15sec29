# Herramientas SEC29

Aplicación web modular para tareas operativas del Juzgado N.º 15, Secretaría N.º 29. La versión 6.2 reúne cuatro accesos principales dentro de un menú lateral que siempre comienza completamente minimizado:

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

## Integración continua y desplazamiento único

Cédulas EJE y Confronte de Liquidaciones EJF conservan sus repositorios y motores especializados, pero dentro de la suite se comportan como parte de una única página.

La versión 6.2 reemplaza la interceptación directa del contenido por un puente explícito entre cada aplicación y la página principal. Ese puente:

- comunica automáticamente la altura real de la herramienta;
- amplía o reduce el espacio cuando aparecen resultados, auditorías o paneles desplegables;
- transmite la rueda del mouse, los gestos táctiles y las teclas de navegación al desplazamiento principal;
- conserva el desplazamiento propio únicamente en controles que realmente lo necesitan;
- evita barras verticales internas y el efecto de “ventana dentro de otra ventana”;
- mantiene los botones `Recargar` y `Abrir aparte` como respaldo operativo.

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
