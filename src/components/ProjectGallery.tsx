"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

const projects = [
  { name: "TripPilot", style: "trip" },
  { name: "Animal Feed", style: "shop" },
  { name: "Consultorio dermatológico", style: "clinic" },
];

export default function ProjectGallery() {
  const [selected, setSelected] = useState<number | null>(null);
  useEffect(() => {
    if (selected === 0) document.documentElement.dataset.projectTheme = "trippilot";
    else if (selected === 1) document.documentElement.dataset.projectTheme = "animal-feed";
    else delete document.documentElement.dataset.projectTheme;
    return () => { delete document.documentElement.dataset.projectTheme; };
  }, [selected]);
  const triggers = useRef<(HTMLButtonElement | null)[]>([]);
  const back = useRef<HTMLButtonElement>(null);
  const origin = useRef(0);
  const restoreFocus = useRef(false);
  useLayoutEffect(() => {
    if (!restoreFocus.current) return;
    restoreFocus.current = false;
    if (selected === null) triggers.current[origin.current]?.focus({ preventScroll: true });
    else back.current?.focus({ preventScroll: true });
  }, [selected]);
  const [leaving, setLeaving] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  function transition(next: number | null) {
    if (timer.current) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    setLeaving(true);
    timer.current = setTimeout(() => {
      restoreFocus.current = true;
      setSelected(next);
      setLeaving(false);
      timer.current = null;
    }, reduced ? 0 : 420);
  }
  function open(index: number) {
    origin.current = index;
    transition(index);
  }
  function close() {
    transition(null);
  }
  function step(direction: number) {
    if (selected !== null) transition((selected + direction + projects.length) % projects.length);
  }
  return <div className="project-browser" data-leaving={leaving} onKeyDown={event => {
    if (selected === null) return;
    if (event.key === "Escape") { event.preventDefault(); close(); }
    if (event.key === "ArrowLeft") { event.preventDefault(); step(-1); }
    if (event.key === "ArrowRight") { event.preventDefault(); step(1); }
  }}>
    <div className="project-browser-toolbar">
      <h2 id="proyectos-heading" className={selected !== null ? "project-heading-hidden" : undefined}>Proyectos</h2>
      {selected !== null && <><button ref={back} onClick={close} aria-label="Volver a la galería">← Volver</button><span>{String(selected + 1).padStart(2, "0")} / 03</span></>}
    </div>
    <div className="project-view" key={selected ?? "gallery"}>
    {selected === null ? <div className="project-gallery">
      {projects.map((project, index) => <article key={project.style} className={`project-name-card project-name-card--${project.style}`}>
        <h3><button ref={element => { triggers.current[index] = element; }} onClick={() => open(index)} aria-label={`Abrir ${project.name}`}>{project.name}</button></h3>
      </article>)}
    </div> : <section className="project-expanded" aria-label="Proyecto seleccionado">
      <div className="project-expanded-stage">
        <button className="project-arrow" onClick={() => step(-1)} aria-label="Proyecto anterior"><svg viewBox="0 0 24 48" aria-hidden="true"><path d="M21 3 3 24l18 21" /></svg></button>
        <div key={selected} className={`project-expanded-cover project-expanded-cover--${projects[selected].style}`} aria-live="polite" aria-atomic="true"><h3>{projects[selected].name}</h3></div>
        <button className="project-arrow" onClick={() => step(1)} aria-label="Proyecto siguiente"><svg viewBox="0 0 24 48" aria-hidden="true"><path d="m3 3 18 21L3 45" /></svg></button>
      </div>
    </section>}
    </div>
  </div>;
}
