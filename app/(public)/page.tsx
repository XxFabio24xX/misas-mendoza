"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Clock, Heart, MapPin, Search } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { findNextMisa, formatDistancia } from "@/lib/misas-utils";
import { useFavorites } from "@/hooks/useFavorites";

type Lugar = {
  id: number;
  nombre: string;
  direccion: string;
  distancia: number | null;
  departamento: string;
  lat: number;
  lng: number;
};

type Horario = {
  id: number;
  lugar_id: number;
  dia_semana: number | null;
  hora: string;
};

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
  const { isFavorite } = useFavorites();

  const departments = useMemo(() => {
    const set = new Set(lugares.map((l) => l.departamento).filter(Boolean));
    return [...set].sort();
  }, [lugares]);

  const fetchHorarios = useCallback(async (places: Lugar[]) => {
    if (!places.length) return;
    const ids = places.map((p) => p.id);
    const { data } = await supabase.from("horarios").select("*").in("lugar_id", ids);
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
      .select("*")
      .eq("activo", true)
      .order("nombre")
      .limit(50);
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

  const horariosMap = useMemo(() => {
    const map = new Map<number, Horario[]>();
    for (const h of horarios) {
      if (!map.has(h.lugar_id)) map.set(h.lugar_id, []);
      map.get(h.lugar_id)!.push(h);
    }
    return map;
  }, [horarios]);

  const filtered = useMemo(() => {
    let result =
      activeFilter === null
        ? lugares
        : lugares.filter((p) => p.departamento === activeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.nombre.toLowerCase().includes(q) ||
          p.direccion.toLowerCase().includes(q),
      );
    }
    // Favoritas fijadas primero, preservando el orden (por cercanía) del resto.
    return [...result].sort((a, b) => {
      const aFav = isFavorite(String(a.id));
      const bFav = isFavorite(String(b.id));
      return aFav === bFav ? 0 : aFav ? -1 : 1;
    });
  }, [lugares, activeFilter, search, isFavorite]);

  return (
    <div className="mx-auto max-w-280 px-5 py-10 md:px-6 md:py-16">
      {/* Search */}
      <div className="mx-auto max-w-xl">
        <div className="group relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-outline-variant transition-colors group-focus-within:text-primary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar parroquias, zonas o curas..."
            className="w-full border-0 border-b-[1.5px] border-outline-variant bg-transparent py-4 pl-12 pr-4 text-base text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/60 focus:border-primary"
          />
        </div>
      </div>

      {/* Filtros */}
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <button
          onClick={() => setActiveFilter(null)}
          className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
            activeFilter === null
              ? "bg-primary/10 text-primary border border-primary/20"
              : "border border-outline-variant/50 bg-outline-variant/40 text-on-surface hover:bg-outline-variant/60"
          }`}
        >
          Todas
        </button>
        {departments.map((dept) => (
          <button
            key={dept}
            onClick={() => setActiveFilter(dept)}
            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
              activeFilter === dept
                ? "bg-primary/10 text-primary border border-primary/20"
                : "border border-outline-variant/50 bg-outline-variant/40 text-on-surface hover:bg-outline-variant/60"
            }`}
          >
            {dept}
          </button>
        ))}
      </div>

      {loading && (
        <div className="mt-20 flex flex-col items-center gap-3 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-on-surface-variant">Cargando iglesias...</p>
        </div>
      )}

      {isLocating && !loading && (
        <p className="mt-4 text-center text-xs text-on-surface-variant animate-pulse">
          Ordenando por cercanía a tu ubicación...
        </p>
      )}

      {noLocation && !loading && !error && (
        <div className="mt-6 rounded-xl bg-surface-container-low p-4 text-center text-sm text-on-surface-variant">
          No pudimos obtener tu ubicación. Mostrando todas las iglesias.
        </div>
      )}

      {error && (
        <div role="status" aria-live="polite" className="mt-6 rounded-xl bg-error-container p-4 text-center text-sm text-on-error-container">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((place) => {
            const misas = horariosMap.get(place.id) ?? [];
            const distanciaValida =
              place.distancia != null && !isNaN(place.distancia);
            const esFavorita = isFavorite(String(place.id));
            return (
              <article
                key={place.id}
                className="group relative flex flex-col gap-6 overflow-hidden rounded-xl bg-secondary-container p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(118,146,131,0.12)]"
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
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#769283] px-3 py-1 text-xs font-medium text-white whitespace-nowrap">
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
                    {findNextMisa(misas)}
                  </p>
                </div>

                {/* Botón */}
                <Link
                  href={`/capilla/${place.id}`}
                  className="relative z-10 w-full rounded-lg border border-outline-variant py-3 text-center text-sm font-semibold text-on-surface transition-colors hover:bg-surface-variant"
                >
                  Detalles
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
