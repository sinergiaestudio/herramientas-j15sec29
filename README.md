# Herramientas SEC29

Aplicación web modular para tareas operativas del Juzgado N.º 15, Secretaría N.º 29. La versión 5.1 incorpora un menú lateral completamente minimizado al iniciar y reúne tres utilidades dentro de una misma página:

1. **Procesador de actuaciones:** lee archivos `.csv`, `.xlsx` o `.xls`, obtiene Carátula, Número de expediente y Título, elimina el prefijo `escrit normal-` y convierte el título a minúsculas.
2. **Procesador de vencimientos:** lee archivos `.xlsx` o `.xls`, detecta Carátula, Número de expediente y Descripción aunque las columnas cambien de posición, y descarta las filas cuya descripción sea únicamente `VTO`.
3. **Cargador EJE:** genera un marcador de Chrome que, dentro de una sesión ya autenticada de EJE, valida una lista de expedientes, completa secuencialmente el campo visible y deja un registro CSV de la operación.

## Navegación modular

La interfaz utiliza rutas por hash, por lo que cada módulo puede abrirse y compartirse sin servidor de aplicaciones:

```text
#procesadores
#cargador-eje
```

El menú lateral comienza completamente oculto en todas las pantallas. El botón de la cabecera despliega las opciones como un panel lateral y, al elegir un módulo o hacer clic fuera del panel, vuelve a minimizarse. La estructura queda preparada para incorporar nuevas herramientas sin mezclar sus interfaces ni sus lógicas.

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

## Privacidad y alcance

Todo el procesamiento de planillas ocurre dentro del navegador. Los archivos seleccionados:

- no se suben a un servidor;
- no se almacenan;
- no se envían a terceros;
- no quedan registrados en la aplicación.

El Cargador EJE tampoco almacena credenciales ni transmite expedientes. El marcador trabaja sobre la página que el usuario ya tiene abierta y autenticada, localiza el campo visible de expediente, completa el valor y simula Enter. No crea actuaciones, no selecciona modelos y no confirma decisiones.

La aplicación utiliza SheetJS Community Edition 0.20.3 desde su CDN oficial únicamente para leer archivos de Excel. Como respaldo, intenta la etiqueta estable `latest` del mismo origen oficial. El contenido de las planillas permanece en el equipo del usuario.

## Publicación en GitHub Pages

Repositorio publicado: `sinergiaestudio/herramientas-j15sec29`.

1. Crear un repositorio público en GitHub.
2. Subir **todo el contenido** de esta carpeta, conservando la estructura.
3. Abrir `Settings` → `Pages`.
4. En `Build and deployment`, elegir `Deploy from a branch`.
5. Seleccionar la rama `main` y la carpeta `/docs`.
6. Guardar.

Para la cuenta `sinergiaestudio`, la dirección esperada será:

```text
https://sinergiaestudio.github.io/herramientas-j15sec29/
```

## Pruebas

```bash
npm test
```

Las pruebas verifican:

- numeración de actuaciones y vencimientos;
- limpieza de `escrit normal-`;
- detección automática de encabezados;
- exclusión de descripciones `VTO`;
- conservación de `Nro` y `N°`;
- integridad y codificación reversible del Cargador EJE;
- apertura, cierre y estado accesible del menú lateral.

## Estructura

```text
.
├── docs/
│   ├── index.html
│   ├── assets/
│   │   ├── css/styles.css
│   │   ├── js/app.js
│   │   ├── js/processors.js
│   │   ├── js/navigation.js
│   │   ├── js/cargador-eje.js
│   │   ├── js/cargador-eje-source.js
│   │   └── icons/
│   ├── manifest.webmanifest
│   └── sw.js
├── tests/
├── .github/workflows/
├── package.json
└── README.md
```

## Autoría

Diseño y desarrollo: **Marcelo Gómez**  
Juzgado N.º 15 · Secretaría N.º 29  
Biblioteca de Mero Trámite · innovación aplicada a la gestión judicial.

La herramienta es un desarrollo de apoyo interno y no constituye un sistema oficial del Consejo de la Magistratura de la Ciudad Autónoma de Buenos Aires.
