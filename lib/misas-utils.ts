export const DAYS_SHORT = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export type HorarioBase = {
  dia_semana: number;
  hora: string;
};

export function findNextMisa(horarios: HorarioBase[]): string {
  if (!horarios.length) return "—";
  const today = new Date().getDay();
  const sorted = [...horarios].sort((a, b) => {
    if (a.dia_semana !== b.dia_semana) return a.dia_semana - b.dia_semana;
    return a.hora.localeCompare(b.hora);
  });
  const fmt = (h: HorarioBase) => h.hora.slice(0, 5);
  const todayH = sorted.find((h) => h.dia_semana === today);
  if (todayH) return `Hoy, ${fmt(todayH)}`;
  const next = sorted.find((h) => h.dia_semana > today);
  if (next) return `${DAYS_SHORT[next.dia_semana]}, ${fmt(next)}`;
  return `${DAYS_SHORT[sorted[0].dia_semana]}, ${fmt(sorted[0])}`;
}

export function formatDistancia(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}
