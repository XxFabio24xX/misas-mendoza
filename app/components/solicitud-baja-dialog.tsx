"use client";

import { useEffect, useRef, useState } from "react";
import { FileWarning, Loader2, X } from "lucide-react";

type SolicitudBajaDialogProps = {
  open: boolean;
  loading?: boolean;
  onConfirm: (motivo: string) => void;
  onCancel: () => void;
};

export default function SolicitudBajaDialog({
  open,
  loading = false,
  onConfirm,
  onCancel,
}: SolicitudBajaDialogProps) {
  const [motivo, setMotivo] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      // Reset on open, not derived from render — mirrors the dialog's open/close transition.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMotivo("");
      textareaRef.current?.focus();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="solicitud-baja-title"
        className="w-full max-w-sm rounded-xl bg-secondary-container p-6 shadow-[0_12px_32px_rgba(118,146,131,0.08)]"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <FileWarning className="h-5 w-5 text-primary" />
            </div>
            <h3 id="solicitud-baja-title" className="text-lg font-semibold text-on-surface">
              Solicitar baja
            </h3>
          </div>
          <button
            onClick={onCancel}
            aria-label="Cerrar"
            className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-3 text-sm text-on-surface-variant">
          Un administrador va a revisar la solicitud antes de eliminar la capilla. Contanos el motivo.
        </p>

        <label htmlFor="solicitud-baja-motivo" className="sr-only">
          Motivo de la baja
        </label>
        <textarea
          id="solicitud-baja-motivo"
          ref={textareaRef}
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          rows={4}
          required
          placeholder="Ej: La capilla cerró definitivamente y ya no funciona."
          className="mt-3 block w-full resize-y rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:border-primary"
        />

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-lg border border-outline-variant px-4 py-2.5 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(motivo)}
            disabled={loading || !motivo.trim()}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-on-primary transition-colors hover:bg-primary-container hover:text-on-primary-container disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Enviando...
              </>
            ) : (
              "Enviar solicitud"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
