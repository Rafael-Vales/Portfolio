"use client";

import { useEffect, useRef, useState } from "react";
import JourneyIdentity from "./JourneyIdentity";

// Dates and roles come from Rafael's supplied CVs. Periods can overlap.
const chapters = [
  {
    id: "formacion", year: "2023", period: "2023 — 2026", category: "Formación", name: "IDRA",
    title: "Una base para construir.",
    role: "Tecnicatura Superior en Desarrollo de Software · Instituto Superior IDRA",
    description: "Tres años de formación centrada en C# y .NET. Programación orientada a objetos, arquitectura MVC y patrones de diseño aplicados a proyectos de escritorio.",
    takeaway: "Una base que hoy llevo a mis proyectos web y mobile.",
    technologies: ["C#", ".NET", "Windows Forms", "SOLID"],
  },
  {
    id: "dividamos", year: "2024", period: "Dic 2024 — Presente", category: "Proyecto propio", name: "Dividamos",
    title: "De una cuenta compartida a una solución.",
    role: "Aplicación de gastos compartidos",
    description: "Una app en producción con usuarios reales. Organiza gastos compartidos y calcula cómo saldar las deudas con menos transferencias.",
    takeaway: "Convertir una necesidad cotidiana en un producto que se usa.",
    technologies: ["Next.js", "React", "TypeScript", "Supabase"],
  },
  {
    id: "animal-feed", year: "2025", period: "Jun — Dic 2025", category: "Pasantía", name: "Animal Feed",
    title: "Construir para un negocio real.",
    role: "Desarrollador web · Los Abuelos Pet Shop",
    description: "Desarrollé el ecommerce de punta a punta: catálogo, carrito, checkout y órdenes. Integré los pagos con MercadoPago y su procesamiento para evitar cobros duplicados.",
    takeaway: "Del trabajo con el cliente a una tienda en producción.",
    technologies: ["Next.js", "TypeScript", "Prisma", "MercadoPago"],
  },
  {
    id: "trippilot", year: "2025", period: "2025 — Presente", category: "Proyecto propio · En desarrollo", name: "TripPilot",
    title: "Diseñar y construir una experiencia nativa.",
    role: "Diseño y desarrollo · App iOS de planificación de viajes",
    description: "Diseñé la aplicación y desarrollé su experiencia para iPhone. Itinerarios, mapas y lugares conectados para acompañar cada etapa del viaje.",
    takeaway: "Una mirada de producto, desde la interfaz hasta su funcionamiento.",
    technologies: ["Swift", "SwiftUI", "SwiftData", "MapKit"],
  },
  {
    id: "mercado-williams", year: "2026", period: "2026 — Presente", category: "Proyecto para comercio", name: "Mercado Williams",
    title: "Que el negocio siga funcionando.",
    role: "Sistema de punto de venta",
    description: "Construí un punto de venta para un comercio real con tres cajas simultáneas. Guarda las ventas localmente y las sincroniza al recuperar la conexión.",
    takeaway: "Diseñar también para cuando las condiciones no son ideales.",
    technologies: ["Next.js", "TypeScript", "Supabase", "Dexie.js"],
  },
  {
    id: "consultorio", year: "2026", period: "2026 — Presente", category: "En desarrollo", name: "Consultorio",
    title: "Construir en equipo.",
    role: "Tech Lead · Consultorio dermatológico",
    description: "Lidero técnicamente un equipo de cuatro personas. Trabajo con la clienta para definir las necesidades del consultorio y llevarlas al diseño del sistema.",
    takeaway: "Conectar las necesidades del cliente con las decisiones del equipo.",
    technologies: ["Next.js", "TypeScript", "Prisma", "Scrum / Jira"],
  },
];

export default function CareerJourney() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLOListElement>(null);
  const markers = useRef<(HTMLSpanElement | null)[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const element = section.current;
    const rail = track.current;
    if (!element || !rail) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let current = -1;
    function paint() {
      frame = 0;
      const positions = markers.current.map(marker => {
        const box = marker?.getBoundingClientRect();
        return box ? box.top + box.height / 2 : 0;
      });
      const first = positions[0];
      const last = positions[positions.length - 1];
      rail!.style.setProperty("--journey-length", `${Math.max(0, last - first)}px`);
      const focus = window.innerHeight * .48;
      const progress = Math.max(0, Math.min(1, (focus - first) / Math.max(1, last - first)));
      rail!.style.setProperty("--journey-progress", String(motion.matches ? 1 : progress));
      let next = 0;
      positions.forEach((top, index) => { if (top <= focus + 28) next = index; });
      if (next !== current) { current = next; setActive(next); }
    }
    function schedule() { if (!frame) frame = requestAnimationFrame(paint); }
    const observer = new ResizeObserver(schedule);
    observer.observe(element);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    motion.addEventListener("change", schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      motion.removeEventListener("change", schedule);
    };
  }, []);

  return <section id="recorrido" ref={section} className="career-journey" aria-labelledby="journey-title">
    <div className="journey-introduction">
      <span className="journey-eyebrow">Mi recorrido</span>
      <JourneyIdentity />
      <nav className="journey-navigation" aria-label="Etapas de mi recorrido">
        {chapters.map((chapter, index) => <a key={chapter.id} href={`#recorrido-${chapter.id}`} aria-current={active === index ? "step" : undefined}>
          <span>{chapter.year}</span><span>{chapter.name}</span><span className="journey-nav-arrow" aria-hidden="true">↗</span>
        </a>)}
      </nav>
      <a className="journey-cv-link" href="/documents/CV_Rafael_Vales.pdf" target="_blank" rel="noopener noreferrer" aria-label="Ver mi CV (PDF, se abre en una pestaña nueva)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6M8 13h8M8 17h5" />
        </svg>
        <span>Ver mi CV</span><span className="journey-cv-arrow" aria-hidden="true">↗</span>
      </a>
    </div>
    <ol ref={track} className="journey-track">
      {chapters.map((chapter, index) => <li key={chapter.id} id={`recorrido-${chapter.id}`} className="journey-chapter" data-active={active === index} data-complete={index < active}>
        <span className="journey-marker" ref={marker => { markers.current[index] = marker; }} aria-hidden="true" />
        <div className="journey-chapter-meta"><span>{chapter.period}</span><span>{chapter.category}</span></div>
        <h3>{chapter.title}</h3>
        <p className="journey-role">{chapter.role}</p>
        <p className="journey-description">{chapter.description}</p>
        <ul className="journey-technologies" aria-label="Tecnologías y prácticas">{chapter.technologies.map(technology => <li key={technology}>{technology}</li>)}</ul>
        <p className="journey-takeaway"><span aria-hidden="true">↳</span>{chapter.takeaway}</p>
      </li>)}
    </ol>
  </section>;
}
