"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Pencil, Trash2, Calendar, MapPin, Clock, Copy } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { eliminarEvento } from "@/app/admin/eventos/actions";
import { tipoEventoColor, tipoEventoLabel } from "@/lib/eventos-tipos";
import { normalizeText } from "@/lib/misas-utils";
import ConfirmDialog from "@/app/components/confirm-dialog";

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

export function EventosList({ initialEventos }: { initialEventos: Evento[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await eliminarEvento(id);
      router.refresh();
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : "Error al eliminar");
    }
    setDeleteTarget(null);
    setDeleting(false);
  };

  const filtered = useMemo(
    () =>
      search.trim()
        ? initialEventos.filter((e) =>
            normalizeText(e.titulo).includes(normalizeText(search)),
          )
        : initialEventos,
    [initialEventos, search],
  );

  return (
    <>
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

      {filtered.length === 0 && (
        <p className="mt-12 text-center text-sm text-on-surface-variant">
          {initialEventos.length === 0
            ? "No hay eventos registrados."
            : "No se encontraron eventos."}
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

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Eliminar evento"
        message="¿Estás seguro? Esta acción no se puede deshacer."
        loading={deleting}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />

      {filtered.length > 0 && (
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
                      href={`/admin/eventos/nuevo?duplicar=${e.id}`}
                      className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
                      title="Duplicar"
                    >
                      <Copy className="h-4 w-4" />
                    </Link>
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
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${tipoEventoColor(e.tipo)}`}>
                      {tipoEventoLabel(e.tipo)}
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
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${tipoEventoColor(e.tipo)}`}>
                        {tipoEventoLabel(e.tipo)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">{e.departamento}</td>
                    <td className="px-4 py-3 text-on-surface-variant text-xs">{formatFecha(e.fecha_inicio, e.fecha_fin)}</td>
                    <td className="px-4 py-3">
                      {e.activo ? (
                        <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">Activo</span>
                      ) : (
                        <span className="inline-block rounded-full bg-surface-container-highest px-2.5 py-0.5 text-xs font-medium text-on-surface-variant">Inactivo</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/eventos/nuevo?duplicar=${e.id}`}
                          className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
                          title="Duplicar"
                        >
                          <Copy className="h-4 w-4" />
                        </Link>
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
    </>
  );
}
