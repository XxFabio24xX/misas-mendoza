"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search, Pencil, Trash2, Calendar, MapPin, Clock } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { supabase } from "@/lib/supabase";
import { eliminarEvento } from "@/app/admin/eventos/actions";
import ConfirmDialog from "@/app/components/confirm-dialog";

export const dynamic = "force-dynamic";

type Evento = {
  id: string;
  titulo: string;
  tipo: string;
  departamento: string;
  lugar_id?: string;
  fecha_inicio: string;
  fecha_fin?: string;
  activo: boolean;
  lugares?: { nombre: string } | null;
};

function formatFecha(inicio: string, fin?: string): string {
  const s = new Date(inicio);
  if (!fin) return format(s, "EEE d MMM • HH:mm", { locale: es });
  const e = new Date(fin);
  const sameDay =
    s.getFullYear() === e.getFullYear() &&
    s.getMonth() === e.getMonth() &&
    s.getDate() === e.getDate();
  if (sameDay) return `${format(s, "EEE d MMM", { locale: es })} • ${format(s, "HH:mm")} - ${format(e, "HH:mm")}`;
  return `${format(s, "EEE d MMM", { locale: es })} - ${format(e, "EEE d MMM", { locale: es })}`;
}

const tipoColors: Record<string, string> = {
  Jóvenes: "bg-primary/10 text-primary",
  Aviso: "bg-surface-container-highest text-on-surface",
  Retiro: "bg-tertiary-container text-on-tertiary-container",
  Especial: "bg-primary-container text-on-primary-container",
};

export default function EventosPage() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await eliminarEvento(id);
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : "Error al eliminar");
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

    let query = supabase.from("eventos").select("*, lugares(nombre)");
    if (
      perfil?.rol === "editor_departamento" &&
      perfil?.departamento_asignado
    ) {
      query = query.eq("departamento", perfil.departamento_asignado);
    }
    query = query.order("fecha_inicio", { ascending: false });

    const { data } = await query;
    if (data) setEventos(data as Evento[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered = useMemo(
    () =>
      search.trim()
        ? eventos.filter((e) =>
            e.titulo.toLowerCase().includes(search.toLowerCase()),
          )
        : eventos,
    [eventos, search],
  );

  return (
    <div>
      <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-on-surface md:text-2xl">
            Gestión de Eventos
          </h1>
          <p className="mt-0.5 text-sm text-on-surface-variant">
            Administrá los eventos y avisos de la comunidad.
          </p>
        </div>
        <Link
          href="/admin/eventos/nuevo"
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
            placeholder="Buscar por título..."
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
          {eventos.length === 0
            ? "No hay eventos registrados."
            : "No se encontraron eventos."}
        </p>
      )}

      {deleteError && (
        <div className="mt-4 rounded-lg bg-error-container px-4 py-3 text-sm text-on-error-container">{deleteError}</div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Eliminar evento"
        message="¿Estás seguro? Esta acción no se puede deshacer."
        loading={deleting}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />

      {!loading && filtered.length > 0 && (
        <>
          <div className="mt-4 space-y-3 md:hidden">
            {filtered.map((e) => (
              <div key={e.id} className="rounded-xl bg-secondary-container p-4 shadow-[0_4px_16px_rgba(118,146,131,0.06)]">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Calendar className="h-5 w-5 shrink-0 text-primary/60" />
                    <span className="font-medium text-on-surface truncate">{e.titulo}</span>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Link
                      href={`/admin/eventos/${e.id}/editar`}
                      className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => setDeleteTarget(e.id)}
                      className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-error"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-2 space-y-1.5 text-sm text-on-surface-variant">
                  <p className="flex items-center gap-1.5">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${tipoColors[e.tipo] ?? "bg-surface-container text-on-surface-variant"}`}>
                      {e.tipo}
                    </span>
                    <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{e.departamento}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    {formatFecha(e.fecha_inicio, e.fecha_fin)}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {e.lugares?.nombre ?? "Sin ubicación"}
                  </p>
                  <p>
                    {e.activo ? (
                      <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">Activo</span>
                    ) : (
                      <span className="inline-block rounded-full bg-surface-container-highest px-2.5 py-0.5 text-xs font-medium text-on-surface-variant">Inactivo</span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 hidden overflow-x-auto rounded-xl bg-secondary-container shadow-[0_4px_16px_rgba(118,146,131,0.06)] md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/20">
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-on-surface-variant">Título</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-on-surface-variant">Tipo</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-on-surface-variant">Departamento</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-on-surface-variant">Fecha</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-on-surface-variant">Estado</th>
                  <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-on-surface-variant">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {filtered.map((e) => (
                  <tr key={e.id} className="transition-colors hover:bg-surface-container-low">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 shrink-0 text-primary/60" />
                        <span className="font-medium text-on-surface">{e.titulo}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${tipoColors[e.tipo] ?? "bg-surface-container text-on-surface-variant"}`}>
                        {e.tipo}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">{e.departamento}</td>
                    <td className="px-4 py-3 text-on-surface-variant text-xs">{formatFecha(e.fecha_inicio, e.fecha_fin)}</td>
                    <td className="px-4 py-3">
                      {e.activo ? (
                        <span className="inline-block rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">Activo</span>
                      ) : (
                        <span className="inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">Inactivo</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/eventos/${e.id}/editar`}
                          className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(e.id)}
                          className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-error"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
