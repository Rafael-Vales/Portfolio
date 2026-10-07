"use client";
import { createContext, useContext, useEffect, type ReactNode } from "react";
import translations from "@/content/translations";
export type Locale = "es" | "en";
const LocaleContext = createContext<Locale>("es");
export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  useEffect(() => { document.documentElement.lang = locale; }, [locale]);
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}
export function useLocale() {
  const locale = useContext(LocaleContext);
  return { locale, t: (es: string, en?: string) => locale === "en" ? (en ?? translations[es] ?? es) : es,
    cv: locale === "en" ? "/documents/CV_Rafael_Vales_EN.pdf" : "/documents/CV_Rafael_Vales.pdf" };
}
export function LanguageSwitcher() {
  const { locale } = useLocale();
  return <div className="language-switch" aria-label={locale === "en" ? "Language" : "Idioma"}>
    {(["es", "en"] as const).map(lang => <a key={lang} href={lang === "en" ? "/en" : "/"} lang={lang} hrefLang={lang}
      aria-current={locale === lang ? "page" : undefined} onClick={event => {
        // Let the browser load a fresh document, including its locale-specific effects.
        // Set the destination before the native link action; modifier clicks still work.
        event.currentTarget.href = `${lang === "en" ? "/en" : "/"}${window.location.search}${window.location.hash}`;
      }}>{lang.toUpperCase()}</a>)}
  </div>;
}
