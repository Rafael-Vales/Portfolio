"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "./LocaleProvider";

const examples = [
  {
    src: "/images/trippilot/current-home.webp", width: 780, height: 1696,
    project: "TripPilot", label: ["Inicio del viaje", "Trip home"],
    alt: ["Inicio de TripPilot con el destino y la próxima actividad", "TripPilot home with the destination and next activity"],
  },
  {
    src: "/images/consultorio/agenda.webp", width: 1440, height: 960,
    project: "Consultorio", label: ["Agenda semanal · Maqueta", "Weekly schedule · Mockup"],
    alt: ["Maqueta de la agenda del consultorio con turnos y horarios bloqueados", "Clinic schedule mockup with appointments and blocked time"],
  },
  {
    src: "/images/animal-feed/store-preview.jpg", width: 1265, height: 712,
    project: "Animal Feed", label: ["Tienda online", "Online store"],
    alt: ["Página de inicio de la tienda Animal Feed", "Animal Feed storefront"],
  },
  {
    src: "/images/trippilot/current-itinerary.webp", width: 780, height: 1696,
    project: "TripPilot", label: ["Itinerario", "Itinerary"],
    alt: ["Itinerario actualizado de TripPilot con las paradas del día", "Updated TripPilot itinerary with the day's stops"],
  },
  {
    src: "/images/trippilot/current-expenses.webp", width: 780, height: 1696,
    project: "TripPilot", label: ["Gastos del viaje", "Trip expenses"],
    alt: ["TripPilot muestra el presupuesto y los gastos por categoría", "TripPilot shows the budget and expenses by category"],
  },
] as const;

export default function DesignShowcase() {
  const { t } = useLocale();
  const region = useRef<HTMLElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [focused, setFocused] = useState(false);
  const [canRotate, setCanRotate] = useState(false);
  const [reduced, setReduced] = useState(false);
  const example = examples[index];

  useEffect(() => {
    const element = region.current;
    if (!element) return;

    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    const sync = () => {
      setReduced(preference.matches);
      setCanRotate(visible && !document.hidden && !preference.matches);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    }, { threshold: .25 });
    observer.observe(element);
    sync();
    document.addEventListener("visibilitychange", sync);
    preference.addEventListener("change", sync);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      preference.removeEventListener("change", sync);
    };
  }, []);

  const playing = canRotate && !paused && !focused;
  useEffect(() => {
    if (!playing) return;
    const timer = setTimeout(() => setIndex(current => (current + 1) % examples.length), 5000);
    return () => clearTimeout(timer);
  }, [playing, index]);

  function step(direction: number) {
    setPaused(true);
    setIndex(current => (current + direction + examples.length) % examples.length);
  }

  return (
    <figure ref={region} className="about-design-figure" aria-label={t("Galería de diseño", "Design gallery")}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
      <div className="about-design-image">
        <div key={example.src} className={example.width < example.height ? "about-design-phone" : "about-design-screen"}>
          <Image src={example.src} alt={t(example.alt[0], example.alt[1])} width={example.width} height={example.height}
            sizes={example.width < example.height ? "(max-width: 700px) 144px, 175px" : "(max-width: 700px) 90vw, 50vw"} />
        </div>
      </div>
      <figcaption>
        <span aria-live={playing ? "off" : "polite"}>{t(example.project)} · {t(example.label[0], example.label[1])}</span>
        <div className="about-design-controls">
          <button type="button" onClick={() => step(-1)} aria-label={t("Diseño anterior", "Previous design")}>←</button>
          {!reduced && <button type="button" onClick={() => setPaused(value => !value)}>{paused ? t("Reanudar", "Resume") : t("Pausar", "Pause")}</button>}
          <button type="button" onClick={() => step(1)} aria-label={t("Diseño siguiente", "Next design")}>→</button>
        </div>
      </figcaption>
    </figure>
  );
}
