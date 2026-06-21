"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { crearVoluntario } from "../actions";

const DEPARTMENTS = ["Capital", "Las Heras", "Guaymallén", "Godoy Cruz", "Maipú"];

export default function NuevoVoluntarioPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await crearVoluntario(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push("/admin/voluntarios");
  };

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
            Nuevo Voluntario
          </h1>
          <p className="mt-0.5 text-sm text-on-surface-variant">
            Creá un nuevo coordinador y asignále un departamento.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label
            htmlFor="nombre"
            className="text-sm font-medium text-on-surface"
          >
            Nombre Completo
          </label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            required
            placeholder="Ej: María Rodríguez"
            className="mt-1.5 block w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:border-primary"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="text-sm font-medium text-on-surface"
          >
            Correo Electrónico
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="off"
            placeholder="maria.r@ejemplo.com"
            className="mt-1.5 block w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:border-primary"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="text-sm font-medium text-on-surface"
          >
            Contraseña Temporal
          </label>
          <div className="relative mt-1.5">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="new-password"
              placeholder="••••••••"
              className="block w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 pr-10 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:border-primary"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant transition-colors hover:text-on-surface"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="departamento"
            className="text-sm font-medium text-on-surface"
          >
            Departamento Asignado
          </label>
          <select
            id="departamento"
            name="departamento"
            required
            defaultValue=""
            className="mt-1.5 block w-full appearance-none rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 pr-8 text-sm text-on-surface outline-none transition-colors focus:border-primary"
          >
            <option value="" disabled>
              Seleccioná un departamento...
            </option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="rounded-lg bg-error-container px-4 py-3 text-sm text-on-error-container">
            {error}
          </div>
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
            disabled={loading}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-on-primary transition-colors hover:bg-primary-container hover:text-on-primary-container disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creando...
              </>
            ) : (
              "Crear Voluntario"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
