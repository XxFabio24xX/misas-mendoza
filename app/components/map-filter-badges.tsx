"use client";

import { X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { FRANJAS_HORARIAS, GRUPO_DIA_LABELS, type FranjaHoraria } from "@/lib/misas-utils";

type Props = {
  dia: string | null;
  horario: FranjaHoraria | null;
};

/** Badges flotantes sobre el mapa: filtros de día/horario activos, con botón
 *  para quitar cada uno. No se muestra nada si no hay filtro activo. */
export function MapFilterBadges({ dia, horario }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const diaLabel = dia ? GRUPO_DIA_LABELS[dia] : undefined;
  const horarioLabel = horario
    ? FRANJAS_HORARIAS.find((f) => f.value === horario)?.label
    : undefined;

  if (!diaLabel && !horarioLabel) return null;

  function quitar(param: "dia" | "horario") {
    const params = new URLSearchParams();
    if (param !== "dia" && dia) params.set("dia", dia);
    if (param !== "horario" && horario) params.set("horario", horario);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  const badgeCls =
    "ambient-shadow pointer-events-auto inline-flex items-center gap-1.5 rounded-full " +
    "bg-surface-container/90 px-3 py-1.5 text-xs font-medium text-on-surface " +
    "backdrop-blur-sm transition-colors hover:bg-surface-container";

  return (
    <div className="pointer-events-none absolute left-4 top-16 z-1000 flex flex-wrap gap-2">
      {diaLabel && (
        <button onClick={() => quitar("dia")} className={badgeCls} aria-label={`Quitar filtro de día: ${diaLabel}`}>
          {diaLabel}
          <X className="h-3 w-3" />
        </button>
      )}
      {horarioLabel && (
        <button
          onClick={() => quitar("horario")}
          className={badgeCls}
          aria-label={`Quitar filtro de horario: ${horarioLabel}`}
        >
          {horarioLabel}
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
