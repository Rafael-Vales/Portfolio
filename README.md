# Portfolio — Rafael Vales

Portfolio con proyectos, casos técnicos, recorrido, CV en español e inglés y contacto. Next.js 16, React y TypeScript; no requiere base de datos ni credenciales de aplicaciones fuente.

## Desarrollo y comprobaciones

```sh
npm ci
npm run dev -- --port 3011
npm run lint
npm run build
npm run start -- --port 3011
```

`build` utiliza Webpack. No es una exportación estática: los documentos se renderizan por solicitud y reciben un nonce nuevo para su política de scripts.

## Preparado para Vercel

- Importar el repositorio **Rafael-Vales/Portfolio** con preset **Next.js** y raíz del repositorio.
- Instalación: `npm ci`. Build: `npm run build`. Output: valor predeterminado de Next.js; no configurar `out`.
- No hacen falta claves de Supabase, TripPilot, correo ni otras credenciales para este portfolio.
- `NEXT_PUBLIC_SITE_URL` es opcional y debe contener únicamente la URL pública definitiva, con `https://`. Si no se configura, se usa `VERCEL_PROJECT_PRODUCTION_URL`; fuera de Vercel, localhost:3011.
- Nunca poner secretos en variables `NEXT_PUBLIC_*`: llegan al navegador.
- Las previews llevan `noindex`. Tras el primer despliegue, revisar ambos idiomas, CV, proyectos, videos y la demo de Animal Feed en la URL real.
- Esta preparación no publica por sí sola en Vercel.

## Prevención de secretos

El flujo de GitHub Actions revisa archivos privados e historial con [Gitleaks](https://github.com/gitleaks/gitleaks), fijado a 8.30.1; la acción de checkout está fijada por commit y el binario se verifica por SHA-256. Revisa todas las ramas e historial disponibles, incluso cambios integrados mediante merge. No sube informes con claves ni publica comentarios.

En este checkout quedó instalado un hook local `pre-push`. Antes de cualquier push verifica el historial y el índice, y rechaza archivos privados o credenciales detectadas. Los valores encontrados se muestran completamente ocultos.

Para activar el mismo control en otra copia:

1. Instalar Gitleaks 8.30.1 desde su distribución oficial y ponerlo en PATH, o indicar la ruta del ejecutable mediante `GITLEAKS_BIN`.
2. Ejecutar `git config --local core.hooksPath .githooks`.
3. Ejecutar:

```sh
npm run security
npm run test:security
```

La copia actual dispone del ejecutable verificado en `.git/tools/gitleaks`; no se versiona ni se envía a Vercel. Las pruebas generan credenciales sintéticas en repositorios temporales, comprueban que se bloqueen y los eliminan al terminar.

El hook puede omitirse deliberadamente desde Git: no sustituye el control del servidor. Actions detecta en pushes y pull requests; para impedir merges futuros con un control rojo, configurar `secrets` como check obligatorio en las reglas de main, si el plan de GitHub lo permite. No se cambiaron reglas de protección remotas.

## Privacidad del contenido

- Los recursos en `public/`, incluidos fotos, CV, capturas y videos, son descargables sin autenticación.
- Se limpiaron metadatos de imágenes y CV sin alterar sus píxeles ni su contenido. Las capturas muestran la demostración de TripPilot seleccionada para el portfolio: ciudades, alojamiento, fechas e importes visibles.
- Antes de agregar material nuevo, revisar notificaciones, datos de cuentas, reservas privadas, números de documentos, claves y metadatos de ubicación.
- La tienda incrustada de Animal Feed es otra aplicación; sus permisos y datos se revisan en su repositorio.
- El historial existente no fue reescrito. Las versiones antiguas de los recursos permanecen en Git.

## Cabeceras

CSP por documento con nonce en `/` y `/en`; scripts sin `unsafe-inline` ni `unsafe-eval` en producción. Los estilos inline siguen permitidos para React y las animaciones. Solo se autoriza el iframe de `ecommerce-los-abuelos.vercel.app`.

También se aplican `nosniff`, bloqueo de embedding externo, política de referrer, permisos restringidos y HSTS en producción. `X-Powered-By` está desactivado. El endurecimiento no equivale a una garantía de ausencia de vulnerabilidades; debe comprobarse de nuevo en el despliegue real.
