"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const FACE_DURATION = 4_000;

export default function JourneyIdentity() {
  const identity = useRef<HTMLDivElement>(null);
  const [photo, setPhoto] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const element = identity.current;
    if (!element || !loaded || paused) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    let timer: ReturnType<typeof setInterval> | undefined;
    function synchronize() {
      clearInterval(timer);
      timer = undefined;
      if (visible && !document.hidden && !motion.matches) {
        timer = setInterval(() => setPhoto(current => !current), FACE_DURATION);
      }
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      synchronize();
    }, { threshold: 0.3 });
    observer.observe(element);
    document.addEventListener("visibilitychange", synchronize);
    motion.addEventListener("change", synchronize);
    return () => {
      clearInterval(timer);
      observer.disconnect();
      document.removeEventListener("visibilitychange", synchronize);
      motion.removeEventListener("change", synchronize);
    };
  }, [loaded, paused]);

  return <div ref={identity} className="journey-identity" data-photo={photo}>
    <div className="journey-identity-turn">
      <div className="journey-identity-copy">
        <h2 id="journey-title">Aprender.<br />Construir.<br /><span>Seguir.</span></h2>
        <p>De la formación a productos reales. Un recorrido por lo que fui construyendo y lo que sigo desarrollando.</p>
      </div>
      <div className="journey-identity-photo" aria-hidden={!photo}>
        <Image src="/images/rafael/journey-portrait.jpg" alt="Rafael Vales" width={1206} height={1985}
          sizes="220px"
          onLoad={() => setLoaded(true)} />
      </div>
    </div>
    <button type="button" className="journey-identity-pause" onClick={() => setPaused(current => !current)}
      aria-label={paused ? "Reanudar giro del retrato" : "Pausar giro del retrato"} aria-pressed={paused}>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
        {paused ? <path d="M3 1.5 10 6l-7 4.5Z" /> : <><rect x="3" y="2" width="2" height="8" rx=".5" /><rect x="7" y="2" width="2" height="8" rx=".5" /></>}
      </svg>
    </button>
  </div>;
}
