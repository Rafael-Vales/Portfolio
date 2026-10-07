import AboutSection from "@/components/AboutSection";
import CareerJourney from "@/components/CareerJourney";
import ContactSection from "@/components/ContactSection";
import ProjectGallery from "@/components/ProjectGallery";
import ScrollName from "@/components/ScrollName";
import ParticlePortrait from "@/components/ParticlePortrait";

export default function Home() {
  return <>
    <a className="skip-link" href="#contenido">Saltar al contenido</a>
    <header className="header"><div className="container header-inner">
      <span className="wordmark wordmark-slot" aria-hidden="true">Rafael Vales</span>
      <nav aria-label="Navegación principal"><a href="#proyectos">Proyectos</a><a href="#sobre-mi">Sobre mí</a><a href="#contacto">Contacto</a></nav>
    </div></header>
    <main id="contenido" className="container">
      <section className="hero" aria-labelledby="presentacion">
        <ScrollName />
        <ParticlePortrait />
        <div className="hero-bottom"><span>Una idea, cada detalle.</span><a href="#proyectos">Explorá mis proyectos <span aria-hidden="true">↘</span></a></div>
      </section>
      <section id="proyectos" aria-labelledby="proyectos-heading">
        <ProjectGallery />
      </section>
      <AboutSection />
      <CareerJourney />
      <ContactSection />
    </main>
    <footer className="container footer"><span>Rafael Vales</span><a href="#contenido">Volver arriba ↑</a></footer>
  </>;
}
