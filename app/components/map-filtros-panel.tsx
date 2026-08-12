"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { diasDesdeGrupoParam, grupoParamDesdeDias, type FranjaHoraria } from "@/lib/misas-utils";
import { FiltrosDiaHorario } from "@/app/components/filtros-dia-horario";

type Props = {
  dia: string | null;
  horario: FranjaHoraria | null;
};

/**
 * Panel flotante de filtros día/horario sobre el mapa. Lee el filtro actual
 * por props (ya resuelto server-side en mapa/page.tsx) y escribe con
 * router.replace + usePathname — deliberadamente sin useSearchParams, para
 * no tener que envolver el mapa en un Suspense adicional.
 */
export function MapFiltrosPanel({ dia, horario }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const hoy = new Date().getDay();
  const selectedDias = diasDesdeGrupoParam(dia);
  const activeCount = (dia ? 1 : 0) + (horario ? 1 : 0);

  function aplicar(nuevoDia: string | null, nuevoHorario: FranjaHoraria | null) {
    const params = new URLSearchParams();
    if (nuevoDia) params.set("dia", nuevoDia);
    if (nuevoHorario) params.set("horario", nuevoHorario);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  // Mismo criterio de toggle que Home (toggleGrupoDias): re-clickear el
  // grupo ya activo lo apaga.
  function onToggleDia(dias: readonly number[]) {
    const isExactMatch =
      selectedDias.size === dias.length && dias.every((d) => selectedDias.has(d));
    const nuevoSet = isExactMatch ? new Set<number>() : new Set(dias);
    aplicar(grupoParamDesdeDias(nuevoSet), horario);
  }

  function onToggleHorario(franja: FranjaHoraria) {
    aplicar(dia, horario === franja ? null : franja);
  }

  return (
    <div className="pointer-events-none absolute left-4 top-16 z-1000 flex flex-col items-start gap-2">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`ambient-shadow pointer-events-auto flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium backdrop-blur-sm transition-colors ${
          activeCount > 0
            ? "bg-primary text-on-primary"
            : "bg-surface-container/90 text-on-surface hover:bg-surface-container"
        }`}
      >
        <SlidersHorizontal className="h-3.5 w-3.5" />
        Filtros
        {activeCount > 0 && (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-surface)]/20 text-[10px] font-semibold">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="ambient-shadow pointer-events-auto w-64 rounded-2xl bg-surface-container/95 p-4 backdrop-blur-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              Filtros
            </span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Cerrar filtros"
              className="text-on-surface-variant transition-colors hover:text-on-surface"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <FiltrosDiaHorario
            selectedDias={selectedDias}
            horarioFilter={horario}
            hoy={hoy}
            onToggleDia={onToggleDia}
            onToggleHorario={onToggleHorario}
            layout="stacked"
          />
        </div>
      )}
    </div>
  );
}
