"use client";
import { useLocale } from "./LocaleProvider";

import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";

const STORE_URL = "https://ecommerce-los-abuelos.vercel.app/";

export default function AnimalFeedShowcase({ trying, onTry, onReturn, repoUrl }: { trying: boolean; onTry: () => void; onReturn: () => void; repoUrl?: string }) {
  const {t}=useLocale();
  const [loaded, setLoaded] = useState(false);
  const tryButton = useRef<HTMLButtonElement>(null);
  const returnButton = useRef<HTMLButtonElement>(null);
  const wasTrying = useRef(false);
  useLayoutEffect(() => {
    if (trying) returnButton.current?.focus({ preventScroll: true });
    else if (wasTrying.current) tryButton.current?.focus({ preventScroll: true });
    wasTrying.current = trying;
  }, [trying]);

  if (trying) return <div className="animal-live-store">
    <div className="animal-store-toolbar">
      <button ref={returnButton} onClick={onReturn}>{t("← Volver al proyecto")}</button>
      <span>{t("Animal Feed · Demo interactiva")}</span>
      <a href={STORE_URL} target="_blank" rel="noopener noreferrer">{t("Abrir en otra pestaña ↗")}</a>
    </div>
    <div className="animal-store-window">
      {!loaded && <p className="animal-store-loading" role="status">{t("Cargando la tienda…")}</p>}
      <iframe title={t("Probar la tienda Animal Feed")} src={STORE_URL} onLoad={() => setLoaded(true)}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
        referrerPolicy="strict-origin-when-cross-origin" />
    </div>
  </div>;

  return <div className="trip-project-content animal-project-content">
    <div className="trip-project-copy animal-project-copy">
      <span className="trip-project-eyebrow">Animal Feed · Los Abuelos</span>
      <h3>{t("Todo para tu mascota.")}<br />{t("En un solo lugar.")}</h3>
      <p className="animal-description-desktop">{t("Una tienda online de alimentos y accesorios para mascotas. Explorá el catálogo, filtrá por marca y elegí la presentación que necesitás antes de sumarla al carrito.")}</p>
      <p className="animal-description-mobile">{t("Ecommerce de alimentos y accesorios para mascotas, con búsqueda, filtros, favoritos y carrito.", "Pet food and accessories ecommerce, with search, filters, favorites and a shopping cart.")}</p>
      <ul className="animal-project-features"><li>{t("Catálogo y búsqueda")}</li><li>{t("Filtros y favoritos")}</li><li>{t("Carrito de compra")}</li></ul>
      <button ref={tryButton} className="animal-project-cta animal-try-desktop" onClick={() => { setLoaded(false); onTry(); }}>{t("Probar tienda")}<span aria-hidden="true">↗</span></button>
      <a className="animal-project-cta animal-try-mobile" href={STORE_URL} target="_blank" rel="noopener noreferrer">{t("Probar tienda")}<span aria-hidden="true">↗</span></a>
      {" "}{repoUrl && <a href={repoUrl} target="_blank" rel="noopener noreferrer">{t("Ver código", "View code")} <span aria-hidden="true">↗</span></a>}
      <small className="animal-project-note">{t("Demo con productos de ejemplo y compra simulada.")}</small>
    </div>
    <div className="animal-store-preview">
      <div className="animal-preview-bar" aria-hidden="true"><i /><i /><i /><span>Animal Feed</span></div>
      <Image src="/images/animal-feed/store-preview.jpg" alt={t("Inicio real de Animal Feed con catálogo para perros y gatos")} width={1265} height={712} sizes="(max-width: 700px) 85vw, 50vw" />
      <span className="animal-preview-caption">{t("Una experiencia pensada para explorar y comprar.")}</span>
    </div>
  </div>;
}
