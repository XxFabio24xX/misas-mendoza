"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search, Pencil, Trash2, Church, AlertTriangle, MapPin, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { eliminarCapilla } from "./actions";
import ConfirmDialog from "@/app/components/confirm-dialog";
import { findNextMisa } from "@/lib/misas-utils";

export const dynamic = "force-dynamic";

type Lugar = {
  id: string;
  nombre: string;
  departamento: string;
  direccion: string;
  telefono?: string;
  email?: string;
  created_at: string;
};

type Horario = {
  id: string;
  lugar_id: string;
  dia_semana: number;
  hora: string;
};

export default function CapillasPage() {
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

    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: perfil } = await supabase
      .from("perfiles")
      .select("*")
      .eq("id", user?.id)
      .maybeSingle();

    let query = supabase.from("lugares").select("*");
    if (
      perfil?.rol === "editor_departamento" &&
      perfil?.departamento_asignado
    ) {
      query = query.eq("departamento", perfil.departamento_asignado);
    }

    const [lugRes, horRes] = await Promise.all([
      query,
      supabase.from("horarios").select("*"),
    ]);
    if (lugRes.data) setLugares(lugRes.data as Lugar[]);
    if (horRes.data) setHorarios(horRes.data as Horario[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const horMap = useMemo(() => {
    const m = new Map<string, Horario[]>();
    for (const h of horarios) {
      if (!m.has(h.lugar_id)) m.set(h.lugar_id, []);
      m.get(h.lugar_id)!.push(h);
    }
    return m;
  }, [horarios]);

  const filtered = useMemo(
    () =>
      search.trim()
        ? lugares.filter((l) =>
            l.nombre.toLowerCase().includes(search.toLowerCase()),
          )
        : lugares,
    [lugares, search],
  );

  return (
    <div>
      <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-on-surface md:text-2xl">
            Gestión de Capillas
          </h1>
          <p className="mt-0.5 text-sm text-on-surface-variant">
            Administrá las capillas, parroquias y santuarios registrados.
          </p>
        </div>
        <Link
          href="/admin/capillas/nuevo"
          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-on-primary transition-colors hover:bg-primary-container hover:text-on-primary-container md:w-auto"
        >
          <Plus className="h-4 w-4" />
          Agregar
        </Link>
      </div>

      <div className="mt-6">
        <div className="flex items-center gap-2 border-b border-outline-variant bg-transparent px-1 py-2.5">
          <Search className="h-4 w-4 shrink-0 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-on-surface outline-none placeholder:text-on-surface-variant/50"
          />
        </div>
      </div>

      {loading && (
        <div className="mt-12 flex items-center justify-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-on-surface-variant">Cargando...</p>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <p className="mt-12 text-center text-sm text-on-surface-variant">
          {lugares.length === 0
            ? "No hay capillas registradas."
            : "No se encontraron capillas."}
        </p>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Eliminar capilla"
        message="¿Estás seguro? Esta acción no se puede deshacer."
        loading={deleting}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />

      {!loading && filtered.length > 0 && (
        <>
          <div className="mt-4 space-y-3 md:hidden">
            {filtered.map((l) => {
              const misas = horMap.get(l.id) ?? [];
              const next = findNextMisa(misas);
              return (
                <div key={l.id} className="rounded-xl bg-secondary-container p-4 shadow-[0_4px_16px_rgba(118,146,131,0.06)]">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Church className="h-5 w-5 shrink-0 text-primary/60" />
                      <span className="font-medium text-on-surface truncate">{l.nombre}</span>
                    </div>
                      <div className="flex shrink-0 gap-1">
                        <Link
                          href={`/admin/capillas/${l.id}/horarios`}
                          className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
                          title="Horarios"
                        >
                          <Clock className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/admin/capillas/${l.id}/editar`}
                          className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(l.id)}
                          className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-error"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
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
                {filtered.map((l) => {
                  const misas = horMap.get(l.id) ?? [];
                  const next = findNextMisa(misas);
                  return (
                    <tr key={l.id} className="transition-colors hover:bg-surface-container-low">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Church className="h-4 w-4 shrink-0 text-primary/60" />
                          <span className="font-medium text-on-surface">{l.nombre}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-on-surface-variant">{l.departamento}</td>
                      <td className="px-4 py-3 text-on-surface-variant max-w-[200px] truncate">{l.direccion}</td>
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
                            className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
                            title="Horarios"
                          >
                            <Clock className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/admin/capillas/${l.id}/editar`}
                            className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => setDeleteTarget(l.id)}
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
    </div>
  );
}
