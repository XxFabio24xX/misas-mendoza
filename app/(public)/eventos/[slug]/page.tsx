import { cache } from "react";
import type { Metadata } from "next";
import { supabasePublic } from "@/lib/supabase-public";
import { BackButton } from "@/app/components/back-button";
import { ShareButton } from "@/app/components/share-button";
import { AddToCalendarButton } from "@/app/components/add-to-calendar-button";
import MapWrapper from "@/app/components/map-wrapper";
import { notFound, permanentRedirect } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, MapPin, Navigation, Tag } from "lucide-react";
import { tipoEventoColor, tipoEventoLabel } from "@/lib/eventos-tipos";

type Evento = {
  id: string;
  titulo: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin?: string;
  tipo: string;
  departamento: string;
  lugar_id?: string;
  activo: boolean;
  ubicacion?: string;
  slug: string;
};

type Lugar = {
  id: string;
  nombre: string;
  direccion: string;
  lat: number;
  lng: number;
};

function formatFechaCompleta(inicio: string, fin?: string): string {
  const start = new Date(inicio);
  if (!fin) {
    return format(start, "EEEE d 'de' MMMM 'de' yyyy '•' HH:mm 'hs'", {
      locale: es,
    });
  }
  const end = new Date(fin);
  const sameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();

  if (sameDay) {
    return `${format(start, "EEEE d 'de' MMMM 'de' yyyy", { locale: es })} • ${format(start, "HH:mm")} – ${format(end, "HH:mm")} hs`;
  }
  return `${format(start, "d 'de' MMMM", { locale: es })} – ${format(end, "d 'de' MMMM 'de' yyyy", { locale: es })}`;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EVENTO_COLS =
  "id, titulo, descripcion, fecha_inicio, fecha_fin, tipo, departamento, lugar_id, activo, ubicacion, slug";

// cache(): generateMetadata y la página comparten la misma consulta por request.
const getEventoBySlug = cache(async (slug: string): Promise<Evento | null> => {
  const { data } = await supabasePublic
    .from("eventos")
    .select(EVENTO_COLS)
    .eq("slug", slug)
    .eq("activo", true)
    .maybeSingle();
  return (data as Evento) ?? null;
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (UUID_RE.test(slug)) return {};
  const evento = await getEventoBySlug(slug);
  if (!evento) return {};
  const description =
    evento.descripcion?.slice(0, 160) ||
    `Evento en ${evento.departamento}, Mendoza — ${formatFechaCompleta(evento.fecha_inicio, evento.fecha_fin)}.`;
  return {
    title: evento.titulo,
    description,
    openGraph: {
      title: evento.titulo,
      description,
    },
  };
}

export default async function EventoDetallePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Links viejos con UUID: redirigir permanentemente a la URL con slug.
  if (UUID_RE.test(slug)) {
    const { data } = await supabasePublic
      .from("eventos")
      .select("slug")
      .eq("id", slug)
      .maybeSingle();
    if (!data?.slug) notFound();
    permanentRedirect(`/eventos/${data.slug}`);
  }

  const evento = await getEventoBySlug(slug);
  if (!evento) notFound();

  let lugar: Lugar | null = null;
  if (evento.lugar_id) {
    const { data } = await supabasePublic
      .from("lugares")
      .select("id, nombre, direccion, lat, lng")
      .eq("id", evento.lugar_id)
      .single();
    if (data) lugar = data as Lugar;
  }

  const tipoColor = tipoEventoColor(evento.tipo);

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-280 px-5 py-6 md:px-6 md:py-8">
        <div className="flex items-center justify-between">
          <BackButton />
          <ShareButton
            title={evento.titulo}
            text={`${evento.titulo} — evento en ${evento.departamento}, Mendoza`}
          />
        </div>

        <div className="mt-6 lg:grid lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-2">
            <span
              className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${tipoColor}`}
            >
              {tipoEventoLabel(evento.tipo)}
            </span>

            <h1 className="mt-3 text-2xl font-semibold text-on-surface md:text-3xl">
              {evento.titulo}
            </h1>

            <div className="mt-4 space-y-2">
              <p className="flex items-start gap-2 text-sm text-on-surface-variant">
                <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="capitalize">
                  {formatFechaCompleta(evento.fecha_inicio, evento.fecha_fin)}
                </span>
              </p>

              {(lugar || evento.ubicacion) && (
                <p className="flex items-start gap-2 text-sm text-on-surface-variant">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>
                    {lugar ? `${lugar.nombre} — ${lugar.direccion}` : evento.ubicacion}
                  </span>
                </p>
              )}

              {evento.departamento && (
                <p className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <Tag className="h-4 w-4 shrink-0 text-primary" />
                  {evento.departamento}
                </p>
              )}
            </div>

            <AddToCalendarButton
              uid={evento.slug}
              titulo={evento.titulo}
              descripcion={evento.descripcion}
              ubicacion={lugar ? `${lugar.nombre} — ${lugar.direccion}` : evento.ubicacion}
              inicio={evento.fecha_inicio}
              fin={evento.fecha_fin}
            />

            <div className="group relative mt-6 overflow-hidden rounded-xl bg-secondary-container p-6">
              <div className="absolute -mr-8 -mt-8 right-0 top-0 h-24 w-24 rounded-bl-full bg-primary/5" />
              <p className="relative z-10 whitespace-pre-line text-sm leading-relaxed text-on-surface">
                {evento.descripcion}
              </p>
            </div>

            {lugar && (
              <div className="mt-8 lg:hidden">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-on-surface">
                  <Navigation className="h-5 w-5 text-primary" />
                  Cómo llegar
                </h2>
                <div className="mt-3">
                  <MapWrapper
                    lat={lugar.lat}
                    lng={lugar.lng}
                    nombre={lugar.nombre}
                  />
                </div>
              </div>
            )}
          </div>

          {lugar && (
            <div className="hidden lg:col-span-1 lg:block">
              <div className="glass-card ambient-shadow sticky top-24 rounded-xl border border-white/20 p-6">
                <h2 className="mb-4 flex items-center gap-2 border-b border-outline-variant/30 pb-4 text-lg font-semibold text-on-surface">
                  <Navigation className="h-5 w-5 text-primary" />
                  Cómo llegar
                </h2>
                <div>
                  <MapWrapper
                    lat={lugar.lat}
                    lng={lugar.lng}
                    nombre={lugar.nombre}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
