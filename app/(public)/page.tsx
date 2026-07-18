"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Clock, Heart, MapPin, Search, X } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  DIAS_SEMANA,
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

  const toggleDia = (dia: number) => {
    setSelectedDias((prev) => {
      const next = new Set(prev);
      if (next.has(dia)) next.delete(dia);
      else next.add(dia);
      return next;
    });
  };

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
            <div className="mt-2 flex flex-wrap gap-1.5">
              {DIAS_SEMANA.map((dia) => (
                <button
                  key={dia.value}
                  onClick={() => toggleDia(dia.value)}
                  aria-pressed={selectedDias.has(dia.value)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    selectedDias.has(dia.value)
                      ? "bg-primary text-on-primary"
                      : "border border-outline-variant/50 text-on-surface-variant hover:bg-outline-variant/40"
                  }`}
                >
                  {dia.label}
                </button>
              ))}
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
            className="flex items-center gap-1.5 rounded-full bg-error-container px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-on-error-container transition-colors hover:bg-error/20"
          >
            <X className="h-3.5 w-3.5" />
            Limpiar filtros
          </button>
        )}
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
                    {findNextMisa(misas, { temporadaActual: place.temporada_actual })}
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
        <div className="flex items-center justify-center gap-2 mt-8 pb-6">
          {/* Anterior */}
          <button
            onClick={() => irAPagina(Math.max(1, paginaActual - 1))}
            disabled={paginaActual === 1}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg
                       text-sm font-medium
                       border border-outline-variant/30
                       text-on-surface-variant
                       hover:bg-surface-container hover:text-on-surface
                       disabled:opacity-30 disabled:cursor-not-allowed
                       transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </button>

          {/* Números de página */}
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
                <span key={`dots-${idx}`} className="px-2 text-on-surface-variant">
                  …
                </span>
              ) : (
                <button
                  key={item}
                  onClick={() => irAPagina(item as number)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium
                              transition-colors
                              ${
                                paginaActual === item
                                  ? "bg-primary text-on-primary"
                                  : "border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                              }`}
                >
                  {item}
                </button>
              ),
            )}

          {/* Siguiente */}
          <button
            onClick={() => irAPagina(Math.min(totalPaginas, paginaActual + 1))}
            disabled={paginaActual === totalPaginas}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg
                       text-sm font-medium
                       border border-outline-variant/30
                       text-on-surface-variant
                       hover:bg-surface-container hover:text-on-surface
                       disabled:opacity-30 disabled:cursor-not-allowed
                       transition-colors"
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
