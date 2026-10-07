"use client";

import { useSyncExternalStore } from "react";
import { useLocale } from "./LocaleProvider";

const STORAGE_KEY = "portfolio-theme";
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  function sync(event: StorageEvent) {
    if (event.key === STORAGE_KEY || event.key === null) {
      document.documentElement.dataset.theme = event.newValue === "dark" ? "dark" : "light";
    }
  }
  window.addEventListener("storage", sync);
  return () => { observer.disconnect(); window.removeEventListener("storage", sync); };
}
const getSnapshot = () => document.documentElement.dataset.theme === "dark";
const getServerSnapshot = () => false;

export default function ThemeToggle() {
  const { t } = useLocale();
  const dark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return <button type="button" className="theme-toggle" aria-pressed={dark}
    aria-label={t("Modo nocturno", "Dark mode")}
    title={dark ? t("Cambiar a modo claro", "Switch to light mode") : t("Cambiar a modo nocturno", "Switch to dark mode")}
    onClick={() => {
      const theme = dark ? "light" : "dark";
      document.documentElement.dataset.theme = theme;
      try { localStorage.setItem(STORAGE_KEY, theme); } catch { /* Keep the choice for this page when storage is unavailable. */ }
    }}>
    <svg className="theme-icon-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20.5 13A8.5 8.5 0 0 1 11 3.5 8.5 8.5 0 1 0 20.5 13Z" /></svg>
    <svg className="theme-icon-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></svg>
  </button>;
}
