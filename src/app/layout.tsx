import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Rafael Vales — Desarrollo & diseño",
  description: "Portfolio de Rafael Vales. Desarrollo full stack con foco en frontend y atención al diseño de productos digitales.",
  robots: { index: false, follow: false },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
