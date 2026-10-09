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


## Corrección de fluidez tras revisar la grabación de las 13:28

### Causas reproducidas

La optimización anterior alternaba 6777 puntos durante el movimiento con 27107 al detenerse en Chromium móvil. El salto de densidad aparecía cuatro veces durante retrato → pila → monograma. El límite de 24 cuadros/s producía intervalos de unos 42 ms en la pantalla local de 60 Hz. Al terminar la transición se reemplazaba el estado del resorte por el destino exacto, introduciendo otro salto. Además, un temporizador de apertura despertaba el retrato a los 6,5 s incluso cuando no había apertura y reiniciaba su pausa.

### Implementación vigente

- En dispositivos táctiles, los destinos de retrato, retrato nocturno, pila, monograma y apertura se cargan una vez en un buffer estático. Un vertex shader interpola el conjunto completo en cada cuadro, con una sola llamada de dibujo y sin actualizaciones de posiciones desde JavaScript en cada cuadro.
- Caída y formación usan curvas continuas dependientes del tiempo; las formaciones llegan con velocidad y aceleración suaves a la figura final. Se elimina el cambio de densidad entre movimiento y reposo.
- Se admite una cadencia máxima de 60 cuadros/s. En las pausas, con movimiento reducido, pestaña oculta y al scrollear fuera del hero se conserva la detención real del bucle. El canvas sigue limitado a DPR 2.
- Los cambios de altura actualizan el piso con un desplazamiento uniforme; no vuelven a subir todos los destinos. Se conserva el renderer de escritorio con interacción de puntero y el retrato estático ante falta/pérdida de WebGL.
- El temporizador de apertura solo termina una apertura que sigue activa. No interrumpe las pausas del ciclo normal.

### Resultados actuales

Producción local en Mac, viewport 393 × 852, DPR del dispositivo 3 y del canvas 2. Instrumentación de requestAnimationFrame, clear, drawArrays y bufferSubData. Cadencia medida entre callbacks que dibujan durante caída/formación; se excluyen los intervalos de reposo. Las lecturas de píxeles y getError se usaron únicamente en los tests, no en la aplicación.

| Medición | Chromium anterior | Chromium actual | WebKit actual |
| --- | ---: | ---: | ---: |
| Puntos durante el movimiento | 6777 | 27107 | 26773 |
| Saltos de densidad detectados | 4 | 0 | 0 |
| Intervalo mediano de cuadros en movimiento | 41,7 ms | 16,7 ms | 17 ms |
| Intervalo percentil 95 | 42,6 ms | 17,6 ms | 18 ms |
| Tiempo JS medio del callback de dibujo, apertura incluida | No medido en esta prueba | 0,115 ms | 0,162 ms |
| Tiempo JS percentil 95 del callback | No medido en esta prueba | 0,3 ms | 1 ms |
| Nuevos dibujos durante pausa / fuera del hero | — | 0 / 0 | 0 / 0 |

El conteo difiere ligeramente entre motores por el muestreo del monograma. En cada motor es constante entre todas las fases. Los tiempos JS no incluyen todo el trabajo de GPU ni todo el trabajo de la página, y no equivalen a energía consumida.

Se verificaron apertura, retrato, caída, pausa/reanudación, monograma, modo nocturno y salida del hero sin excepciones de página ni errores de WebGL. La pila en 393 × 852 ocupa aproximadamente y=797–842,5, debajo de los textos que terminan en y=777. También se comprobaron 320 × 568, 430 × 932 y 768 × 1024: pila dentro del viewport y debajo de los controles. Sin WebGL, con pérdida de contexto y con movimiento reducido: retrato disponible, sin nuevos dibujos durante el reposo y sin excepciones.

### Investigación aplicada

- [MDN: WebGL best practices](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices): agrupar dibujos, trasladar cálculos al vertex shader y evitar lecturas síncronas de GPU en producción.
- [MDN: requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame): calcular el avance con el tiempo transcurrido, independiente del número de cuadros.
- [WebKit: Rendering Frames Timeline](https://webkit.org/blog/3996/introducing-the-rendering-frames-timeline/): medir el tiempo de los cuadros y respetar el presupuesto de aproximadamente 16,7 ms a 60 Hz.
- [web.dev: Animations and performance](https://web.dev/articles/animations-and-performance/): priorizar transformaciones compuestas para el scroll y evitar trabajo de layout/paint innecesario.

### Validación física pendiente

WebKit en Mac verifica compatibilidad del motor, no temperatura ni FPS en un iPhone 16 Pro. Comparar en Safari real el ciclo completo durante 3–5 minutos, scroll de ida/vuelta, cambio de tema y pausa. El resultado térmico no puede darse por resuelto a partir de estas pruebas locales.
