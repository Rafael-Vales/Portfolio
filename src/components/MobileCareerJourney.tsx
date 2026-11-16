"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "./LocaleProvider";
import JourneyProjectLogo from "./JourneyProjectLogo";
import { JourneyWords, useJourneyWords } from "./JourneyWords";

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
  ["Tres años en IDRA: C#, .NET, SQL y bases de datos que hoy aplico a mis productos.", "Three years at IDRA: C#, .NET, SQL and databases I now apply to my products."],
  ["De una necesidad cotidiana a un producto con usuarios reales.", "From an everyday need to a product with real users."],
  ["Del catálogo al pago, trabajando para Los Abuelos Pet Shop.", "From catalog to payment, working for Los Abuelos Pet Shop."],
  ["Itinerarios, mapas y lugares en una experiencia nativa. En desarrollo.", "Itineraries, maps and places in a native experience. In development."],
  ["Tres cajas simultáneas. Las ventas siguen aunque se corte internet.", "Three simultaneous checkouts. Sales continue even when internet stops."],
  ["Tesis para un consultorio real: reserva móvil, agenda, señas y seguimiento clínico.", "Thesis project for a real clinic: mobile booking, scheduling, deposits, and clinical follow-up."],
];

export default function MobileCareerJourney({chapters, cv}: {chapters: Chapter[]; cv: string}) {
  const {t} = useLocale();
  const [active, setActive] = useState(0);
  const stage = useRef<HTMLElement>(null);
  const current = useRef(0);
  const captureWords = useJourneyWords(stage, active);
  const gesture = useRef<{x: number; y: number; id: number; horizontal: boolean} | null>(null);

  function goTo(index: number) {
    const next = Math.max(0, Math.min(chapters.length - 1, index));
    if (next === current.current) return;
    captureWords();
    current.current = next;
    setActive(next);
  }

  useEffect(() => {
    function fromHash() {
      const index = ids.indexOf(location.hash.replace("#recorrido-", ""));
      if (index >= 0) {
        current.current = index;
        setActive(index);
      }
      if (index >= 0 || location.hash === "#recorrido") {
        document.getElementById("recorrido")?.scrollIntoView({block: "start", behavior: "instant"});
      }
    }
    window.addEventListener("hashchange", fromHash);
    fromHash();
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  const chapter = chapters[active];
  const title = t(titles[active][0], titles[active][1]);
  const summary = t(summaries[active][0], summaries[active][1]);

  return <section id="recorrido" className="mobile-journey" aria-labelledby="journey-title">
    <span className="journey-eyebrow">{t("Mi recorrido")}</span>
    <h2 id="journey-title">{t("Cada proyecto me enseñó algo que usé en el siguiente.", "Each project taught me something I used in the next.")}</h2>
    <nav className="journey-timebar" style={{"--time-progress": active / (chapters.length - 1)} as React.CSSProperties} aria-label={t("Etapas de mi recorrido", "Career stages")}>
      <span className="journey-time-line" aria-hidden="true"/>
      {chapters.map((chapter, index) => <button key={chapter.id} type="button" onClick={() => goTo(index)} aria-pressed={active === index} aria-controls="journey-reading-stage" aria-label={`${chapter.year} · ${chapter.name}`}>
        <span className="journey-time-dot" aria-hidden="true"/><span>{chapter.year}</span>
      </button>)}
    </nav>
    <div className="journey-carousel-controls">
      <span aria-live="polite" aria-atomic="true"><strong>{chapters[active].name}</strong><small>{String(active + 1).padStart(2, "0")} / 06</small></span>
      <div><button type="button" onClick={() => goTo(active - 1)} disabled={active === 0} aria-label={t("Etapa anterior", "Previous stage")}>←</button><button type="button" onClick={() => goTo(active + 1)} disabled={active === chapters.length - 1} aria-label={t("Etapa siguiente", "Next stage")}>→</button></div>
    </div>
    <div id="journey-reading-stage" className="journey-carousel" role="region" aria-roledescription={t("Recorrido", "Journey")} aria-label={t("Deslizá para recorrer las etapas", "Swipe through the stages")} tabIndex={0} onKeyDown={event => {
      if (event.target !== event.currentTarget) return;
      const target = event.key === "ArrowRight" ? active + 1 : event.key === "ArrowLeft" ? active - 1 : event.key === "Home" ? 0 : event.key === "End" ? chapters.length - 1 : -1;
      if (target >= 0) { event.preventDefault(); goTo(target); }
    }} onPointerDown={event => {
      if (!event.isPrimary || event.pointerType === "mouse" || (event.target as HTMLElement).closest("button, a, details")) return;
      gesture.current = {x: event.clientX, y: event.clientY, id: event.pointerId, horizontal: false};
    }} onPointerMove={event => {
      const start = gesture.current;
      if (!start || start.id !== event.pointerId) return;
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      if (!start.horizontal && Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx)) { gesture.current = null; return; }
      if (!start.horizontal && Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        start.horizontal = true;
        event.currentTarget.setPointerCapture(event.pointerId);
      }
    }} onPointerUp={event => {
      const start = gesture.current;
      gesture.current = null;
      if (!start || start.id !== event.pointerId) return;
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) goTo(current.current + (dx < 0 ? 1 : -1));
    }} onPointerCancel={() => { gesture.current = null; }}>
      <article ref={stage} className="journey-slide" id={`recorrido-${chapter.id}`}>
        <div className="journey-stage-header"><div className="journey-slide-meta"><span>{chapter.period}</span><span>{chapter.category}</span></div>{active === 0 ? <Image className="journey-stage-portrait" src="/images/rafael/journey-portrait.jpg" alt={t("Retrato de Rafael Vales", "Portrait of Rafael Vales")} width={34} height={56} sizes="34px"/> : <JourneyProjectLogo id={chapter.id}/>}</div>
        <div className="journey-word-copy">
          <h3 aria-label={title}><JourneyWords text={title} group="title"/></h3>
          <p className="journey-slide-summary"><JourneyWords text={summary} group="summary"/></p>
        </div>
        <details key={chapter.id} className="journey-slide-detail"><summary><span>{t("Profundizar en esta etapa", "More about this stage")}</span><span className="journey-expand-icon" aria-hidden="true">+</span></summary>
          <p className="journey-slide-role">{chapter.role}</p><p>{chapter.description}</p><ul className="journey-technologies" aria-label={t("Tecnologías y prácticas", "Technologies and practices")}>{chapter.technologies.map(technology => <li key={technology}>{technology}</li>)}</ul><p className="journey-slide-takeaway">↳ {chapter.takeaway}</p>
        </details>
      </article>
    </div>
    <p className="journey-swipe-hint">{t("Deslizá para seguir el recorrido", "Swipe to continue the journey")} <span aria-hidden="true">↔</span></p>
    <a className="mobile-primary-action" href={cv} target="_blank" rel="noopener noreferrer">{t("Ver mi CV", "View my resume")} <span aria-hidden="true">↗</span></a>
  </section>;
}
