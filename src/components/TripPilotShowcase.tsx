"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Slide = { image: string; label: string; title: string; text: string; alt: string; video?: string };

const slides: Slide[] = [
  { image: "home", label: "Inicio", title: "Tu día, de un vistazo.", text: "La próxima actividad, tu alojamiento y los pendientes del viaje. Lo que necesitás para empezar el día.", alt: "Inicio de TripPilot en Lisboa con próxima actividad, alojamiento y tareas pendientes" },
  { image: "itinerary", label: "Itinerario", title: "Cada parada, en su lugar.", text: "Organizá las actividades de cada día, cambiá su orden y consultá los tiempos entre una parada y otra.", alt: "Itinerario de Lisboa con selector de días, actividades y controles para reordenar" },
  { image: "discover", label: "Recomendaciones", title: "Descubrí qué hay cerca.", text: "Explorá las sugerencias de la ciudad en el mapa. Encontrá museos, parques y lugares para sumar a tu viaje.", alt: "Mapa de recomendaciones en Lisboa con lugares de distintas categorías" },
  { image: "saved", label: "Guardados", title: "Tus lugares, siempre a mano.", text: "Reuní los lugares que querés conocer y ubicá en el mapa cuáles te quedan pendientes y cuáles ya visitaste.", alt: "Mapa de lugares guardados con filtros de pendientes y visitados" },
  { image: "route", label: "Ruta", title: "El recorrido completo.", text: "Visualizá el orden de las paradas, la distancia y el tiempo estimado. Compará el recorrido a pie, en coche o en transporte público.", alt: "Ruta por cuatro lugares de Lisboa con distancia, tiempo y opciones de transporte" },
  { image: "discover-video", video: "discover", label: "Del lugar al plan", title: "De descubrirlo a visitarlo.", text: "Explorá recomendaciones, guardá un lugar y sumalo a tu plan. Elegí el día en el que querés conocerlo.", alt: "Demostración de cómo guardar un museo y elegir su día de visita" },
  { image: "expenses-video", video: "expenses", label: "Gasto rápido", title: "Un gasto, en segundos.", text: "Ingresá el monto, elegí una categoría y guardá. El total de tu viaje se actualiza en el inicio.", alt: "Demostración de un gasto de 25 dólares y su total actualizado" },
  { image: "widgets", label: "Widgets", title: "Tu viaje, más a mano.", text: "Consultá tu próxima actividad y el gasto acumulado desde la pantalla de inicio. Con accesos a gastos, lugares y mapa.", alt: "Widgets de TripPilot con próxima actividad, total gastado y accesos rápidos" },
];

export default function TripPilotShowcase({ active }: { active: boolean }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [visible, setVisible] = useState(false);
  const [focused, setFocused] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [pageVisible, setPageVisible] = useState(true);
  useEffect(() => {
    const sync = () => setPageVisible(!document.hidden);
    sync(); document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(media.matches);
    sync(); media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .25 });
    if (container.current) observer.observe(container.current);
    return () => observer.disconnect();
  }, []);
  const playing = active && visible && pageVisible && !paused && !reduced && !focused;
  const slide = slides[index];
  useEffect(() => {
    if (!playing || slide.video) return;
    const timer = setInterval(() => {
      if (!document.hidden) setIndex(value => (value + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [playing, index, slide.video]);
  useEffect(() => {
    const element = video.current;
    if (!element) return;
    if (playing) {
      if (element.ended) element.currentTime = 0;
      void element.play().catch(() => { /* Native controls remain available if autoplay is blocked. */ });
    } else element.pause();
  }, [playing, index]);
  return <div ref={container} className="trip-project-content trip-showcase" role="region" aria-label="Funciones de TripPilot" aria-roledescription="carrusel"
    onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
    <div className="trip-project-copy">
      <span className="trip-project-eyebrow">TripPilot · App iOS</span>
      <div key={slide.image} className="trip-showcase-story" aria-live={playing ? "off" : "polite"}>
        <span className="trip-showcase-label">{slide.label}</span>
        <h3>{slide.title}</h3>
        <p>{slide.text}</p>
      </div>
      <div className="trip-showcase-controls">
        <div className="trip-showcase-dots" aria-label="Elegir pantalla">
          {slides.map((item, i) => <button key={item.image} type="button" aria-label={`Mostrar ${item.label}`} aria-current={i === index ? "true" : undefined} onClick={() => setIndex(i)}><span /></button>)}
        </div>
        {!reduced && <button type="button" className="trip-showcase-pause" onClick={() => setPaused(value => !value)} aria-label={paused ? "Reanudar presentación" : "Pausar presentación"}>{paused ? "Reanudar" : "Pausar"}</button>}
        <span className="trip-showcase-count">{String(index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}</span>
      </div>
      <span className="trip-project-role">Diseñado y desarrollado por mí.</span>
    </div>
    <div className="trip-showcase-phone">
      {slides.map((item, i) => <div key={item.image} className="trip-showcase-frame" data-current={i === index} aria-hidden={i !== index}>
        {item.video ? (i === index && <video ref={video} key={item.video} src={`/videos/trippilot/${item.video}.mp4`} muted playsInline controls preload="metadata" aria-label={item.alt} onEnded={() => { if (playing) setIndex(value => (value + 1) % slides.length); }} />) :
        <Image src={`/images/trippilot/demo-${item.image}.png`} width={1206} height={2622} alt={item.alt} sizes="(max-width: 700px) 65vw, 300px" loading="eager" />}
      </div>)}
    </div>
  </div>;
}
