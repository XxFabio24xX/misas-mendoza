"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { eliminarVoluntario } from "./actions";
import ConfirmDialog from "@/app/components/confirm-dialog";

type Perfil = {
  id: string;
  nombre_completo: string;
  email: string;
  rol: "admin" | "editor_departamento";
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
  admin: "Super Admin",
  editor_departamento: "Editor",
};

const roleColors: Record<string, string> = {
  admin: "bg-primary/10 text-primary",
  editor_departamento: "bg-secondary-container/30 text-secondary",
};

export default function VoluntariosPage() {
  const router = useRouter();
  const [perfiles, setPerfiles] = useState<Perfil[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [authCheck, setAuthCheck] = useState(true);

  const fetchPerfiles = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const { data: perfil } = await supabase
      .from("perfiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!perfil || perfil.rol !== "admin") {
      router.push("/admin");
      return;
    }

    setAuthCheck(false);

    const { data } = await supabase.from("perfiles").select("*");
    if (data) setPerfiles(data as Perfil[]);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    // Initial data load on mount — fetchPerfiles manages its own loading/auth state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPerfiles();
  }, [fetchPerfiles]);

  const handleDelete = async (id: string) => {
    setDeleting(true);
    const result = await eliminarVoluntario(id);
    if (result.error) console.error(result.error);
    setDeleteTarget(null);
    setDeleting(false);
    fetchPerfiles();
  };

  const filtered = useMemo(
    () =>
      search.trim()
        ? perfiles.filter(
            (p) =>
              (p.nombre_completo ?? "").toLowerCase().includes(search.toLowerCase()) ||
              (p.email ?? "").toLowerCase().includes(search.toLowerCase()),
          )
        : perfiles,
    [perfiles, search],
  );

  if (authCheck) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-on-surface md:text-2xl">
            Gestión de Voluntarios
          </h1>
          <p className="mt-0.5 text-sm text-on-surface-variant">
            Administrá los accesos, roles y departamentos asignados a los coordinadores.
          </p>
        </div>
        <Link
          href="/admin/voluntarios/nuevo"
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
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-on-surface outline-none placeholder:text-on-surface-variant/50"
          />
        </div>
      </div>

      {loading && (
        <div className="mt-12 flex flex-col items-center gap-3 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-on-surface-variant">Cargando voluntarios...</p>
        </div>
      )}

      {!loading && (
        <>
          {filtered.length === 0 && (
            <p className="mt-12 text-center text-sm text-on-surface-variant">
              {perfiles.length === 0
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
                            <span className="inline-block rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">Activo</span>
                          ) : (
                            <span className="inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">Inactivo</span>
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
        </>
      )}
    </div>
  );
}
