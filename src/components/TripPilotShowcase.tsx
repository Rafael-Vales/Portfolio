"use client";
import { useLocale } from "./LocaleProvider";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function TripPilotShowcase({ active }: { active: boolean }) {
  const { t } = useLocale();
  const slides = [
    { image: "home", label: t("Inicio"), title: t("Tu día, de un vistazo."), text: t("Consultá el destino, tu alojamiento y la próxima actividad en una sola pantalla.", "See the destination, your lodging, and the next activity on one screen."), alt: t("Inicio de TripPilot con el destino y la próxima actividad", "TripPilot home with the destination and next activity") },
    { image: "itinerary", label: t("Itinerario"), title: t("Cada parada, en su lugar."), text: t("Organizá las actividades de cada día, cambiá su orden y consultá los tiempos entre una parada y otra."), alt: t("Itinerario con fechas, paradas y controles para reordenar", "Itinerary with dates, stops, and controls to reorder them") },
    { image: "day", label: t("Hoy", "Today"), title: t("Lo que sigue en el viaje.", "What's next on the trip."), text: t("Revisá las paradas del día y abrí el recorrido desde la pantalla de inicio.", "Check today's stops and open the route from the home screen."), alt: t("Pantalla Hoy con la siguiente parada y las actividades del día", "Today screen with the next stop and the day's activities") },
    { image: "saved", label: t("Guardados"), title: t("Tus lugares, siempre a mano."), text: t("Consultá tus lugares guardados y volvé al mapa para ubicarlos.", "Browse saved places and return to the map to find them."), alt: t("Lista de lugares guardados sobre el mapa", "Saved places list over the map") },
    { image: "expenses", label: t("Gastos", "Expenses"), title: t("Tu presupuesto durante el viaje.", "Your budget as you travel."), text: t("Consultá cuánto gastaste, cuánto queda y cómo se reparten los gastos por categoría o ciudad.", "See what you've spent, what remains, and how expenses break down by category or city."), alt: t("Presupuesto, categorías y movimientos del viaje", "Trip budget, expense categories, and transactions") },
    { image: "home-dark", label: t("Modo oscuro", "Dark mode"), title: t("El viaje en modo oscuro.", "The trip in dark mode."), text: t("La pantalla de inicio conserva el destino, el alojamiento y la próxima actividad en el tema oscuro.", "The home screen keeps the destination, lodging, and next activity visible in dark mode."), alt: t("Inicio de TripPilot en modo oscuro", "TripPilot home in dark mode") },
  ];

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [visible, setVisible] = useState(false);
  const [focused, setFocused] = useState(false);
  const container = useRef<HTMLDivElement>(null);
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
    if (!playing) return;
    const timer = setTimeout(() => {
      if (!document.hidden) setIndex(value => (value + 1) % slides.length);
    }, 5000);
    return () => clearTimeout(timer);
  }, [playing, index, slides.length]);
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
        {(i === index || i === (index + 1) % slides.length) && (
          <Image src={`/images/trippilot/current-${item.image}.webp`} width={780} height={1696} alt={item.alt} sizes="(max-width: 700px) 65vw, 300px" loading="eager" />
        )}
      </div>)}
    </div>
  </div>;
}
