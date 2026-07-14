"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Pencil, Trash2, Church, AlertTriangle, MapPin, Clock, FileWarning } from "lucide-react";
import { eliminarCapilla, solicitarBajaCapilla } from "./actions";
import ConfirmDialog from "@/app/components/confirm-dialog";
import SolicitudBajaDialog from "@/app/components/solicitud-baja-dialog";
import { findNextMisa } from "@/lib/misas-utils";

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

export function CapillasList({
  initialLugares,
  initialHorarios,
  rol,
}: {
  initialLugares: Lugar[];
  initialHorarios: Horario[];
  rol: "admin" | "editor_departamento";
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

  const horMap = useMemo(() => {
    const m = new Map<string, Horario[]>();
    for (const h of initialHorarios) {
      if (!m.has(h.lugar_id)) m.set(h.lugar_id, []);
      m.get(h.lugar_id)!.push(h);
    }
    return m;
  }, [initialHorarios]);

  const filtered = useMemo(
    () =>
      search.trim()
        ? initialLugares.filter((l) =>
            l.nombre.toLowerCase().includes(search.toLowerCase()),
          )
        : initialLugares,
    [initialLugares, search],
  );

  return (
    <div>
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
                        {rol === "admin" ? (
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
                          {rol === "admin" ? (
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
        </>
      )}
    </div>
  );
}
