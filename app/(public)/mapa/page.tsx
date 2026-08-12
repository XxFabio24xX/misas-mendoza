import Link from "next/link";
import { List } from "lucide-react";
import { supabasePublic } from "@/lib/supabase-public";
import GlobalMapWrapper from "@/app/components/global-map-wrapper";
import { MapFiltrosPanel } from "@/app/components/map-filtros-panel";
import type { LugarMapa } from "@/app/components/global-map";
import { GRUPO_DIA_LABELS, franjaDesdeParam, type HorarioBase } from "@/lib/misas-utils";

type LugarRow = Omit<LugarMapa, "horarios"> & { temporada_actual: string | null };
type HorarioRow = HorarioBase & { lugar_id: string };

export default async function MapaPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const diaRaw = params.dia;
  // Solo día y horario viajan al mapa (no localidad); valores desconocidos
  // se ignoran en vez de romper.
  const diaParam = typeof diaRaw === "string" && diaRaw in GRUPO_DIA_LABELS ? diaRaw : null;
  const horarioRaw = params.horario;
  const horarioParam = franjaDesdeParam(typeof horarioRaw === "string" ? horarioRaw : null);

  const { data } = await supabasePublic
    .from("lugares")
    .select("id, nombre, direccion, lat, lng, slug, temporada_actual")
    .eq("activo", true);

  const lugaresBase = ((data ?? []) as LugarRow[]).filter(
    (l) => l.lat != null && l.lng != null,
  );

  // Mismo patrón que fetchHorarios en Inicio: una segunda consulta por los
  // ids ya cargados, para poder filtrar por día/horario con lugarPasaFiltro.
  let horariosPorLugar = new Map<string, HorarioBase[]>();
  if (lugaresBase.length > 0) {
    const { data: horariosData } = await supabasePublic
      .from("horarios")
      .select("id, lugar_id, dia_semana, dia_mes, hora, temporada, reemplaza_dia")
      .in(
        "lugar_id",
        lugaresBase.map((l) => l.id),
      );
    horariosPorLugar = new Map();
    for (const h of (horariosData ?? []) as HorarioRow[]) {
      if (!horariosPorLugar.has(h.lugar_id)) horariosPorLugar.set(h.lugar_id, []);
      horariosPorLugar.get(h.lugar_id)!.push(h);
    }
  }

  const lugares: LugarMapa[] = lugaresBase.map((l) => ({
    ...l,
    horarios: horariosPorLugar.get(l.id) ?? [],
  }));

  // Vuelve a Inicio arrastrando el mismo filtro (viceversa del link "Ver en el mapa").
  const volverParams = new URLSearchParams();
  if (diaParam) volverParams.set("dia", diaParam);
  if (horarioParam) volverParams.set("horario", horarioParam);
  const volverQs = volverParams.toString();
  const volverHref = volverQs ? `/?${volverQs}` : "/";

  return (
    <div className="relative h-[calc(100dvh-9rem)] w-full md:h-[calc(100dvh-4rem)]">
      <div className="pointer-events-none absolute left-4 top-4 z-1000">
        <span className="ambient-shadow pointer-events-auto inline-block rounded-full bg-surface-container/90 px-4 py-2 text-sm font-semibold text-on-surface backdrop-blur-sm">
          Mapa de Iglesias
        </span>
      </div>
      <div className="pointer-events-none absolute right-4 top-4 z-1000">
        <Link
          href={volverHref}
          className="ambient-shadow pointer-events-auto inline-flex items-center gap-1.5 rounded-full bg-surface-container/90 px-4 py-2 text-sm font-medium text-on-surface backdrop-blur-sm transition-colors hover:bg-surface-container"
        >
          <List className="h-4 w-4" />
          Ver en lista
        </Link>
      </div>
      <MapFiltrosPanel dia={diaParam} horario={horarioParam} />
      <GlobalMapWrapper lugares={lugares} diaParam={diaParam} horarioParam={horarioParam} />
    </div>
  );
}
