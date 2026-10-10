"use client";

import { Fragment, useLayoutEffect, useRef, type RefObject } from "react";

type WordPosition = { key: string; rect: DOMRect; text: string; font: string; color: string; letterSpacing: string; opacity: number };

// Stable identities let shared words travel to their new position across chapters.
export function JourneyWords({text, group}: {text: string; group: string}) {
  const occurrences = new Map<string, number>();
  return <><span className="sr-only">{text}</span><span aria-hidden="true">{text.split(/\s+/).map((word, index) => {
    const token = word.toLocaleLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
    const occurrence = occurrences.get(token) ?? 0;
    occurrences.set(token, occurrence + 1);
    const key = `${group}:${token}:${occurrence}`;
    return <Fragment key={key}>{index > 0 && " "}<span data-journey-word={key}>{word}</span></Fragment>;
  })}</span></>;
}

export function useJourneyWords(root: RefObject<HTMLElement | null>, chapter: number) {
  const previous = useRef<WordPosition[] | null>(null);
  const animations = useRef(new Set<Animation>());
  const ghosts = useRef<HTMLElement[]>([]);

  function clear() {
    animations.current.forEach(animation => animation.cancel());
    animations.current.clear();
    ghosts.current.forEach(ghost => ghost.remove());
    ghosts.current = [];
  }

  function capture() {
    const element = root.current;
    if (!element || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      previous.current = null;
      clear();
      return;
    }
    // Read visible positions before canceling an interrupted transition.
    previous.current = Array.from(element.querySelectorAll<HTMLElement>("[data-journey-word]")).map(word => {
      const style = getComputedStyle(word);
      return {key: word.dataset.journeyWord!, rect: word.getBoundingClientRect(), text: word.textContent!,
        font: style.font, color: style.color, letterSpacing: style.letterSpacing, opacity: Number(style.opacity)};
    });
    clear();
  }

  useLayoutEffect(() => {
    const element = root.current;
    const old = previous.current;
    previous.current = null;
    if (!element || !old || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const bounds = element.getBoundingClientRect();
    const next = Array.from(element.querySelectorAll<HTMLElement>("[data-journey-word]")).map(word => ({word, rect: word.getBoundingClientRect(), key: word.dataset.journeyWord!}));
    const oldByKey = new Map(old.map(word => [word.key, word]));
    const nextKeys = new Set(next.map(word => word.key));
    function animate(target: HTMLElement, frames: Keyframe[], options: KeyframeAnimationOptions, remove = false) {
      const animation = target.animate(frames, options);
      animations.current.add(animation);
      animation.onfinish = () => {
        animations.current.delete(animation);
        animation.cancel();
        if (remove) { target.remove(); ghosts.current = ghosts.current.filter(ghost => ghost !== target); }
      };
    }
    old.filter(word => !nextKeys.has(word.key)).forEach(word => {
      const ghost = document.createElement("span");
      ghost.className = "journey-word-ghost";
      ghost.setAttribute("aria-hidden", "true");
      ghost.textContent = word.text;
      Object.assign(ghost.style, {left: `${word.rect.left - bounds.left}px`, top: `${word.rect.top - bounds.top}px`,
        font: word.font, color: word.color, letterSpacing: word.letterSpacing});
      element.appendChild(ghost);
      ghosts.current.push(ghost);
      animate(ghost, [{opacity: word.opacity, transform: "translateY(0)"}, {opacity: 0, transform: "translateY(-9px)"}],
        {duration: 170, easing: "ease-out"}, true);
    });
    next.forEach(({word, rect, key}, index) => {
      const from = oldByKey.get(key);
      const dx = from ? from.rect.left - rect.left : Math.min(36, 12 + index * 1.2);
      const dy = from ? from.rect.top - rect.top : 12;
      animate(word, [{transform: `translate(${dx}px, ${dy}px)`, opacity: from?.opacity ?? 0}, {transform: "translate(0, 0)", opacity: 1}],
        {duration: from ? 520 : 390, delay: from ? 0 : 90 + Math.min(index * 5, 70), easing: "cubic-bezier(.22,.7,.24,1)", fill: "both"});
    });
  }, [chapter, root]);

  useLayoutEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const changed = () => { if (preference.matches) clear(); };
    preference.addEventListener("change", changed);
    return () => { preference.removeEventListener("change", changed); clear(); };
  }, []);

  return capture;
}
