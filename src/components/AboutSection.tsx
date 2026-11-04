"use client";
import { useLocale } from "./LocaleProvider";
import Image from "next/image";

import { useEffect, useRef } from "react";
import TechnologyStack from "@/components/TechnologyStack";



export default function AboutSection() {
  const {t}=useLocale();
const approach = [
  { short: t("Interacciones fluidas y detalles cuidados.", "Fluid interactions and thoughtful details."), title: "Frontend", description: t("Interacciones fluidas y detalles cuidados. Me interesa tanto lo que se ve como lo que pasa al tocarlo.") },
  { short: t("La interfaz conectada con lo que la hace funcionar.", "An interface connected to what makes it work."), title: t("Producto"), description: t("Una mirada fullstack para conectar la interfaz con lo que necesita para funcionar.") },
];

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
    <div className="about-overview"><div className="about-section-label"><span>{t("Sobre mí")}</span><span>Mar del Plata, Argentina</span></div>
    <div className="about-introduction about-reveal">
      <h2 id="about-title">{t("Diseñar con criterio.")}<br /><span>{t("Construir con detalle.")}</span></h2>
      <div className="about-bio">
        <p>{t("Soy Rafael, desarrollador fullstack con foco en frontend.")}</p>
        <p>{t("Me interesa cómo se ve una interfaz, cómo se usa y cómo está construida. Conecto esas tres miradas para convertir ideas en productos digitales claros y cuidados.")}</p>
        <a href="#contacto" className="about-conversation">{t("Construyamos algo")}<span aria-hidden="true">↗</span></a>
      </div>
    </div>
    <div className="about-approach" aria-label={t("Mi forma de trabajar")}>
      <div className="about-design-feature about-reveal">
        <figure className="about-design-figure">
          <div className="about-design-image"><div className="about-design-phone">
            <Image src="/images/trippilot/demo-itinerary.png" alt={t("Pantalla del itinerario de TripPilot", "TripPilot itinerary screen")} width={1206} height={2622} sizes="(max-width: 700px) 114px, 160px" />
          </div></div>
          <figcaption>TripPilot · {t("diseño y desarrollo", "design and development")}</figcaption>
        </figure>
        <div className="about-design-copy"><span className="about-principle-number">01 / {t("Diseño")}</span>
          <h3>{t("Jerarquía, espacio y claridad.", "Hierarchy, space and clarity.")}</h3>
          <p>{t("Cada decisión visual tiene que ayudar a entender y usar el producto.", "Every visual decision should make the product easier to understand and use.")}</p>
        </div>
      </div>
      {approach.map((item, index) => <div className="about-principle about-reveal" key={item.title} style={{ transitionDelay: `${120 + index * 90}ms` }}>
        <span className="about-principle-number" aria-hidden="true">0{index + 2}</span>
        <h3>{item.title}</h3><p><span className="about-description-desktop">{item.description}</span><span className="about-description-mobile">{item.short}</span></p>
      </div>)}
    </div>
    <div className="about-languages"><span className="about-mobile-location">Mar del Plata, Argentina</span><span>{t("También, más allá del código.")}</span><p>{t("Español nativo")}<span aria-hidden="true">·</span>{t("Inglés avanzado")}<strong>C1</strong></p></div>
    <a className="mobile-primary-action" href="#stack">{t("Conocé mi stack", "Explore my stack")} <span aria-hidden="true">↓</span></a></div>
    <TechnologyStack />
    <div className="about-signoff"><span>{t("Una idea, cada detalle.")}</span><a href="#recorrido">{t("Conocé mi recorrido")}<span aria-hidden="true">↘</span></a></div>
  </section>;
}
