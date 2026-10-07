import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3011")),
  title: "Rafael Vales — Desarrollo & diseño",
  description: "Portfolio de Rafael Vales. Desarrollo full stack con foco en frontend y atención al diseño de productos digitales.",
  robots: { index: process.env.VERCEL_ENV !== "preview", follow: true },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: `(function(){var theme="light";try{if(localStorage.getItem("portfolio-theme")==="dark")theme="dark";}catch{}document.documentElement.dataset.theme=theme;})();` }} /></head><body>{children}</body></html>;
}
