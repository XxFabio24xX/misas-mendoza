export const DAYS_SHORT = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export type HorarioBase = {
  dia_semana: number | null;
  hora: string;
};

export function findNextMisa(horarios: HorarioBase[]): string {
  if (!horarios.length) return "—";
  // Solo horarios semanales pueden usarse para calcular "próxima misa"
  const weekly = horarios.filter(
    (h): h is HorarioBase & { dia_semana: number } => h.dia_semana != null
  );
  if (!weekly.length) return "—";
  const today = new Date().getDay();
  const sorted = [...weekly].sort((a, b) => {
    if (a.dia_semana !== b.dia_semana) return a.dia_semana - b.dia_semana;
    return a.hora.localeCompare(b.hora);
  });
  const fmt = (h: { hora: string }) => h.hora.slice(0, 5);
  const todayH = sorted.find((h) => h.dia_semana === today);
  if (todayH) return `Hoy, ${fmt(todayH)}`;
  const next = sorted.find((h) => h.dia_semana > today);
  if (next) return `${DAYS_SHORT[next.dia_semana]}, ${fmt(next)}`;
  return `${DAYS_SHORT[sorted[0].dia_semana]}, ${fmt(sorted[0])}`;
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
