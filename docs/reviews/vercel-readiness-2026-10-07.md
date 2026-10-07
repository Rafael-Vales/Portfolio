# Revisión previa a Vercel — 2026-10-07

## Alcance

Revisión de los cambios locales pendientes y prueba de la compilación de producción en Chrome, escritorio de 1440 × 900. El despliegue en Vercel, Safari y la revisión móvil quedan pendientes. No se probó un checkout completo de la tienda externa ni se realizaron compras.

## Problemas reproducidos y correcciones

- La página original se cerró durante la prueba de Chrome. El proceso de renderizado llegó a aproximadamente 3,6 GiB de memoria residente. Una prueba temporal sustituyendo los Path2D grandes creados en cada cuadro por dibujo directo redujo notablemente el consumo. La corrección reutiliza buffers numéricos y el trazado del contexto Canvas, conservando las partículas, sus colores y las fases del ciclo.
- El botón de pausa no recibía el clic porque el pie del hero y el encabezado interceptaban el puntero. Se corrigió su capa visual. El mismo clic que fallaba pasó después del cambio.

Tras la corrección se observaron varios ciclos y se recorrió el portfolio durante varios minutos sin nuevos cierres. Las mediciones del proceso de renderizado estuvieron aproximadamente entre 290 y 450 MiB; las muestras iniciales de memoria JavaScript estuvieron entre 17 y 31 MB. Son mediciones de esta sesión local, no un límite garantizado para todos los equipos.

## Verificaciones realizadas

- `npm run lint`: salida 0.
- `npm run build`: salida 0; TypeScript y rutas `/`, `/en`, `/opengraph-image` correctas.
- `git diff --check`: salida 0.
- Rutas principales, ambos CV y la imagen para compartir: HTTP 200. Ambos documentos tienen cabecera PDF válida.
- Hero: ciclo retrato/monograma, pausa/reanudación mediante clic y modo oscuro. Inspección visual del retrato oscuro.
- Proyectos: apertura, dorso técnico, regreso al frente, navegación entre proyectos, restauración mediante Atrás del navegador.
- TripPilot: reproducción del video de gasto rápido comprobada con avance del tiempo y estado multimedia listo.
- Animal Feed: apertura y regreso de la tienda dentro del iframe; catálogo con productos visible en el documento de la tienda.
- Español → inglés → español con un clic por cambio: conserva proyecto seleccionado y modo oscuro; cambia el enlace al CV correspondiente.
- Decisiones: los cuatro proyectos completan los cuatro pasos de su demostración.
- Recorrido: giro automático cuando está visible, regreso al texto, pausa y alineación izquierda de imagen/navegación. Origen del giro en el borde izquierdo.
- Contacto: copiar email muestra confirmación.
- Movimiento reducido: acceso directo al proyecto sin loader bloqueante.
- Registro final de Chrome: sin errores ni advertencias.
- Revisión de archivos pendientes: no se detectaron credenciales en los patrones inspeccionados. Se incluye el CV inglés y todos los componentes y rutas nuevos.

## Cómo repetir la comprobación

1. Ejecutar `npm run lint` y `npm run build`.
2. Iniciar producción con `npm run start -- --port 3012`.
3. Abrir `http://localhost:3012/` en Chrome y dejar transcurrir varios ciclos del hero. Probar pausa, modo oscuro y desplazamiento.
4. Abrir las tres tarjetas, sus dorsos y las flechas. Reproducir el video de gastos y abrir/regresar de la tienda.
5. Con un proyecto seleccionado, cambiar EN y ES. Comprobar nombre del proyecto, idioma y enlace al CV.
6. Recorrer las decisiones, dejar visible el retrato del recorrido, probar su pausa y copiar el email en contacto.
7. Revisar errores del navegador y memoria del proceso de renderizado. Comparar con la versión anterior si reaparece un cierre.

## Pendiente después de publicar una preview

- Revisión en un teléfono real, pospuesta por decisión del usuario.
- Verificación en Safari y en la URL real de Vercel.
- Ajustes de dominio y buscadores al definir la dirección definitiva.
