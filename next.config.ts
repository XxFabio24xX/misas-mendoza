import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Derive the Supabase project host so CSP stays scoped to it instead of
// broadly allowing *.supabase.co.
const supabaseHost = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").host;
  } catch {
    return "*.supabase.co";
  }
})();

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://static.cloudflareinsights.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https://*.tile.openstreetmap.org https://${supabaseHost};
  font-src 'self' data:;
  connect-src 'self' https://${supabaseHost} wss://${supabaseHost} https://cloudflareinsights.com;
  worker-src 'self' blob:;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: supabaseHost }],
  },
  async redirects() {
    return [
      // /capilla sola no tiene página (solo /capilla/[slug]); es una URL que
      // la gente y Google prueban al recortar la ruta de una capilla.
      { source: "/capilla", destination: "/capillas", permanent: true },
    ];
  },
  async headers() {
    // Páginas privadas: Google puede entrar (no están bloqueadas en
    // robots.txt) pero este header le dice que no las indexe. Si se
    // bloquearan en robots.txt, Google no vería el header y las indexaría
    // igual por los links a /login que hay en todo el sitio. Son Client
    // Components, por eso va como header y no como metadata.
    const noIndex = [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];
    return [
      { source: "/login", headers: noIndex },
      { source: "/restablecer-password", headers: noIndex },
      { source: "/admin", headers: noIndex },
      { source: "/admin/:path*", headers: noIndex },
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspHeader.replace(/\s{2,}/g, " ").trim(),
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "geolocation=(self), camera=(), microphone=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
