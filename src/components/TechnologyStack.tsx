"use client";

import { useRef, useState, type CSSProperties, type KeyboardEvent } from "react";

const groups = [
  {
    id: "web", title: "Web", context: "Animal Feed · Portfolio",
    description: "Mi foco principal: interfaces claras, interacciones cuidadas y una base que las sostiene.",
    technologies: [
      { name: "React", detail: "Interfaces y componentes", mark: "Re", icon: 'react', color: "#61DAFB", surface: "#17313B" },
      { name: "Next.js", detail: "Aplicaciones web", mark: "N", icon: 'nextdotjs', color: "#FFFFFF", surface: "#202323" },
      { name: "TypeScript", detail: "Código con tipos", mark: "TS", icon: 'typescript', color: "#FFFFFF", surface: "#3178C6" },
      { name: "Tailwind CSS", detail: "Estilos y diseño responsive", mark: "Tw", icon: 'tailwindcss', color: "#06B6D4", surface: "#E3F6FA" },
    ],
  },
  {
    id: "ios", title: "iOS", context: "TripPilot",
    description: "La misma atención al detalle, llevada a una experiencia nativa para iPhone.",
    technologies: [
      { name: "Swift", detail: "Desarrollo nativo", mark: "Sw", icon: 'swift', color: "#FFFFFF", surface: "#F05138" },
      { name: "SwiftUI", detail: "Interfaces e interacción", mark: "UI", icon: null, color: "#FFFFFF", surface: "#2879DB" },
      { name: "MapKit", detail: "Mapas y recorridos", mark: "Mk", icon: null, color: "#FFFFFF", surface: "#419E67" },
      { name: "WidgetKit", detail: "El producto fuera de la app", mark: "W", icon: null, color: "#FFFFFF", surface: "#6558B2" },
    ],
  },
  {
    id: "data", title: "Datos", context: "Animal Feed · TripPilot",
    description: "Conectar lo que se ve con lo que necesita funcionar detrás de cada pantalla.",
    technologies: [
      { name: "Prisma", detail: "Modelos y acceso a datos", mark: "Pr", icon: 'prisma', color: "#FFFFFF", surface: "#2D3748" },
      { name: "PostgreSQL", detail: "Datos relacionales", mark: "Pg", icon: 'postgresql', color: "#FFFFFF", surface: "#4169E1" },
      { name: "Supabase", detail: "Backend y servicios de datos", mark: "Sb", icon: 'supabase', color: "#3FCF8E", surface: "#183E32" },
      { name: "Dexie.js", detail: "Persistencia local sin conexión", mark: "Dx", icon: null, color: "#88562D", surface: "#F3E8D9" },
      { name: "SwiftData", detail: "Persistencia nativa", mark: "Sd", icon: null, color: "#FFFFFF", surface: "#3773BB" },
      { name: "Zustand", detail: "Estado de la aplicación", mark: "Zu", icon: null, color: "#71513E", surface: "#EFE5DE" },
    ],
  },
];

export default function TechnologyStack() {
  const [active, setActive] = useState(0);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const group = groups[active];

  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % groups.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + groups.length) % groups.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = groups.length - 1;
    else return;
    event.preventDefault();
    setActive(next);
    buttons.current[next]?.focus();
  }

  return <section className="technology-stack" aria-labelledby="stack-title">
    <div className="stack-introduction">
      <span className="stack-eyebrow">Herramientas</span>
      <h3 id="stack-title">Mi stack.</h3>
      <p>Tecnologías que uso en mis proyectos.</p>
    </div>
    <div className="stack-explorer">
      <div className="stack-tabs" role="tablist" aria-label="Áreas del stack">
        {groups.map((item, index) => <button
          key={item.id} ref={element => { buttons.current[index] = element; }}
          id={`stack-tab-${item.id}`} type="button" role="tab"
          aria-selected={active === index} aria-controls={`stack-panel-${item.id}`}
          tabIndex={active === index ? 0 : -1}
          onClick={() => setActive(index)} onKeyDown={event => navigate(event, index)}
        >{item.title}<span aria-hidden="true">0{index + 1}</span></button>)}
      </div>
      {groups.map((item, index) => <div key={item.id} id={`stack-panel-${item.id}`} role="tabpanel"
        aria-labelledby={`stack-tab-${item.id}`} hidden={active !== index} tabIndex={0} className="stack-panel">
        <p className="stack-context">{item.context}</p>
        <ul className="stack-technologies">
          {item.technologies.map(technology => <li key={technology.name}>
            <span className="stack-mark" aria-hidden="true" style={{
              "--stack-accent": technology.color,
              "--stack-surface": technology.surface,
            } as CSSProperties}>
              {technology.icon ? <span className="stack-logo" style={{
                "--stack-icon": `url(/images/technologies/${technology.icon}.svg)`,
              } as CSSProperties} /> : technology.mark}
            </span>
            <span><strong>{technology.name}</strong><span className="stack-detail">{technology.detail}</span></span>
          </li>)}
        </ul>
      </div>)}
      <p className="stack-description">{group.description}</p>
    </div>
  </section>;
}
