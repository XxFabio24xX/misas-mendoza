"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Clock, Heart, MapPin, Search, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  FRANJAS_HORARIAS,
  GRUPOS_DIAS,
  findNextMisa,
  formatDistancia,
  horaEnFranja,
  normalizeText,
  temporadaVigente,
  type FranjaHoraria,
} from "@/lib/misas-utils";
import { useFavorites } from "@/hooks/useFavorites";
import HeroBanner from "@/app/components/hero-banner";
import { FilterChip } from "@/app/components/filter-chip";
import { CandleLoader } from "@/app/components/candle-loader";

type Lugar = {
  id: string;
  nombre: string;
  direccion: string;
  distancia: number | null;
  departamento: string;
  lat: number;
  lng: number;
  slug: string;
  temporada_actual: string | null;
};

type Horario = {
  id: string;
  lugar_id: string;
  dia_semana: number | null;
  dia_mes: number | null;
  hora: string;
  temporada: string | null;
  reemplaza_dia: boolean | null;
};

const LUGARES_POR_PAGINA = 12;

export default function Home() {
  const [lugares, setLugares] = useState<Lugar[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noLocation, setNoLocation] = useState(false);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [selectedDias, setSelectedDias] = useState<Set<number>>(new Set());
  const [horarioFilter, setHorarioFilter] = useState<FranjaHoraria | null>(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [sheetOpen, setSheetOpen] = useState(false);
  const { isFavorite } = useFavorites();

  const departments = useMemo(() => {
    const set = new Set(lugares.map((l) => l.departamento).filter(Boolean));
    return [...set].sort();
  }, [lugares]);

  const fetchHorarios = useCallback(async (places: Lugar[]) => {
    if (!places.length) return;
    const ids = places.map((p) => p.id);
    const { data } = await supabase
      .from("horarios")
      .select("id, lugar_id, dia_semana, dia_mes, hora, temporada, reemplaza_dia")
      .in("lugar_id", ids);
    if (data) setHorarios(data as Horario[]);
  }, []);

  // Fetches location-sorted results — does NOT set global loading
  const fetchCercanos = useCallback(
    async (lat: number, lng: number) => {
      const { data, error: rpcError } = await supabase.rpc("get_lugares_cercanos", {
        user_lat: lat,
        user_lng: lng,
      });
      if (rpcError) {
        setError(rpcError.message);
      } else {
        setLugares(data as Lugar[]);
        await fetchHorarios(data as Lugar[]);
      }
    },
    [fetchHorarios],
  );

  // Fetches all places sorted by name — used as fast initial load
  const fetchFallback = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: dbError } = await supabase
      .from("lugares")
      .select("id, nombre, direccion, departamento, lat, lng, slug, temporada_actual")
      .eq("activo", true)
      .order("nombre");
    if (dbError) {
      setError(dbError.message);
    } else {
      setLugares(data as Lugar[]);
      await fetchHorarios(data as Lugar[]);
    }
    setLoading(false);
  }, [fetchHorarios]);

  // On mount: show fallback immediately and start geolocation in parallel
  useEffect(() => {
    // Initial data load on mount — fetchFallback manages its own loading/error state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchFallback();

    navigator.geolocation.getCurrentPosition(
      (position) =>
        setCoords({ lat: position.coords.latitude, lng: position.coords.longitude }),
      () => setNoLocation(true),
      { timeout: 3000, enableHighAccuracy: false },
    );
  }, [fetchFallback]);

  // When coords arrive: silently upgrade to location-sorted results
  useEffect(() => {
    if (!coords) return;
    // Reacting to a new `coords` value from the geolocation callback, not deriving it from render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNoLocation(false);
    setIsLocating(true);
    fetchCercanos(coords.lat, coords.lng).finally(() => setIsLocating(false));
  }, [coords, fetchCercanos]);

  // Reset a página 1 cuando cambia cualquier filtro existente.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPaginaActual(1);
  }, [search, activeFilter, selectedDias, horarioFilter]);

  const horariosMap = useMemo(() => {
    const map = new Map<string, Horario[]>();
    for (const h of horarios) {
      if (!map.has(h.lugar_id)) map.set(h.lugar_id, []);
      map.get(h.lugar_id)!.push(h);
    }
    return map;
  }, [horarios]);

  const toggleGrupoDias = (dias: readonly number[]) => {
    setSelectedDias((prev) => {
      const isExactMatch =
        prev.size === dias.length && dias.every((d) => prev.has(d));
      return isExactMatch ? new Set() : new Set(dias);
    });
  };

  const toggleHorario = (franja: FranjaHoraria) => {
    setHorarioFilter((prev) => (prev === franja ? null : franja));
  };

  // Día actual para el chip "Hoy" (0=Dom … 6=Sáb, como dia_semana en la DB).
  const hoy = new Date().getDay();
  // Constantes del render actual — se recalculan en el próximo re-render.
  const ahora = new Date();
  const minutosAhora = ahora.getHours() * 60 + ahora.getMinutes();
  const esFiltroPorHoy = selectedDias.size === 1 && selectedDias.has(hoy);

  const hasActiveFilters =
    activeFilter !== null ||
    selectedDias.size > 0 ||
    horarioFilter !== null ||
    search.trim() !== "";

  const clearFilters = () => {
    setActiveFilter(null);
    setSelectedDias(new Set());
    setHorarioFilter(null);
    setSearch("");
  };

  const filtered = useMemo(() => {
    let result =
      activeFilter === null
        ? lugares
        : lugares.filter((p) => p.departamento === activeFilter);
    if (search.trim()) {
      const q = normalizeText(search);
      result = result.filter(
        (p) =>
          normalizeText(p.nombre).includes(q) ||
          normalizeText(p.direccion).includes(q),
      );
    }
    // Solo capillas con al menos una misa que caiga en el día y/o franja
    // elegidos, considerando únicamente horarios de la temporada vigente.
    if (selectedDias.size > 0 || horarioFilter !== null) {
      // Calculados dentro del memo (no capturados de afuera) para que el
      // compilador de React pueda preservar la memoización: son locales al
      // cuerpo de la función, no dependencias externas inestables.
      const hoyLocal = new Date().getDay();
      const ahoraLocal = new Date();
      const minutosAhoraLocal = ahoraLocal.getHours() * 60 + ahoraLocal.getMinutes();
      const esFiltroPorHoyLocal = selectedDias.size === 1 && selectedDias.has(hoyLocal);
      result = result.filter((p) => {
        const misas = horariosMap.get(p.id) ?? [];
        return misas.some((h) => {
          if (!temporadaVigente(h, p.temporada_actual)) return false;
          if (selectedDias.size > 0 && (h.dia_semana == null || !selectedDias.has(h.dia_semana))) {
            return false;
          }
          if (horarioFilter !== null && !horaEnFranja(h.hora, horarioFilter)) {
            return false;
          }
          // Si el filtro es HOY, descartar misas que ya pasaron.
          if (esFiltroPorHoyLocal) {
            const [hs, ms] = h.hora.split(":").map(Number);
            const minutosMisa = hs * 60 + ms;
            if (minutosMisa <= minutosAhoraLocal) return false;
          }
          return true;
        });
      });
    }
    // Favoritas fijadas primero, preservando el orden (por cercanía) del resto.
    return [...result].sort((a, b) => {
      const aFav = isFavorite(a.id);
      const bFav = isFavorite(b.id);
      return aFav === bFav ? 0 : aFav ? -1 : 1;
    });
  }, [lugares, activeFilter, search, isFavorite, selectedDias, horarioFilter, horariosMap]);

  const totalPaginas = Math.ceil(filtered.length / LUGARES_POR_PAGINA);

  const lugaresPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * LUGARES_POR_PAGINA;
    return filtered.slice(inicio, inicio + LUGARES_POR_PAGINA);
  }, [filtered, paginaActual]);

  const irAPagina = (pagina: number) => {
    setPaginaActual(pagina);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="mx-auto max-w-280 space-y-8 px-4 py-10 md:px-6 md:py-16">
      <HeroBanner />

      {/* Banner informativo: verificación de datos en curso */}
      <div className="overflow-hidden rounded-full border border-outline-variant/30 bg-secondary-container px-4 py-2.5">
        <div className="flex items-center gap-3">
          <span className="shrink-0 text-base" aria-hidden="true">
            ℹ️
          </span>
          <div className="flex-1 overflow-hidden whitespace-nowrap">
            <p className="inline-block animate-marquee text-sm text-on-surface-variant">
              ⚠️ Los horarios pueden no estar actualizados — estamos verificando los datos con
              cada parroquia. Si encontrás un error, usá el botón Reportar en el detalle de cada
              capilla. ✝ Gracias por tu paciencia.
            </p>
          </div>
        </div>
      </div>

      {/* Search + Filtros: alineados al mismo eje izquierdo que la grilla */}
      <div className="space-y-6">
        <div className="group relative w-full max-w-xl">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-outline-variant transition-colors group-focus-within:text-primary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar parroquias..."
            className="w-full border-0 border-b-[1.5px] border-outline-variant bg-transparent py-4 pl-12 pr-4 text-base text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/60 focus:border-primary"
          />
        </div>

        {/* Mobile: barra compacta con botón Filtros + chips activos (patrón C) */}
        <div className="md:hidden">
          <div
            className="flex items-center gap-2 overflow-x-auto pb-1
                       scrollbar-none [-ms-overflow-style:none]
                       [scrollbar-width:none]"
          >
            {/* Botón Filtros — siempre visible */}
            <button
              onClick={() => setSheetOpen(true)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full
                          px-3 py-1.5 text-xs font-medium transition-all
                          border whitespace-nowrap
                          ${
                            hasActiveFilters
                              ? "bg-primary text-on-primary border-transparent"
                              : "border-outline-variant/40 text-on-surface-variant"
                          }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filtros
              {hasActiveFilters && (
                <span
                  className="flex h-4 w-4 items-center justify-center
                             rounded-full bg-[var(--color-surface)]/20
                             text-[10px] font-semibold"
                >
                  {[
                    activeFilter !== null,
                    selectedDias.size > 0,
                    horarioFilter !== null,
                  ].filter(Boolean).length}
                </span>
              )}
            </button>

            {/* Chip de departamento activo */}
            {activeFilter && (
              <button
                onClick={() => setActiveFilter(null)}
                className="flex shrink-0 items-center gap-1 rounded-full
                           bg-primary/10 text-primary border border-primary/20
                           px-3 py-1.5 text-xs font-medium whitespace-nowrap"
              >
                {activeFilter}
                <X className="h-3 w-3" />
              </button>
            )}

            {/* Chip de día activo */}
            {selectedDias.size > 0 && (
              <button
                onClick={() => setSelectedDias(new Set())}
                className="flex shrink-0 items-center gap-1 rounded-full
                           bg-primary/10 text-primary border border-primary/20
                           px-3 py-1.5 text-xs font-medium whitespace-nowrap"
              >
                {/* Mostrar label del grupo activo */}
                {selectedDias.size === 1 && selectedDias.has(hoy)
                  ? "Hoy"
                  : GRUPOS_DIAS.semana.every((d) => selectedDias.has(d))
                    ? "Lun-Vie"
                    : selectedDias.has(6)
                      ? "Sábado"
                      : selectedDias.has(0)
                        ? "Domingo"
                        : "Día"}
                <X className="h-3 w-3" />
              </button>
            )}

            {/* Chip de horario activo */}
            {horarioFilter && (
              <button
                onClick={() => setHorarioFilter(null)}
                className="flex shrink-0 items-center gap-1 rounded-full
                           bg-primary/10 text-primary border border-primary/20
                           px-3 py-1.5 text-xs font-medium whitespace-nowrap"
              >
                {FRANJAS_HORARIAS.find((f) => f.value === horarioFilter)?.label}
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* Desktop: layout de filtros sin cambios */}
        <div className="hidden md:block">
          <div className="flex flex-wrap items-start gap-x-10 gap-y-5">
            {/* Localidad */}
            <div role="group" aria-label="Filtrar por localidad">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                Localidad
              </p>
              <div className="flex flex-wrap gap-2">
                <FilterChip active={activeFilter === null} onClick={() => setActiveFilter(null)}>
                  Todas
                </FilterChip>
                {departments.map((dept) => (
                  <FilterChip
                    key={dept}
                    active={activeFilter === dept}
                    onClick={() => setActiveFilter(dept)}
                  >
                    {dept}
                  </FilterChip>
                ))}
              </div>
            </div>

            {/* Día de misa */}
            <div role="group" aria-label="Filtrar por día de misa">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                Día de misa
              </p>
              <div className="flex flex-wrap gap-2">
                <FilterChip
                  active={selectedDias.size === 1 && selectedDias.has(hoy)}
                  onClick={() => toggleGrupoDias([hoy])}
                >
                  Hoy
                </FilterChip>
                <FilterChip
                  active={GRUPOS_DIAS.semana.every((d) => selectedDias.has(d)) && selectedDias.size === GRUPOS_DIAS.semana.length}
                  onClick={() => toggleGrupoDias(GRUPOS_DIAS.semana)}
                >
                  Lun-Vie
                </FilterChip>
                <FilterChip
                  active={selectedDias.size === 1 && selectedDias.has(6)}
                  onClick={() => toggleGrupoDias(GRUPOS_DIAS.sabado)}
                >
                  Sábado
                </FilterChip>
                <FilterChip
                  active={selectedDias.size === 1 && selectedDias.has(0)}
                  onClick={() => toggleGrupoDias(GRUPOS_DIAS.domingo)}
                >
                  Domingo
                </FilterChip>
              </div>
            </div>

            {/* Horario */}
            <div role="group" aria-label="Filtrar por horario">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                Horario
              </p>
              <div className="flex flex-wrap gap-2">
                {FRANJAS_HORARIAS.map((franja) => (
                  <FilterChip
                    key={franja.value}
                    active={horarioFilter === franja.value}
                    onClick={() => toggleHorario(franja.value)}
                  >
                    {franja.label}
                  </FilterChip>
                ))}
              </div>
            </div>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-6 flex items-center gap-1.5 rounded-full bg-error-container px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-on-error-container transition-colors hover:bg-error/20"
            >
              <X className="h-3.5 w-3.5" />
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center gap-3 pt-8 text-center">
          <CandleLoader size="sm" text="Buscando capillas cercanas" />
        </div>
      )}

      {isLocating && !loading && (
        <p className="text-xs text-on-surface-variant animate-pulse">
          Ordenando por cercanía a tu ubicación...
        </p>
      )}

      {noLocation && !loading && !error && (
        <div className="w-full max-w-2xl rounded-xl bg-surface-container-low p-4 text-sm text-on-surface-variant">
          No pudimos obtener tu ubicación. Mostrando todas las iglesias.
        </div>
      )}

      {error && (
        <div role="status" aria-live="polite" className="w-full max-w-2xl rounded-xl bg-error-container p-4 text-sm text-on-error-container">
          {error}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="pt-8 text-center">
          <p className="text-sm text-on-surface-variant">
            No encontramos capillas que coincidan con esos filtros.
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-3 text-sm font-medium text-primary hover:underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <p className="text-xs text-on-surface-variant">
          Mostrando {(paginaActual - 1) * LUGARES_POR_PAGINA + 1}–
          {Math.min(paginaActual * LUGARES_POR_PAGINA, filtered.length)} de {filtered.length} capillas
        </p>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {lugaresPaginados.map((place) => {
            const misas = horariosMap.get(place.id) ?? [];
            // Cuando filtra HOY, solo pasar las misas de hoy que no pasaron.
            const misasParaCard = esFiltroPorHoy
              ? misas.filter((h) => {
                  if (h.dia_semana !== hoy) return false;
                  if (!temporadaVigente(h, place.temporada_actual)) return false;
                  const [hs, ms] = h.hora.split(":").map(Number);
                  return hs * 60 + ms > minutosAhora;
                })
              : misas;
            const distanciaValida =
              place.distancia != null && !isNaN(place.distancia);
            const esFavorita = isFavorite(place.id);
            return (
              <article
                key={place.id}
                className="group relative flex flex-col gap-6 overflow-hidden rounded-xl border border-outline-variant/50 bg-secondary-container p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(118,146,131,0.12)]"
              >
                {/* Decorative blob */}
                <div className="absolute -mr-8 -mt-8 right-0 top-0 h-32 w-32 rounded-bl-full bg-primary/5 transition-transform duration-300 group-hover:scale-110" />

                {/* Header */}
                <div className="relative z-10 flex items-start justify-between gap-3">
                  <h2 className="flex items-center gap-1.5 text-lg font-semibold leading-tight text-on-surface">
                    {esFavorita && (
                      <Heart
                        className="h-4 w-4 shrink-0 text-primary"
                        fill="currentColor"
                      />
                    )}
                    {place.nombre}
                  </h2>
                  {distanciaValida ? (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-medium text-on-primary whitespace-nowrap">
                      <MapPin className="h-3 w-3" />
                      {formatDistancia(place.distancia!)}
                    </span>
                  ) : (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-outline-variant/60 px-3 py-1 text-xs font-medium text-on-surface-variant whitespace-nowrap">
                      {place.departamento}
                    </span>
                  )}
                </div>

                {/* Dirección */}
                <p className="relative z-10 flex items-start gap-1.5 text-sm text-on-surface-variant">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {place.direccion}
                </p>

                {/* Próxima misa */}
                <div className="relative z-10 mt-auto border-t border-outline-variant/30 pt-4">
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    Próxima Misa
                  </p>
                  <p className="flex items-center gap-2 text-base font-medium text-primary">
                    <Clock className="h-4 w-4" />
                    {findNextMisa(misasParaCard, { temporadaActual: place.temporada_actual })}
                  </p>
                </div>

                {/* Botón */}
                <Link
                  href={`/capilla/${place.slug}`}
                  className="relative z-10 w-full rounded-lg border border-outline-variant py-3 text-center text-sm font-semibold text-on-surface transition-colors hover:bg-surface-variant"
                >
                  Detalles
                </Link>
              </article>
            );
          })}
        </div>
      )}

      {!loading && !error && totalPaginas > 1 && (
        <div className="flex flex-col items-center gap-4 mt-10 pb-8">
          {/* Números + navegación */}
          <div className="flex items-center gap-1.5">
            {/* Anterior */}
            <button
              onClick={() => irAPagina(Math.max(1, paginaActual - 1))}
              disabled={paginaActual === 1}
              className="flex items-center gap-1 px-3 h-9 rounded-lg
                         text-xs font-medium text-on-surface-variant
                         border border-outline-variant/30
                         hover:border-outline-variant hover:text-on-surface
                         disabled:opacity-25 disabled:cursor-not-allowed
                         transition-all"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Anterior
            </button>

            <div className="w-2" />

            {/* Números */}
            {Array.from({ length: totalPaginas }, (_, i) => i + 1)
              .filter((n) => {
                // Mostrar: primera, última, actual y ±1 de la actual
                return n === 1 || n === totalPaginas || Math.abs(n - paginaActual) <= 1;
              })
              .reduce((acc: (number | "...")[], n, idx, arr) => {
                if (idx > 0 && n - (arr[idx - 1] as number) > 1) {
                  acc.push("...");
                }
                acc.push(n);
                return acc;
              }, [])
              .map((item, idx) =>
                item === "..." ? (
                  <span key={`dots-${idx}`} className="w-8 text-center text-sm text-on-surface-variant/50">
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    onClick={() => irAPagina(item as number)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium
                                transition-all
                                ${
                                  paginaActual === item
                                    ? "bg-primary text-on-primary border border-transparent"
                                    : "border border-outline-variant/30 text-on-surface-variant hover:border-outline-variant hover:text-on-surface"
                                }`}
                  >
                    {item}
                  </button>
                ),
              )}

            <div className="w-2" />

            {/* Siguiente */}
            <button
              onClick={() => irAPagina(Math.min(totalPaginas, paginaActual + 1))}
              disabled={paginaActual === totalPaginas}
              className="flex items-center gap-1 px-3 h-9 rounded-lg
                         text-xs font-medium text-on-surface-variant
                         border border-outline-variant/30
                         hover:border-outline-variant hover:text-on-surface
                         disabled:opacity-25 disabled:cursor-not-allowed
                         transition-all"
            >
              Siguiente
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Separador con cruz */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-px bg-outline-variant/40" />
            <svg width="10" height="10" viewBox="0 0 10 10" className="text-outline-variant/30" aria-hidden="true">
              <rect x="4" y="0" width="2" height="10" rx="0.5" fill="currentColor" />
              <rect x="0" y="3.5" width="10" height="2" rx="0.5" fill="currentColor" />
            </svg>
            <div className="w-10 h-px bg-outline-variant/40" />
          </div>

          {/* Contador */}
          <p className="text-[11px] tracking-wide text-on-surface-variant/50">
            Página {paginaActual} de {totalPaginas}
            <span className="mx-2 opacity-40">·</span>
            {filtered.length} capillas
          </p>
        </div>
      )}

      {/* Bottom sheet — solo mobile. z-[60]: por encima del contenido pero
          por debajo del bottom nav (z-1100 en app/components/bottom-nav.tsx). */}
      {sheetOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSheetOpen(false)}
          />

          {/* Panel */}
          <div className="absolute bottom-0 left-0 right-0 bg-[var(--color-surface-container-low)] rounded-t-2xl pb-safe">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-8 rounded-full bg-outline-variant/50" />
            </div>

            <div className="px-5 pt-2 pb-6">
              {/* Título */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold text-on-surface">
                  Filtros
                </h2>
                <button
                  onClick={() => setSheetOpen(false)}
                  className="p-1 text-on-surface-variant"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Sección Localidad */}
              <div className="mb-5">
                <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                  Localidad
                </p>
                <div className="flex flex-wrap gap-2">
                  <FilterChip
                    active={activeFilter === null}
                    onClick={() => setActiveFilter(null)}
                  >
                    Todas
                  </FilterChip>
                  {departments.map((dept) => (
                    <FilterChip
                      key={dept}
                      active={activeFilter === dept}
                      onClick={() => setActiveFilter(dept)}
                    >
                      {dept}
                    </FilterChip>
                  ))}
                </div>
              </div>

              {/* Sección Día */}
              <div className="mb-5">
                <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                  Día de misa
                </p>
                <div className="flex flex-wrap gap-2">
                  <FilterChip
                    active={selectedDias.size === 1 && selectedDias.has(hoy)}
                    onClick={() => toggleGrupoDias([hoy])}
                  >
                    Hoy
                  </FilterChip>
                  <FilterChip
                    active={GRUPOS_DIAS.semana.every((d) => selectedDias.has(d)) && selectedDias.size === GRUPOS_DIAS.semana.length}
                    onClick={() => toggleGrupoDias(GRUPOS_DIAS.semana)}
                  >
                    Lun-Vie
                  </FilterChip>
                  <FilterChip
                    active={selectedDias.size === 1 && selectedDias.has(6)}
                    onClick={() => toggleGrupoDias(GRUPOS_DIAS.sabado)}
                  >
                    Sábado
                  </FilterChip>
                  <FilterChip
                    active={selectedDias.size === 1 && selectedDias.has(0)}
                    onClick={() => toggleGrupoDias(GRUPOS_DIAS.domingo)}
                  >
                    Domingo
                  </FilterChip>
                </div>
              </div>

              {/* Sección Horario */}
              <div className="mb-6">
                <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                  Horario
                </p>
                <div className="flex flex-wrap gap-2">
                  {FRANJAS_HORARIAS.map((franja) => (
                    <FilterChip
                      key={franja.value}
                      active={horarioFilter === franja.value}
                      onClick={() => toggleHorario(franja.value)}
                    >
                      {franja.label}
                    </FilterChip>
                  ))}
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3">
                {hasActiveFilters && (
                  <button
                    onClick={() => {
                      clearFilters();
                      setSheetOpen(false);
                    }}
                    className="flex-1 rounded-xl border border-outline-variant/40 py-3 text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-colors"
                  >
                    Limpiar
                  </button>
                )}
                <button
                  onClick={() => setSheetOpen(false)}
                  className="flex-1 rounded-xl bg-primary text-on-primary py-3 text-sm font-medium transition-colors"
                >
                  Ver {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
