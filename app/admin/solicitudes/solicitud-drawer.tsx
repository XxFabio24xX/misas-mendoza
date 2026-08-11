"use client";

import type { ReactNode } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { X } from "lucide-react";
import { DIAS_SEMANA } from "@/lib/misas-utils";
import { tipoEventoColor, tipoEventoLabel } from "@/lib/eventos-tipos";
import { TIPO_BADGE, nombreSolicitud, type Solicitud } from "./solicitudes-list";

const texto = (v: unknown): string | null =>
  typeof v === "string" && v.trim() !== "" ? v : null;

const booleano = (v: unknown): string => (v === true ? "Sí" : v === false ? "No" : "—");

function Campo({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm text-on-surface">{children}</dd>
    </div>
  );
}

// --- Horarios: shape tolerante, no necesariamente completa ni bien formada ---
type HorarioPropuesto = {
  tipo?: string | null;
  dia_semana?: number | null;
  dia_mes?: number | null;
  hora?: string | null;
  temporada?: string | null;
  reemplaza_dia?: boolean | null;
  observacion?: string | null;
};

function diaLabel(h: HorarioPropuesto): string {
  const esMensual = h.tipo === "mensual" || (h.tipo == null && h.dia_mes != null && h.dia_semana == null);
  if (esMensual) {
    return h.dia_mes != null ? `Día ${h.dia_mes} de cada mes` : "Día del mes sin especificar";
  }
  if (h.dia_semana != null) {
    return DIAS_SEMANA.find((d) => d.value === h.dia_semana)?.label ?? "Día sin especificar";
  }
  return "Día sin especificar";
}

function HorarioRow({ h }: { h: HorarioPropuesto }) {
  const obs = texto(h.observacion);
  return (
    <li className="flex flex-col gap-1 px-3 py-2">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <span className="text-sm text-on-surface">{diaLabel(h)}</span>
        <div className="flex items-center gap-1.5">
          <span className="text-sm tabular-nums text-on-surface-variant">
            {texto(h.hora)?.slice(0, 5) ?? "—"} hs
          </span>
          {h.temporada && h.temporada !== "Todo el año" && (
            <span className="rounded-full bg-surface-container-high px-2 py-0.5 text-[10px] font-medium text-on-surface-variant">
              {h.temporada}
            </span>
          )}
          {h.reemplaza_dia && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
              Reemplaza el día
            </span>
          )}
        </div>
      </div>
      {obs && <p className="text-xs text-on-surface-variant/70">{obs}</p>}
    </li>
  );
}

/** Tolerante: horarios puede no ser un array, venir vacío, o traer filas incompletas. */
function HorariosPropuestos({ horarios }: { horarios: unknown }) {
  const lista = (Array.isArray(horarios) ? horarios : []) as (HorarioPropuesto | null)[];
  const filas = lista.filter((h): h is HorarioPropuesto => h != null && typeof h === "object");

  if (filas.length === 0) {
    return <p className="text-sm text-on-surface-variant">Sin horarios propuestos.</p>;
  }

  return (
    <ul className="divide-y divide-outline-variant/15 overflow-hidden rounded-lg border border-outline-variant/30 bg-surface-container-low/50">
      {filas.map((h, i) => (
        <HorarioRow key={i} h={h} />
      ))}
    </ul>
  );
}

// --- Caso 1: capilla completa (alta, o edición de datos importantes) ---
function DetalleCapilla({ datos }: { datos: Record<string, unknown> }) {
  return (
    <dl className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Campo label="Nombre">{texto(datos.nombre) ?? "—"}</Campo>
        <Campo label="Tipo">
          <span className="capitalize">{texto(datos.tipo) ?? "—"}</span>
        </Campo>
        <Campo label="Departamento">{texto(datos.departamento) ?? "—"}</Campo>
        <Campo label="Decanato">{texto(datos.decanato) ?? "—"}</Campo>
      </div>

      <Campo label="Dirección">{texto(datos.direccion) ?? "—"}</Campo>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Campo label="Teléfono">{texto(datos.telefono) ?? "—"}</Campo>
        <Campo label="Email">{texto(datos.email) ?? "—"}</Campo>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Campo label="Sitio web">
          {texto(datos.sitio_web) ? (
            <a
              href={texto(datos.sitio_web)!}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-primary hover:underline"
            >
              {texto(datos.sitio_web)}
            </a>
          ) : (
            "—"
          )}
        </Campo>
        <Campo label="Horario de secretaría">{texto(datos.horario_secretaria) ?? "—"}</Campo>
      </div>

      {texto(datos.descripcion) && (
        <Campo label="Descripción">
          <span className="whitespace-pre-line">{datos.descripcion as string}</span>
        </Campo>
      )}

      {texto(datos.notas_horarios) && (
        <Campo label="Notas de horarios">
          <span className="whitespace-pre-line">{datos.notas_horarios as string}</span>
        </Campo>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Campo label="Confesiones">{booleano(datos.hay_confesiones)}</Campo>
        <Campo label="Recibe Cáritas">{booleano(datos.recibe_caritas)}</Campo>
        <Campo label="Activa">{booleano(datos.activo)}</Campo>
      </div>

      {texto(datos.imagen_url) && (
        <Campo label="Imagen propuesta">
          <a
            href={texto(datos.imagen_url)!}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Ver imagen →
          </a>
        </Campo>
      )}

      <div>
        <dt className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
          Horarios propuestos
        </dt>
        <dd className="mt-1.5">
          <HorariosPropuestos horarios={datos.horarios} />
        </dd>
      </div>
    </dl>
  );
}

// --- Caso 2: horario suelto (campo_editado === "horarios") ---
const ACCION_LABELS: Record<string, string> = {
  agregar: "Agregar horario",
  editar: "Editar horario",
  eliminar: "Eliminar horario",
};

function DetalleHorarioSuelto({ datos }: { datos: Record<string, unknown> }) {
  const accion = texto(datos.accion);
  const horarioId = texto(datos.horario_id);

  return (
    <dl className="space-y-4">
      <Campo label="Acción">{accion ? (ACCION_LABELS[accion] ?? accion) : "—"}</Campo>

      {accion === "eliminar" && (
        <Campo label="Horario a eliminar">
          {horarioId ? <span className="font-mono text-xs">{horarioId}</span> : "—"}
        </Campo>
      )}

      {accion === "agregar" && (
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
            Horario propuesto
          </dt>
          <dd className="mt-1.5">
            <HorariosPropuestos horarios={datos.horario ? [datos.horario] : []} />
          </dd>
        </div>
      )}

      {accion === "editar" && (
        <>
          <Campo label="Horario a editar">
            {horarioId ? <span className="font-mono text-xs">{horarioId}</span> : "—"}
          </Campo>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              Nuevos valores
            </dt>
            <dd className="mt-1.5">
              <HorariosPropuestos horarios={datos.datos ? [datos.datos] : []} />
            </dd>
          </div>
        </>
      )}

      {accion && !ACCION_LABELS[accion] && (
        <p className="text-sm text-on-surface-variant">
          Acción desconocida (&ldquo;{accion}&rdquo;) — revisar manualmente antes de aprobar.
        </p>
      )}
    </dl>
  );
}

// --- Caso 3: evento (campo_editado === "evento") ---
function formatRangoFechas(inicio: string | null, fin: string | null): string {
  if (!inicio) return "—";
  const s = new Date(inicio);
  if (isNaN(s.getTime())) return "—";
  if (!fin) return format(s, "EEE d MMM yyyy • HH:mm", { locale: es });
  const e = new Date(fin);
  if (isNaN(e.getTime())) return format(s, "EEE d MMM yyyy • HH:mm", { locale: es });
  const mismoDia =
    s.getFullYear() === e.getFullYear() &&
    s.getMonth() === e.getMonth() &&
    s.getDate() === e.getDate();
  if (mismoDia) {
    return `${format(s, "EEE d MMM yyyy", { locale: es })} • ${format(s, "HH:mm")} - ${format(e, "HH:mm")}`;
  }
  return `${format(s, "EEE d MMM yyyy, HH:mm", { locale: es })} - ${format(e, "EEE d MMM yyyy, HH:mm", { locale: es })}`;
}

function DetalleEvento({ datos }: { datos: Record<string, unknown> }) {
  const tipo = texto(datos.tipo);

  return (
    <dl className="space-y-4">
      <Campo label="Título">{texto(datos.titulo) ?? "—"}</Campo>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Campo label="Tipo">
          {tipo ? (
            <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${tipoEventoColor(tipo)}`}>
              {tipoEventoLabel(tipo)}
            </span>
          ) : (
            "—"
          )}
        </Campo>
        <Campo label="Departamento">{texto(datos.departamento) ?? "—"}</Campo>
      </div>

      <Campo label="Fecha">
        {formatRangoFechas(texto(datos.fecha_inicio), texto(datos.fecha_fin))}
      </Campo>

      <Campo label="Ubicación">{texto(datos.ubicacion) ?? "—"}</Campo>

      {texto(datos.descripcion) && (
        <Campo label="Descripción">
          <span className="whitespace-pre-line">{datos.descripcion as string}</span>
        </Campo>
      )}
    </dl>
  );
}

export function SolicitudDrawer({
  solicitud,
  onClose,
}: {
  solicitud: Solicitud;
  onClose: () => void;
}) {
  const datos =
    solicitud.datos_propuestos && typeof solicitud.datos_propuestos === "object"
      ? (solicitud.datos_propuestos as Record<string, unknown>)
      : null;

  return (
    <div className="fixed inset-0 z-1200">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <aside className="fixed right-0 top-0 h-full w-full max-w-lg overflow-y-auto bg-surface-container p-6 shadow-xl">
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="ml-auto flex rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TIPO_BADGE[solicitud.tipo].className}`}>
            {TIPO_BADGE[solicitud.tipo].label}
          </span>
          {solicitud.estado !== "pendiente" && (
            <span className="rounded-full bg-surface-container-highest px-2 py-0.5 text-xs font-medium text-on-surface-variant">
              {solicitud.estado === "rechazada" ? "Rechazada" : "Aprobada"}
            </span>
          )}
        </div>

        <h2 className="mt-3 text-lg font-semibold text-on-surface">{nombreSolicitud(solicitud)}</h2>
        <p className="mt-1 whitespace-pre-line text-sm text-on-surface-variant">{solicitud.motivo}</p>
        <p className="mt-2 text-xs text-on-surface-variant/70">
          Solicitada por {solicitud.perfiles?.nombre_completo ?? "—"}
          {solicitud.perfiles?.email ? ` (${solicitud.perfiles.email})` : ""} ·{" "}
          {format(new Date(solicitud.created_at), "d MMM yyyy, HH:mm", { locale: es })}
        </p>

        <div className="mt-6 border-t border-outline-variant/30 pt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
            Cambios propuestos
          </h3>
          <div className="mt-3">
            {!datos ? (
              <p className="text-sm text-on-surface-variant">
                No hay datos adicionales para esta solicitud.
              </p>
            ) : solicitud.campo_editado === "horarios" ? (
              <DetalleHorarioSuelto datos={datos} />
            ) : solicitud.campo_editado === "evento" ? (
              <DetalleEvento datos={datos} />
            ) : (
              <DetalleCapilla datos={datos} />
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
