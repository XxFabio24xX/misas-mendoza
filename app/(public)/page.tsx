import type { Metadata } from "next";
import HeroBanner from "@/app/components/hero-banner";
import { supabasePublic } from "@/lib/supabase-public";
import { DEPARTAMENTOS } from "@/lib/departamentos";
import { SITE_URL } from "@/lib/site";
import Home from "./home-client";

// La home es un Client Component envuelto en Suspense (usa useSearchParams),
// así que su contenido no llega en el HTML inicial. Esta página de servidor
// aporta lo que Google necesita leer sin ejecutar JavaScript: la canónica, el
// JSON-LD y el encabezado, con el h1 (que además es el LCP) y los links por
// departamento.
export const revalidate = 3600;

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Misas Mendoza",
      description: "Horarios de misas y celebraciones católicas en Mendoza, Argentina",
      inLanguage: "es-AR",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Misas Mendoza",
      url: SITE_URL,
      logo: `${SITE_URL}/icons/icon-512.png`,
      description: "Plataforma gratuita de horarios de misas y celebraciones católicas para la Arquidiócesis de Mendoza",
      areaServed: {
        "@type": "State",
        name: "Mendoza",
        addressCountry: "AR",
      },
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        url: `${SITE_URL}/contacto`,
        availableLanguage: "Spanish",
      },
    },
    {
      "@type": "LocalBusiness",
      "@id": `${SITE_URL}/#localbusiness`,
      name: "Misas Mendoza",
      url: SITE_URL,
      description: "Directorio de horarios de misas, parroquias, capillas y santuarios de la Arquidiócesis de Mendoza",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Mendoza",
        addressRegion: "Mendoza",
        addressCountry: "AR",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: -32.8908,
        longitude: -68.8272,
      },
      areaServed: [
        "Capital, Mendoza",
        "Godoy Cruz, Mendoza",
        "Guaymallén, Mendoza",
        "Las Heras, Mendoza",
        "Maipú, Mendoza",
        "Luján de Cuyo, Mendoza",
        "San Martín, Mendoza",
        "Junín, Mendoza",
        "Rivadavia, Mendoza",
      ],
      sameAs: [SITE_URL],
    },
  ],
};

export default async function HomePage() {
  const { data } = await supabasePublic.from("lugares").select("departamento").eq("activo", true);
  const conCapillas = new Set((data ?? []).map((l) => l.departamento as string));
  const departamentos = DEPARTAMENTOS.filter((d) => conCapillas.has(d));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <div className="mx-auto max-w-280 px-4 pt-10 md:px-6 md:pt-16">
        <HeroBanner departamentos={departamentos} />
      </div>

      <Home />
    </>
  );
}
