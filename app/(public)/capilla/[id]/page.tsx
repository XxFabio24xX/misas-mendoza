import { supabasePublic } from "@/lib/supabase-public";
import { BackButton } from "@/app/components/back-button";
import { FavoriteButton } from "@/app/components/favorite-button";
import MapWrapper from "@/app/components/map-wrapper";
import { Clock, Cross as CrossIcon, HandHeart, MapPin, Navigation, Snowflake, Sun } from "lucide-react";
import { notFound } from "next/navigation";

type Lugar = {
  id: string;
  nombre: string;
  direccion: string;
  telefono?: string;
  email?: string;
  imagen_url?: string;
  hay_confesiones: boolean;
  departamento: string;
  lat: number;
  lng: number;
  recibe_caritas?: boolean;
};

type Horario = {
  id: string;
  lugar_id: string;
  dia_semana: number | null;
  dia_mes: number | null;
  hora: string;
  tipo_actividad: string;
  temporada: string;
  observacion?: string;
};

const DAYS_FULL = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

const TEMPORADA_META: Record<
  string,
  { label: string; months: string; icon: "sun" | "snow" | null; style: string; headerStyle: string }
> = {
  "Todo el año": {
    label: "Todo el año",
    months: "",
    icon: null,
    style: "bg-surface-container-low",
    headerStyle: "bg-primary/8 text-primary border-primary/20",
  },
  Invierno: {
    label: "Invierno",
    months: "Marzo · Octubre",
    icon: "snow",
    style: "bg-blue-50/60 dark:bg-blue-950/20",
    headerStyle: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
  },
  Verano: {
    label: "Verano",
    months: "Noviembre · Febrero",
    icon: "sun",
    style: "bg-amber-50/60 dark:bg-amber-950/20",
    headerStyle: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
  },
};

const SEASON_ORDER = ["Todo el año", "Invierno", "Verano"];

function groupByDay(horarios: Horario[]) {
  const byDay = new Map<number, { times: string[]; tipos: string[]; obs: string[] }>();
  for (const h of horarios) {
    if (h.dia_semana == null) continue;
    const dia = h.dia_semana;
    if (!byDay.has(dia)) byDay.set(dia, { times: [], tipos: [], obs: [] });
    const entry = byDay.get(dia)!;
    entry.times.push(h.hora.slice(0, 5));
    entry.tipos.push(h.tipo_actividad ?? "Misa");
    if (h.observacion) entry.obs.push(h.observacion);
  }

  const sorted = [...byDay.entries()].sort(([a], [b]) => a - b);

  const groups: { days: number[]; times: string[]; tipos: string[]; obs: string[] }[] = [];
  for (const [day, { times, tipos, obs }] of sorted) {
    const sortedTimes = times.slice().sort();
    const sortedTipos = sortedTimes.map((t) => tipos[times.indexOf(t)]);
    const last = groups[groups.length - 1];
    if (
      last &&
      last.times.join(",") === sortedTimes.join(",") &&
      last.days[last.days.length - 1] === day - 1
    ) {
      last.days.push(day);
    } else {
      groups.push({ days: [day], times: sortedTimes, tipos: sortedTipos, obs });
    }
  }

  return groups.map((g) => ({
    label:
      g.days.length === 1
        ? DAYS_FULL[g.days[0]]
        : `${DAYS_FULL[g.days[0]]} a ${DAYS_FULL[g.days[g.days.length - 1]]}`,
    times: g.times,
    tipos: g.tipos,
    obs: g.obs,
    isSunday: g.days.includes(0),
  }));
}

export default async function CapillaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [lugarRes, horariosRes] = await Promise.all([
    supabasePublic
      .from("lugares")
      .select(
        "id, nombre, direccion, telefono, email, imagen_url, hay_confesiones, departamento, lat, lng, recibe_caritas",
      )
      .eq("id", id)
      .single(),
    supabasePublic
      .from("horarios")
      .select("id, lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion")
      .eq("lugar_id", id)
      .order("dia_semana", { ascending: true })
      .order("hora", { ascending: true }),
  ]);

  if (lugarRes.error) notFound();

  const lugar = lugarRes.data as unknown as Lugar;
  const horarios = (horariosRes.data ?? []) as Horario[];

  // Group by temporada
  const byTemporada = new Map<string, Horario[]>();
  for (const h of horarios) {
    const key = h.temporada ?? "Todo el año";
    if (!byTemporada.has(key)) byTemporada.set(key, []);
    byTemporada.get(key)!.push(h);
  }

  const temporadasPresentes = SEASON_ORDER.filter((s) => byTemporada.has(s));

  return (
    <div className="min-h-screen bg-background">
      <div className="relative h-52 overflow-hidden rounded-b-xl bg-surface-container-high md:h-72">
        {lugar.imagen_url && (
          <div
            className="h-full w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${lugar.imagen_url})` }}
          />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent" />
        <div className="absolute left-4 top-4 z-10">
          <BackButton />
        </div>
        <div className="absolute right-4 top-4 z-10">
          <FavoriteButton id={lugar.id} />
        </div>
      </div>

      <div className="mx-auto max-w-280 px-5 py-6 md:px-6 md:py-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-2">
            <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {lugar.departamento}
            </span>

            <h1 className="mt-3 text-2xl font-semibold text-on-surface md:text-3xl">
              {lugar.nombre}
            </h1>

            <p className="mt-2 flex items-start gap-1.5 text-sm text-on-surface-variant">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              {lugar.direccion}
            </p>

            {lugar.recibe_caritas && (
              // Colores fijos (no theme-aware) a propósito: el fondo #e9dec8 tampoco
              // cambia con el tema, así que el texto debe quedar igual de fijo para
              // no perder contraste en dark mode.
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#e9dec8] px-3.5 py-1.5 text-xs font-medium text-[#476254]">
                <HandHeart className="h-3.5 w-3.5 shrink-0" />
                Recibe donaciones para Cáritas
              </div>
            )}

            {(lugar.telefono || lugar.email) && (
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {lugar.telefono && (
                  <a
                    href={`tel:${lugar.telefono}`}
                    className="ambient-shadow flex items-center gap-3 rounded-xl bg-secondary-container px-4 py-3 text-sm font-medium text-on-surface transition-all hover:-translate-y-0.5"
                  >
                    <CrossIcon className="h-4 w-4 shrink-0 text-primary" />
                    {lugar.telefono}
                  </a>
                )}
                {lugar.email && (
                  <a
                    href={`mailto:${lugar.email}`}
                    className="ambient-shadow flex items-center gap-3 rounded-xl bg-secondary-container px-4 py-3 text-sm font-medium text-on-surface transition-all hover:-translate-y-0.5"
                  >
                    <CrossIcon className="h-4 w-4 shrink-0 text-primary" />
                    {lugar.email}
                  </a>
                )}
              </div>
            )}

            {lugar.hay_confesiones && (
              <div className="mt-6 rounded-xl border border-outline-variant/50 bg-surface-container-low p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-on-surface">
                  <CrossIcon className="h-4 w-4 text-primary" />
                  Confesiones Disponibles
                </p>
              </div>
            )}

            {horarios.length > 0 && (
              <section className="mt-8">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-on-surface">
                  <Clock className="h-5 w-5 text-primary" />
                  Horarios de Misa
                </h2>

                {temporadasPresentes.length > 1 && (
                  <p className="mt-1 text-sm text-on-surface-variant">
                    Esta capilla tiene horarios diferenciados según la época del año.
                  </p>
                )}

                <div className="mt-4 space-y-5">
                  {temporadasPresentes.map((temporada) => {
                    const meta = TEMPORADA_META[temporada] ?? TEMPORADA_META["Todo el año"];
                    const allInTemporada = byTemporada.get(temporada)!;
                    const grouped = groupByDay(allInTemporada);
                    const mensuales = allInTemporada.filter((h) => h.dia_mes != null);

                    return (
                      <div
                        key={temporada}
                        className={`overflow-hidden rounded-2xl border border-outline-variant/20 ambient-shadow ${meta.style}`}
                      >
                        {/* Season header */}
                        <div className={`flex items-center gap-2.5 border-b border-outline-variant/20 px-4 py-3 ${meta.headerStyle}`}>
                          {meta.icon === "snow" && <Snowflake className="h-4 w-4 shrink-0" />}
                          {meta.icon === "sun" && <Sun className="h-4 w-4 shrink-0" />}
                          <div>
                            <span className="text-sm font-bold">{meta.label}</span>
                            {meta.months && (
                              <span className="ml-2 text-xs font-normal opacity-75">
                                {meta.months}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Horarios semanales */}
                        <div className="divide-y divide-outline-variant/15 px-4">
                          {grouped.map((group) => (
                            <div
                              key={group.label}
                              className="flex items-baseline justify-between gap-4 py-3"
                            >
                              <p
                                className={`shrink-0 text-sm font-medium ${
                                  group.isSunday ? "text-primary" : "text-on-surface"
                                }`}
                              >
                                {group.label}
                              </p>
                              <div className="text-right">
                                <p className="text-sm tabular-nums text-on-surface-variant">
                                  {group.times.join(" · ")} hs
                                </p>
                                {group.obs.length > 0 && (
                                  <p className="mt-0.5 text-xs italic text-on-surface-variant/70">
                                    {group.obs[0]}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                          {/* Horarios mensuales fijos */}
                          {mensuales.map((h) => (
                            <div
                              key={h.id}
                              className="flex items-baseline justify-between gap-4 py-3"
                            >
                              <p className="shrink-0 text-sm font-medium text-on-surface">
                                Día {h.dia_mes} de cada mes
                              </p>
                              <p className="text-sm tabular-nums text-on-surface-variant">
                                {h.hora.slice(0, 5)} hs
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            <div className="mt-8 lg:hidden">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-on-surface">
                <Navigation className="h-5 w-5 text-primary" />
                Cómo llegar
              </h2>
              <div className="mt-3">
                <MapWrapper lat={lugar.lat} lng={lugar.lng} nombre={lugar.nombre} />
              </div>
            </div>
          </div>

          <div className="hidden lg:col-span-1 lg:block">
            <div className="sticky top-24 glass-card rounded-xl border border-white/20 p-6 ambient-shadow">
              <h2 className="mb-4 flex items-center gap-2 border-b border-outline-variant/30 pb-4 text-lg font-semibold text-on-surface">
                <Navigation className="h-5 w-5 text-primary" />
                Cómo llegar
              </h2>
              <div>
                <MapWrapper lat={lugar.lat} lng={lugar.lng} nombre={lugar.nombre} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
