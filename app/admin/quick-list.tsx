"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Church,
  Pencil,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { eliminarCapilla } from "@/app/admin/capillas/actions";
import ConfirmDialog from "@/app/components/confirm-dialog";
import { findNextMisa, normalizeText } from "@/lib/misas-utils";

type Lugar = {
  id: string;
  nombre: string;
  departamento: string;
  direccion: string;
  imagen_url?: string | null;
  telefono?: string | null;
  decanato?: string | null;
  descripcion?: string | null;
  temporada_actual?: string | null;
  created_at: string;
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

export function QuickList({
  initialLugares,
  initialHorarios,
}: {
  initialLugares: Lugar[];
  initialHorarios: Horario[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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

  const horariosMap = useMemo(() => {
    const map = new Map<string, Horario[]>();
    for (const h of initialHorarios) {
      if (!map.has(h.lugar_id)) map.set(h.lugar_id, []);
      map.get(h.lugar_id)!.push(h);
    }
    return map;
  }, [initialHorarios]);

  const filtered = useMemo(
    () =>
      search.trim()
        ? initialLugares.filter((l) =>
            normalizeText(l.nombre).includes(normalizeText(search)),
          )
        : initialLugares.slice(0, 4),
    [initialLugares, search],
  );

  return (
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

      {deleteError && (
        <div
          role="status"
          aria-live="polite"
          className="mt-4 rounded-lg bg-error-container px-4 py-3 text-sm text-on-error-container"
        >
          {deleteError}
        </div>
      )}

      {filtered.length === 0 && (
        <p className="mt-8 text-center text-sm text-on-surface-variant">
          {initialLugares.length === 0
            ? "No hay capillas registradas."
            : "No se encontraron capillas que coincidan con la búsqueda."}
        </p>
      )}

      {filtered.length > 0 && (
        <>
          <div className="mt-3 space-y-3 md:hidden">
            {filtered.map((lugar) => {
              const misas = horariosMap.get(lugar.id) ?? [];
              const nextMisa = findNextMisa(misas, { temporadaActual: lugar.temporada_actual });
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
                  const nextMisa = findNextMisa(misas, { temporadaActual: lugar.temporada_actual });
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

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Eliminar capilla"
        message="¿Estás seguro? Esta acción no se puede deshacer."
        loading={deleting}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />
    </section>
  );
}
