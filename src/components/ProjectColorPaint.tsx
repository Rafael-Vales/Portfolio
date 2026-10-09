"use client";

import { createPortal } from "react-dom";
import { useId, useLayoutEffect, useRef } from "react";

export type PaintOrigin = { left: number; top: number; width: number; height: number };
export const PAINT_SPREAD_MS = 1450;

type Point = { x: number; y: number };

// A smooth rectangular pool: each edge flows at a slightly different speed.
// The starting perimeter follows the card, rather than a radial/circular wipe.
function liquidPath(origin: PaintOrigin, width: number, height: number, progress: number) {
  const points: Point[] = [];
  const overscan = Math.max(width, height) * .2;
  const amplitude = Math.sin(progress * Math.PI) ** 2 * Math.min(32, height * .045);
  for (let i = 0; i < 32; i++) {
    const side = Math.floor(i / 8), u = (i % 8) / 8;
    const local = progress + .045 * Math.sin(progress * Math.PI) * Math.sin(i * .73);
    const t = local ** 3 * (local * (local * 6 - 15) + 10);
    const left = origin.left + (-overscan - origin.left) * t;
    const top = origin.top + (-overscan - origin.top) * t;
    const right = origin.left + origin.width + (width + overscan - origin.left - origin.width) * t;
    const bottom = origin.top + origin.height + (height + overscan - origin.top - origin.height) * t;
    const wave = amplitude * (1 + .65 * Math.sin(i * .82 + progress * 3) + .2 * Math.sin(i * 1.7 - progress * 2));
    points.push(side === 0 ? { x: left + (right - left) * u, y: top - wave }
      : side === 1 ? { x: right + wave, y: top + (bottom - top) * u }
      : side === 2 ? { x: right - (right - left) * u, y: bottom + wave }
      : { x: left - wave, y: bottom - (bottom - top) * u });
  }
  // Catmull-Rom to cubic Bezier keeps the moving boundary soft and continuous.
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length; i++) {
    const a = points[(i + 31) % 32], b = points[i], c = points[(i + 1) % 32], d = points[(i + 2) % 32];
    path += ` C ${b.x + (c.x - a.x) / 6} ${b.y + (c.y - a.y) / 6}, ${c.x - (d.x - b.x) / 6} ${c.y - (d.y - b.y) / 6}, ${c.x} ${c.y}`;
  }
  const coversViewport = points.every((point, i) => {
    const side = Math.floor(i / 8);
    return side === 0 ? point.y < -16 : side === 1 ? point.x > width + 16
      : side === 2 ? point.y > height + 16 : point.x < -16;
  });
  return { path: `${path} Z`, coversViewport };
}

export default function ProjectColorPaint({ color, origin, onComplete }: { color: string; origin: PaintOrigin; onComplete: () => void }) {
  const svg = useRef<SVGSVGElement>(null);
  const path = useRef<SVGPathElement>(null);
  const navbarSvg = useRef<SVGSVGElement>(null);
  const navbarPath = useRef<SVGPathElement>(null);
  const oldVeilCutout = useRef<SVGPathElement>(null);
  const oldVeil = useRef<SVGRectElement>(null);
  const id = useId();
  const navbarStage = document.querySelector(".portrait-stage");
  useLayoutEffect(() => {
    let frame = 0, completed = false;
    const start = performance.now();
    const width = document.documentElement.clientWidth, height = window.innerHeight;
    svg.current?.setAttribute("viewBox", `0 0 ${width} ${height}`);
    navbarSvg.current?.setAttribute("viewBox", `0 0 ${width} ${height}`);
    const root = document.documentElement;
    oldVeil.current?.setAttribute("fill", getComputedStyle(document.body).backgroundColor);
    root.dataset.projectSpread = "true";
    function draw(now: number) {
      const progress = Math.min(1, (now - start) / PAINT_SPREAD_MS);
      const shape = liquidPath(origin, width, height, progress);
      path.current?.setAttribute("d", shape.path);
      navbarPath.current?.setAttribute("d", shape.path);
      oldVeilCutout.current?.setAttribute("d", shape.path);
      if (progress < 1) frame = requestAnimationFrame(draw);
      // Change text/controls as soon as all edges have actually left the viewport.
      // No waiting at a fully painted screen, and no timer forcing unpainted gaps shut.
      if (!completed && shape.coversViewport) { completed = true; onComplete(); }
    }
    draw(start);
    return () => { cancelAnimationFrame(frame); delete root.dataset.projectSpread; };
  }, [origin, onComplete]);
  return <>
    <svg ref={svg} className="project-color-paint" aria-hidden="true" preserveAspectRatio="none"><path ref={path} fill={color} /></svg>
    {navbarStage && createPortal(
      <svg ref={navbarSvg} className="project-navbar-paint" aria-hidden="true" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`${id}-fade`} x1="0" y1="0" x2="0" y2="160" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="white" /><stop offset=".45" stopColor="white" />
            <stop offset=".625" stopColor="white" stopOpacity=".68" />
            <stop offset=".844" stopColor="white" stopOpacity=".18" /><stop offset="1" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <mask id={`${id}-veil`} maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="160">
            <rect width="100%" height="160" fill={`url(#${id}-fade)`} />
          </mask>
          <mask id={`${id}-unpainted`} maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="160">
            <rect width="100%" height="160" fill="white" />
            <path ref={oldVeilCutout} fill="black" />
          </mask>
        </defs>
        <g mask={`url(#${id}-veil)`}>
          <rect ref={oldVeil} width="100%" height="160" mask={`url(#${id}-unpainted)`} />
          <path ref={navbarPath} fill={color} />
        </g>
      </svg>, navbarStage,
    )}
  </>;
}
