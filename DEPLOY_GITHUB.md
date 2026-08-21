# Publicar o actualizar Herramientas SEC29 en GitHub Pages

## Primera publicación mediante el navegador

1. Ingresar a GitHub con la cuenta `sinergiaestudio`.
2. Crear un repositorio nuevo llamado `herramientas-j15sec29`.
3. Elegir visibilidad **Public**.
4. No agregar README, licencia ni `.gitignore` durante la creación, porque ya están incluidos en el paquete.
5. Dentro del repositorio vacío, elegir `uploading an existing file`.
6. Arrastrar todo el contenido descomprimido del ZIP. Deben quedar visibles las carpetas `docs`, `tests` y `.github`.
7. Confirmar la carga con `Commit changes`.
8. Abrir `Settings` → `Pages`.
9. En `Source`, seleccionar `Deploy from a branch`.
10. Elegir `main` y `/docs`, y guardar.
11. Esperar el aviso de publicación.

Dirección esperada:

```text
https://sinergiaestudio.github.io/herramientas-j15sec29/
```

## Actualizar un repositorio ya existente

1. Descomprimir el nuevo paquete.
2. En el repositorio, reemplazar el contenido anterior por el de esta versión, conservando la estructura de carpetas.
3. Confirmar la actualización con un commit, por ejemplo: `Actualiza Herramientas SEC29 a v6.0`.
4. GitHub Pages volverá a publicar automáticamente la carpeta `/docs`.
5. Debido al modo instalable y al service worker, en la primera apertura posterior a la actualización puede ser necesario recargar la página con `Ctrl + F5`.

## Rutas disponibles

```text
https://sinergiaestudio.github.io/herramientas-j15sec29/#procesadores
https://sinergiaestudio.github.io/herramientas-j15sec29/#actuaciones-lote
https://sinergiaestudio.github.io/herramientas-j15sec29/#lotes-cedulas
https://sinergiaestudio.github.io/herramientas-j15sec29/#confronte-liquidaciones
```

## Observación

Los documentos cargados en los procesadores nunca se suben a GitHub. GitHub aloja únicamente el código estático. El Creador de actuaciones en lote opera localmente sobre una sesión ya autenticada y tampoco almacena credenciales ni números de expediente.
