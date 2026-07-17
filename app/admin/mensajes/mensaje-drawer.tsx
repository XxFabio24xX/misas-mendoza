"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { X } from "lucide-react";
import { actualizarMensaje } from "./actions";
import { TIPO_BADGE, type Mensaje } from "./mensajes-list";

const ESTADO_OPCIONES: { value: Mensaje["estado"]; label: string }[] = [
  { value: "nuevo", label: "Nuevo" },
  { value: "leido", label: "Leído" },
  { value: "respondido", label: "Respondido" },
];

export function MensajeDrawer({
  mensaje,
  onClose,
}: {
  mensaje: Mensaje;
  onClose: () => void;
}) {
  const router = useRouter();
  const [estado, setEstado] = useState(mensaje.estado);
  const [notas, setNotas] = useState(mensaje.notas_internas ?? "");
  const [guardado, setGuardado] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleEstadoChange = (nuevoEstado: Mensaje["estado"]) => {
    setEstado(nuevoEstado);
    startTransition(async () => {
      setError(null);
      try {
        await actualizarMensaje(mensaje.id, { estado: nuevoEstado });
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo actualizar el estado.");
      }
    });
  };

  const handleGuardarNotas = () => {
    startTransition(async () => {
      setError(null);
      setGuardado(false);
      try {
        await actualizarMensaje(mensaje.id, { notas_internas: notas });
        setGuardado(true);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudieron guardar las notas.");
      }
    });
  };

  const sinContacto = !mensaje.nombre && !mensaje.telefono && !mensaje.email;

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
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TIPO_BADGE[mensaje.tipo].className}`}>
            {TIPO_BADGE[mensaje.tipo].label}
          </span>
          <span className="rounded-full bg-surface-container-high px-2 py-0.5 text-xs text-on-surface-variant">
            {ESTADO_OPCIONES.find((o) => o.value === estado)?.label}
          </span>
        </div>

        <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-on-surface">
          {mensaje.mensaje}
        </p>

        <div className="mt-6 border-t border-outline-variant/30 pt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
            Datos de contacto
          </h3>
          {sinContacto ? (
            <p className="mt-2 text-sm text-on-surface-variant">Mensaje anónimo</p>
          ) : (
            <div className="mt-2 space-y-1 text-sm">
              {mensaje.nombre && <p className="text-on-surface">{mensaje.nombre}</p>}
              {mensaje.telefono && (
                <a href={`tel:${mensaje.telefono}`} className="block text-primary hover:underline">
                  {mensaje.telefono}
                </a>
              )}
              {mensaje.email && (
                <a href={`mailto:${mensaje.email}`} className="block text-primary hover:underline">
                  {mensaje.email}
                </a>
              )}
            </div>
          )}
        </div>

        {mensaje.tipo === "error_horario" && (
          <div className="mt-6 border-t border-outline-variant/30 pt-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              Capilla reportada
            </h3>
            <p className="mt-2 text-sm text-on-surface">
              {mensaje.departamento ? `${mensaje.departamento} · ` : ""}
              {mensaje.lugar_nombre ?? "—"}
            </p>
            {mensaje.lugar && (
              <Link
                href={`/capilla/${mensaje.lugar.slug}`}
                target="_blank"
                className="mt-1 inline-block text-sm text-primary hover:underline"
              >
                Ver capilla →
              </Link>
            )}
          </div>
        )}

        <div className="mt-6 border-t border-outline-variant/30 pt-4">
          <label htmlFor="estado-mensaje" className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
            Estado
          </label>
          <select
            id="estado-mensaje"
            value={estado}
            onChange={(e) => handleEstadoChange(e.target.value as Mensaje["estado"])}
            disabled={isPending}
            className="mt-1.5 block w-full appearance-none rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 pr-8 text-sm text-on-surface outline-none transition-colors focus:border-primary"
          >
            {ESTADO_OPCIONES.map((op) => (
              <option key={op.value} value={op.value}>
                {op.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4">
          <label htmlFor="notas-internas" className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
            Notas internas
          </label>
          <textarea
            id="notas-internas"
            value={notas}
            onChange={(e) => {
              setNotas(e.target.value);
              setGuardado(false);
            }}
            rows={3}
            placeholder="Solo visible para admins..."
            className="mt-1.5 block w-full resize-y rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:border-primary"
          />
          <button
            onClick={handleGuardarNotas}
            disabled={isPending}
            className="mt-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary-container hover:text-on-primary-container disabled:opacity-50"
          >
            {guardado ? "Guardado ✓" : "Guardar notas"}
          </button>
        </div>

        {error && (
          <div
            role="status"
            aria-live="polite"
            className="mt-4 rounded-lg bg-error-container px-4 py-3 text-sm text-on-error-container"
          >
            {error}
          </div>
        )}
      </aside>
    </div>
  );
}
