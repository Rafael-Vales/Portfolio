"use client";

import { useLayoutEffect, useRef } from "react";

export default function ScrollName() {
  const ref = useRef<HTMLHeadingElement>(null);
  useLayoutEffect(() => {
    const name = ref.current;
    const hero = document.querySelector<HTMLElement>(".hero");
    const target = document.querySelector<HTMLElement>(".wordmark-slot");
    if (!name || !hero || !target) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0, lastProgress = -1, measuredWidth = 0;
    const compact = matchMedia("(max-width: 700px), (pointer: coarse)").matches;
    let startX = 0, startY = 0, endX = 0, endY = 0, endScale = 1, range = 1, heroTop = 0;
    function paint() {
      raf = 0;
      const raw = Math.max(0, Math.min(1, (window.scrollY - heroTop + 72) / range));
      const p = reduce.matches ? (raw >= .5 ? 1 : 0) : raw * raw * (3 - 2 * raw);
      if (p === lastProgress) return;
      lastProgress = p;
      const scale = 1 + (endScale - 1) * p;
      name!.style.transform = `translate3d(${startX + (endX - startX) * p}px, ${startY + (endY - startY) * p}px, 0) scale(${scale})`;
      const docked = String(raw >= .99);
      if (name!.dataset.docked !== docked) {
        // Match the navbar typography once on arrival, without relayout on
        // every scrolling frame. The journey itself only changes transform.
        name!.style.letterSpacing = docked === "true" ? "-.025em" : "-.07em";
        name!.style.fontWeight = docked === "true" ? "550" : "500";
        name!.dataset.docked = docked;
      }
    }
    function measure() {
      if (compact && measuredWidth === document.documentElement.clientWidth) return;
      measuredWidth = document.documentElement.clientWidth;
      lastProgress = -1;
      delete name!.dataset.docked;
      const box = hero!.getBoundingClientRect();
      const slot = target!.getBoundingClientRect();
      heroTop = box.top + window.scrollY;
      name!.style.letterSpacing = "-.07em";
      name!.style.fontWeight = "500";
      const font = parseFloat(getComputedStyle(name!).fontSize);
      startX = box.left + (box.width - name!.offsetWidth) / 2;
      startY = heroTop + (box.height - name!.offsetHeight) / 2 + Math.min(44, box.height * .05);
      endX = slot.left;
      const targetSize = parseFloat(getComputedStyle(target!).fontSize);
      endScale = targetSize / font;
      endY = slot.top + (slot.height - name!.offsetHeight * endScale) / 2;
      range = box.height * .7;
      paint();
    }
    function scroll() { if (!raf) raf = requestAnimationFrame(paint); }
    measure();
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("resize", measure);
    reduce.addEventListener("change", paint);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", scroll); window.removeEventListener("resize", measure); reduce.removeEventListener("change", paint); };
  }, []);
  return <h1 ref={ref} id="presentacion" className="scroll-name"><a href="#contenido">Rafael Vales<span>.</span></a></h1>;
}
