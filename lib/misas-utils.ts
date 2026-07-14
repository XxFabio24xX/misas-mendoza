export const DAYS_SHORT = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export type HorarioBase = {
  dia_semana: number | null;
  hora: string;
  dia_mes?: number | null;
  temporada?: string | null;
  reemplaza_dia?: boolean | null;
};

export type FindNextMisaOpts = {
  /** Temporada vigente de la capilla ('Invierno' / 'Verano'); null si no usa temporadas. */
  temporadaActual?: string | null;
  /** Inyectable para tests. */
  ahora?: Date;
};

/** Un horario aplica si es de todo el año, o si coincide con la temporada vigente.
 *  Si la capilla no tiene temporada definida, no se oculta nada. */
export function temporadaVigente(
  horario: Pick<HorarioBase, "temporada">,
  temporadaActual: string | null | undefined,
): boolean {
  if (!horario.temporada || horario.temporada === "Todo el año") return true;
  if (!temporadaActual) return true;
  return horario.temporada === temporadaActual;
}

/**
 * Próxima misa recorriendo fechas concretas: respeta la temporada vigente,
 * incluye misas mensuales fijas (dia_mes) y aplica el reemplazo del día
 * cuando una mensual está marcada con reemplaza_dia (ej.: misa de los
 * enfermos que cancela las misas normales cuando cae sábado o domingo).
 */
export function findNextMisa(horarios: HorarioBase[], opts?: FindNextMisaOpts): string {
  const ahora = opts?.ahora ?? new Date();
  const vigentes = horarios.filter((h) => temporadaVigente(h, opts?.temporadaActual));
  if (!vigentes.length) return "—";

  const fmt = (h: { hora: string }) => h.hora.slice(0, 5);
  const horaActual = `${String(ahora.getHours()).padStart(2, "0")}:${String(
    ahora.getMinutes(),
  ).padStart(2, "0")}`;

  // 62 días cubre dos ciclos mensuales completos (incluye dia_mes = 31).
  for (let offset = 0; offset < 62; offset++) {
    const fecha = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + offset);
    const mensuales = vigentes.filter((h) => h.dia_mes != null && h.dia_mes === fecha.getDate());
    const semanales = vigentes.filter(
      (h) => h.dia_semana != null && h.dia_semana === fecha.getDay(),
    );

    const hayReemplazo = mensuales.some((h) => h.reemplaza_dia);
    let candidatas = hayReemplazo ? mensuales : [...semanales, ...mensuales];

    if (offset === 0) {
      candidatas = candidatas.filter((h) => h.hora.slice(0, 5) > horaActual);
    }
    if (!candidatas.length) continue;

    candidatas.sort((a, b) => a.hora.localeCompare(b.hora));
    const label = offset === 0 ? "Hoy" : DAYS_SHORT[fecha.getDay()];
    return `${label}, ${fmt(candidatas[0])}`;
  }

  return "—";
}

/** Minúsculas y sin tildes/diacríticos, para búsquedas ("señora" ≈ "senora"). */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function formatDistancia(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

// dia_semana sigue la convención de Date.getDay() (0 = domingo), pero se
// muestra empezando el lunes para que coincida con el uso cotidiano.
export const DIAS_SEMANA = [
  { value: 1, label: "Lun" },
  { value: 2, label: "Mar" },
  { value: 3, label: "Mié" },
  { value: 4, label: "Jue" },
  { value: 5, label: "Vie" },
  { value: 6, label: "Sáb" },
  { value: 0, label: "Dom" },
] as const;

export const GRUPOS_DIAS = {
  semana: [1, 2, 3, 4, 5],
  sabado: [6],
  domingo: [0],
} as const;

export type FranjaHoraria = "manana" | "tarde" | "noche";

export const FRANJAS_HORARIAS: {
  value: FranjaHoraria;
  label: string;
  start: string;
  end: string;
}[] = [
  { value: "manana", label: "Mañana", start: "00:00:00", end: "12:00:00" },
  { value: "tarde", label: "Tarde", start: "12:00:00", end: "19:00:00" },
  { value: "noche", label: "Noche", start: "19:00:00", end: "24:00:00" },
];

export function horaEnFranja(hora: string, franja: FranjaHoraria): boolean {
  const banda = FRANJAS_HORARIAS.find((f) => f.value === franja);
  if (!banda) return false;
  return hora >= banda.start && hora < banda.end;
}
