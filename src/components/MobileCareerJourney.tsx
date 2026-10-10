"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "./LocaleProvider";

type Chapter = {
  id: string; year: string; period: string; category: string; name: string;
  title: string; role: string; description: string; takeaway: string; technologies: string[];
};
const ids = ["formacion", "dividamos", "animal-feed", "trippilot", "mercado-williams", "consultorio"];
const titles = [
  ["Me formé en desarrollo de software.", "I studied software development."],
  ["Creé una app para dividir gastos.", "I built an app to split expenses."],
  ["Desarrollé una tienda online completa.", "I developed a complete online store."],
  ["Diseñé y desarrollé una app para iPhone.", "I designed and built an iPhone app."],
  ["Construí un punto de venta sin conexión.", "I built a point of sale that works offline."],
  ["Lidero un equipo de cuatro personas.", "I lead a four-person team."],
];
const summaries = [
  ["Tres años en IDRA: C#, .NET y bases que hoy aplico a mis productos.", "Three years at IDRA: C#, .NET and foundations I now apply to my products."],
  ["De una necesidad cotidiana a un producto con usuarios reales.", "From an everyday need to a product with real users."],
  ["Del catálogo al pago, trabajando para Los Abuelos Pet Shop.", "From catalog to payment, working for Los Abuelos Pet Shop."],
  ["Itinerarios, mapas y lugares en una experiencia nativa. En desarrollo.", "Itineraries, maps and places in a native experience. In development."],
  ["Tres cajas simultáneas. Las ventas siguen aunque se corte internet.", "Three simultaneous checkouts. Sales continue even when internet stops."],
  ["Turnos, señas y atención clínica para un consultorio real. En desarrollo.", "Appointments, deposits and clinical care for a real clinic. In development."],
];

export default function MobileCareerJourney({chapters, cv}: {chapters: Chapter[]; cv: string}) {
  const {t} = useLocale();
  const [active, setActive] = useState(0);
  const rail = useRef<HTMLOListElement>(null);
  const timeline = useRef<HTMLElement>(null);
  const current = useRef(0);
  const positions = useRef<number[]>([]);

  function goTo(index: number) {
    if (!rail.current) return;
    rail.current.scrollTo({left: positions.current[index] ?? 0,
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth"});
  }

  useEffect(() => {
    const element = rail.current;
    if (!element) return;
    let frame = 0;
    function paint() {
      frame = 0;
      const left = element!.scrollLeft;
      const last = positions.current.at(-1) || 1;
      timeline.current?.style.setProperty("--time-progress", String(Math.max(0, Math.min(1, left / last))));
      let next = 0;
      positions.current.forEach((position, index) => {
        if (Math.abs(position - left) < Math.abs(positions.current[next] - left)) next = index;
      });
      if (next !== current.current) {
        // Close expanded content on departure so each new stage stays compact.
        element!.querySelectorAll("details[open]").forEach(detail => detail.removeAttribute("open"));
        current.current = next;
        setActive(next);
      }
    }
    function schedule() { if (!frame) frame = requestAnimationFrame(paint); }
    function measure() {
      positions.current = Array.from(element!.children).map(child => (child as HTMLElement).offsetLeft - (element!.firstElementChild as HTMLElement).offsetLeft);
      element!.scrollTo({left: positions.current[current.current] || 0, behavior: "instant"});
      paint();
    }
    function fromHash() {
      if (location.hash === "#recorrido") {
        document.getElementById("recorrido")?.scrollIntoView({block: "start", behavior: "instant"});
        return;
      }
      const index = ids.indexOf(location.hash.replace("#recorrido-", ""));
      if (index < 0) return;
      current.current = index;
      setActive(index);
      element!.scrollTo({left: positions.current[index] || 0, behavior: "instant"});
      document.getElementById("recorrido")?.scrollIntoView({block: "start", behavior: "instant"});
      paint();
    }
    const resize = new ResizeObserver(measure);
    resize.observe(element);
    element.addEventListener("scroll", schedule, {passive: true});
    window.addEventListener("hashchange", fromHash);
    measure(); fromHash();
    return () => { cancelAnimationFrame(frame); resize.disconnect(); element.removeEventListener("scroll", schedule); window.removeEventListener("hashchange", fromHash); };
  }, []);

  return <section id="recorrido" className="mobile-journey" aria-labelledby="journey-title">
    <span className="journey-eyebrow">{t("Mi recorrido")}</span>
    <h2 id="journey-title">{t("Aprender. Construir.", "Learn. Build.")}<br/><span>{t("Seguir.", "Keep going.")}</span></h2>
    <nav ref={timeline} className="journey-timebar" aria-label={t("Etapas de mi recorrido", "Career stages")}>
      <span className="journey-time-line" aria-hidden="true"/>
      {chapters.map((chapter, index) => <button key={chapter.id} type="button" onClick={() => goTo(index)} aria-pressed={active === index} aria-controls={`recorrido-${chapter.id}`} aria-label={`${chapter.year} · ${chapter.name}`}>
        <span className="journey-time-dot" aria-hidden="true"/><span>{chapter.year}</span>
      </button>)}
    </nav>
    <div className="journey-carousel-controls">
      <span><strong>{chapters[active].name}</strong><small>{String(active + 1).padStart(2, "0")} / 06</small></span>
      <div><button type="button" onClick={() => goTo(active - 1)} disabled={active === 0} aria-label={t("Etapa anterior", "Previous stage")}>←</button><button type="button" onClick={() => goTo(active + 1)} disabled={active === chapters.length - 1} aria-label={t("Etapa siguiente", "Next stage")}>→</button></div>
    </div>
    <ol ref={rail} className="journey-carousel" aria-label={t("Deslizá para recorrer las etapas", "Swipe through the stages")} tabIndex={0} onKeyDown={event => {
      if (event.target !== event.currentTarget) return;
      const target = event.key === "ArrowRight" ? Math.min(5, active + 1) : event.key === "ArrowLeft" ? Math.max(0, active - 1) : event.key === "Home" ? 0 : event.key === "End" ? 5 : -1;
      if (target >= 0) { event.preventDefault(); goTo(target); }
    }}>
      {chapters.map((chapter, index) => <li key={chapter.id} className="journey-slide" id={`recorrido-${chapter.id}`} inert={active !== index} aria-hidden={active !== index}>
        <div className="journey-slide-meta"><span>{chapter.period}</span><span>{chapter.category}</span></div>
        <h3>{t(titles[index][0], titles[index][1])}</h3>
        <p className="journey-slide-summary">{t(summaries[index][0], summaries[index][1])}</p>
        {index === 0 && <div className="journey-study"><Image src="/images/rafael/journey-portrait.jpg" alt={t("Retrato de Rafael Vales", "Portrait of Rafael Vales")} width={58} height={96} sizes="58px"/><span>IDRA<small>{t("Desarrollo de Software", "Software Development")}</small></span></div>}
        <details className="journey-slide-detail"><summary><span>{t("Profundizar en esta etapa", "More about this stage")}</span><span className="journey-expand-icon" aria-hidden="true">+</span></summary>
          <p className="journey-slide-role">{chapter.role}</p><p>{chapter.description}</p><ul className="journey-technologies" aria-label={t("Tecnologías y prácticas", "Technologies and practices")}>{chapter.technologies.map(technology => <li key={technology}>{technology}</li>)}</ul><p className="journey-slide-takeaway">↳ {chapter.takeaway}</p>
        </details>
      </li>)}
    </ol>
    <p className="journey-swipe-hint">{t("Deslizá para seguir el recorrido", "Swipe to continue the journey")} <span aria-hidden="true">↔</span></p>
    <a className="mobile-primary-action" href={cv} target="_blank" rel="noopener noreferrer">{t("Ver mi CV", "View my resume")} <span aria-hidden="true">↗</span></a>
  </section>;
}
