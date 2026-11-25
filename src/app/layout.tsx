import type { Metadata } from "next";
import "./globals.css";
import { headers } from "next/headers";
import localFont from "next/font/local";

const fraunces = localFont({
  src: "./fonts/Fraunces-Latin-500.woff2",
  weight: "500",
  style: "normal",
  variable: "--font-heading",
  display: "swap",
  fallback: ["Georgia", "serif"],
  adjustFontFallback: "Times New Roman",
});
export const metadata: Metadata = {
  metadataBase: new URL("https://rafaelvales.com"),
  title: "Rafael Vales — Desarrollo & diseño",
  description: "Portfolio de Rafael Vales. Desarrollo full stack con foco en frontend y atención al diseño de productos digitales.",
  robots: { index: process.env.VERCEL_ENV !== "preview", follow: true },
};
const person = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Rafael Vales",
  jobTitle: "Full Stack Developer",
  url: "https://rafaelvales.com",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Mar del Plata",
    addressCountry: "AR",
  },
  sameAs: [
    "https://www.linkedin.com/in/rafael-vales/",
    "https://github.com/Rafael-Vales",
  ],
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return <html lang="es" className={fraunces.variable} suppressHydrationWarning><head><script nonce={nonce} dangerouslySetInnerHTML={{ __html: `(function(){var theme="light";try{if(localStorage.getItem("portfolio-theme")==="dark")theme="dark";}catch{}document.documentElement.dataset.theme=theme;})();` }} /></head><body><script type="application/ld+json" nonce={nonce} dangerouslySetInnerHTML={{ __html: JSON.stringify(person).replace(/</g, "\\u003c") }} />{children}</body></html>;
}
