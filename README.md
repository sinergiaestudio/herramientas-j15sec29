# Herramientas SEC29

Aplicación web modular para tareas operativas del Juzgado N.º 15, Secretaría N.º 29. La versión 6.4 reúne cuatro accesos principales dentro de un menú lateral que siempre comienza completamente minimizado:

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

## Arquitectura sin iframes

La versión 6.4 elimina definitivamente la integración mediante `iframe` para Cédulas y Confronte.

Cada módulo complejo abre como una página completa, pero conserva el mismo shell de Herramientas SEC29:

- cabecera institucional;
- menú lateral inicialmente minimizado;
- selector de tema siempre visible en el ángulo superior izquierdo;
- mismos nombres de módulos y accesos cruzados;
- crédito de autoría común;
- preferencia de tema compartida mediante el mismo almacenamiento local.

Esta arquitectura evita de raíz:

- scroll anidado;
- bloqueo de rueda o trackpad;
- crecimiento infinito de la altura;
- barras laterales cada vez más pequeñas;
- dependencia de puentes de redimensionamiento entre documentos.

El desplazamiento de Cédulas y Confronte vuelve a ser el desplazamiento nativo del navegador, sin intermediarios.

## Modo oscuro obligatorio

La suite incluye un selector de tema siempre visible junto al botón del menú, en el sector superior izquierdo.

- `☾` activa el modo oscuro.
- `☀` vuelve al modo claro.
- La elección se conserva en el navegador.
- Sin una elección previa, se respeta la preferencia del sistema operativo.
- El tema funciona en Actuaciones y vencimientos, Creador de actuaciones en lote, Creador de Lotes - Cédulas y Confronte de Liquidaciones EJF.

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
