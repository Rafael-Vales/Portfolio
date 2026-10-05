"use client";

import Image from "next/image";
import TripPilotShowcase from "./TripPilotShowcase";
import { createPortal } from "react-dom";
import TripPilotLogo from "./TripPilotLogo";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

const projects = [
	{ name: "TripPilot", style: "trip" },
	{ name: "Animal Feed", style: "shop" },
	{ name: "Consultorio dermatológico", style: "clinic" },
];

export default function ProjectGallery() {
	const [selected, setSelected] = useState<number | null>(null);
	const [colored, setColored] = useState(false);
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
	}, [selected]);
	const [paint, setPaint] = useState<{
		color: string;
		reveal: boolean;
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
	useEffect(
		() => () => {
			if (timer.current) clearTimeout(timer.current);
			delete document.documentElement.dataset.projectPainting;
		},
		[],
	);
	function transition(next: number | null) {
		if (timer.current) return;
		const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
		const color = next === 0 ? "#2a7d6b" : next === 1 ? "#0b1d4d" : null;
		const painting = Boolean(color && !reduced);
		setLeaving(true);
		timer.current = setTimeout(
			() => {
				restoreFocus.current = true;
				setColored(!painting);
				setSelected(next);
				setLeaving(false);
				if (painting) {
					timer.current = setTimeout(() => {
						setPaint({ color: color!, reveal: false });
						timer.current = setTimeout(() => {
							setColored(true);
							setPaint({ color: color!, reveal: true });
							timer.current = setTimeout(() => {
								setPaint(null);
								timer.current = null;
							}, 100);
						}, 1100);
					}, 1000);
				} else timer.current = null;
			},
			reduced ? 0 : 420,
		);
	}

	function open(index: number) {
		origin.current = index;
		transition(index);
	}
	function close() {
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
			data-waiting={selected !== null && !colored && !paint}
			data-painting={Boolean(paint)}
			onKeyDown={(event) => {
				if (selected === null) return;
				if (event.key === "Escape") {
					event.preventDefault();
					close();
				}
				if (event.key === "ArrowLeft") {
					event.preventDefault();
					step(-1);
				}
				if (event.key === "ArrowRight") {
					event.preventDefault();
					step(1);
				}
			}}>
			{paint &&
				createPortal(
					<div
						className="project-color-paint"
						data-reveal={paint.reveal}
						style={{ backgroundColor: paint.color }}
						aria-hidden="true"
					/>,
					document.body,
				)}
			<div className="project-browser-toolbar">
				<h2
					id="proyectos-heading"
					className={
						selected !== null ? "project-heading-hidden" : undefined
					}>
					Proyectos
				</h2>
				{selected !== null && (
					<>
						<button
							ref={back}
							onClick={close}
							aria-label="Volver a la galería">
							← Volver
						</button>
						<span>
							{String(selected + 1).padStart(2, "0")} / 03
						</span>
					</>
				)}
			</div>
			<div className="project-view" key={selected ?? "gallery"}>
				{selected === null ? (
					<div className="project-gallery">
						{projects.map((project, index) => (
							<article
								key={project.style}
								className={`project-name-card project-name-card--${project.style}`}>
								{index === 0 && (
									<>
										<span className="trip-card-category">
											App iOS
										</span>
										<TripPilotLogo />
									</>
								)}
                                {index === 1 && <>
                                  <span className="animal-card-category">Ecommerce · Los Abuelos</span>
                                  <Image className="animal-card-logo" src="/images/animal-feed/logo.svg" width={1080} height={1080} alt="" aria-hidden="true" />
                                </>}
								<h3>{project.name}</h3>
                                <button
                                  className="project-card-trigger"
                                  ref={element => { triggers.current[index] = element; }}
                                  onClick={() => open(index)}
                                  aria-label={`Abrir ${project.name}`}
                                />
								{index === 0 && (
									<div className="trip-card-footer">
										<p>
											Tu viaje, de la idea
											<br />
											al itinerario.
										</p>
										<span aria-hidden="true">↗</span>
									</div>
								)}
                                {index === 1 && <div className="animal-card-footer">
                                  <p>Alimentos y accesorios<br />para tu mascota.</p>
                                  <span aria-hidden="true">↗</span>
                                </div>}
							</article>
						))}
					</div>
				) : (
					<section
						className="project-expanded"
						aria-label="Proyecto seleccionado">
						<div className="project-expanded-stage">
							<button
								className="project-arrow"
								onClick={() => step(-1)}
								aria-label="Proyecto anterior">
								<svg viewBox="0 0 24 48" aria-hidden="true">
									<path d="M21 3 3 24l18 21" />
								</svg>
							</button>
							<div
								key={selected}
								className={`project-expanded-cover project-expanded-cover--${projects[selected].style}`}
								aria-live={selected === 0 ? "off" : "polite"}
								aria-atomic="true">
								{selected === 0 ? (
									<>
										<TripPilotShowcase
											active={
												colored && !paint && !leaving
											}
										/>
										<div className="trip-project-emblem">
											<TripPilotLogo />
										</div>
									</>
								) : (
									<h3>{projects[selected].name}</h3>
								)}
								{paint && (
									<span
										className="project-panel-paint"
										style={{
											backgroundColor:
												selected === 0
													? "#236b5c"
													: "#102659",
										}}
										aria-hidden="true"
									/>
								)}
							</div>
							<button
								className="project-arrow"
								onClick={() => step(1)}
								aria-label="Proyecto siguiente">
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
