# Publicar la aplicación en GitHub Pages

## Método mediante el navegador

1. Ingresar a GitHub con la cuenta `sinergiaestudio`.
2. Crear un repositorio nuevo llamado `herramientas-sec29`.
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
https://sinergiaestudio.github.io/herramientas-sec29/
```

## Actualizaciones posteriores

Para actualizar la aplicación, reemplazar en GitHub únicamente los archivos modificados. GitHub Pages volverá a publicar el sitio automáticamente.

## Observación

Los documentos cargados en la aplicación nunca se suben a GitHub. GitHub aloja solamente el código estático de la herramienta.
