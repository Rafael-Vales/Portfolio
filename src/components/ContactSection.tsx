"use client";

import { useEffect, useRef, useState } from "react";

const email = "rafavales3@gmail.com";

export default function ContactSection() {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const [copying, setCopying] = useState(false);
  const reset = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (reset.current) clearTimeout(reset.current); }, []);

  async function copyEmail() {
    if (reset.current) clearTimeout(reset.current);
    setCopying(true);
    try {
      await navigator.clipboard.writeText(email);
      setCopyState("copied");
      reset.current = setTimeout(() => setCopyState("idle"), 3000);
    } catch {
      setCopyState("error");
    } finally {
      setCopying(false);
    }
  }

  return <section id="contacto" className="contact contact-closing" aria-labelledby="contact-title">
    <div className="contact-section-label"><span>Contacto</span><span>Mar del Plata, Argentina</span></div>
    <div className="contact-introduction">
      <h2 id="contact-title">Construyamos<br /><span>lo que viene.</span></h2>
      <p>Busco un equipo donde aportar como desarrollador fullstack, con foco en frontend y atención al detalle.</p>
    </div>
    <div className="contact-conversation">
      <div className="contact-address">
        <span>Una conversación puede ser el comienzo.</span>
        <a href={`mailto:${email}`}>{email}</a>
      </div>
      <div className="contact-actions">
        <a className="contact-write" href={`mailto:${email}`}>Escribime <span aria-hidden="true">↗</span></a>
        <button className="contact-copy" type="button" onClick={copyEmail} disabled={copying}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {copyState === "copied" ? <path d="m5 12 4 4L19 6" /> : <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4" /></>}
          </svg>
          <span>{copyState === "copied" ? "Copiado" : copying ? "Copiando…" : "Copiar email"}</span>
        </button>
        <span className="contact-copy-feedback" role="status">{copyState === "copied" ? "Email copiado." : copyState === "error" ? "No pude copiarlo. Podés seleccionar la dirección o tocar Escribime." : ""}</span>
      </div>
    </div>
    <div className="contact-signoff">
      <span><span className="contact-signoff-dot" aria-hidden="true" />Una idea, cada detalle.</span>
      <div className="contact-socials" aria-label="Perfiles profesionales">
        <a href="https://www.linkedin.com/in/rafael-vales/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn (se abre en una pestaña nueva)">LinkedIn <span aria-hidden="true">↗</span></a>
        <a href="https://github.com/Rafael-Vales" target="_blank" rel="noopener noreferrer" aria-label="GitHub (se abre en una pestaña nueva)">GitHub <span aria-hidden="true">↗</span></a>
      </div>
    </div>
  </section>;
}
