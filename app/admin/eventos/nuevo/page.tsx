"use client";

import { useEffect, useState, useTransition } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { crearEvento } from "../actions";

const TIPOS_EVENTO = ["Jóvenes", "Aviso", "Retiro", "Especial"];
const DEPARTAMENTOS = ["Capital", "Las Heras", "Guaymallén", "Godoy Cruz", "Maipú"];

const HORARIOS = Array.from({ length: 96 }, (_, i) => {
  const h = String(Math.floor(i / 4)).padStart(2, "0");
  const m = String((i % 4) * 15).padStart(2, "0");
  return `${h}:${m}`;
});

type Lugar = { id: string; nombre: string };

export default function NuevoEventoPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [lugares, setLugares] = useState<Lugar[]>([]);

  useEffect(() => {
    supabase.from("lugares").select("id,nombre").order("nombre").then(({ data }) => {
      if (data) setLugares(data);
    });
  }, []);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      setError(null);
      const lugarId = formData.get("lugar_id") as string;
      if (lugarId) {
        const lugar = lugares.find((l) => l.id === lugarId);
        if (lugar && !formData.get("ubicacion")) {
          formData.set("ubicacion", lugar.nombre);
        }
      }
      const fechaDate = formData.get("fecha_inicio_date") as string;
      const fechaTime = formData.get("fecha_inicio_time") as string;
      if (fechaDate && fechaTime) {
        formData.set("fecha_inicio", `${fechaDate}T${fechaTime}:00`);
      }
      const finDate = formData.get("fecha_fin_date") as string;
      const finTime = formData.get("fecha_fin_time") as string;
      if (finDate && finTime) {
        formData.set("fecha_fin", `${finDate}T${finTime}:00`);
      }
      try {
        await crearEvento(formData);
      } catch (e) {
        if (e instanceof Error && !e.message.includes("NEXT_REDIRECT")) {
          setError(e.message);
        }
      }
    });
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/eventos"
          className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-on-surface md:text-2xl">Nuevo Evento</h1>
          <p className="mt-0.5 text-sm text-on-surface-variant">Creá un nuevo evento o aviso para la comunidad.</p>
        </div>
      </div>

      <form action={handleSubmit} className="mt-6 space-y-5">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label htmlFor="titulo" className="text-sm font-medium text-on-surface">Título</label>
            <input id="titulo" name="titulo" type="text" required
              placeholder="Ej: Retiro Espiritual de Cuaresma"
              className="mt-1.5 block w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:border-primary"
            />
          </div>

          <div>
            <label htmlFor="tipo" className="text-sm font-medium text-on-surface">Tipo</label>
            <select id="tipo" name="tipo" required defaultValue=""
              className="mt-1.5 block w-full appearance-none rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 pr-8 text-sm text-on-surface outline-none transition-colors focus:border-primary"
            >
              <option value="" disabled>Seleccioná...</option>
              {TIPOS_EVENTO.map((t) => (<option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>))}
            </select>
          </div>

          <div>
            <label htmlFor="departamento" className="text-sm font-medium text-on-surface">Departamento</label>
            <select id="departamento" name="departamento" required defaultValue=""
              className="mt-1.5 block w-full appearance-none rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 pr-8 text-sm text-on-surface outline-none transition-colors focus:border-primary"
            >
              <option value="" disabled>Seleccioná...</option>
              {DEPARTAMENTOS.map((d) => (<option key={d} value={d}>{d}</option>))}
            </select>
          </div>

          <div>
            <label htmlFor="lugar_id" className="text-sm font-medium text-on-surface">Capilla asociada <span className="text-on-surface-variant font-normal">(opcional)</span></label>
            <select id="lugar_id" name="lugar_id" defaultValue=""
              className="mt-1.5 block w-full appearance-none rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 pr-8 text-sm text-on-surface outline-none transition-colors focus:border-primary"
            >
              <option value="">Sin capilla</option>
              {lugares.map((l) => (<option key={l.id} value={l.id}>{l.nombre}</option>))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="ubicacion" className="text-sm font-medium text-on-surface">Ubicación <span className="text-on-surface-variant font-normal">(se completa automáticamente si seleccionás una capilla)</span></label>
            <input id="ubicacion" name="ubicacion" type="text"
              placeholder="Ej: Parroquia Santiago Apóstol, Godoy Cruz"
              className="mt-1.5 block w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:border-primary"
            />
          </div>

          <div>
            <label htmlFor="fecha_inicio_date" className="text-sm font-medium text-on-surface">Fecha de Inicio</label>
            <input id="fecha_inicio_date" name="fecha_inicio_date" type="date" required
              className="mt-1.5 block w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 text-sm text-on-surface outline-none transition-colors focus:border-primary"
            />
          </div>

          <div>
            <label htmlFor="fecha_inicio_time" className="text-sm font-medium text-on-surface">Hora de Inicio</label>
            <select id="fecha_inicio_time" name="fecha_inicio_time" required defaultValue=""
              className="mt-1.5 block w-full appearance-none rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 pr-8 text-sm text-on-surface outline-none transition-colors focus:border-primary"
            >
              <option value="" disabled>Seleccioná...</option>
              {HORARIOS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="fecha_fin_date" className="text-sm font-medium text-on-surface">Fecha de Fin <span className="text-on-surface-variant font-normal">(opcional)</span></label>
            <input id="fecha_fin_date" name="fecha_fin_date" type="date"
              className="mt-1.5 block w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 text-sm text-on-surface outline-none transition-colors focus:border-primary"
            />
          </div>

          <div>
            <label htmlFor="fecha_fin_time" className="text-sm font-medium text-on-surface">Hora de Fin <span className="text-on-surface-variant font-normal">(opcional)</span></label>
            <select id="fecha_fin_time" name="fecha_fin_time" defaultValue=""
              className="mt-1.5 block w-full appearance-none rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 pr-8 text-sm text-on-surface outline-none transition-colors focus:border-primary"
            >
              <option value="">Sin hora</option>
              {HORARIOS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="descripcion" className="text-sm font-medium text-on-surface">Descripción</label>
            <textarea id="descripcion" name="descripcion" rows={4}
              placeholder="Describí los detalles del evento..."
              className="mt-1.5 block w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:border-primary resize-y"
            />
          </div>
        </div>

        {error && (
          <div role="status" aria-live="polite" className="rounded-lg bg-error-container px-4 py-3 text-sm text-on-error-container">{error}</div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <Link
            href="/admin/eventos"
            className="flex-1 rounded-lg border border-outline-variant px-4 py-2.5 text-center text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-on-primary transition-colors hover:bg-primary-container hover:text-on-primary-container disabled:opacity-50"
          >
            {isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</>
            ) : (
              "Guardar Evento"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
