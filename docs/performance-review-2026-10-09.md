# Rendimiento del portfolio — 9 de octubre de 2026

## Diagnóstico

El retrato fijo continuaba simulando partículas y dibujando el canvas a cada cuadro incluso en Contacto. El observador de tamaño podía reconstruir la imagen ante cambios de altura del viewport; Safari cambia esa altura con sus barras. TripPilot montaba las seis capturas de inmediato. Los logos seguían animándose fuera de pantalla. El nombre modificaba peso y espaciado durante el scroll y el timeline leía seis posiciones del documento en cada cuadro.

## Cambios

- Partículas: menor densidad según dispositivo, máximo de 30 redibujados por segundo en celular y 60 en escritorio; pausas reales en las figuras ya formadas. La transformación entre retrato y monograma se conserva.
- Al salir de la portada, el retrato se detiene. En celular se limpia y oculta detrás del navbar opaco; en escritorio queda una textura estable sin un ciclo de dibujo continuo.
- Se conserva una altura estable en celular y se evita volver a muestrear por cambios de altura de las barras del navegador. Los cambios de ancho reconstruyen la composición.
- Paleta fuera del ciclo de dibujo; fricción calculada una sola vez por cuadro; sin eventos de interacción de partículas en dispositivos táctiles.
- Nombre: movimiento con transform y cambio de tipografía solamente al llegar/salir del navbar. Timeline: posiciones cacheadas, trabajo de scroll solamente cerca de la sección. Pintado de proyecto: dimensiones medidas una sola vez.
- Logos pausados fuera de pantalla, en una pestaña oculta o en el dorso de las tarjetas.
- Imágenes de partículas comprimidas con transparencia en WebP. Los originales se conservan como referencia, sin cargarlos en la página.
- TripPilot carga la captura actual y la próxima, no toda la presentación. En dispositivos táctiles los videos tienen reproducción manual, sin descarga anticipada, y portadas pequeñas obtenidas del video real. Se pausan al salir de pantalla, abrir el dorso o esconder la pestaña.

## Medición antes/después

Producción local, mismo navegador Chromium y viewport de 393 × 852. Instrumentación de las llamadas del canvas; no estimación del consumo de batería.

| Prueba | Antes | Después |
| --- | ---: | ---: |
| Redibujados del retrato en Contacto, durante 2,5 segundos | 151 | 0 |
| Operaciones arc en Contacto durante ese intervalo | 3.593.922 | 0 |
| Imágenes de las partículas, bytes descargados sin compresión HTTP | 4.882.862 | 557.008 |
| Capturas de TripPilot montadas al abrir el proyecto | 6 | 2 |

Las dos imágenes de partículas pesan 88,6% menos. Una medición adicional de seis segundos confirmó el paso de retrato a caída hacia el logo: 29 redibujados y 196.591 operaciones arc, con pausas sin renderizar cuando la figura está formada.

## Comprobaciones

- Producción y lint pasan; los siete tests existentes de seguridad pasan.
- Modo táctil con DPR 3: cambio de altura sin nuevo muestreo, video inicialmente pausado y sin descarga MP4, reproducción manual y pausa al salir de pantalla.
- Galería, apertura/dorso/regreso de TripPilot, Animal Feed y Consultorio; sin desbordamiento horizontal, paletas correctas y logos del dorso pausados.
- ES → EN, modo oscuro, preferencia de movimiento reducido y escritorio a 1440 px; sin excepciones de JavaScript en las pruebas móviles.
- Scroll con CPU ralentizada 4×: 168 intervalos requestAnimationFrame, mediana y percentil 95 de 16,7 ms; ninguno mayor a 50 ms. Esta prueba mide la programación de cuadros en Chromium, no garantiza FPS en Safari ni un resultado térmico.

## Prueba pendiente en dispositivo real

En Safari del iPhone 16 Pro: recorrer la página 3–5 minutos, dejarla quieta en Contacto, volver a la portada, cambiar tema/idioma y reproducir las demos. Comparar con la versión anterior desde condiciones similares y sin otra grabación de pantalla en curso. La emulación no mide temperatura ni batería y no sustituye esa comprobación. Los cambios permanecen locales; esta revisión no publica un despliegue.

Referencias: [optimización de canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas) y [viewport visual](https://developer.mozilla.org/en-US/docs/Web/API/VisualViewport).
