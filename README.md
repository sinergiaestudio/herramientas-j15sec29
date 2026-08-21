# Herramientas SEC29

Aplicación web unificada para transformar exportaciones judiciales en mensajes listos para copiar y pegar en WhatsApp.

Integra dos procesadores:

- **Actuaciones:** lee archivos `.csv`, `.xlsx` o `.xls`, obtiene Carátula, Número de expediente y Título, elimina el prefijo `escrit normal-` y convierte el título a minúsculas.
- **Vencimientos:** lee archivos `.xlsx` o `.xls`, detecta Carátula, Número de expediente y Descripción aunque las columnas cambien de posición, y descarta las filas cuya descripción sea únicamente `VTO`.

## Regla de numeración

- Un único resultado se exporta **sin** `1)`.
- Dos o más resultados se exportan como `1)`, `2)`, `3)`, etc.

Los formatos de salida se mantienen separados:

```text
*CARÁTULA - Expte. Nro 12345/2026-0* (título de la actuación)
```

```text
*CARÁTULA - Expte. N° 12345/2026-0* (descripción del vencimiento)
```

## Privacidad

Todo el procesamiento ocurre dentro del navegador. Los archivos seleccionados:

- no se suben a un servidor;
- no se almacenan;
- no se envían a terceros;
- no quedan registrados en la aplicación.

La aplicación utiliza SheetJS Community Edition 0.20.3 desde su CDN oficial únicamente para leer los archivos de Excel. Como respaldo, intenta la etiqueta estable `latest` del mismo origen oficial. El contenido de los archivos permanece en el equipo del usuario.

## Estructura

```text
.
├── docs/                    Sitio publicado por GitHub Pages
│   ├── index.html
│   ├── assets/
│   │   ├── css/styles.css
│   │   ├── js/app.js
│   │   ├── js/processors.js
│   │   └── icons/
│   ├── manifest.webmanifest
│   └── sw.js
├── tests/                   Pruebas de la lógica de formato
├── .github/workflows/       Control automático en GitHub Actions
├── package.json
└── README.md
```

## Autoría

Diseño y desarrollo: **Marcelo Gómez**  
Juzgado N.º 15 · Secretaría N.º 29  
Biblioteca de Mero Trámite · innovación aplicada a la gestión judicial.

La herramienta es un desarrollo de apoyo interno y no constituye un sistema oficial del Consejo de la Magistratura de la Ciudad Autónoma de Buenos Aires.
