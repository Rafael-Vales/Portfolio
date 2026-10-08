# Preparación de privacidad y seguridad — 8 de octubre de 2026

## Cambios

- 11 imágenes limpiadas de EXIF/XMP/textos auxiliares, sin recomprimir los píxeles. Se conservaron perfiles de color y orientación.
- 2 CV sin metadatos de autor/herramienta/fechas; texto y render idénticos.
- TripPilot conserva las capturas seleccionadas y suma una aclaración de demostración en ambos idiomas. No se afirma que los datos sean ficticios.
- .gitignore ampliado para claves, certificados y archivos de credenciales.
- Control local pre-push: Gitleaks 8.30.1, historial de todas las ramas e índice, valores completamente ocultos y bloqueo por nombres privados.
- GitHub Actions: checkout fijado por commit, historial completo, binario oficial verificado por SHA256, mismo control y pruebas de credenciales sintéticas. Sin publicación de informes ni comentarios con hallazgos.
- CSP por solicitud con nonce para scripts; estilos inline conservados para React/animaciones, videos locales y únicamente el iframe autorizado de Animal Feed.
- Cabeceras nosniff, DENY, Referrer-Policy, Permissions-Policy y HSTS de producción; X-Powered-By desactivado. Documentos con nonce sin caché compartida.
- README actualizado con configuración de Vercel y uso de los controles.

## Comprobaciones locales

- npm run lint: sin errores.
- npm run build: correcto; / y /en se renderizan por solicitud, proxy detectado.
- npm run test:security: 7 pruebas aprobadas. Incluyen nombres privados, secretos sintéticos preparados, borrados del historial y borrados en una rama luego mergeada. Sin mostrar los valores.
- Gitleaks: sin secretos detectados en el historial examinado; análisis del índice antes de commit.
- Imágenes: comparación de tamaño, modo, bytes de píxeles y perfiles ICC antes/después, idénticos.
- PDF: extracción de texto idéntica y renders de ambos CV comparados píxel por píxel con sips, idénticos.
- HTTP de producción local en 127.0.0.1:3012: /, /en y variantes de proyectos con 200 y cabeceras esperadas. Nonce diferente por solicitud, presente en todos los scripts y reemplazo de x-nonce aportado por el cliente. .env/.git/config/package.json/src/proxy.ts con 404. CV, foto y video accesibles.
- Chrome: cambio real ES→EN conservando proyecto, modo oscuro e hidratación; video de gastos decodificado (readyState 4, sin error); apertura del iframe con respuesta 200. Sin errores de aplicación en la comprobación inicial.
- Prueba negativa CSP con bypassCSP:false: script sin nonce insertado en la respuesta HTML bloqueado, script con nonce válido ejecutado, hidratación funcional. La violación script-src-elem fue esperada en esta prueba. Los scripts creados por JS confiable no son una prueba negativa válida bajo strict-dynamic.
- Revisión independiente de código favorable después de corregir alcance de merges en CI, variantes de nombres privados y rama inicial determinista de las pruebas.

## Publicación posterior

Esta revisión es local; la ejecución remota de Actions se comprueba al subir los commits. No se realizó despliegue en Vercel. Tras importar el repositorio, verificar cabeceras y funciones de nuevo sobre HTTPS en la URL definitiva. No se cambiaron reglas remotas obligatorias de GitHub ni se auditó el backend de Animal Feed. El historial no se reescribió y los metadatos de versiones antiguas permanecen en Git.
