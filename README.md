# Herramientas SEC29

Aplicación web modular para tareas operativas del Juzgado N.º 15, Secretaría N.º 29. La versión 6.0 reúne cuatro accesos principales dentro de un menú lateral que siempre comienza completamente minimizado:

1. **Actuaciones y vencimientos:** procesa exportaciones del EJE y genera listados listos para WhatsApp.
2. **Creador de actuaciones en lote:** instala un marcador que carga expedientes secuencialmente en la pantalla Crear actuación de EJE.
3. **Creador de Lotes - Cédulas:** integra Cédulas EJE, que analiza PDFs de confronte, identifica las piezas remitidas a la Oficina de Notificaciones y asiste su incorporación en Crear lote.
4. **Confronte de Liquidaciones EJF:** integra la aplicación de comparación documental, revisión de lectura y recálculo trazable de intereses.

## Navegación modular

```text
#procesadores
#actuaciones-lote
#lotes-cedulas
#confronte-liquidaciones
```

La ruta histórica `#cargador-eje` continúa funcionando y redirige internamente a `#actuaciones-lote`.

El menú lateral comienza oculto en escritorio, tablet y teléfono. Se abre con el botón de la cabecera y vuelve a cerrarse al seleccionar un módulo, hacer clic fuera del panel o presionar `Escape`.

## Integración de aplicaciones especializadas

Cédulas EJE y Confronte de Liquidaciones EJF permanecen como aplicaciones independientes, con sus propios ciclos de desarrollo y pruebas. Herramientas SEC29 las abre dentro de un marco integrado y también ofrece el acceso “Abrir aparte”. Esta arquitectura evita duplicar código complejo y permite que las actualizaciones de cada aplicación se reflejen sin reconstruir toda la suite.

Aplicaciones integradas:

- `https://sinergiaestudio.github.io/Cedulas-EJE-v1.0/`
- `https://sinergiaestudio.github.io/Confronte-Liquidaciones-EJF-v2.1.0/`

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

Las pruebas verifican formatos de actuaciones y vencimientos, integridad del marcador, navegación accesible, alias de rutas e integración diferida de las aplicaciones externas.

## Autoría

Diseño y desarrollo: **Marcelo Gómez**  
Juzgado N.º 15 · Secretaría N.º 29  
Biblioteca de Mero Trámite · innovación aplicada a la gestión judicial.
