import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

const BASE_URL = SITE_URL;

// Sin Disallow a propósito: /login, /admin y /restablecer-password se excluyen
// de Google con el header X-Robots-Tag: noindex (next.config.ts). Bloquearlas
// acá impedía que Google viera ese header, y como todo el sitio enlaza a
// /login, Search Console las reportaba como "indexada aunque robots.txt la
// bloqueaba". robots.txt no es una medida de seguridad: el panel lo protegen
// la sesión (proxy.ts) y la autorización de cada Server Action.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
