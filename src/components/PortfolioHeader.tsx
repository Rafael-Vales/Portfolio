"use client";

import { useEffect, useRef, useState } from "react";
import { LanguageSwitcher, useLocale } from "./LocaleProvider";
import ThemeToggle from "./ThemeToggle";

export default function PortfolioHeader() {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const header = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function outside(event: PointerEvent) {
      if (event.target instanceof Node && !header.current?.contains(event.target)) setOpen(false);
    }
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape") { setOpen(false); toggle.current?.focus(); }
    }
    function resize() { if (window.innerWidth > 700) setOpen(false); }
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    window.addEventListener("resize", resize);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
      window.removeEventListener("resize", resize);
    };
  }, [open]);

  return <header ref={header} className="header" data-menu-open={open}>
    <div className="container header-inner">
      <span className="wordmark wordmark-slot" aria-hidden="true">Rafael Vales</span>
      <a className="mobile-wordmark wordmark" href="#contenido" onClick={() => setOpen(false)}>Rafael Vales<span>.</span></a>
      <div className="header-desktop-controls">
        <nav aria-label={t("Navegación principal")}>
          <a href="#proyectos">{t("Proyectos")}</a><a href="#sobre-mi">{t("Sobre mí")}</a><a href="#contacto">{t("Contacto")}</a>
        </nav>
        <LanguageSwitcher /><ThemeToggle />
      </div>
      <button ref={toggle} type="button" className="mobile-menu-toggle" aria-expanded={open} aria-controls="mobile-navigation"
        aria-label={open ? t("Cerrar menú", "Close menu") : t("Abrir menú", "Open menu")} onClick={() => setOpen(value => !value)}>
        <span aria-hidden="true">{open ? "−" : "+"}</span>{t("Menú", "Menu")}
      </button>
    </div>
    <div id="mobile-navigation" className="mobile-navigation" hidden={!open} onBlur={event => {
      if (!header.current?.contains(event.relatedTarget)) setOpen(false);
    }}>
      <nav className="container" aria-label={t("Navegación móvil", "Mobile navigation")}>
        {[["#proyectos", t("Proyectos")], ["#sobre-mi", t("Sobre mí")], ["#recorrido", t("Mi recorrido")], ["#contacto", t("Contacto")]].map(([href, label], index) =>
          <a key={href} href={href} onClick={() => setOpen(false)}><span>0{index + 1}</span>{label}<span aria-hidden="true">↗</span></a>)}
      </nav>
      <div className="container mobile-preferences"><span>{t("Idioma y apariencia", "Language & appearance")}</span><LanguageSwitcher /><ThemeToggle /></div>
    </div>
  </header>;
}
