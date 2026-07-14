"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { actualizarVoluntario } from "../../actions";

const DEPARTMENTS = ["Capital", "Las Heras", "Guaymallén", "Godoy Cruz", "Maipú"];

type Perfil = {
  id: string;
  nombre_completo: string;
  email: string;
  rol: string;
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

  const fetchPerfil = useCallback(async () => {
    const { data } = await supabase
      .from("perfiles")
      .select("*")
      .eq("id", id)
      .single();
    if (data) setPerfil(data as Perfil);
    else setError("No se encontró el voluntario.");
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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
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
          <label htmlFor="departamento" className="text-sm font-medium text-on-surface">Departamento Asignado</label>
          <select id="departamento" name="departamento" required defaultValue={perfil?.departamento_asignado ?? ""}
            className="mt-1.5 block w-full appearance-none rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 pr-8 text-sm text-on-surface outline-none transition-colors focus:border-primary"
          >
            <option value="" disabled>Seleccioná un departamento...</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

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
