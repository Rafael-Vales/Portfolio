"use client";
import { useLocale } from "./LocaleProvider";
import PortfolioHeader from "./PortfolioHeader";
import ProductDecisions from "./ProductDecisions";
import AboutSection from "@/components/AboutSection";
import CareerJourney from "@/components/CareerJourney";
import ContactSection from "@/components/ContactSection";
import ProjectGallery from "@/components/ProjectGallery";
import ScrollName from "@/components/ScrollName";
import ParticlePortrait from "@/components/ParticlePortrait";

export default function Portfolio({ initialProject }: { initialProject?: string }) {
  const { t } = useLocale();
  return <>
    <a className="skip-link" href="#contenido">{t("Saltar al contenido")}</a>
    <PortfolioHeader />
    <ScrollName />
    <main id="contenido" className="container">
      <section className="hero" aria-labelledby="presentacion">
        <ParticlePortrait /><p className="hero-positioning">{t("Desarrollador fullstack con foco en frontend.", "Fullstack developer with a focus on frontend.")}</p>
        <div className="hero-bottom"><span>{t("Una idea, cada detalle.")}</span><a href="#proyectos">{t("Explorá mis proyectos")}<span aria-hidden="true">↘</span></a></div>
      </section>
      <section id="proyectos" aria-labelledby="proyectos-heading">
        <ProjectGallery initialProject={initialProject} />
      </section>
      <ProductDecisions />
      <AboutSection />
      <CareerJourney />
      <ContactSection />
    </main>
    <footer className="container footer"><span>Rafael Vales</span><a href="#contenido">{t("Volver arriba ↑")}</a></footer>
  </>;
}
