"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Church, Eye, ListChecks } from "lucide-react";
import { TIPO_BADGE, nombreSolicitud, type Solicitud } from "@/app/admin/solicitudes/solicitudes-list";
import { SolicitudDrawer } from "@/app/admin/solicitudes/solicitud-drawer";

const ESTADO_BADGE: Record<Solicitud["estado"], { label: string; className: string }> = {
  pendiente: { label: "Pendiente", className: "bg-primary/10 text-primary" },
  aprobada: { label: "Aprobada", className: "bg-primary text-on-primary" },
  rechazada: { label: "Rechazada", className: "bg-error-container text-on-error-container" },
};

export function MisSolicitudesList({ solicitudes }: { solicitudes: Solicitud[] }) {
  const [detalleTarget, setDetalleTarget] = useState<Solicitud | null>(null);

  if (solicitudes.length === 0) {
    return (
      <div className="mt-6 flex flex-col items-center gap-2 rounded-xl bg-surface-container-low py-12 text-center">
        <ListChecks className="h-8 w-8 text-on-surface-variant/50" />
        <p className="text-sm text-on-surface-variant">
          Todavía no enviaste ninguna solicitud.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-3">
      {detalleTarget && (
        <SolicitudDrawer solicitud={detalleTarget} onClose={() => setDetalleTarget(null)} />
      )}

      {solicitudes.map((s) => (
        <div
          key={s.id}
          className="rounded-xl bg-secondary-container p-5 shadow-[0_4px_16px_rgba(118,146,131,0.06)]"
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-2 font-medium text-on-surface">
                <Church className="h-4 w-4 shrink-0 text-primary/60" />
                {nombreSolicitud(s)}
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TIPO_BADGE[s.tipo].className}`}>
                  {TIPO_BADGE[s.tipo].label}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ESTADO_BADGE[s.estado].className}`}>
                  {ESTADO_BADGE[s.estado].label}
                </span>
              </p>
              <p className="mt-2 text-xs text-on-surface-variant/70">
                {format(new Date(s.created_at), "d MMM yyyy, HH:mm", { locale: es })}
              </p>
            </div>

            <button
              onClick={() => setDetalleTarget(s)}
              className="flex shrink-0 items-center gap-1.5 rounded-lg border border-outline-variant px-3.5 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container"
            >
              <Eye className="h-4 w-4" />
              Ver detalle
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
