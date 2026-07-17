"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, ChevronRight, MapPin } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { tipoEventoColor, tipoEventoLabel } from "@/lib/eventos-tipos";
import { FilterChip } from "@/app/components/filter-chip";
import { CandleLoader } from "@/app/components/candle-loader";

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
  slug: string;
  lugares?: { nombre: string } | null;
};

function formatFecha(inicio: string, fin?: string): string {
  const start = new Date(inicio);
  if (!fin) return format(start, "EEE d MMM '•' HH:mm", { locale: es });

  const end = new Date(fin);
  const sameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();

  if (sameDay) {
    return `${format(start, "EEE d MMM", { locale: es })} • ${format(start, "HH:mm")} - ${format(end, "HH:mm")}`;
  }

  return `${format(start, "EEE d MMM", { locale: es })} - ${format(end, "EEE d MMM", { locale: es })}`;
}

export default function EventosPage() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [tipoFilter, setTipoFilter] = useState("Todos");
  const [deptoFilter, setDeptoFilter] = useState("Todos");

  useEffect(() => {
    (async () => {
      const nowISO = new Date().toISOString();
      const { data } = await supabase
        .from("eventos")
        .select("id, titulo, descripcion, fecha_inicio, fecha_fin, tipo, departamento, lugar_id, activo, slug, lugares(nombre)")
        .eq("activo", true)
        // Oculta eventos pasados: usa fecha_fin cuando existe, si no fecha_inicio.
        .or(`fecha_fin.gte.${nowISO},and(fecha_fin.is.null,fecha_inicio.gte.${nowISO})`)
        .order("fecha_inicio", { ascending: true });
      // La FK lugar_id es many-to-one: `lugares` llega como objeto, pero el
      // cliente lo infiere como array al no conocer la cardinalidad.
      if (data) setEventos(data as unknown as Evento[]);
      setLoading(false);
    })();
  }, []);

  const tipos = useMemo(() => {
    const set = new Set(eventos.map((e) => e.tipo).filter(Boolean));
    return ["Todos", ...[...set].sort()];
  }, [eventos]);

  const departamentos = useMemo(() => {
    const set = new Set(eventos.map((e) => e.departamento).filter(Boolean));
    return ["Todos", ...[...set].sort()];
  }, [eventos]);

  const filtered = useMemo(
    () =>
      eventos.filter(
        (e) =>
          (tipoFilter === "Todos" || e.tipo === tipoFilter) &&
          (deptoFilter === "Todos" || e.departamento === deptoFilter),
      ),
    [eventos, tipoFilter, deptoFilter],
  );

  return (
    <div className="mx-auto max-w-280 px-5 py-8 md:px-6 md:py-10">
      <h1 className="text-2xl font-semibold text-on-surface md:text-3xl">
        Próximos Eventos y Avisos
      </h1>
      <p className="mt-2 text-sm text-on-surface-variant">
        Descubrí las actividades de la comunidad católica en Mendoza.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {tipos.map((tipo) => (
          <FilterChip key={tipo} active={tipoFilter === tipo} onClick={() => setTipoFilter(tipo)}>
            {tipo === "Todos" ? tipo : tipoEventoLabel(tipo)}
          </FilterChip>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-on-surface-variant">
          Departamento:
        </span>
        {departamentos.map((depto) => (
          <FilterChip key={depto} active={deptoFilter === depto} onClick={() => setDeptoFilter(depto)}>
            {depto}
          </FilterChip>
        ))}
      </div>

      {loading && (
        <div className="mt-20 flex flex-col items-center gap-3 text-center">
          <CandleLoader size="sm" text="Cargando eventos" />
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <p className="mt-20 text-center text-sm text-on-surface-variant">
          No hay eventos que coincidan con los filtros seleccionados.
        </p>
      )}

      {!loading && (
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((evento) => (
            <article
              key={evento.id}
              className="group relative flex flex-col gap-4 overflow-hidden rounded-xl bg-secondary-container p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(118,146,131,0.12)]"
            >
              <div className="absolute -mr-8 -mt-8 right-0 top-0 h-32 w-32 rounded-bl-full bg-primary/5 transition-transform duration-300 group-hover:scale-110" />

              <div className="relative z-10">
                <span
                  className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${tipoEventoColor(evento.tipo)}`}
                >
                  {tipoEventoLabel(evento.tipo)}
                </span>

                <h2 className="mt-3 text-lg font-semibold text-on-surface">
                  {evento.titulo}
                </h2>

                <p className="mt-2 flex items-center gap-1.5 text-xs text-on-surface-variant">
                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                  {formatFecha(evento.fecha_inicio, evento.fecha_fin)}
                </p>

                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-on-surface-variant">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  {evento.lugares?.nombre ?? "Ubicación no disponible"}
                </p>

                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-on-surface-variant">
                  {evento.descripcion}
                </p>
              </div>

              <div className="relative z-10 mt-auto border-t border-outline-variant/30 pt-4">
                <Link
                  href={`/eventos/${evento.slug}`}
                  className="flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/70"
                >
                  Más información
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
