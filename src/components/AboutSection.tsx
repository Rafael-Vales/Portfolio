"use client";

import { useEffect, useRef } from "react";
import TechnologyStack from "@/components/TechnologyStack";

const approach = [
  { title: "Diseño", description: "Jerarquía, espacio y claridad. Cada decisión visual tiene que ayudar a entender y usar el producto." },
  { title: "Frontend", description: "Interacciones fluidas y detalles cuidados. Me interesa tanto lo que se ve como lo que pasa al tocarlo." },
  { title: "Producto", description: "Una mirada fullstack para conectar la interfaz con lo que necesita para funcionar." },
];

export default function AboutSection() {
  const section = useRef<HTMLElement>(null);
  useEffect(() => {
    const element = section.current;
    if (!element || !('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    element.dataset.reveal = "ready";
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        element.dataset.reveal = "visible";
        observer.disconnect();
      }
    }, { threshold: .12 });
    observer.observe(element);
    return () => { observer.disconnect(); delete element.dataset.reveal; };
  }, []);

  return <section ref={section} id="sobre-mi" className="about about-editorial" aria-labelledby="about-title">
    <div className="about-section-label"><span>Sobre mí</span><span>Mar del Plata, Argentina</span></div>
    <div className="about-introduction about-reveal">
      <h2 id="about-title">Diseñar con criterio.<br /><span>Construir con detalle.</span></h2>
      <div className="about-bio">
        <p>Soy Rafael, desarrollador fullstack con foco en frontend.</p>
        <p>Me interesa cómo se ve una interfaz, cómo se usa y cómo está construida. Conecto esas tres miradas para convertir ideas en productos digitales claros y cuidados.</p>
        <a href="#contacto" className="about-conversation">Construyamos algo <span aria-hidden="true">↗</span></a>
      </div>
    </div>
    <div className="about-approach" aria-label="Mi forma de trabajar">
      {approach.map((item, index) => <div className="about-principle about-reveal" key={item.title} style={{ transitionDelay: `${120 + index * 90}ms` }}>
        <span className="about-principle-number" aria-hidden="true">0{index + 1}</span>
        <h3>{item.title}</h3><p>{item.description}</p>
      </div>)}
    </div>
    <div className="about-languages"><span>También, más allá del código.</span><p>Español nativo <span aria-hidden="true">·</span> Inglés avanzado <strong>C1</strong></p></div>
    <TechnologyStack />
    <div className="about-signoff"><span>Una idea, cada detalle.</span><a href="#recorrido">Conocé mi recorrido <span aria-hidden="true">↘</span></a></div>
  </section>;
}
