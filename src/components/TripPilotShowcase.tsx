"use client";
import { useLocale } from "./LocaleProvider";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Slide = { image: string; label: string; title: string; text: string; alt: string; video?: string };



export default function TripPilotShowcase({ active }: { active: boolean }) {
  const {t}=useLocale();
const slides: Slide[] = [
  { image: "home", label: t("Inicio"), title: t("Tu día, de un vistazo."), text: t("La próxima actividad, tu alojamiento y los pendientes del viaje. Lo que necesitás para empezar el día."), alt: t("Inicio de TripPilot en Lisboa con próxima actividad, alojamiento y tareas pendientes") },
  { image: "itinerary", label: t("Itinerario"), title: t("Cada parada, en su lugar."), text: t("Organizá las actividades de cada día, cambiá su orden y consultá los tiempos entre una parada y otra."), alt: t("Itinerario de Lisboa con selector de días, actividades y controles para reordenar") },
  { image: "discover", label: t("Recomendaciones"), title: t("Descubrí qué hay cerca."), text: t("Explorá las sugerencias de la ciudad en el mapa. Encontrá museos, parques y lugares para sumar a tu viaje."), alt: t("Mapa de recomendaciones en Lisboa con lugares de distintas categorías") },
  { image: "saved", label: t("Guardados"), title: t("Tus lugares, siempre a mano."), text: t("Reuní los lugares que querés conocer y ubicá en el mapa cuáles te quedan pendientes y cuáles ya visitaste."), alt: t("Mapa de lugares guardados con filtros de pendientes y visitados") },
  { image: "route", label: t("Ruta"), title: t("El recorrido completo."), text: t("Visualizá el orden de las paradas, la distancia y el tiempo estimado. Compará el recorrido a pie, en coche o en transporte público."), alt: t("Ruta por cuatro lugares de Lisboa con distancia, tiempo y opciones de transporte") },
  { image: "discover-video", video: "discover", label: t("Del lugar al plan"), title: t("De descubrirlo a visitarlo."), text: t("Explorá recomendaciones, guardá un lugar y sumalo a tu plan. Elegí el día en el que querés conocerlo."), alt: t("Demostración de cómo guardar un museo y elegir su día de visita") },
  { image: "expenses-video", video: "expenses", label: t("Gasto rápido"), title: t("Un gasto, en segundos."), text: t("Ingresá el monto, elegí una categoría y guardá. El total de tu viaje se actualiza en el inicio."), alt: t("Demostración de un gasto de 25 dólares y su total actualizado") },
  { image: "widgets", label: "Widgets", title: t("Tu viaje, más a mano."), text: t("Consultá tu próxima actividad y el gasto acumulado desde la pantalla de inicio. Con accesos a gastos, lugares y mapa."), alt: t("Widgets de TripPilot con próxima actividad, total gastado y accesos rápidos") },
];

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
  }, [playing, index, slide.video, slides.length]);
  useEffect(() => {
    const element = video.current;
    if (!element) return;
    if (playing) {
      if (element.ended) element.currentTime = 0;
      void element.play().catch(() => { /* Native controls remain available if autoplay is blocked. */ });
    } else element.pause();
  }, [playing, index]);
  return <div ref={container} className="trip-project-content trip-showcase" role="region" aria-label={t("Funciones de TripPilot")} aria-roledescription={t("carrusel", "carousel")}
    onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
    <div className="trip-project-copy">
      <div className="trip-project-eyebrow trip-project-identity"><span>{t("TripPilot · App iOS")}</span><span className="trip-release-status">{t("Próximamente en App Store")}</span></div>
      <div key={slide.image} className="trip-showcase-story" aria-live={playing ? "off" : "polite"}>
        <span className="trip-showcase-label">{slide.label}</span>
        <h3>{slide.title}</h3>
        <p>{slide.text}</p>
      </div>
      <div className="trip-showcase-controls">
        <div className="trip-showcase-dots" aria-label={t("Elegir pantalla")}>
          {slides.map((item, i) => <button key={item.image} type="button" aria-label={`${t("Mostrar", "Show")} ${item.label}`} aria-current={i === index ? "true" : undefined} onClick={() => setIndex(i)}><span /></button>)}
        </div>
        {!reduced && <button type="button" className="trip-showcase-pause" onClick={() => setPaused(value => !value)} aria-label={paused ? t("Reanudar presentación") : t("Pausar presentación")}>{paused ? t("Reanudar") : t("Pausar")}</button>}
        <span className="trip-showcase-count">{String(index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}</span>
      </div>
      <span className="trip-project-role">{t("Diseñado y desarrollado por mí.")}<br />{t("Vista de demostración de TripPilot.", "TripPilot demonstration.")}</span>
    </div>
    <div className="trip-showcase-phone">
      {slides.map((item, i) => <div key={item.image} className="trip-showcase-frame" data-current={i === index} aria-hidden={i !== index}>
        {item.video ? (i === index && <video ref={video} key={item.video} src={`/videos/trippilot/${item.video}.mp4`} muted playsInline controls preload="metadata" aria-label={item.alt} onEnded={() => { if (playing) setIndex(value => (value + 1) % slides.length); }} />) :
        <Image src={`/images/trippilot/demo-${item.image}.png`} width={1206} height={2622} alt={item.alt} sizes="(max-width: 700px) 65vw, 300px" loading="eager" />}
      </div>)}
    </div>
  </div>;
}
