import { supabase } from "@/lib/supabase";
import { BackButton } from "@/app/components/back-button";
import MapWrapper from "@/app/components/map-wrapper";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, MapPin, Navigation, Tag } from "lucide-react";
import { tipoEventoColor, tipoEventoLabel } from "@/lib/eventos-tipos";

type Evento = {
  id: number;
  titulo: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin?: string;
  tipo: string;
  zona: string;
  lugar_id?: string;
  activo: boolean;
  imagen_url?: string;
  ubicacion?: string;
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

export default async function EventoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: eventoData, error } = await supabase
    .from("eventos")
    .select("*")
    .eq("id", id)
    .eq("activo", true)
    .single();

  if (error || !eventoData) notFound();

  const evento = eventoData as Evento;

  let lugar: Lugar | null = null;
  if (evento.lugar_id) {
    const { data } = await supabase
      .from("lugares")
      .select("id, nombre, direccion, lat, lng")
      .eq("id", evento.lugar_id)
      .single();
    if (data) lugar = data as Lugar;
  }

  const tipoColor = tipoEventoColor(evento.tipo);

  return (
    <div className="min-h-screen">
      <div className="relative h-44 overflow-hidden rounded-b-xl bg-surface-container-high md:h-64">
        {evento.imagen_url && (
          <div
            className="h-full w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${evento.imagen_url})` }}
          />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent" />
        <div className="absolute left-4 top-4 z-10">
          <BackButton />
        </div>
      </div>

      <div className="mx-auto max-w-280 px-5 py-6 md:px-6 md:py-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
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

              {evento.zona && (
                <p className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <Tag className="h-4 w-4 shrink-0 text-primary" />
                  {evento.zona}
                </p>
              )}
            </div>

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
