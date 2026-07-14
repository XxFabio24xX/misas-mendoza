"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Check, Church, Inbox, Loader2, X } from "lucide-react";
import { aprobarSolicitudBaja, rechazarSolicitudBaja } from "./actions";
import ConfirmDialog from "@/app/components/confirm-dialog";

export type Solicitud = {
  id: string;
  motivo: string;
  estado: "pendiente" | "aprobada" | "rechazada";
  created_at: string;
  lugares: { nombre: string; departamento: string } | null;
  perfiles: { nombre_completo: string; email: string } | null;
};

export function SolicitudesList({
  initialSolicitudes,
}: {
  initialSolicitudes: Solicitud[];
}) {
  const router = useRouter();
  const [aprobarTarget, setAprobarTarget] = useState<Solicitud | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pendientes = initialSolicitudes.filter((s) => s.estado === "pendiente");
  const resueltas = initialSolicitudes.filter((s) => s.estado !== "pendiente");

  const handleAprobar = async () => {
    if (!aprobarTarget) return;
    setBusyId(aprobarTarget.id);
    setError(null);
    try {
      await aprobarSolicitudBaja(aprobarTarget.id);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al aprobar la solicitud");
    }
    setAprobarTarget(null);
    setBusyId(null);
  };

  const handleRechazar = async (id: string) => {
    setBusyId(id);
    setError(null);
    try {
      await rechazarSolicitudBaja(id);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al rechazar la solicitud");
    }
    setBusyId(null);
  };

  return (
    <div className="mt-6 space-y-8">
      {error && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-lg bg-error-container px-4 py-3 text-sm text-on-error-container"
        >
          {error}
        </div>
      )}

      <ConfirmDialog
        open={aprobarTarget !== null}
        title="Aprobar baja"
        message={`Se va a eliminar definitivamente "${aprobarTarget?.lugares?.nombre ?? "la capilla"}" junto con sus horarios. Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar capilla"
        loading={busyId !== null}
        onConfirm={handleAprobar}
        onCancel={() => setAprobarTarget(null)}
      />

      {pendientes.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-xl bg-surface-container-low py-12 text-center">
          <Inbox className="h-8 w-8 text-on-surface-variant/50" />
          <p className="text-sm text-on-surface-variant">
            No hay solicitudes pendientes.
          </p>
        </div>
      )}

      {pendientes.length > 0 && (
        <div className="space-y-3">
          {pendientes.map((s) => (
            <div
              key={s.id}
              className="rounded-xl bg-secondary-container p-5 shadow-[0_4px_16px_rgba(118,146,131,0.06)]"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-medium text-on-surface">
                    <Church className="h-4 w-4 shrink-0 text-primary/60" />
                    {s.lugares?.nombre ?? "Capilla eliminada"}
                    {s.lugares && (
                      <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {s.lugares.departamento}
                      </span>
                    )}
                  </p>
                  <p className="mt-2 whitespace-pre-line text-sm text-on-surface-variant">
                    {s.motivo}
                  </p>
                  <p className="mt-2 text-xs text-on-surface-variant/70">
                    Solicitada por {s.perfiles?.nombre_completo ?? "—"}
                    {s.perfiles?.email ? ` (${s.perfiles.email})` : ""} ·{" "}
                    {format(new Date(s.created_at), "d MMM yyyy, HH:mm", { locale: es })}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => handleRechazar(s.id)}
                    disabled={busyId !== null}
                    className="flex items-center gap-1.5 rounded-lg border border-outline-variant px-3.5 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container disabled:opacity-50"
                  >
                    {busyId === s.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                    Rechazar
                  </button>
                  <button
                    onClick={() => setAprobarTarget(s)}
                    disabled={busyId !== null}
                    className="flex items-center gap-1.5 rounded-lg bg-error px-3.5 py-2 text-sm font-medium text-on-error transition-colors hover:bg-error/90 disabled:opacity-50"
                  >
                    <Check className="h-4 w-4" />
                    Aprobar baja
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {resueltas.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-on-surface-variant">
            Resueltas
          </h2>
          <div className="mt-3 space-y-2">
            {resueltas.map((s) => (
              <div
                key={s.id}
                className="flex flex-col gap-1 rounded-lg bg-surface-container-low px-4 py-3 text-sm md:flex-row md:items-center md:justify-between"
              >
                <span className="text-on-surface">
                  {s.lugares?.nombre ?? "Capilla eliminada"}
                  <span className="ml-2 text-xs text-on-surface-variant/70">
                    {format(new Date(s.created_at), "d MMM yyyy", { locale: es })}
                  </span>
                </span>
                <span className="inline-flex w-fit items-center rounded-full bg-surface-container-highest px-2.5 py-0.5 text-xs font-medium text-on-surface-variant">
                  {s.estado === "rechazada" ? "Rechazada" : "Aprobada"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
