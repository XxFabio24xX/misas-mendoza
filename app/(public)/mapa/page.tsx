import { supabasePublic } from "@/lib/supabase-public";
import GlobalMapWrapper from "@/app/components/global-map-wrapper";
import type { LugarMapa } from "@/app/components/global-map";

export default async function MapaPage() {
  const { data } = await supabasePublic
    .from("lugares")
    .select("id, nombre, direccion, lat, lng, slug")
    .eq("activo", true);

  const lugares = ((data ?? []) as LugarMapa[]).filter(
    (l) => l.lat != null && l.lng != null,
  );

  return (
    <div className="relative h-[calc(100dvh-9rem)] w-full md:h-[calc(100dvh-4rem)]">
      <div className="pointer-events-none absolute left-4 top-4 z-1000">
        <span className="ambient-shadow pointer-events-auto inline-block rounded-full bg-surface-container/90 px-4 py-2 text-sm font-semibold text-on-surface backdrop-blur-sm">
          Mapa de Iglesias
        </span>
      </div>
      <GlobalMapWrapper lugares={lugares} />
    </div>
  );
}
