"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { actualizarVoluntario } from "../../actions";
import { CandleLoader } from "@/app/components/candle-loader";
import { DEPARTAMENTOS } from "@/lib/departamentos";

type Perfil = {
  id: string;
  nombre_completo: string;
  email: string;
  rol: "super_admin" | "admin_departamento" | "editor";
  departamento_asignado: string | null;
  activo: boolean;
};

export default function EditarVoluntarioPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rolSeleccionado, setRolSeleccionado] = useState<string>("editor");

  const fetchPerfil = useCallback(async () => {
    const { data } = await supabase
      .from("perfiles")
      .select("*")
      .eq("id", id)
      .single();
    if (data) {
      setPerfil(data as Perfil);
      setRolSeleccionado((data as Perfil).rol);
    } else {
      setError("No se encontró el voluntario.");
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    // Initial data load on mount — fetchPerfil manages its own loading/error state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPerfil();
  }, [fetchPerfil]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    const result = await actualizarVoluntario(id, formData);

    if (result.error) {
      setError(result.error);
      setSaving(false);
      return;
    }

    router.push("/admin/voluntarios");
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <CandleLoader size="md" />
      </div>
    );
  }

  if (error && !perfil) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
        <p className="text-sm text-on-surface-variant">{error}</p>
        <Link href="/admin/voluntarios" className="text-sm font-medium text-primary hover:underline">Volver a voluntarios</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/voluntarios"
          className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-on-surface md:text-2xl">
            Editar Voluntario
          </h1>
          <p className="mt-0.5 text-sm text-on-surface-variant">
            Modificá los datos del coordinador.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label htmlFor="nombre" className="text-sm font-medium text-on-surface">Nombre Completo</label>
          <input id="nombre" name="nombre" type="text" required defaultValue={perfil?.nombre_completo}
            className="mt-1.5 block w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:border-primary"
          />
        </div>

        <div>
          <label htmlFor="email" className="text-sm font-medium text-on-surface">Correo Electrónico</label>
          <input id="email" name="email" type="email" required defaultValue={perfil?.email}
            className="mt-1.5 block w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:border-primary"
          />
        </div>

        <div>
          <label htmlFor="rol" className="text-sm font-medium text-on-surface">Rol</label>
          <select
            id="rol"
            name="rol"
            required
            value={rolSeleccionado}
            onChange={(e) => setRolSeleccionado(e.target.value)}
            className="mt-1.5 block w-full appearance-none rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 pr-8 text-sm text-on-surface outline-none transition-colors focus:border-primary"
          >
            <option value="editor">Editor</option>
            <option value="admin_departamento">Admin de Departamento</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </div>

        {(rolSeleccionado === "editor" || rolSeleccionado === "admin_departamento") && (
          <div>
            <label htmlFor="departamento_asignado" className="text-sm font-medium text-on-surface">Departamento Asignado</label>
            <select id="departamento_asignado" name="departamento_asignado" required defaultValue={perfil?.departamento_asignado ?? ""}
              className="mt-1.5 block w-full appearance-none rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 pr-8 text-sm text-on-surface outline-none transition-colors focus:border-primary"
            >
              <option value="" disabled>Seleccioná un departamento...</option>
              {DEPARTAMENTOS.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="flex items-center gap-2.5">
            <input
              id="activo"
              name="activo"
              type="checkbox"
              defaultChecked={perfil?.activo}
              className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium text-on-surface">
              Activo
            </span>
          </label>
        </div>

        <div className="border-t border-outline-variant/20 pt-6 mt-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-4">
            Cambiar contraseña
          </h3>
          <p className="text-xs text-on-surface-variant mb-3">
            Dejá vacío si no querés cambiar la contraseña actual.
          </p>
          <input
            id="nueva_password"
            name="nueva_password"
            type="password"
            placeholder="Nueva contraseña (mínimo 12 caracteres)"
            minLength={12}
            autoComplete="new-password"
            className="block w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:border-primary"
          />
        </div>

        {error && (
          <div role="status" aria-live="polite" className="rounded-lg bg-error-container px-4 py-3 text-sm text-on-error-container">{error}</div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <Link
            href="/admin/voluntarios"
            className="flex-1 rounded-lg border border-outline-variant px-4 py-2.5 text-center text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-on-primary transition-colors hover:bg-primary-container hover:text-on-primary-container disabled:opacity-50"
          >
            {saving ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</>
            ) : (
              "Guardar Cambios"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
