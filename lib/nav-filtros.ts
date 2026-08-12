/**
 * Arma el href de "/" o "/mapa" arrastrando ?dia=&horario= de la URL actual,
 * para que el filtro viaje entre Inicio y Mapa al navegar por el nav global
 * (header/bottom nav). Cualquier otro link queda intacto.
 */
export function hrefConFiltrosCompartidos(href: string): string {
  if (href !== "/" && href !== "/mapa") return href;
  if (typeof window === "undefined") return href;

  const actuales = new URLSearchParams(window.location.search);
  const params = new URLSearchParams();
  const dia = actuales.get("dia");
  const horario = actuales.get("horario");
  if (dia) params.set("dia", dia);
  if (horario) params.set("horario", horario);

  const qs = params.toString();
  return qs ? `${href}?${qs}` : href;
}
