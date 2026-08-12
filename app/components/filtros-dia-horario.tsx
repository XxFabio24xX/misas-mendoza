import { FRANJAS_HORARIAS, GRUPOS_DIAS, type FranjaHoraria } from "@/lib/misas-utils";
import { FilterChip } from "@/app/components/filter-chip";

type Props = {
  selectedDias: Set<number>;
  horarioFilter: FranjaHoraria | null;
  /** Día actual (Date.getDay()), para saber si el grupo activo es "Hoy". */
  hoy: number;
  onToggleDia: (dias: readonly number[]) => void;
  onToggleHorario: (franja: FranjaHoraria) => void;
  /** "row": grupos lado a lado, sin wrapper propio (para insertar dentro de
   *  un flex-wrap existente, ej. junto a Localidad en Inicio desktop).
   *  "stacked": grupos apilados con separación propia (Inicio mobile, panel del mapa). */
  layout?: "row" | "stacked";
};

/**
 * Botones de filtro de "Día de misa" y "Horario" — compartidos entre Inicio
 * y el mapa para no divergir en las opciones ni en el criterio de qué
 * cuenta como grupo activo (ver GRUPOS_DIAS/FRANJAS_HORARIAS en
 * lib/misas-utils.ts).
 */
export function FiltrosDiaHorario({
  selectedDias,
  horarioFilter,
  hoy,
  onToggleDia,
  onToggleHorario,
  layout = "row",
}: Props) {
  const grupos = (
    <>
      <div role="group" aria-label="Filtrar por día de misa">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
          Día de misa
        </p>
        <div className="flex flex-wrap gap-2">
          <FilterChip
            active={selectedDias.size === 1 && selectedDias.has(hoy)}
            onClick={() => onToggleDia([hoy])}
          >
            Hoy
          </FilterChip>
          <FilterChip
            active={
              GRUPOS_DIAS.semana.every((d) => selectedDias.has(d)) &&
              selectedDias.size === GRUPOS_DIAS.semana.length
            }
            onClick={() => onToggleDia(GRUPOS_DIAS.semana)}
          >
            Lun-Vie
          </FilterChip>
          <FilterChip
            active={selectedDias.size === 1 && selectedDias.has(6)}
            onClick={() => onToggleDia(GRUPOS_DIAS.sabado)}
          >
            Sábado
          </FilterChip>
          <FilterChip
            active={selectedDias.size === 1 && selectedDias.has(0)}
            onClick={() => onToggleDia(GRUPOS_DIAS.domingo)}
          >
            Domingo
          </FilterChip>
        </div>
      </div>

      <div role="group" aria-label="Filtrar por horario">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
          Horario
        </p>
        <div className="flex flex-wrap gap-2">
          {FRANJAS_HORARIAS.map((franja) => (
            <FilterChip
              key={franja.value}
              active={horarioFilter === franja.value}
              onClick={() => onToggleHorario(franja.value)}
            >
              {franja.label}
            </FilterChip>
          ))}
        </div>
      </div>
    </>
  );

  if (layout === "stacked") {
    return <div className="space-y-5">{grupos}</div>;
  }
  return grupos;
}
