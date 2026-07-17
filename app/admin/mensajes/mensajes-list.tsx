"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { MensajeDrawer } from "./mensaje-drawer";

export type Mensaje = {
  id: string;
  tipo: "sugerencia" | "error_horario";
  nombre: string | null;
  telefono: string | null;
  email: string | null;
  mensaje: string;
  lugar_id: string | null;
  lugar_nombre: string | null;
  departamento: string | null;
  estado: "nuevo" | "leido" | "respondido";
  notas_internas: string | null;
  created_at: string;
  lugar: { id: string; nombre: string; slug: string } | null;
};

export const TIPO_BADGE: Record<Mensaje["tipo"], { label: string; className: string }> = {
  sugerencia: { label: "Sugerencia", className: "bg-secondary-container text-on-secondary-container" },
  error_horario: { label: "Error de horario", className: "bg-error-container/50 text-on-error-container" },
};

export const ESTADO_BADGE: Record<Mensaje["estado"], { label: string; className: string }> = {
  nuevo: { label: "Nuevo", className: "bg-primary/10 text-primary font-medium" },
  leido: { label: "Leído", className: "bg-surface-container-high text-on-surface-variant" },
  respondido: { label: "Respondido", className: "bg-primary-fixed/50 text-on-primary-fixed" },
};

function tiempoRelativo(fecha: string): string {
  const diff = Date.now() - new Date(fecha).getTime();
  const horas = Math.floor(diff / 3_600_000);
  if (horas < 1) return "hace un momento";
  if (horas < 24) return `hace ${horas}h`;
  const dias = Math.floor(horas / 24);
  if (dias === 1) return "ayer";
  return `hace ${dias} días`;
}

export function MensajesList({ mensajes }: { mensajes: Mensaje[] }) {
  const [seleccionado, setSeleccionado] = useState<Mensaje | null>(null);

  if (mensajes.length === 0) {
    return (
      <div className="mt-8 flex flex-col items-center gap-2 rounded-xl bg-surface-container-low py-12 text-center">
        <MessageSquare className="h-8 w-8 text-on-surface-variant/50" />
        <p className="text-sm text-on-surface-variant">
          No hay mensajes que coincidan con el filtro.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mt-6 divide-y divide-outline-variant/20 rounded-xl bg-surface-container-low">
        {mensajes.map((m) => (
          <div key={m.id} className="flex items-start justify-between gap-4 p-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TIPO_BADGE[m.tipo].className}`}>
                  {TIPO_BADGE[m.tipo].label}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-xs ${ESTADO_BADGE[m.estado].className}`}>
                  {ESTADO_BADGE[m.estado].label}
                </span>
                <span className="text-sm font-medium text-on-surface">{m.nombre || "Anónimo"}</span>
              </div>
              {(m.telefono || m.email) && (
                <p className="mt-1 text-xs text-on-surface-variant">
                  {[m.telefono, m.email].filter(Boolean).join(" · ")}
                </p>
              )}
              <p className="mt-1.5 text-sm text-on-surface-variant">
                {m.mensaje.length > 120 ? `${m.mensaje.slice(0, 120)}…` : m.mensaje}
              </p>
              {m.tipo === "error_horario" && m.lugar_nombre && (
                <p className="mt-1 text-xs text-on-surface-variant">📍 {m.lugar_nombre}</p>
              )}
              <p className="mt-1.5 text-xs text-on-surface-variant/70">{tiempoRelativo(m.created_at)}</p>
            </div>
            <button
              onClick={() => setSeleccionado(m)}
              className="shrink-0 rounded-lg border border-outline-variant px-3 py-1.5 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container"
            >
              Ver
            </button>
          </div>
        ))}
      </div>

      {seleccionado && (
        <MensajeDrawer
          key={seleccionado.id}
          mensaje={seleccionado}
          onClose={() => setSeleccionado(null)}
        />
      )}
    </>
  );
}
