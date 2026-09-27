// Departamentos habilitados en los formularios, orden alfabético.
export const DEPARTAMENTOS = [
  "Capital",
  "Godoy Cruz",
  "Guaymallén",
  "Junín",
  "Las Heras",
  "Luján de Cuyo",
  "Maipú",
  "Rivadavia",
  "San Martín",
];

/** "Luján de Cuyo" -> "lujan-de-cuyo" (URL de /capillas/[departamento]). */
export function slugDepartamento(dep: string): string {
  return dep
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "-");
}

/** Inversa de slugDepartamento para los departamentos habilitados; null si no existe. */
export function departamentoDesdeSlug(slug: string): string | null {
  return DEPARTAMENTOS.find((d) => slugDepartamento(d) === slug) ?? null;
}
