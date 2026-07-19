"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Pencil, Trash2 } from "lucide-react";
import { eliminarVoluntario } from "./actions";
import { normalizeText } from "@/lib/misas-utils";
import ConfirmDialog from "@/app/components/confirm-dialog";

type Perfil = {
  id: string;
  nombre_completo: string;
  email: string;
  rol: "super_admin" | "admin_departamento" | "editor";
  departamento_asignado: string | null;
  activo: boolean;
};

function getInitials(name: string | null | undefined): string {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  return parts
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  admin_departamento: "Admin Depto.",
  editor: "Editor",
};

const roleColors: Record<string, string> = {
  super_admin: "bg-primary/10 text-primary",
  admin_departamento: "bg-primary/10 text-primary",
  editor: "bg-secondary-container/30 text-secondary",
};

export function VoluntariosList({
  initialPerfiles,
}: {
  initialPerfiles: Perfil[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (id: string) => {
    setDeleting(true);
    const result = await eliminarVoluntario(id);
    if (result.error) console.error(result.error);
    setDeleteTarget(null);
    setDeleting(false);
    router.refresh();
  };

  const filtered = useMemo(
    () =>
      search.trim()
        ? initialPerfiles.filter(
            (p) =>
              normalizeText(p.nombre_completo ?? "").includes(normalizeText(search)) ||
              normalizeText(p.email ?? "").includes(normalizeText(search)),
          )
        : initialPerfiles,
    [initialPerfiles, search],
  );

  return (
    <div>
      <div className="mt-6">
        <div className="flex items-center gap-2 border-b border-outline-variant bg-transparent px-1 py-2.5">
          <Search className="h-4 w-4 shrink-0 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-on-surface outline-none placeholder:text-on-surface-variant/50"
          />
        </div>
      </div>

      {filtered.length === 0 && (
        <p className="mt-12 text-center text-sm text-on-surface-variant">
          {initialPerfiles.length === 0
            ? "No hay voluntarios registrados."
            : "No se encontraron voluntarios que coincidan con la búsqueda."}
        </p>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Eliminar voluntario"
        message="¿Estás seguro? El usuario perderá el acceso al panel."
        loading={deleting}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />

      {filtered.length > 0 && (
        <>
          <div className="mt-4 space-y-3 md:hidden">
            {filtered.map((perfil) => (
              <div key={perfil.id} className="rounded-xl bg-secondary-container p-4 shadow-[0_4px_16px_rgba(118,146,131,0.06)]">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {getInitials(perfil.nombre_completo)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-on-surface truncate">
                        {perfil.nombre_completo ?? "—"}
                      </p>
                      <p className="text-xs text-on-surface-variant truncate">{perfil.email}</p>
                    </div>
                  </div>
                <div className="flex shrink-0 gap-1">
                  <Link
                    href={`/admin/voluntarios/${perfil.id}/editar`}
                    className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
                    title="Editar"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => setDeleteTarget(perfil.id)}
                    className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-error"
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 font-medium ${roleColors[perfil.rol] ?? ""}`}>
                    {roleLabels[perfil.rol] ?? perfil.rol}
                  </span>
                  <span className="rounded-full bg-surface-container-high px-2.5 py-0.5 text-on-surface-variant">
                    {perfil.departamento_asignado ?? "Sin depto."}
                  </span>
                  {perfil.activo ? (
                    <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 font-medium text-primary">Activo</span>
                  ) : (
                    <span className="inline-block rounded-full bg-surface-container-highest px-2.5 py-0.5 font-medium text-on-surface-variant">Inactivo</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 hidden overflow-x-auto rounded-xl bg-secondary-container shadow-[0_4px_16px_rgba(118,146,131,0.06)] md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/20">
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-on-surface-variant">Nombre</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-on-surface-variant">Email</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-on-surface-variant">Rol</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-on-surface-variant">Departamento</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-on-surface-variant">Estado</th>
                  <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-on-surface-variant">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {filtered.map((perfil) => (
                  <tr key={perfil.id} className="transition-colors hover:bg-surface-container-low">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {getInitials(perfil.nombre_completo)}
                        </div>
                        <span className="text-sm font-medium text-on-surface">
                          {perfil.nombre_completo ?? "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-on-surface-variant">{perfil.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${roleColors[perfil.rol] ?? ""}`}>
                        {roleLabels[perfil.rol] ?? perfil.rol}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-on-surface-variant">{perfil.departamento_asignado ?? "—"}</td>
                    <td className="px-4 py-3">
                      {perfil.activo ? (
                        <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">Activo</span>
                      ) : (
                        <span className="inline-block rounded-full bg-surface-container-highest px-2.5 py-0.5 text-xs font-medium text-on-surface-variant">Inactivo</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/voluntarios/${perfil.id}/editar`}
                          className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(perfil.id)}
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
