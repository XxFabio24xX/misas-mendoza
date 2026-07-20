"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Pencil, Trash2, Church, AlertTriangle, MapPin, Clock, FileWarning, ChevronLeft, ChevronRight } from "lucide-react";
import { eliminarCapilla, solicitarBajaCapilla } from "./actions";
import ConfirmDialog from "@/app/components/confirm-dialog";
import SolicitudBajaDialog from "@/app/components/solicitud-baja-dialog";
import { findNextMisa, normalizeText } from "@/lib/misas-utils";

type Lugar = {
  id: string;
  nombre: string;
  departamento: string;
  direccion: string;
  telefono?: string;
  email?: string;
  created_at: string;
  temporada_actual?: string | null;
  estado_verificacion?: "sin_verificar" | "en_revision" | "verificada";
};

const ESTADO_VERIF_META: Record<
  "sin_verificar" | "en_revision" | "verificada",
  { color: string; label: string }
> = {
  sin_verificar: { color: "bg-outline-variant/40", label: "Sin verificar" },
  en_revision: { color: "bg-amber-400", label: "En revisión" },
  verificada: { color: "bg-primary", label: "Datos verificados" },
};

type Horario = {
  id: string;
  lugar_id: string;
  dia_semana: number | null;
  dia_mes?: number | null;
  hora: string;
  temporada?: string | null;
  reemplaza_dia?: boolean | null;
};

const ITEMS_POR_PAGINA = 15;

export function CapillasList({
  initialLugares,
  initialHorarios,
  rol,
}: {
  initialLugares: Lugar[];
  initialHorarios: Horario[];
  rol: "super_admin" | "admin_departamento" | "editor";
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [bajaTarget, setBajaTarget] = useState<string | null>(null);
  const [bajaLoading, setBajaLoading] = useState(false);
  const [bajaError, setBajaError] = useState<string | null>(null);
  const [bajaSuccess, setBajaSuccess] = useState<string | null>(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [deptFiltro, setDeptFiltro] = useState<string | null>(null);

  // Reset a página 1 cuando cambia la búsqueda o el filtro de departamento
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPaginaActual(1);
  }, [search, deptFiltro]);

  const handleDelete = async (id: string) => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await eliminarCapilla(id);
      router.refresh();
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : "Error al eliminar");
    }
    setDeleteTarget(null);
    setDeleting(false);
  };

  const handleSolicitarBaja = async (motivo: string) => {
    if (!bajaTarget) return;
    setBajaLoading(true);
    setBajaError(null);
    try {
      await solicitarBajaCapilla(bajaTarget, motivo);
      setBajaTarget(null);
      setBajaSuccess("Solicitud enviada al administrador.");
    } catch (e) {
      setBajaError(e instanceof Error ? e.message : "Error al enviar la solicitud");
    }
    setBajaLoading(false);
  };

  useEffect(() => {
    if (!bajaSuccess) return;
    const t = setTimeout(() => setBajaSuccess(null), 5000);
    return () => clearTimeout(t);
  }, [bajaSuccess]);

  // Lista de departamentos únicos presentes en los lugares, con conteos,
  // ordenados alfabéticamente.
  const departamentos = useMemo(() => {
    const counts = new Map<string, number>();
    for (const l of initialLugares) {
      counts.set(l.departamento, (counts.get(l.departamento) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => a[0].localeCompare(b[0], "es"))
      .map(([depto, count]) => ({ depto, count }));
  }, [initialLugares]);

  const horMap = useMemo(() => {
    const m = new Map<string, Horario[]>();
    for (const h of initialHorarios) {
      if (!m.has(h.lugar_id)) m.set(h.lugar_id, []);
      m.get(h.lugar_id)!.push(h);
    }
    return m;
  }, [initialHorarios]);

  const filtered = useMemo(() => {
    let result = initialLugares;

    if (search.trim()) {
      const q = normalizeText(search);
      result = result.filter((l) => normalizeText(l.nombre).includes(q));
    }

    if (deptFiltro) {
      result = result.filter((l) => l.departamento === deptFiltro);
    }

    return result;
  }, [initialLugares, search, deptFiltro]);

  const totalPaginas = Math.ceil(filtered.length / ITEMS_POR_PAGINA);

  const capillasPaginadas = useMemo(() => {
    const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
    return filtered.slice(inicio, inicio + ITEMS_POR_PAGINA);
  }, [filtered, paginaActual]);

  return (
    <div>
      {rol === "super_admin" && (
        <div className="mb-6">
          {/* Resumen global */}
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              Capillas por departamento
            </h2>
            <span className="text-xs text-on-surface-variant/60">
              {initialLugares.length} en total
            </span>
          </div>

          {/* Grid de chips con contador — clickeables para filtrar */}
          <div className="flex flex-wrap gap-2">
            {/* Chip "Todos" */}
            <button
              onClick={() => setDeptFiltro(null)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5
                          text-xs font-medium transition-all border
                          ${
                            deptFiltro === null
                              ? "bg-[var(--color-on-surface)] text-[var(--color-surface)] border-transparent"
                              : "border-outline-variant/30 text-on-surface-variant hover:border-outline-variant hover:text-on-surface"
                          }`}
            >
              Todos
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold
                            ${
                              deptFiltro === null
                                ? "bg-[var(--color-surface)]/20 text-[var(--color-surface)]"
                                : "bg-surface-container-high text-on-surface-variant"
                            }`}
              >
                {initialLugares.length}
              </span>
            </button>

            {/* Un chip por departamento */}
            {departamentos.map(({ depto, count }) => (
              <button
                key={depto}
                onClick={() => setDeptFiltro(deptFiltro === depto ? null : depto)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5
                            text-xs font-medium transition-all border
                            ${
                              deptFiltro === depto
                                ? "bg-[var(--color-on-surface)] text-[var(--color-surface)] border-transparent"
                                : "border-outline-variant/30 text-on-surface-variant hover:border-outline-variant hover:text-on-surface"
                            }`}
              >
                {depto}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold
                              ${
                                deptFiltro === depto
                                  ? "bg-[var(--color-surface)]/20 text-[var(--color-surface)]"
                                  : "bg-surface-container-high text-on-surface-variant"
                              }`}
                >
                  {count}
                </span>
              </button>
            ))}
          </div>

          {/* Indicador de filtro activo */}
          {deptFiltro && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-on-surface-variant">
                Mostrando {filtered.length} capilla{filtered.length !== 1 ? "s" : ""} en{" "}
                {deptFiltro}
              </span>
              <button
                onClick={() => setDeptFiltro(null)}
                className="text-xs text-primary hover:underline"
              >
                Ver todas
              </button>
            </div>
          )}
        </div>
      )}

      <div className="mt-6">
        <div className="flex items-center gap-2 border-b border-outline-variant bg-transparent px-1 py-2.5">
          <Search className="h-4 w-4 shrink-0 text-on-surface-variant" />
          <input
            type="text"
            placeholder={deptFiltro ? `Buscar en ${deptFiltro}...` : "Buscar por nombre..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-on-surface outline-none placeholder:text-on-surface-variant/50"
          />
        </div>
      </div>

      {filtered.length === 0 && (
        <p className="mt-12 text-center text-sm text-on-surface-variant">
          {initialLugares.length === 0
            ? "No hay capillas registradas."
            : "No se encontraron capillas."}
        </p>
      )}

      {deleteError && (
        <div
          role="status"
          aria-live="polite"
          className="mt-4 rounded-lg bg-error-container px-4 py-3 text-sm text-on-error-container"
        >
          {deleteError}
        </div>
      )}

      {bajaError && (
        <div
          role="status"
          aria-live="polite"
          className="mt-4 rounded-lg bg-error-container px-4 py-3 text-sm text-on-error-container"
        >
          {bajaError}
        </div>
      )}

      {bajaSuccess && (
        <div
          role="status"
          aria-live="polite"
          className="mt-4 rounded-lg bg-primary/10 px-4 py-3 text-sm text-primary"
        >
          {bajaSuccess}
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Eliminar capilla"
        message="¿Estás seguro? Esta acción no se puede deshacer."
        loading={deleting}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />

      <SolicitudBajaDialog
        open={bajaTarget !== null}
        loading={bajaLoading}
        onConfirm={handleSolicitarBaja}
        onCancel={() => setBajaTarget(null)}
      />

      {filtered.length > 0 && (
        <>
          <div className="mt-4 space-y-3 md:hidden">
            {capillasPaginadas.map((l) => {
              const misas = horMap.get(l.id) ?? [];
              const next = findNextMisa(misas, { temporadaActual: l.temporada_actual });
              return (
                <div key={l.id} className="rounded-xl bg-secondary-container p-4 shadow-[0_4px_16px_rgba(118,146,131,0.06)]">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Church className="h-5 w-5 shrink-0 text-primary/60" />
                      <span className="font-medium text-on-surface truncate">{l.nombre}</span>
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${ESTADO_VERIF_META[l.estado_verificacion ?? "sin_verificar"].color}`}
                        title={ESTADO_VERIF_META[l.estado_verificacion ?? "sin_verificar"].label}
                      />
                    </div>
                      <div className="flex shrink-0 gap-1">
                        <Link
                          href={`/admin/capillas/${l.id}/horarios`}
                          className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
                          title="Gestionar horarios de misa"
                        >
                          <Clock className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/admin/capillas/${l.id}/editar`}
                          className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
                          title="Editar capilla"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        {rol !== "editor" ? (
                          <button
                            onClick={() => setDeleteTarget(l.id)}
                            aria-label="Eliminar capilla"
                            className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-error"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => setBajaTarget(l.id)}
                            aria-label="Solicitar baja de capilla"
                            className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
                            title="Solicitar baja"
                          >
                            <FileWarning className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                  </div>
                  <div className="mt-2 space-y-1 text-sm text-on-surface-variant">
                    <p className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      {l.direccion}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{l.departamento}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      {next === "—" ? (
                        <span className="text-on-surface-variant">Sin horarios</span>
                      ) : (
                        <span className="text-primary font-medium">{next}</span>
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 hidden overflow-x-auto rounded-xl bg-secondary-container shadow-[0_4px_16px_rgba(118,146,131,0.06)] md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/20">
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-on-surface-variant">Nombre</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-on-surface-variant">Departamento</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-on-surface-variant">Dirección</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-on-surface-variant">Próxima Misa</th>
                  <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-on-surface-variant">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {capillasPaginadas.map((l) => {
                  const misas = horMap.get(l.id) ?? [];
                  const next = findNextMisa(misas, { temporadaActual: l.temporada_actual });
                  return (
                    <tr key={l.id} className="transition-colors hover:bg-surface-container-low">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Church className="h-4 w-4 shrink-0 text-primary/60" />
                          <span className="font-medium text-on-surface">{l.nombre}</span>
                          <span
                            className={`h-2 w-2 shrink-0 rounded-full ${ESTADO_VERIF_META[l.estado_verificacion ?? "sin_verificar"].color}`}
                            title={ESTADO_VERIF_META[l.estado_verificacion ?? "sin_verificar"].label}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-on-surface-variant">{l.departamento}</td>
                      <td className="px-4 py-3 text-on-surface-variant max-w-50 truncate">{l.direccion}</td>
                      <td className="px-4 py-3">
                        {next === "—" ? (
                          <span className="flex items-center gap-1 text-amber-600">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            Sin horarios
                          </span>
                        ) : (
                          <span className="font-medium text-primary">{next}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/capillas/${l.id}/horarios`}
                            title="Gestionar horarios de misa"
                            className="inline-flex items-center gap-1.5
                                       rounded-lg px-3 py-1.5 text-sm
                                       text-on-surface-variant border
                                       border-outline-variant/30
                                       hover:text-primary hover:border-primary/30
                                       transition-colors"
                          >
                            <Clock className="h-3.5 w-3.5" />
                            Horarios
                          </Link>
                          <Link
                            href={`/admin/capillas/${l.id}/editar`}
                            className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
                            title="Editar capilla"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                          {rol !== "editor" ? (
                            <button
                              onClick={() => setDeleteTarget(l.id)}
                              aria-label="Eliminar capilla"
                              className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-error"
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => setBajaTarget(l.id)}
                              aria-label="Solicitar baja de capilla"
                              className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
                              title="Solicitar baja"
                            >
                              <FileWarning className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPaginas > 1 && (
            <div className="flex flex-col items-center gap-4 mt-6 pb-4">
              {/* Controles */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setPaginaActual((p) => Math.max(1, p - 1));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  disabled={paginaActual === 1}
                  className="flex items-center gap-1 px-3 h-8 rounded-lg
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

                {Array.from({ length: totalPaginas }, (_, i) => i + 1)
                  .filter(
                    (n) =>
                      n === 1 || n === totalPaginas || Math.abs(n - paginaActual) <= 1,
                  )
                  .reduce((acc: (number | "...")[], n, idx, arr) => {
                    if (idx > 0 && n - (arr[idx - 1] as number) > 1) acc.push("...");
                    acc.push(n);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    item === "..." ? (
                      <span
                        key={`d-${idx}`}
                        className="w-7 text-center text-sm text-on-surface-variant/50"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => {
                          setPaginaActual(item as number);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className={`w-8 h-8 rounded-lg text-sm font-medium
                                    transition-all
                                    ${
                                      paginaActual === item
                                        ? "bg-[var(--color-on-surface)] text-[var(--color-surface)] border border-transparent"
                                        : "border border-outline-variant/30 text-on-surface-variant hover:border-outline-variant hover:text-on-surface"
                                    }`}
                      >
                        {item}
                      </button>
                    ),
                  )}

                <div className="w-2" />

                <button
                  onClick={() => {
                    setPaginaActual((p) => Math.min(totalPaginas, p + 1));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  disabled={paginaActual === totalPaginas}
                  className="flex items-center gap-1 px-3 h-8 rounded-lg
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
                <div className="h-px w-10 bg-outline-variant/40" />
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  className="text-outline-variant/30"
                  aria-hidden="true"
                >
                  <rect x="4" y="0" width="2" height="10" rx="0.5" fill="currentColor" />
                  <rect x="0" y="3.5" width="10" height="2" rx="0.5" fill="currentColor" />
                </svg>
                <div className="h-px w-10 bg-outline-variant/40" />
              </div>

              {/* Contador */}
              <p className="text-[11px] tracking-wide text-on-surface-variant/50">
                Página {paginaActual} de {totalPaginas}
                <span className="mx-2 opacity-40">·</span>
                {filtered.length} capillas
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
