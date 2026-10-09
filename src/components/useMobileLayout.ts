"use client";
import { useSyncExternalStore } from "react";

const query = "(max-width: 700px), (max-width: 1000px) and (max-height: 600px) and (pointer: coarse)";
function subscribe(onChange: () => void) {
  const media = window.matchMedia(query);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}
const snapshot = () => window.matchMedia(query).matches;
const serverSnapshot = () => false;

// Layout changes are observed only at the breakpoint, never during scroll.
export default function useMobileLayout() {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}
