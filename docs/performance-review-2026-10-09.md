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

## Ajuste de definición después de la prueba

La primera reducción a 240 px de muestreo en celular y 360 px en escritorio hacía que los puntos fueran más grandes y se perdieran rasgos. Se aumenta a 360 px en celular y se recuperan los 480 px en escritorio. El canvas vuelve a un límite de DPR 2 en ambos; antes se limitaba a 1,5 en celular. Se mantienen el máximo de 30 redibujados por segundo en celular, las pausas entre figuras, la detención fuera de la portada y los recursos comprimidos. Las cifras de redibujados de la tabla siguen describiendo la inactividad fuera de pantalla; el conteo de operaciones durante la transformación de seis segundos corresponde a la primera versión y no a este ajuste de densidad.

### Segundo ajuste de definición

Se recupera el muestreo de 480 px también en celular, con puntos más pequeños. En el monograma se distribuyen los destinos de forma uniforme antes de repetirlos y se reduce la dispersión de cada punto: mejora la continuidad de los bordes y evita huecos o acumulaciones aleatorias. Se conservan DPR máximo 2, 30 redibujados por segundo en celular y las pausas dentro y fuera de la portada. El consumo durante las transformaciones debe compararse nuevamente en el iPhone; recuperar densidad aumenta el trabajo de esos cuadros respecto de la primera optimización.

## Piso de partículas adaptable

La pila se posiciona dentro del viewport visual y por encima de Pausar y los enlaces inferiores, respetando el área segura. Se limita el rebote de los resortes para que no atraviese el piso. Los cambios de altura de las barras de Safari desplazan únicamente los destinos de caída, con un ajuste agrupado; no reconstruyen ni vuelven a muestrear el retrato. Los cambios de ancho continúan reconstruyendo la composición.


## Revisión de temperatura, nombre único y caída bajo los controles

- La pila ahora termina por debajo de Pausar y de los textos inferiores. Se reserva una franja inferior dentro del viewport visual y se respeta el área segura. El hero pequeño deja de imponer una altura superior a la disponible.
- Se elimina el segundo nombre fijo del header móvil. El mismo h1 viaja desde el hero al espacio del navbar; queda fuera del contexto de apilamiento del contenido para que el fondo del header no lo tape al llegar.
- Se sustituye el trazado de miles de círculos Canvas 2D por puntos WebGL agrupados por tinta, sin bibliotecas nuevas. Se mantiene el muestreo de 480 px y DPR máximo 2. Las figuras quietas conservan todos sus puntos; las transformaciones móviles usan un máximo de 8000 puntos a 24 cuadros/s. Las figuras quietas no mantienen un bucle de dibujo.
- Durante el scroll móvil se mueve y desvanece la capa compuesta: se cancelan los cálculos y dibujos de partículas desde que se abandona la posición inicial. Se reanuda al volver al hero.
- Sin WebGL o ante pérdida del contexto gráfico en móvil se muestra un retrato estático. Se respeta reducir movimiento y se liberan buffers/programas al desmontar.

### Medición local antes y después

Chromium en Mac, viewport 393 × 852, DPR de dispositivo 3 (canvas limitado a 2), durante 26 segundos desde una navegación nueva. Se instrumentaron los callbacks de animación que efectivamente dibujan. Son tiempos de JavaScript de esos callbacks, no CPU total de la página ni consumo energético ni temperatura del iPhone.

| Métrica | Antes | Después |
| --- | ---: | ---: |
| Tiempo acumulado de callbacks de dibujo | 3494,8 ms | 890,0 ms |
| Cuadros dibujados | 438 | 226 |
| Tiempo medio por cuadro | 7,98 ms | 3,94 ms |
| Percentil 95 | 9,70 ms | 8,00 ms |
| Llamadas arc del canvas visible | 9.741.306 | 0 |

Reducción observada de aproximadamente 74,5% en el tiempo acumulado de los callbacks de dibujo. El nuevo renderer usa envíos de puntos agrupados; cero llamadas arc no significa cero trabajo gráfico. La temperatura y batería siguen pendientes de validación en el iPhone real.

### Verificaciones

- Reproducción previa: dos nombres visibles; pila por encima del texto inferior.
- Prueba corregida a 393 × 852: un nombre; pila entre y=797,8 y y=842,7, por debajo del texto (y=777) y dentro del viewport (y=852). El nombre llega a x=20 en el navbar y recibe interacción por encima de su fondo.
- Cero dibujos nuevos fuera del hero durante 1,8 s. Sin errores de página/consola en ese recorrido.
- WebGL deshabilitado, pérdida de contexto simulada y reducir movimiento: retrato disponible, cero redibujados durante el intervalo de reposo de 1,6 s y sin errores de página.
- Build, TypeScript, ESLint y 7 pruebas de seguridad correctos.

Referencia de implementación: [WebGL best practices, MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices) (envíos agrupados, buffers reutilizados y eliminación de recursos).

### Comprobación final de tamaños

La altura mínima del hero móvil ahora respeta el espacio disponible. Se verificó la pila pausada mediante las coordenadas reales enviadas al renderizador:

| Viewport | Fin de textos | Inicio de pila | Fin de pila | Resultado |
| --- | ---: | ---: | ---: | --- |
| 320 × 568 | 493 | 513.96 | 558.45 | Dentro del viewport, debajo de los textos |
| 430 × 932 | 847 | 867.72 | 912.78 | Dentro del viewport, debajo de los textos |
| 768 × 1024 | 948 | 969.87 | 1014.75 | Dentro del viewport, debajo de los textos |
| 1440 × 900 | 824 | 845.70 | 890.93 | Dentro del viewport, debajo de los textos |

Medición en píxeles CSS con Chromium local. No sustituye la revisión de las barras dinámicas y temperatura en Safari del iPhone. Compilación y lint volvieron a pasar después del ajuste de altura.
