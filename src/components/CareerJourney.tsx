"use client";
import { useLocale } from "./LocaleProvider";

import { useEffect, useRef, useState } from "react";
import JourneyIdentity from "./JourneyIdentity";
import Image from "next/image";
import useMobileLayout from "./useMobileLayout";

// Dates and roles come from Rafael's supplied CVs. Periods can overlap.


export default function CareerJourney() {
  const {t, cv}=useLocale();
const chapters = [
  {
    id: "formacion", year: "2023", period: "2023 — 2026", category: t("Formación"), name: "IDRA",
    title: t("Una base para construir."),
    role: t("Tecnicatura Superior en Desarrollo de Software · Instituto Superior IDRA"),
    description: t("Tres años de formación centrada en C# y .NET. Programación orientada a objetos, arquitectura MVC y patrones de diseño aplicados a proyectos de escritorio."),
    takeaway: t("Una base que hoy llevo a mis proyectos web y mobile."),
    technologies: ["C#", ".NET", "Windows Forms", "SOLID"],
  },
  {
    id: "dividamos", year: "2024", period: t("Dic 2024 — Presente"), category: t("Proyecto propio"), name: "Dividamos",
    title: t("De una cuenta compartida a una solución."),
    role: t("Aplicación de gastos compartidos"),
    description: t("Una app en producción con usuarios reales. Organiza gastos compartidos y calcula cómo saldar las deudas con menos transferencias."),
    takeaway: t("Convertir una necesidad cotidiana en un producto que se usa."),
    technologies: ["Next.js", "React", "TypeScript", "Supabase"],
  },
  {
    id: "animal-feed", year: "2025", period: t("Jun — Dic 2025"), category: t("Pasantía"), name: "Animal Feed",
    title: t("Construir para un negocio real."),
    role: t("Desarrollador web · Los Abuelos Pet Shop"),
    description: t("Desarrollé el ecommerce de punta a punta: catálogo, carrito, checkout y órdenes. Integré los pagos con MercadoPago y su procesamiento para evitar cobros duplicados."),
    takeaway: t("Del trabajo con el cliente a una tienda en producción."),
    technologies: ["Next.js", "TypeScript", "Prisma", "MercadoPago"],
  },
  {
    id: "trippilot", year: "2025", period: t("2025 — Presente"), category: t("Proyecto propio · En desarrollo"), name: "TripPilot",
    title: t("Diseñar y construir una experiencia nativa."),
    role: t("Diseño y desarrollo · App iOS de planificación de viajes"),
    description: t("Diseñé la aplicación y desarrollé su experiencia para iPhone. Itinerarios, mapas y lugares conectados para acompañar cada etapa del viaje."),
    takeaway: t("Una mirada de producto, desde la interfaz hasta su funcionamiento."),
    technologies: ["Swift", "SwiftUI", "SwiftData", "MapKit"],
  },
  {
    id: "mercado-williams", year: "2026", period: t("2026 — Presente"), category: t("Proyecto para comercio"), name: "Mercado Williams",
    title: t("Que el negocio siga funcionando."),
    role: t("Sistema de punto de venta"),
    description: t("Construí un punto de venta para un comercio real con tres cajas simultáneas. Guarda las ventas localmente y las sincroniza al recuperar la conexión."),
    takeaway: t("Diseñar también para cuando las condiciones no son ideales."),
    technologies: ["Next.js", "TypeScript", "Supabase", "Dexie.js"],
  },
  {
    id: "consultorio", year: "2026", period: t("2026 — Presente"), category: t("En desarrollo"), name: t("Consultorio"),
    title: t("Construir en equipo."),
    role: t("Tech Lead · Consultorio dermatológico"),
    description: t("Lidero técnicamente un equipo de cuatro personas en un sistema para un consultorio real. Participo del relevamiento con la clienta y del modelo de datos para conectar turnos, señas y atención clínica. El producto sigue en desarrollo.", "I lead a four-person technical team building a system for a real clinic. I contribute to client requirements and the data model connecting appointments, deposits and clinical care. The product is still in development."),
    takeaway: t("Traducir un proceso real en reglas de negocio, permisos y decisiones compartidas.", "Translating a real workflow into business rules, permissions and shared decisions."),
    technologies: ["Next.js", "TypeScript", "Prisma", "Supabase", "Scrum / Jira"],
  },
];

  const mobile = useMobileLayout();
  const [selected, setSelected] = useState(5);
  const summaries = [
    t("Tres años de formación en C# y .NET.", "Three years studying C# and .NET."),
    t("Gastos compartidos, usuarios reales y menos transferencias.", "Shared expenses, real users and fewer transfers."),
    t("Un ecommerce de punta a punta para un negocio real.", "An end-to-end ecommerce for a real business."),
    t("Diseño y desarrollo de una experiencia nativa para iPhone.", "Design and development of a native iPhone experience."),
    t("Tres cajas simultáneas, con ventas que funcionan sin conexión.", "Three simultaneous checkouts, with sales that work offline."),
    t("Liderazgo técnico en un equipo de cuatro personas.", "Technical leadership in a four-person team."),
  ];
  useEffect(() => {
    if (!mobile) return;
    function selectFromHash() {
      const id = window.location.hash.replace("#recorrido-", "");
      const index = ["formacion", "dividamos", "animal-feed", "trippilot", "mercado-williams", "consultorio"].indexOf(id);
      if (index >= 0) setSelected(index);
    }
    selectFromHash();
    window.addEventListener("hashchange", selectFromHash);
    return () => window.removeEventListener("hashchange", selectFromHash);
  }, [mobile]);
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLOListElement>(null);
  const markers = useRef<(HTMLSpanElement | null)[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (mobile) return;
    const element = section.current;
    const rail = track.current;
    if (!element || !rail) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0, current = -1, visible = false;
    let positions: number[] = [], lastProgress = -1;
    function measure() {
      positions = markers.current.map(marker => {
        const box = marker?.getBoundingClientRect();
        return box ? box.top + window.scrollY + box.height / 2 : 0;
      });
      rail!.style.setProperty("--journey-length", `${Math.max(0, positions.at(-1)! - positions[0])}px`);
      paint();
    }
    function paint() {
      frame = 0;
      if (!positions.length) return;
      const first = positions[0], last = positions[positions.length - 1];
      const focus = window.scrollY + window.innerHeight * .48;
      const progress = motion.matches ? 1 : Math.max(0, Math.min(1, (focus - first) / Math.max(1, last - first)));
      if (progress !== lastProgress) { lastProgress = progress; rail!.style.setProperty("--journey-progress", String(progress)); }
      let next = 0;
      positions.forEach((top, index) => { if (top <= focus + 28) next = index; });
      if (next !== current) { current = next; setActive(next); }
    }
    function schedule() { if (visible && !frame) frame = requestAnimationFrame(paint); }
    // Marker geometry changes with layout, not with scroll. Avoid six forced
    // layout reads on every swipe, including while the timeline is off screen.
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    observer.observe(document.querySelector("main")!);
    const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) measure(); }, {rootMargin: "100px"});
    intersection.observe(element);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    motion.addEventListener("change", measure);
    measure();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect(); intersection.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      motion.removeEventListener("change", measure);
    };
  }, [mobile]);

  if (mobile) return <section id="recorrido" className="mobile-journey" aria-labelledby="journey-title">
    <span className="journey-eyebrow">{t("Mi recorrido")}</span>
    <h2 id="journey-title">{t("Aprender. Construir.", "Learn. Build.")}<br/><span>{t("Seguir.", "Keep going.")}</span></h2>
    <button id="recorrido-formacion" className="mobile-journey-education" type="button" onClick={()=>setSelected(0)} aria-pressed={selected===0}>
      <Image src="/images/rafael/journey-portrait.jpg" alt={t("Retrato de Rafael Vales", "Portrait of Rafael Vales")} width={100} height={160} sizes="100px"/>
      <span>2023 — 2026<br/>IDRA<br/>{t("Desarrollo de Software", "Software Development")}</span>
    </button>
    <ol className="mobile-journey-list">{chapters.slice(1).map((chapter,index)=>{const i=index+1;return <li key={chapter.id} id={`recorrido-${chapter.id}`}><button type="button" aria-pressed={selected===i} aria-controls="journey-selected-detail" onClick={()=>setSelected(i)}>
      <span className="mobile-journey-marker" aria-hidden="true" style={{maskImage:`url(/images/mobile/timeline${selected===i ? "-active" : ""}.svg)`,WebkitMaskImage:`url(/images/mobile/timeline${selected===i ? "-active" : ""}.svg)`}}/>
      <span className="mobile-journey-year">{chapter.year}</span><span>{chapter.name}</span>
    </button></li>;})}</ol>
    <details key={selected} id="journey-selected-detail" className="mobile-journey-detail">
      <summary><span className="mobile-journey-period">{chapters[selected].period} · {chapters[selected].category}</span><span>{summaries[selected]}</span><span className="journey-detail-cue">{t("Ver detalle", "Read more")} <span aria-hidden="true">↗</span></span></summary>
      <p>{chapters[selected].description}</p><ul className="journey-technologies">{chapters[selected].technologies.map(technology=><li key={technology}>{technology}</li>)}</ul>
    </details>
    <a className="mobile-primary-action" href={cv} target="_blank" rel="noopener noreferrer">{t("Ver mi CV", "View my resume")} <span aria-hidden="true">↗</span></a>
  </section>;

  return <section id="recorrido" ref={section} className="career-journey" aria-labelledby="journey-title">
    <div className="journey-introduction">
      <span className="journey-eyebrow">{t("Mi recorrido")}</span>
      <JourneyIdentity />
      <nav className="journey-navigation" aria-label={t("Etapas de mi recorrido")}>
        {chapters.map((chapter, index) => <a key={chapter.id} href={`#recorrido-${chapter.id}`} aria-current={active === index ? "step" : undefined}>
          <span>{chapter.year}</span><span>{chapter.name}</span><span className="journey-nav-arrow" aria-hidden="true">↗</span>
        </a>)}
      </nav>
      <a className="journey-cv-link" href={cv} target="_blank" rel="noopener noreferrer" aria-label={t("Ver mi CV (PDF, se abre en una pestaña nueva)")}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6M8 13h8M8 17h5" />
        </svg>
        <span>{t("Ver mi CV")}</span><span className="journey-cv-arrow" aria-hidden="true">↗</span>
      </a>
    </div>
    <ol ref={track} className="journey-track">
      {chapters.map((chapter, index) => <li key={chapter.id} id={`recorrido-${chapter.id}`} className="journey-chapter" data-active={active === index} data-complete={index < active}>
        <span className="journey-marker" ref={marker => { markers.current[index] = marker; }} aria-hidden="true" />
        <div className="journey-chapter-meta"><span>{chapter.period}</span><span>{chapter.category}</span></div>
        <h3>{chapter.title}</h3>
        <p className="journey-role">{chapter.role}</p>
        <p className="journey-description">{chapter.description}</p>
        <ul className="journey-technologies" aria-label={t("Tecnologías y prácticas")}>{chapter.technologies.map(technology => <li key={technology}>{technology}</li>)}</ul>
        <p className="journey-takeaway"><span aria-hidden="true">↳</span>{chapter.takeaway}</p>
      </li>)}
    </ol>
  </section>;
}
