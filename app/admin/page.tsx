"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Church,
  Pencil,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { eliminarCapilla } from "@/app/admin/capillas/actions";
import ConfirmDialog from "@/app/components/confirm-dialog";
import { findNextMisa, DAYS_SHORT } from "@/lib/misas-utils";

type Lugar = {
  id: string;
  nombre: string;
  departamento: string;
  direccion: string;
  imagen_url?: string | null;
  telefono?: string | null;
  decanato?: string | null;
  descripcion?: string | null;
  created_at: string;
};

type Horario = {
  id: string;
  lugar_id: string;
  dia_semana: number;
  hora: string;
};

const DEPARTMENTS = ["Capital", "Las Heras", "Guaymallén", "Godoy Cruz", "Maipú"];

function missingFields(lugar: Lugar): string[] {
  const missing: string[] = [];
  if (!lugar.direccion) missing.push("dirección");
  if (!lugar.telefono) missing.push("teléfono");
  if (!lugar.descripcion) missing.push("descripción");
  return missing;
}

export default function AdminDashboard() {
  const [lugares, setLugares] = useState<Lugar[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await eliminarCapilla(id);
    } catch (e) {
      console.error(e);
    }
    setDeleteTarget(null);
    setDeleting(false);
    fetchAll();
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [lugaresRes, horariosRes] = await Promise.all([
      supabase.from("lugares").select("*"),
      supabase.from("horarios").select("*"),
    ]);
    if (lugaresRes.data) setLugares(lugaresRes.data as Lugar[]);
    if (horariosRes.data) setHorarios(horariosRes.data as Horario[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const deptCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const d of DEPARTMENTS) counts[d] = 0;
    for (const l of lugares) {
      if (counts[l.departamento] !== undefined) counts[l.departamento]++;
    }
    return counts;
  }, [lugares]);

  const horariosMap = useMemo(() => {
    const map = new Map<string, Horario[]>();
    for (const h of horarios) {
      if (!map.has(h.lugar_id)) map.set(h.lugar_id, []);
      map.get(h.lugar_id)!.push(h);
    }
    return map;
  }, [horarios]);

  const filtered = useMemo(
    () =>
      search.trim()
        ? lugares.filter((l) =>
            l.nombre.toLowerCase().includes(search.toLowerCase()),
          )
        : lugares.slice(0, 4),
    [lugares, search],
  );

  return (
    <div>
      <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-on-surface md:text-2xl">
            Resumen Operativo
          </h1>
          <p className="mt-0.5 text-sm text-on-surface-variant">
            Vista general del estado de capillas por departamento.
          </p>
        </div>
        <Link
          href="/admin/capillas/nuevo"
          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary-container hover:text-on-primary-container md:w-auto"
        >
          <Plus className="h-4 w-4" />
          Agregar Nueva Capilla
        </Link>
      </div>

      <section className="mt-6">
        <h2 className="text-sm font-semibold text-on-surface">
          Resumen de Capillas por Departamento
        </h2>
        <div className="mt-3 grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {DEPARTMENTS.map((dept) => {
            const count = deptCounts[dept] ?? 0;
            const deptLugares = lugares.filter((l) => l.departamento === dept);
            const sinFoto = deptLugares.filter((l) => !l.imagen_url).length;
            const sinHorarios = deptLugares.filter((l) => !horariosMap.get(l.id)?.length).length;
            const incompletas = deptLugares.filter((l) => missingFields(l).length > 0).length;
            const hasIssues = sinFoto > 0 || sinHorarios > 0 || incompletas > 0;

            return (
              <div
                key={dept}
                className={`w-full wrap-break-word rounded-xl bg-secondary-container p-4 shadow-[0_4px_16px_rgba(118,146,131,0.06)] ${!hasIssues && count > 0 ? "ring-1 ring-primary/30" : ""}`}
              >
                <p className="text-sm font-semibold text-on-surface">{dept}</p>
                <p className="mt-1 text-2xl font-bold text-primary">
                  {count}
                  <span className="ml-1 text-sm font-normal text-on-surface-variant">
                    capillas
                  </span>
                </p>
                {count > 0 && (
                  <div className="mt-3 space-y-1.5">
                    {sinFoto > 0 && (
                      <p className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                        <AlertTriangle className="h-3 w-3 shrink-0 text-outline" />
                        {sinFoto} sin foto
                      </p>
                    )}
                    {sinHorarios > 0 && (
                      <p className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                        <Clock className="h-3 w-3 shrink-0 text-outline" />
                        {sinHorarios} sin horarios
                      </p>
                    )}
                    {incompletas > 0 && (
                      <p className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                        <AlertTriangle className="h-3 w-3 shrink-0 text-outline" />
                        {incompletas} incompletas
                      </p>
                    )}
                    {!hasIssues && (
                      <p className="flex items-center gap-1.5 text-xs text-primary">
                        <CheckCircle className="h-3 w-3 shrink-0" />
                        Completas
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-8">
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <h2 className="text-sm font-semibold text-on-surface">
            Gestión Rápida de Capillas
          </h2>
          <div className="flex w-full items-center gap-3 md:w-auto">
            <div className="flex flex-1 items-center gap-2 border-b border-outline-variant bg-transparent px-1 py-1.5 md:flex-initial">
              <Search className="h-4 w-4 shrink-0 text-on-surface-variant" />
              <input
                type="text"
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-sm text-on-surface outline-none placeholder:text-on-surface-variant/50 md:w-36"
              />
            </div>
            <button className="flex shrink-0 items-center gap-1 rounded-lg border border-outline-variant/50 px-3 py-1.5 text-xs font-medium text-on-surface-variant transition-colors hover:bg-surface-container">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
              </svg>
              Filtros
            </button>
          </div>
        </div>

        {loading && (
          <div className="mt-8 flex flex-col items-center gap-3 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-on-surface-variant">Cargando...</p>
          </div>
        )}

        {!loading && (
          <>
            {filtered.length === 0 && (
              <p className="mt-8 text-center text-sm text-on-surface-variant">
                {lugares.length === 0
                  ? "No hay capillas registradas."
                  : "No se encontraron capillas que coincidan con la búsqueda."}
              </p>
            )}

            {filtered.length > 0 && (
              <>
                <div className="mt-3 space-y-3 md:hidden">
                  {filtered.map((lugar) => {
                    const misas = horariosMap.get(lugar.id) ?? [];
                    const nextMisa = findNextMisa(misas);
                    const needsReview = nextMisa === "—";
                    return (
                      <div key={lugar.id} className="w-full rounded-xl bg-secondary-container p-4 shadow-[0_4px_16px_rgba(118,146,131,0.06)]">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <Church className="h-5 w-5 shrink-0 text-primary/60" />
                            <div className="min-w-0">
                              <span className="block truncate text-sm font-medium text-on-surface">{lugar.nombre}</span>
                              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                                {lugar.id.slice(0, 8)}
                              </span>
                            </div>
                          </div>
                          <Link
                            href={`/admin/capillas/${lugar.id}/editar`}
                            className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => setDeleteTarget(lugar.id)}
                            className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-error"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                          <span className="text-on-surface-variant">{lugar.departamento}</span>
                          {needsReview ? (
                            <span className="inline-block rounded-full bg-surface-container-highest px-2 py-0.5 text-xs font-medium text-on-surface-variant">Revisión Requerida</span>
                          ) : (
                            <span className="inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Activo</span>
                          )}
                        </div>
                        <p className="mt-1 text-sm">
                          {needsReview ? (
                            <span className="flex items-center gap-1 text-amber-600">
                              <AlertTriangle className="h-3.5 w-3.5" />
                              Sin horarios reg.
                            </span>
                          ) : (
                            <span className="font-medium text-primary">{nextMisa}</span>
                          )}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-3 hidden overflow-x-auto rounded-xl bg-secondary-container shadow-[0_4px_16px_rgba(118,146,131,0.06)] md:block">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-outline-variant/20">
                        <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                          Nombre
                        </th>
                        <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                          Departamento
                        </th>
                        <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                          Próxima Misa Registrada
                        </th>
                        <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                          Estado
                        </th>
                        <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10">
                      {filtered.map((lugar) => {
                        const misas = horariosMap.get(lugar.id) ?? [];
                        const nextMisa = findNextMisa(misas);
                        const needsReview = nextMisa === "—";
                        return (
                          <tr
                            key={lugar.id}
                            className="transition-colors hover:bg-surface-container-low"
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <Church className="h-4 w-4 shrink-0 text-primary/60" />
                                <div>
                                  <span className="text-sm font-medium text-on-surface">
                                    {lugar.nombre}
                                  </span>
                                  <span className="ml-2 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                                {lugar.id.slice(0, 8)}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-sm text-on-surface-variant">
                              {lugar.departamento}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-sm font-medium">
                              {needsReview ? (
                                <span className="flex items-center gap-1 text-on-surface-variant">
                                  <AlertTriangle className="h-3.5 w-3.5 text-outline" />
                                  Sin horarios reg.
                                </span>
                              ) : (
                                <span className="text-primary">{nextMisa}</span>
                              )}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3">
                              {needsReview ? (
                                <span className="inline-block rounded-full bg-surface-container-highest px-2.5 py-0.5 text-xs font-medium text-on-surface-variant">
                                  Revisión Requerida
                                </span>
                              ) : (
                                <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                                  Activo
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Link
                                  href={`/admin/capillas/${lugar.id}/editar`}
                                  className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
                                  title="Editar"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Link>
                                <button
                                  onClick={() => setDeleteTarget(lugar.id)}
                                  className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-error"
                                  title="Eliminar"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}
      </section>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Eliminar capilla"
        message="¿Estás seguro? Esta acción no se puede deshacer."
        loading={deleting}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
