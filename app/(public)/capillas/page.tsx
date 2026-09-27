import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, MapPin } from "lucide-react";
import { supabasePublic } from "@/lib/supabase-public";
import { DEPARTAMENTOS, slugDepartamento } from "@/lib/departamentos";
import { SITE_URL } from "@/lib/site";

// Directorio renderizado en el servidor: es el único lugar del HTML inicial
// con links a todas las capillas (la home y el mapa las arman en el cliente),
// así Google puede descubrirlas siguiendo enlaces internos.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Capillas y parroquias de Mendoza",
  description:
    "Listado de parroquias, capillas y santuarios de Mendoza por departamento, con dirección y horarios de misa de cada una.",
  alternates: { canonical: "/capillas" },
  openGraph: {
    title: "Capillas y parroquias de Mendoza",
    description: "Todas las parroquias, capillas y santuarios de Mendoza, por departamento.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
};

type LugarListado = {
  nombre: string;
  slug: string;
  tipo: "parroquia" | "capilla" | "santuario";
  departamento: string;
  direccion: string | null;
};

const TIPO_LABEL: Record<LugarListado["tipo"], string> = {
  parroquia: "Parroquia",
  capilla: "Capilla",
  santuario: "Santuario",
};

export default async function CapillasPage() {
  const { data } = await supabasePublic
    .from("lugares")
    .select("nombre, slug, tipo, departamento, direccion")
    .eq("activo", true)
    .order("nombre");
  const lugares = (data ?? []) as LugarListado[];

  // Departamentos en el orden habitual; cualquier otro que aparezca va al final.
  const orden = [
    ...DEPARTAMENTOS,
    ...[...new Set(lugares.map((l) => l.departamento))].filter((d) => !DEPARTAMENTOS.includes(d)),
  ];
  const grupos = orden
    .map((dep) => ({ dep, items: lugares.filter((l) => l.departamento === dep) }))
    .filter((g) => g.items.length > 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Capillas y parroquias de Mendoza",
    numberOfItems: lugares.length,
    itemListElement: lugares.map((l, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/capilla/${l.slug}`,
      name: l.nombre,
    })),
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-16">
      <h1 className="text-2xl font-semibold text-on-surface md:text-3xl">
        Capillas y parroquias de Mendoza
      </h1>
      <p className="mt-3 leading-relaxed text-on-surface-variant">
        {lugares.length} parroquias, capillas y santuarios con sus horarios de
        misa, ordenados por departamento. Si buscás la más cercana a vos, usá
        el{" "}
        <Link href="/" className="font-medium text-primary hover:underline">
          buscador
        </Link>{" "}
        o el{" "}
        <Link href="/mapa" className="font-medium text-primary hover:underline">
          mapa
        </Link>
        .
      </p>

      {grupos.length > 1 && (
        <nav aria-label="Departamentos" className="mt-6 flex flex-wrap gap-2">
          {grupos.map(({ dep, items }) => (
            <a
              key={dep}
              href={`#${slugDepartamento(dep)}`}
              className="rounded-full border border-outline-variant/50 bg-surface-container-low px-3 py-1 text-xs font-medium text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
            >
              {dep} <span className="text-on-surface-variant/70">({items.length})</span>
            </a>
          ))}
        </nav>
      )}

      {grupos.map(({ dep, items }) => (
        <section key={dep} id={slugDepartamento(dep)} className="mt-10 scroll-mt-24">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-lg font-semibold text-on-surface">{dep}</h2>
            <Link
              href={`/capillas/${slugDepartamento(dep)}`}
              className="shrink-0 text-sm font-medium text-primary hover:underline"
            >
              Horarios de misa en {dep} →
            </Link>
          </div>
          <ul className="mt-3 divide-y divide-outline-variant/40 rounded-xl border border-outline-variant/50 bg-secondary-container">
            {items.map((l) => (
              <li key={l.slug}>
                <Link
                  href={`/capilla/${l.slug}`}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-container-high"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-on-surface">{l.nombre}</p>
                    <p className="mt-0.5 flex items-start gap-1 text-xs text-on-surface-variant">
                      <MapPin className="mt-px h-3 w-3 shrink-0" />
                      <span>
                        {TIPO_LABEL[l.tipo]}
                        {l.direccion ? ` · ${l.direccion}` : ""}
                      </span>
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-on-surface-variant" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
    </div>
  );
}
