import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://rafaelvales.com" },
    { url: "https://rafaelvales.com/en" },
  ];
}
