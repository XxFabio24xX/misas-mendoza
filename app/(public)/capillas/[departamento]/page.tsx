import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ChevronRight, Clock, MapPin, Snowflake, Sun } from "lucide-react";
import { supabasePublic } from "@/lib/supabase-public";
import { DEPARTAMENTOS, departamentoDesdeSlug, slugDepartamento } from "@/lib/departamentos";
import { resumenHorarios, type HorarioBase } from "@/lib/misas-utils";
import { SITE_URL } from "@/lib/site";

// Una página por departamento ("Horarios de misa en Godoy Cruz"): es lo que
// busca la gente y lo que posiciona a los directorios que compiten. Se
// invalida junto con /capillas desde las Server Actions del panel.
export const revalidate = 3600;

export function generateStaticParams() {
  return DEPARTAMENTOS.map((d) => ({ departamento: slugDepartamento(d) }));
}

type LugarDep = {
  id: string;
  nombre: string;
  slug: string;
  tipo: "parroquia" | "capilla" | "santuario";
  direccion: string | null;
  temporada_actual: string | null;
};

type HorarioDep = HorarioBase & { lugar_id: string; tipo_actividad: string | null };

const TIPO_LABEL: Record<LugarDep["tipo"], string> = {
  parroquia: "Parroquia",
  capilla: "Capilla",
  santuario: "Santuario",
};

// cache(): generateMetadata y la página comparten la consulta por request.
const getDepartamento = cache(async (slug: string) => {
  const departamento = departamentoDesdeSlug(slug);
  if (!departamento) return null;

  const { data: lugaresData } = await supabasePublic
    .from("lugares")
    .select("id, nombre, slug, tipo, direccion, temporada_actual")
    .eq("departamento", departamento)
    .eq("activo", true)
    .order("nombre");
  const lugares = (lugaresData ?? []) as LugarDep[];
  if (lugares.length === 0) return null;

  const { data: horariosData } = await supabasePublic
    .from("horarios")
    .select("lugar_id, dia_semana, dia_mes, hora, temporada, tipo_actividad")
    .in("lugar_id", lugares.map((l) => l.id));
  const horarios = ((horariosData ?? []) as HorarioDep[]).filter(
    (h) => (h.tipo_actividad ?? "Misa") === "Misa",
  );

  return {
    departamento,
    lugares: lugares.map((l) => ({
      ...l,
      resumen: resumenHorarios(
        horarios.filter((h) => h.lugar_id === l.id),
        l.temporada_actual,
      ),
    })),
  };
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ departamento: string }>;
}): Promise<Metadata> {
  const { departamento: slug } = await params;
  const data = await getDepartamento(slug);
  if (!data) return {};
  const { departamento, lugares } = data;
  const title = `Horarios de misa en ${departamento}`;
  const description = `Horarios de misa de ${lugares.length} parroquias, capillas y santuarios de ${departamento}, Mendoza: domingos, días de semana, dirección y cómo llegar.`;
  return {
    title,
    description,
    alternates: { canonical: `/capillas/${slug}` },
    openGraph: {
      title: `${title} | Misas Mendoza`,
      description,
      images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
    },
  };
}

export default async function DepartamentoPage({
  params,
}: {
  params: Promise<{ departamento: string }>;
}) {
  const { departamento: slug } = await params;
  const data = await getDepartamento(slug);
  if (!data) notFound();
  const { departamento, lugares } = data;
  const conHorarios = lugares.filter((l) => l.resumen.length > 0).length;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Capillas", item: `${SITE_URL}/capillas` },
          { "@type": "ListItem", position: 3, name: departamento, item: `${SITE_URL}/capillas/${slug}` },
        ],
      },
      {
        "@type": "ItemList",
        name: `Horarios de misa en ${departamento}`,
        numberOfItems: lugares.length,
        itemListElement: lugares.map((l, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${SITE_URL}/capilla/${l.slug}`,
          name: l.nombre,
        })),
      },
    ],
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-16">
      <nav aria-label="Ruta" className="text-xs text-on-surface-variant">
        <Link href="/capillas" className="hover:text-primary hover:underline">
          Capillas
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-on-surface">{departamento}</span>
      </nav>

      <h1 className="mt-3 text-2xl font-semibold text-on-surface md:text-3xl">
        Horarios de misa en {departamento}
      </h1>
      <p className="mt-3 leading-relaxed text-on-surface-variant">
        {lugares.length} parroquias, capillas y santuarios de {departamento}
        {conHorarios < lugares.length ? `, ${conHorarios} con horarios cargados` : ""}.
        Los horarios los mantienen voluntarios en contacto con cada parroquia;
        entrá a cada una para ver la dirección, el mapa y los horarios
        completos. Si buscás la misa más cercana a vos, usá el{" "}
        <Link href="/" className="font-medium text-primary hover:underline">
          buscador
        </Link>
        .
      </p>

      <ul className="mt-8 space-y-4">
        {lugares.map((l) => (
          <li key={l.slug}>
            <Link
              href={`/capilla/${l.slug}`}
              className="block rounded-xl border border-outline-variant/50 bg-secondary-container p-5 transition-colors hover:border-primary/40"
            >
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-on-surface">{l.nombre}</h2>
                  <p className="mt-0.5 flex items-start gap-1 text-xs text-on-surface-variant">
                    <MapPin className="mt-px h-3 w-3 shrink-0" />
                    <span>
                      {TIPO_LABEL[l.tipo]}
                      {l.direccion ? ` · ${l.direccion}` : ""}
                    </span>
                  </p>
                </div>
                <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-on-surface-variant" />
              </div>

              {l.resumen.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {l.resumen.map((bloque) => (
                    <div key={bloque.temporada ?? "todo"}>
                      {bloque.temporada && (
                        <p className="flex items-center gap-1 text-xs font-medium text-primary">
                          {bloque.temporada === "Verano" ? (
                            <Sun className="h-3 w-3" />
                          ) : (
                            <Snowflake className="h-3 w-3" />
                          )}
                          {bloque.temporada}
                        </p>
                      )}
                      <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-sm">
                        {bloque.grupos.map((g) => (
                          <div key={g.label} className="contents">
                            <dt className="text-on-surface-variant">{g.label}</dt>
                            <dd className="font-medium text-on-surface">{g.horas.join(" · ")}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 flex items-center gap-1.5 text-sm text-on-surface-variant">
                  <Clock className="h-3.5 w-3.5" />
                  Todavía sin horarios cargados
                </p>
              )}
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-10 text-center text-sm text-on-surface-variant">
        <Link href="/capillas" className="font-medium text-primary hover:underline">
          Ver capillas de otros departamentos
        </Link>
      </p>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
    </div>
  );
}
