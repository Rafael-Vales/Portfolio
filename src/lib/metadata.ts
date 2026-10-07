import type { Metadata } from "next";
export function portfolioMetadata(locale: "es" | "en", project?: string): Metadata {
  const names: Record<string,string> = { trippilot: "TripPilot", "animal-feed": "Animal Feed", consultorio: locale === "en" ? "Dermatology clinic" : "Consultorio dermatológico" };
  const title = project && names[project] ? `${names[project]} — Rafael Vales` : `Rafael Vales — ${locale === "en" ? "Fullstack developer" : "Desarrollador fullstack"}`;
  const description = locale === "en" ? "Fullstack developer with a focus on frontend. Explore the products I design and build, and the decisions behind them." : "Desarrollador fullstack con foco en frontend. Conocé los productos que diseño y construyo, y las decisiones detrás de cada uno.";
  return { title, description, robots: { index: process.env.VERCEL_ENV !== "preview", follow: true },
    openGraph: { title, description, type: "website", locale: locale === "en" ? "en_US" : "es_AR" },
    twitter: { card: "summary_large_image", title, description } };
}
