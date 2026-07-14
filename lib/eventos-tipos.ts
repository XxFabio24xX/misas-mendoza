// Debe coincidir exactamente con los valores del enum `tipo_evento` en Supabase.
export const TIPO_EVENTO_OPTIONS = [
  { value: "jovenes", label: "Jóvenes" },
  { value: "aviso", label: "Aviso" },
  { value: "retiro", label: "Retiro" },
  { value: "especial", label: "Especial" },
] as const;

export const TIPO_EVENTO_LABELS: Record<string, string> = Object.fromEntries(
  TIPO_EVENTO_OPTIONS.map((t) => [t.value, t.label]),
);

export const TIPO_EVENTO_COLORS: Record<string, string> = {
  jovenes: "bg-primary/10 text-primary",
  aviso: "bg-surface-container-highest text-on-surface",
  retiro: "bg-tertiary-container text-on-tertiary-container",
  especial: "bg-primary-container text-on-primary-container",
};

export function tipoEventoLabel(tipo: string): string {
  return TIPO_EVENTO_LABELS[tipo] ?? tipo;
}

export function tipoEventoColor(tipo: string): string {
  return TIPO_EVENTO_COLORS[tipo] ?? "bg-tertiary-container text-on-tertiary-container";
}
