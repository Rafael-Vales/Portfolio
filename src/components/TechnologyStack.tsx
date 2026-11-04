"use client";
import { useLocale } from "./LocaleProvider";

import { useRef, useState, type CSSProperties, type KeyboardEvent } from "react";



export default function TechnologyStack() {
  const {t}=useLocale();
const groups = [
  {
    id: "web", title: "Web", context: "Animal Feed · Portfolio",
    description: t("Mi foco principal: interfaces claras, interacciones cuidadas y una base que las sostiene."),
    technologies: [
      { name: "React", detail: t("Interfaces y componentes"), mark: "Re", icon: 'react', color: "#61DAFB", surface: "#17313B" },
      { name: "Next.js", detail: t("Aplicaciones web"), mark: "N", icon: 'nextdotjs', color: "#FFFFFF", surface: "#202323" },
      { name: "TypeScript", detail: t("Código con tipos"), mark: "TS", icon: 'typescript', color: "#FFFFFF", surface: "#3178C6" },
      { name: "Tailwind CSS", detail: t("Estilos y diseño responsive"), mark: "Tw", icon: 'tailwindcss', color: "#06B6D4", surface: "#E3F6FA" },
    ],
  },
  {
    id: "ios", title: "iOS", context: "TripPilot",
    description: t("La misma atención al detalle, llevada a una experiencia nativa para iPhone."),
    technologies: [
      { name: "Swift", detail: t("Desarrollo nativo"), mark: "Sw", icon: 'swift', color: "#FFFFFF", surface: "#F05138" },
      { name: "SwiftUI", detail: t("Interfaces e interacción"), mark: "UI", icon: null, color: "#FFFFFF", surface: "#2879DB" },
      { name: "MapKit", detail: t("Mapas y recorridos"), mark: "Mk", icon: null, color: "#FFFFFF", surface: "#419E67" },
      { name: "WidgetKit", detail: t("El producto fuera de la app"), mark: "W", icon: null, color: "#FFFFFF", surface: "#6558B2" },
    ],
  },
  {
    id: "data", title: t("Datos"), context: "Animal Feed · TripPilot · Mercado Williams",
    description: t("Conectar lo que se ve con lo que necesita funcionar detrás de cada pantalla."),
    technologies: [
      { name: "Prisma", detail: t("Modelos y acceso a datos"), mark: "Pr", icon: 'prisma', color: "#FFFFFF", surface: "#2D3748" },
      { name: "PostgreSQL", detail: t("Datos relacionales"), mark: "Pg", icon: 'postgresql', color: "#FFFFFF", surface: "#4169E1" },
      { name: "Supabase", detail: t("Backend y servicios de datos"), mark: "Sb", icon: 'supabase', color: "#3FCF8E", surface: "#183E32" },
      { name: "Dexie.js", detail: t("Persistencia local sin conexión"), mark: "Dx", icon: null, color: "#88562D", surface: "#F3E8D9" },
      { name: "SwiftData", detail: t("Persistencia nativa"), mark: "Sd", icon: null, color: "#FFFFFF", surface: "#3773BB" },
      { name: "Zustand", detail: t("Estado de la aplicación"), mark: "Zu", icon: null, color: "#71513E", surface: "#EFE5DE" },
    ],
  },
];

  const [active, setActive] = useState(0);
  const [chosen, setChosen] = useState("React");
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
    setChosen(groups[next].technologies[0].name);
    setActive(next);
    buttons.current[next]?.focus();
  }

  return <section id="stack" className="technology-stack" aria-labelledby="stack-title">
    <div className="stack-introduction">
      <span className="stack-eyebrow">{t("Herramientas")}</span>
      <h3 id="stack-title">{t("Mi stack.")}</h3>
      <p>{t("Tecnologías que uso en mis proyectos.")}</p>
    </div>
    <div className="stack-explorer">
      <div className="stack-tabs" role="tablist" aria-label={t("Áreas del stack")}>
        {groups.map((item, index) => <button
          key={item.id} ref={element => { buttons.current[index] = element; }}
          id={`stack-tab-${item.id}`} type="button" role="tab"
          aria-selected={active === index} aria-controls={`stack-panel-${item.id}`}
          tabIndex={active === index ? 0 : -1}
          onClick={() => {setActive(index);setChosen(item.technologies[0].name);}} onKeyDown={event => navigate(event, index)}
        >{item.title}<span aria-hidden="true">0{index + 1}</span></button>)}
      </div>
      {groups.map((item, index) => <div key={item.id} id={`stack-panel-${item.id}`} role="tabpanel"
        aria-labelledby={`stack-tab-${item.id}`} hidden={active !== index} tabIndex={0} className="stack-panel">
        <p className="stack-context">{item.context}</p>
        <ul className="stack-technologies">
          {item.technologies.map(technology => <li key={technology.name}><button type="button" aria-pressed={chosen===technology.name} onClick={()=>setChosen(technology.name)}>
            <span className="stack-mark" aria-hidden="true" style={{
              "--stack-accent": technology.color,
              "--stack-surface": technology.surface,
            } as CSSProperties}>
              {technology.icon ? <span className="stack-logo" style={{
                "--stack-icon": `url(/images/technologies/${technology.icon}.svg)`,
              } as CSSProperties} /> : technology.mark}
            </span>
            <span className="stack-technology-copy"><strong>{technology.name}</strong><span className="stack-detail">{technology.detail}</span></span>
            <span className="stack-selection-arrow" aria-hidden="true">↗</span>
          </button></li>)}
        </ul>
      </div>)}
      <div className="stack-used-in" key={chosen}><span>{t("Usé", "I used")} {chosen} {t("en", "in")}</span><div className="stack-project-links">{(chosen === "Dexie.js" ? [{name:"Mercado Williams",href:"#recorrido-mercado-williams"}] : ["Swift","SwiftUI","SwiftData","MapKit","WidgetKit"].includes(chosen) ? [{name:"TripPilot",href:"?project=trippilot#proyectos"}] : chosen === "Supabase" ? [{name:"Dividamos",href:"#recorrido-dividamos"},{name:"Mercado Williams",href:"#recorrido-mercado-williams"}] : chosen === "Zustand" ? [{name:"Animal Feed",href:"?project=animal-feed#proyectos"}] : [{name:"Animal Feed",href:"?project=animal-feed#proyectos"}]).map(project=><a key={project.name} href={project.href}>{project.name} <span aria-hidden="true">↗</span></a>)}</div></div>
      <p className="stack-description">{group.description}</p>
    </div>
    <a className="mobile-primary-action" href="#recorrido">{t("Conocé mi recorrido", "Explore my journey")} <span aria-hidden="true">↓</span></a>
  </section>;
}
