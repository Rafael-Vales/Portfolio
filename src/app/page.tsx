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
      <section id="sobre-mi" className="about" aria-labelledby="about-title"><h2 id="about-title">Sobre mí</h2><p>Me interesa cómo se ve una interfaz, cómo se usa y cómo está construida. Trabajo sobre esos detalles para convertir ideas en productos digitales claros y cuidados.</p>        <aside className="hero-timeline" aria-label="Trayectoria y disponibilidad">
          <dl className="timeline-list">
            <div><dt>2025 — Pres.</dt><dd>Desarrollador Frontend • Freelance</dd></div>
            <div><dt>2024</dt><dd>Arquitectura UI • Design Systems</dd></div>
            <div><dt>2023</dt><dd>Full Stack • TypeScript &amp; Next.js</dd></div>
          </dl>
          <p className="availability"><span aria-hidden="true" />Disponible para proyectos seleccionados</p>
        </aside>
</section>
      <section id="contacto" className="contact" aria-labelledby="contact-title"><h2 id="contact-title">Construir en equipo.</h2><p>Busco un equipo donde aportar, aprender y construir productos con atención al detalle.</p></section>
    </main>
    <footer className="container footer"><span>Rafael Vales</span><a href="#contenido">Volver arriba ↑</a></footer>
  </>;
}
