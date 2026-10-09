"use client";

import ProjectColorPaint, { type PaintOrigin } from "./ProjectColorPaint";
import AnimalFeedLogo from "./AnimalFeedLogo";
import AnimalFeedShowcase from "./AnimalFeedShowcase";
import TripPilotShowcase from "./TripPilotShowcase";
import { createPortal, flushSync } from "react-dom";
import ProjectBack from "./ProjectBack";
import { useLocale } from "./LocaleProvider";
import TripPilotLogo from "./TripPilotLogo";
import { type CSSProperties, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";



const slugs = ["trippilot", "animal-feed", "consultorio"];
export default function ProjectGallery({ initialProject }: { initialProject?: string }) {
 const {t,locale}=useLocale();
const projects = [
	{ name: "TripPilot", style: "trip" },
	{ name: "Animal Feed", style: "shop" },
	{ name: t("Consultorio dermatológico"), style: "clinic" },
];


  const initial = slugs.indexOf(initialProject ?? "");
  const [selected, setSelected] = useState<number | null>(initial < 0 ? null : initial);
  const [colored, setColored] = useState(initial >= 0);
  const [galleryIndex, setGalleryIndex] = useState(initial < 0 ? 0 : initial);
  const gallery = useRef<HTMLDivElement>(null);
  const galleryIndexRef = useRef(galleryIndex);
  const galleryTarget = useRef<number | null>(null);
  const galleryFrame = useRef(0);
  function centerCard(index: number, smooth = true) {
    const rail = gallery.current;
    const card = rail?.children[index] as HTMLElement | undefined;
    if (!rail || !card || !matchMedia("(max-width: 700px)").matches) return;
    const left = card.offsetLeft - rail.offsetLeft - (rail.clientWidth - card.offsetWidth) / 2;
    rail.scrollTo({left, behavior: smooth && !matchMedia("(prefers-reduced-motion: reduce)").matches ? "smooth" : "instant"});
  }
  function moveGallery(direction: number) {
    const next = ((galleryTarget.current ?? galleryIndexRef.current) + direction + slugs.length) % slugs.length;
    galleryTarget.current = next;
    galleryIndexRef.current = next;
    setGalleryIndex(next);
    centerCard(next);
    return next;
  }
  function syncGallery() {
    cancelAnimationFrame(galleryFrame.current);
    galleryFrame.current = requestAnimationFrame(() => {
      const rail = gallery.current;
      if (!rail || !matchMedia("(max-width: 700px)").matches) return;
      const center = rail.scrollLeft + rail.clientWidth / 2;
      let closest = 0, distance = Infinity;
      Array.from(rail.children).forEach((child, index) => {
        const card = child as HTMLElement;
        const gap = Math.abs(card.offsetLeft - rail.offsetLeft + card.offsetWidth / 2 - center);
        if (gap < distance) { distance = gap; closest = index; }
      });
      if (distance < 2) galleryTarget.current = null;
      galleryIndexRef.current = closest;
      setGalleryIndex(closest);
    });
  }
  useLayoutEffect(() => {
    if (selected !== null) return;
    const frame = requestAnimationFrame(() => centerCard(galleryIndexRef.current, false));
    const resize = () => centerCard(galleryIndexRef.current, false);
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(frame); cancelAnimationFrame(galleryFrame.current); window.removeEventListener("resize", resize); };
  }, [selected]);
  const [flipped, setFlipped] = useState(false);
  const flipReturn = useRef<HTMLButtonElement>(null);
  const flipOpen = useRef<HTMLButtonElement>(null);
  const flipChanged = useRef(false);
  const [shared, setShared] = useState(false);
  const [shareFailed, setShareFailed] = useState(false);
  const transitioning = useRef(false);
  const transitionId = useRef(0);
  useEffect(() => {
    const name = selected === null ? (locale === "en" ? "Fullstack developer" : "Desarrollador fullstack") : ["TripPilot", "Animal Feed", locale === "en" ? "Dermatology clinic" : "Consultorio dermatológico"][selected];
    document.title = selected === null ? `Rafael Vales — ${name}` : `${name} — Rafael Vales`;
  }, [selected, locale]);
  const shareTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (shareTimer.current) clearTimeout(shareTimer.current); }, []);
  useLayoutEffect(() => {
    if (flipChanged.current) {
      (flipped ? flipReturn : flipOpen).current?.focus({preventScroll:true});
      if (matchMedia("(max-width: 700px)").matches) document.querySelector(".project-browser")?.scrollIntoView({block:"start",behavior:"instant"});
      flipChanged.current=false;
    }
  },[flipped]);
  function flip(value:boolean) { flipChanged.current=true;setFlipped(value); }
  async function share() {
    setShareFailed(false);
    try { await navigator.clipboard.writeText(window.location.href); setShared(true); if(shareTimer.current)clearTimeout(shareTimer.current);shareTimer.current=setTimeout(()=>setShared(false),2500); }
    catch { setShared(false);setShareFailed(true); }
  }
  const [tryingStore, setTryingStore] = useState(false);
	useLayoutEffect(() => {
		if (!colored) delete document.documentElement.dataset.projectTheme;
		else if (selected === 0)
			document.documentElement.dataset.projectTheme = "trippilot";
		else if (selected === 1)
			document.documentElement.dataset.projectTheme = "animal-feed";
		else delete document.documentElement.dataset.projectTheme;
		return () => {
			delete document.documentElement.dataset.projectTheme;
		};
	}, [selected, colored]);

	const triggers = useRef<(HTMLButtonElement | null)[]>([]);
	const back = useRef<HTMLButtonElement>(null);
	const origin = useRef(0);
	const restoreFocus = useRef(false);
	useLayoutEffect(() => {
		if (!restoreFocus.current) return;
		restoreFocus.current = false;
		if (selected === null)
			triggers.current[origin.current]?.focus({ preventScroll: true });
		else back.current?.focus({ preventScroll: true });
        if (matchMedia("(max-width: 700px)").matches) document.querySelector(".project-browser")?.scrollIntoView({block:"start",behavior:"instant"});
	}, [selected]);
	const [paint, setPaint] = useState<{
		color: string;
		stage: "card" | "spread";
        origin: PaintOrigin;
	} | null>(null);
	useLayoutEffect(() => {
		if (paint) document.documentElement.dataset.projectPainting = "true";
		else delete document.documentElement.dataset.projectPainting;
		return () => {
			delete document.documentElement.dataset.projectPainting;
		};
	}, [paint]);
	const [leaving, setLeaving] = useState(false);
	const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finishPaint = useCallback(() => {
    // The SVG has covered the viewport. Switch the palette under that same frame.
    flushSync(() => setColored(true));
    timer.current=setTimeout(() => {
      setPaint(null); timer.current=null; transitioning.current=false;
    },80);
  }, []);
  useEffect(() => {
    function restore() {
      transitionId.current++; transitioning.current=false;
      if(timer.current){clearTimeout(timer.current);timer.current=null;}
      const next=slugs.indexOf(new URL(window.location.href).searchParams.get("project") ?? "");
      setSelected(next<0?null:next);setColored(next>=0);setPaint(null);setLeaving(false);setTryingStore(false);setFlipped(false);
    }
    window.addEventListener("popstate",restore);
    return ()=>window.removeEventListener("popstate",restore);
  },[]);
	useEffect(
		() => () => {
			if (timer.current) clearTimeout(timer.current);
            transitionId.current++;
			delete document.documentElement.dataset.projectPainting;
		},
		[],
	);
  function transition(next: number | null) {
    if (timer.current || transitioning.current) return;
    transitioning.current = true;
    const id = ++transitionId.current;
    const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
    const color=next===0?"#2a7d6b":next===1?"#0b1d4d":null;
    const painting=Boolean(color&&!reduced);
    const card = selected===null && next!==null ? triggers.current[next]?.closest<HTMLElement>("article") : null;
    if(card){card.style.viewTransitionName="project-panel";const mark=card.querySelector<HTMLElement>(".trip-card-logo, .animal-logo");if(mark)mark.style.viewTransitionName="project-mark";}
    const update=()=>{
      restoreFocus.current=true;
      flushSync(()=>{setSelected(next);setColored(!painting);setFlipped(false);setTryingStore(false);setLeaving(false);setShared(false);});
      const url=new URL(window.location.href);
      if(next===null)url.searchParams.delete("project");else url.searchParams.set("project",slugs[next]);
      url.hash="proyectos";window.history.pushState({},"",url);
    };
    const beginPaint=()=>{
      if (id !== transitionId.current) return;
      if(!painting) { transitioning.current=false; return; }
      const bounds=document.querySelector(".project-expanded-cover")?.getBoundingClientRect();
      if(!bounds){setColored(true);transitioning.current=false;return;}
      const origin: PaintOrigin={left:bounds.left,top:bounds.top,width:bounds.width,height:bounds.height};
      setPaint({color:color!,stage:"card",origin});
      timer.current=setTimeout(()=>{
        setPaint({color:color!,stage:"spread",origin});
        timer.current=null;
      },440);
    };
    if(!reduced && document.startViewTransition) {
      const view=document.startViewTransition(update);
      void view.finished.catch(()=>{}).finally(beginPaint);
    } else {
      update();
      if(painting) timer.current=setTimeout(()=>{timer.current=null;beginPaint();},450);
      else transitioning.current=false;
    }
  }

	function open(index: number) {
		origin.current = index;
        galleryIndexRef.current = index; setGalleryIndex(index);
		transition(index);
	}
	function close() {
        if (flipped) { flip(false); return; }
        if (tryingStore) { setTryingStore(false); return; }
		transition(null);
	}
	function step(direction: number) {
		if (selected !== null)
			transition(
				(selected + direction + projects.length) % projects.length,
			);
	}
	return (
		<div
			className="project-browser"
			data-leaving={leaving}
            data-store-open={tryingStore}
			data-waiting={selected !== null && !colored && !paint}
			data-painting={Boolean(paint)}
			onKeyDown={(event) => {
				if (selected === null) return;
				if (event.key === "Escape") {
					event.preventDefault();
					close();
				}
				if (event.target instanceof Element && event.target.closest(".trip-showcase, .project-back-content")) return;
				if (!tryingStore && event.key === "ArrowLeft") {
					event.preventDefault();
					step(-1);
				}
				if (!tryingStore && event.key === "ArrowRight") {
					event.preventDefault();
					step(1);
				}
			}}>
            {paint?.stage === "spread" && createPortal(
              <ProjectColorPaint color={paint.color} origin={paint.origin} onComplete={finishPaint} />,
              document.body,
            )}
			<div className="project-browser-toolbar">
				<h2
					id="proyectos-heading"
					className={
						selected !== null ? "project-heading-hidden" : undefined
					}>{t("Proyectos")}</h2>
				{selected !== null && (
					<>
						<button
							ref={back}
							onClick={close}
							aria-label={flipped || tryingStore ? t("Volver al proyecto") : t("Volver a la galería")}>{t("← Volver")}</button>
                        <div className="project-toolbar-actions"><button type="button" onClick={share}>{shared?t("Enlace copiado","Link copied"):t("Copiar enlace","Copy link")}</button><span>{String(selected+1).padStart(2,"0")} / 03</span><span role="status" className="sr-only">{shared?t("Enlace copiado","Link copied"):shareFailed?t("No se pudo copiar. Podés copiar la dirección del navegador.","Could not copy. You can copy the address from your browser."):""}</span></div>
					</>
				)}
			</div>
			<div className="project-view" key={selected ?? "gallery"}>
				{selected === null ? (
					<div className="project-gallery-carousel" role="region" aria-label={t("Galería de proyectos", "Project gallery")}>
                      <button type="button" className="gallery-arrow gallery-arrow--previous" onClick={() => moveGallery(-1)} aria-label={t("Tarjeta anterior", "Previous card")}>←</button>
                      <div ref={gallery} className="project-gallery" onPointerDown={() => { galleryTarget.current = null; }} onScroll={syncGallery} onKeyDown={event => {
                        if (!matchMedia("(max-width: 700px)").matches) return;
                        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
                          event.preventDefault();
                          const next = moveGallery(event.key === "ArrowLeft" ? -1 : 1);
                          triggers.current[next]?.focus({preventScroll:true});
                        }
                      }}>
						{projects.map((project, index) => (
							<article
								key={project.style}
								className={`project-name-card project-name-card--${project.style}`}
                                data-active={galleryIndex === index}>
								{index === 0 && (
									<>
										<span className="trip-card-category">{t("App iOS")}</span>
										<TripPilotLogo />
									</>
								)}
                                {index === 1 && <>
                                  <span className="animal-card-category">Ecommerce · Los Abuelos</span>
                                  <AnimalFeedLogo />
                                </>}
								{index === 0 ? <div className="trip-card-heading">
                                  <h3>{project.name}</h3>
                                  <span className="trip-release-status">{t("Próximamente en App Store")}</span>
                                </div> : <h3>{project.name}</h3>}
                                <button
                                  className="project-card-trigger"
                                  ref={element => { triggers.current[index] = element; }}
                                  onClick={() => open(index)}
                                  aria-label={`${t("Abrir", "Open")} ${project.name}`}
                                />
								{index === 0 && (
									<div className="trip-card-footer">
										<p>{t("Tu viaje, de la idea")}<br />{t("al itinerario.")}</p>
										<span aria-hidden="true">↗</span>
									</div>
								)}
                                {index === 2 && <span className="clinic-card-status">{t("En desarrollo")}</span>}
                                {index === 1 && <div className="animal-card-footer">
                                  <p>{t("Alimentos y accesorios")}<br />{t("para tu mascota.")}</p>
                                  <span aria-hidden="true">↗</span>
                                </div>}
							</article>
						))}
                      </div>
                      <button type="button" className="gallery-arrow gallery-arrow--next" onClick={() => moveGallery(1)} aria-label={t("Tarjeta siguiente", "Next card")}>→</button>
                      <div className="gallery-progress" aria-live="polite" aria-atomic="true"><span>{String(galleryIndex + 1).padStart(2, "0")} / 03</span><span>{projects[galleryIndex].name}</span></div>
                    </div>
				) : (
					<section
						className="project-expanded"
						aria-label={t("Proyecto seleccionado")}>
						<div className="project-expanded-stage">
							<button
								className="project-arrow"
								onClick={() => step(-1)}
								aria-label={t("Proyecto anterior")}>
								<svg viewBox="0 0 24 48" aria-hidden="true">
									<path d="M21 3 3 24l18 21" />
								</svg>
							</button>
							<div
								key={selected}
								className={`project-expanded-cover project-expanded-cover--${projects[selected].style}`}
                                data-flipped={flipped}
                                style={{viewTransitionName:"project-panel", "--project-panel-color": selected === 0 ? "#236b5c" : "#102659"} as CSSProperties}>
                                <div className="project-front" inert={flipped} aria-hidden={flipped}>
								{selected === 0 ? (
									<>
										<TripPilotShowcase
											active={
												colored && !paint && !leaving && !flipped
											}
										/>
										<div className="trip-project-emblem" style={{viewTransitionName:"project-mark"}}>
											<TripPilotLogo />
										</div>
									</>
								) : selected === 1 ? (
                                    <>
                                      <AnimalFeedShowcase trying={tryingStore} onTry={() => setTryingStore(true)} onReturn={() => setTryingStore(false)} />
                                      {!tryingStore && <div className="trip-project-emblem animal-project-emblem" style={{viewTransitionName:"project-mark"}}><AnimalFeedLogo /></div>}
                                    </>
                                ) : (
									<div className="clinic-project-content">
                                      <span className="clinic-project-status">{t("En desarrollo")}</span>
                                      <span className="clinic-project-eyebrow">{t("Gestión clínica · Una necesidad real", "Clinic management · A real need")}</span>
                                      <h3>{t("Consultorio")}<br />{t("dermatológico.")}</h3>
                                      <p>{t("De coordinar turnos y señas por WhatsApp a diseñar un sistema que conecte recepción, agenda y seguimiento clínico.", "From coordinating appointments and deposits over WhatsApp to designing a system that connects reception, scheduling and clinical follow-up.")}</p>
                                      <ul className="clinic-project-scope" aria-label={t("Alcance del proyecto", "Project scope")}>
                                        <li>{t("Turnos y señas", "Appointments & deposits")}</li>
                                        <li>{t("Recepción y atención", "Reception & consultations")}</li>
                                        <li>{t("Historia clínica e imágenes", "Medical records & images")}</li>
                                      </ul>
                                      <span className="clinic-project-note">{t("Tech Lead · Equipo de cuatro personas","Tech Lead · Four-person team")}</span>
                                      <small className="clinic-project-stage">{t("Desarrollo por etapas · Demostraciones con datos ficticios", "Incremental development · Demonstrations with fictional data")}</small>
                                    </div>
								)}
                                {!tryingStore && <button ref={flipOpen} type="button" className="project-flip-trigger" onClick={()=>flip(true)}>{t("Cómo lo construí","How I built it")} <span aria-hidden="true">↻</span></button>}
                                </div>
                                <div className="project-back" inert={!flipped} aria-hidden={!flipped}>
                                  <ProjectBack index={selected} />
                                  <button ref={flipReturn} type="button" className="project-flip-trigger" onClick={()=>flip(false)}>{t("Volver al producto","Back to the product")} <span aria-hidden="true">↶</span></button>
                                </div>

							</div>
							<button
								className="project-arrow"
								onClick={() => step(1)}
								aria-label={t("Proyecto siguiente")}>
								<svg viewBox="0 0 24 48" aria-hidden="true">
									<path d="m3 3 18 21L3 45" />
								</svg>
							</button>
						</div>
					</section>
				)}
			</div>
		</div>
	);
}
