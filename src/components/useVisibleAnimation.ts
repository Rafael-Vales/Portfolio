"use client";

import { useEffect, useRef } from "react";

// Leave decorative CSS animations asleep until they are actually visible.
export default function useVisibleAnimation<T extends Element>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let visible = false;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    function sync() { element!.setAttribute("data-animating", String(visible && !document.hidden && !motion.matches)); }
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    observer.observe(element);
    document.addEventListener("visibilitychange", sync);
    motion.addEventListener("change", sync);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", sync); motion.removeEventListener("change", sync); };
  }, []);
  return ref;
}
