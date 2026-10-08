# Preparación segura para Vercel — Implementation Plan

**Goal:** integrar en main las medidas aprobadas en la revisión de exposición, sin desplegar todavía.
**Architecture:** limpieza sin recomprimir los píxeles, CSP con nonce por documento y cabeceras de Next.js, Gitleaks fijado en CI y control local antes del push.
**Tech Stack:** Next.js 16, TypeScript, Node.js, Gitleaks 8.30.1.
**Spec:** solicitud del usuario del 8 de octubre de 2026 y revisión de exposición de esa fecha.

## Constraints
- Conservar la apariencia, el contenido aprobado y la demo incrustada de Animal Feed.
- No inventar que los datos de viaje son ficticios ni alterar la aplicación fuente.
- No reescribir el historial; no publicar en Vercel en esta etapa.

## Review focus
- La CSP debe permitir hidratar ambos idiomas y aplicar el tema antes de mostrar la página.
- Videos, animaciones, estilos dinámicos e iframe deben seguir funcionando.
- Las imágenes deben conservar exactamente sus píxeles y orientación.
- Los controles de secretos deben fallar con credenciales sintéticas y nombres privados.
- El nonce debe ser distinto por solicitud y no depender de cabeceras enviadas por el cliente.

## Tasks
- [x] Limpiar EXIF/XMP/comentarios privados de imágenes y metadatos PDF; comparar píxeles y texto antes/después.
- [x] Ampliar .gitignore, incorporar Gitleaks, comprobar rechazo de secretos sintéticos en un repositorio temporal e instalar el hook local.
- [x] Implementar CSP con nonce y cabeceras; comprobar HTTP y navegador en producción.
- [x] Aclarar la demostración de TripPilot y actualizar instrucciones de publicación.
- [x] Ejecutar lint/build y revisión de código antes de integrar main; sin despliegue.
