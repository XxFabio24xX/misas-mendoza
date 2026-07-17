"use client";

import { Suspense, useState, useTransition } from "react";
import { unstable_rethrow, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, ChevronDown, Loader2 } from "lucide-react";
import { enviarMensaje } from "./actions";

const DEPARTAMENTOS_TODOS = [
  "Capital", "Las Heras", "Guaymallén", "Godoy Cruz", "Maipú",
  "Luján de Cuyo", "San Martín", "Junín", "Rivadavia",
];

type Tipo = "sugerencia" | "error_horario";

// useSearchParams exige un boundary de Suspense en páginas estáticas.
export default function ContactoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <ContactoForm />
    </Suspense>
  );
}

function ContactoForm() {
  const searchParams = useSearchParams();
  const tipoInicial = (searchParams.get("tipo") as Tipo) === "error_horario" ? "error_horario" : "sugerencia";
  const capillaInicial = searchParams.get("capilla") || "";

  const [tipo, setTipo] = useState<Tipo>(tipoInicial);
  const [contactoAbierto, setContactoAbierto] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formKey, setFormKey] = useState(0);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      setError(null);
      try {
        await enviarMensaje(formData);
        setSuccess(true);
      } catch (e) {
        unstable_rethrow(e);
        setError(e instanceof Error ? e.message : "Error inesperado.");
      }
    });
  }

  function resetForm() {
    setSuccess(false);
    setTipo("sugerencia");
    setContactoAbierto(false);
    setFormKey((k) => k + 1);
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10 md:px-6 md:py-16">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al inicio
      </Link>

      <h1 className="mt-4 text-2xl font-semibold text-on-surface md:text-3xl">Contacto</h1>
      <p className="mt-2 text-on-surface-variant">
        ¿Encontraste un error o tenés una sugerencia? Contanos.
      </p>

      {success ? (
        <div className="py-12 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-on-surface">¡Mensaje enviado!</h2>
          <p className="mt-2 text-on-surface-variant">
            Gracias por escribirnos. Lo revisaremos a la brevedad.
          </p>
          <button onClick={resetForm} className="mt-6 text-sm text-primary hover:underline">
            Enviar otro mensaje
          </button>
        </div>
      ) : (
        <form key={formKey} action={handleSubmit} className="mt-8 space-y-6">
          <div role="group" aria-label="Tipo de mensaje">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setTipo("sugerencia")}
                aria-pressed={tipo === "sugerencia"}
                className={`cursor-pointer rounded-xl border p-4 text-left transition-colors ${
                  tipo === "sugerencia"
                    ? "border-primary bg-primary/10"
                    : "border-outline-variant/30 bg-surface-container"
                }`}
              >
                <span className="text-sm font-medium text-on-surface">
                  💬 Sugerencia o comentario
                </span>
              </button>
              <button
                type="button"
                onClick={() => setTipo("error_horario")}
                aria-pressed={tipo === "error_horario"}
                className={`cursor-pointer rounded-xl border p-4 text-left transition-colors ${
                  tipo === "error_horario"
                    ? "border-primary bg-primary/10"
                    : "border-outline-variant/30 bg-surface-container"
                }`}
              >
                <span className="text-sm font-medium text-on-surface">⚠️ Error en horarios</span>
              </button>
            </div>
            <input type="hidden" name="tipo" value={tipo} />
          </div>

          <div
            className={`grid transition-all duration-300 ease-out ${
              tipo === "error_horario" ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="space-y-4 overflow-hidden">
              <div>
                <label htmlFor="departamento" className="text-sm font-medium text-on-surface">
                  ¿En qué departamento está?
                </label>
                <select
                  id="departamento"
                  name="departamento"
                  defaultValue=""
                  className="mt-1.5 block w-full appearance-none rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 pr-8 text-sm text-on-surface outline-none transition-colors focus:border-primary"
                >
                  <option value="" disabled>Seleccioná...</option>
                  {DEPARTAMENTOS_TODOS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="lugar_nombre" className="text-sm font-medium text-on-surface">
                  Nombre de la capilla
                </label>
                <input
                  id="lugar_nombre"
                  name="lugar_nombre"
                  type="text"
                  defaultValue={capillaInicial}
                  placeholder="Ej: Parroquia San José"
                  className="mt-1.5 block w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:border-primary"
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="mensaje" className="text-sm font-medium text-on-surface">
              {tipo === "sugerencia" ? "Tu sugerencia o comentario" : "Describí el error que encontraste"}
            </label>
            <textarea
              id="mensaje"
              name="mensaje"
              rows={4}
              required
              minLength={10}
              placeholder={
                tipo === "sugerencia"
                  ? "Contanos qué mejorarías o qué te pareció la app..."
                  : "Ej: El horario del domingo está mal, la misa es a las 10 hs no a las 9 hs..."
              }
              className="mt-1.5 block w-full resize-y rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:border-primary"
            />
          </div>

          <div className="rounded-xl border border-outline-variant/30">
            <button
              type="button"
              onClick={() => setContactoAbierto((v) => !v)}
              aria-expanded={contactoAbierto}
              className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-on-surface"
            >
              ¿Querés que te contactemos?
              <ChevronDown
                className={`h-4 w-4 text-on-surface-variant transition-transform ${contactoAbierto ? "rotate-180" : ""}`}
              />
            </button>
            <div
              className={`grid transition-all duration-300 ease-out ${
                contactoAbierto ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <div className="space-y-3 px-4 pb-4">
                  <p className="text-xs text-on-surface-variant">
                    Si nos dejás tus datos podemos responderte. Es completamente opcional.
                  </p>
                  <input
                    name="nombre"
                    type="text"
                    placeholder="Tu nombre"
                    className="block w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:border-primary"
                  />
                  <input
                    name="telefono"
                    type="tel"
                    placeholder="Tu teléfono o WhatsApp"
                    className="block w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:border-primary"
                  />
                  <input
                    name="email"
                    type="email"
                    placeholder="tu@email.com"
                    className="block w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:border-primary"
                  />
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div
              role="status"
              aria-live="polite"
              className="rounded-lg bg-error-container px-4 py-3 text-sm text-on-error-container"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-on-primary transition-colors hover:bg-primary-container hover:text-on-primary-container disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Enviando...
              </>
            ) : (
              "Enviar mensaje"
            )}
          </button>
        </form>
      )}
    </div>
  );
}
