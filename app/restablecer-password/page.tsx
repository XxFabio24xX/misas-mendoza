"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { ThemeToggle } from "@/app/components/theme-toggle";
import { CandleLoader } from "@/app/components/candle-loader";
import { supabase } from "@/lib/supabase";

const MIN_PASSWORD_LENGTH = 12;
const DEFAULT_INVALID_MESSAGE =
  "El link no es válido o expiró. Pedí uno nuevo desde la pantalla de inicio de sesión.";

type Status = "checking" | "ready" | "invalid" | "success";

// useSearchParams exige un boundary de Suspense en páginas estáticas.
export default function RestablecerPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <CandleLoader size="md" />
        </div>
      }
    >
      <RestablecerPasswordForm />
    </Suspense>
  );
}

function RestablecerPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Links de recuperación vencidos/usados: Supabase redirige acá con
  // ?error=...&error_description=... en vez de un ?code= válido. Se resuelve
  // en el render (no en el efecto) para no disparar un setState síncrono
  // apenas monta.
  const errorDescription = searchParams.get("error_description");

  const [status, setStatus] = useState<Status>(errorDescription ? "invalid" : "checking");
  const invalidMessage = errorDescription
    ? errorDescription.replace(/\+/g, " ")
    : DEFAULT_INVALID_MESSAGE;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Evita que el timeout de "link inválido" pise un estado ya resuelto por
  // el listener o por getSession (pueden llegar en cualquier orden).
  const resolvedRef = useRef(Boolean(errorDescription));

  useEffect(() => {
    if (resolvedRef.current) return;

    function markReady() {
      if (resolvedRef.current) return;
      resolvedRef.current = true;
      setStatus("ready");
    }

    // El cliente (createBrowserClient) canjea el ?code= de la URL de forma
    // automática al cargar. Puede haber terminado antes de que este efecto
    // se suscriba, así que chequeamos la sesión ya establecida...
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) markReady();
    });

    // ...y además escuchamos el evento por si el canje todavía no terminó.
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") markReady();
    });

    // Si en unos segundos no pasó ninguna de las dos cosas, el link no era
    // válido (o alguien entró a la página directamente sin uno).
    const timeout = setTimeout(() => {
      if (!resolvedRef.current) {
        resolvedRef.current = true;
        setStatus("invalid");
      }
    }, 5000);

    return () => {
      listener.subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`);
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    const { error: authError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    setStatus("success");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm rounded-2xl bg-secondary-container p-8 shadow-[0_12px_32px_rgba(118,146,131,0.08)]">
        {status === "checking" && (
          <div className="flex flex-col items-center gap-4 py-6">
            <CandleLoader size="sm" text="Verificando" />
          </div>
        )}

        {status === "invalid" && (
          <div className="py-4 text-center">
            <h1 className="text-lg font-semibold text-on-surface">Link no válido</h1>
            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
              {invalidMessage}
            </p>
            <Link
              href="/login"
              className="mt-6 flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-on-primary transition-colors hover:bg-primary-container hover:text-on-primary-container"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a iniciar sesión
            </Link>
          </div>
        )}

        {status === "success" && (
          <div className="py-4 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-lg font-semibold text-on-surface">
              Contraseña actualizada
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
              Ya podés iniciar sesión con tu nueva contraseña.
            </p>
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-on-primary transition-colors hover:bg-primary-container hover:text-on-primary-container"
            >
              Ir a iniciar sesión
            </button>
          </div>
        )}

        {status === "ready" && (
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col items-center gap-2">
              <h1 className="text-lg font-semibold text-on-surface">
                Elegí tu nueva contraseña
              </h1>
              <p className="text-center text-sm text-on-surface-variant">
                Mínimo {MIN_PASSWORD_LENGTH} caracteres.
              </p>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label htmlFor="new-password" className="text-xs font-medium text-on-surface-variant">
                  Nueva contraseña
                </label>
                <div className="relative mt-1.5">
                  <input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 pr-10 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
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
                <label htmlFor="confirm-password" className="text-xs font-medium text-on-surface-variant">
                  Confirmar contraseña
                </label>
                <input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1.5 block w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:border-primary"
                />
              </div>

              {error && (
                <div role="status" aria-live="polite" className="rounded-lg bg-error-container px-4 py-2.5 text-sm text-on-error-container">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-on-primary transition-colors hover:bg-primary-container hover:text-on-primary-container disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar nueva contraseña"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
