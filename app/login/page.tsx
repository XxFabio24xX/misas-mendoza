"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { ThemeToggle } from "@/app/components/theme-toggle";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type Mode = "login" | "forgot";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSent, setForgotSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Completá todos los campos.");
      return;
    }
    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }
    router.push("/admin");
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    if (!forgotEmail) {
      setForgotError("Ingresá tu correo electrónico.");
      return;
    }
    setForgotLoading(true);
    // Supabase no revela si el mail existe o no: siempre devuelve éxito
    // salvo errores reales (rate limit, red, etc.), así que este flujo no
    // filtra si una cuenta existe.
    const { error: authError } = await supabase.auth.resetPasswordForEmail(
      forgotEmail,
      { redirectTo: `${window.location.origin}/restablecer-password` },
    );
    setForgotLoading(false);
    if (authError) {
      setForgotError(authError.message);
      return;
    }
    setForgotSent(true);
  };

  function backToLogin() {
    setMode("login");
    setForgotEmail("");
    setForgotError(null);
    setForgotSent(false);
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      {mode === "login" ? (
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm rounded-2xl bg-secondary-container p-8 shadow-[0_12px_32px_rgba(118,146,131,0.08)]"
        >
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-lg font-semibold text-on-surface">
              Iniciar Sesión
            </h1>
            <p className="text-sm text-on-surface-variant">
              Ingresá al panel de administración
            </p>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <label htmlFor="login-email" className="text-xs font-medium text-on-surface-variant">
                Correo electrónico
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ejemplo.com"
                className="mt-1.5 block w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:border-primary"
              />
            </div>

            <div>
              <div className="flex items-center justify-between gap-2">
                <label htmlFor="login-password" className="text-xs font-medium text-on-surface-variant">
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => setMode("forgot")}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="relative mt-1.5">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
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
                  Ingresando...
                </>
              ) : (
                "Ingresar"
              )}
            </button>
          </div>

          <Link
            href="/"
            className="mt-6 flex items-center justify-center gap-1.5 text-sm text-on-surface-variant transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
        </form>
      ) : (
        <div className="w-full max-w-sm rounded-2xl bg-secondary-container p-8 shadow-[0_12px_32px_rgba(118,146,131,0.08)]">
          {forgotSent ? (
            <div className="py-4 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-lg font-semibold text-on-surface">Revisá tu correo</h1>
              <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                Si existe una cuenta con ese correo, te enviamos un mail con
                instrucciones para restablecer tu contraseña.
              </p>
              <button
                type="button"
                onClick={backToLogin}
                className="mt-6 flex w-full items-center justify-center gap-1.5 rounded-lg border border-outline-variant px-4 py-2.5 text-sm font-medium text-on-surface transition-colors hover:bg-surface-container-low"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver a iniciar sesión
              </button>
            </div>
          ) : (
            <form onSubmit={handleForgotSubmit}>
              <div className="flex flex-col items-center gap-2">
                <h1 className="text-lg font-semibold text-on-surface">
                  Recuperar contraseña
                </h1>
                <p className="text-center text-sm text-on-surface-variant">
                  Ingresá tu correo y te mandamos instrucciones para
                  restablecerla.
                </p>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <label htmlFor="forgot-email" className="text-xs font-medium text-on-surface-variant">
                    Correo electrónico
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="admin@ejemplo.com"
                    className="mt-1.5 block w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:border-primary"
                  />
                </div>

                {forgotError && (
                  <div role="status" aria-live="polite" className="rounded-lg bg-error-container px-4 py-2.5 text-sm text-on-error-container">
                    {forgotError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-on-primary transition-colors hover:bg-primary-container hover:text-on-primary-container disabled:opacity-50"
                >
                  {forgotLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar instrucciones"
                  )}
                </button>
              </div>

              <button
                type="button"
                onClick={backToLogin}
                className="mt-6 flex w-full items-center justify-center gap-1.5 text-sm text-on-surface-variant transition-colors hover:text-primary"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver a iniciar sesión
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
