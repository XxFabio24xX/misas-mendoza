"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { unstable_rethrow, useParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { TIPO_EVENTO_OPTIONS } from "@/lib/eventos-tipos";
import { DEPARTAMENTOS } from "@/lib/departamentos";
import DateInputDMY from "@/app/components/date-input-dmy";
import { actualizarEvento } from "@/app/admin/eventos/actions";

const HORARIOS = Array.from({ length: 96 }, (_, i) => {
  const h = String(Math.floor(i / 4)).padStart(2, "0");
  const m = String((i % 4) * 15).padStart(2, "0");
  return `${h}:${m}`;
});

type Evento = {
  id: string;
  titulo: string;
  tipo: string;
  departamento: string;
  lugar_id?: string;
  fecha_inicio: string;
  fecha_fin?: string;
  descripcion?: string;
  activo: boolean;
  lugares?: { nombre: string } | null;
};

type Lugar = { id: string; nombre: string; departamento: string };

export default function EditarEventoPage() {
  const params = useParams();
  const id = params.id as string;
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [evento, setEvento] = useState<Evento | null>(null);
  const [lugares, setLugares] = useState<Lugar[]>([]);
  const [loading, setLoading] = useState(true);
  const [departamento, setDepartamento] = useState("");
  const [lugarId, setLugarId] = useState("");

  const fetchData = useCallback(async () => {
    if (!id) {
      setError("ID de evento inválido");
      setLoading(false);
      return;
    }
    const [evRes, lugRes] = await Promise.all([
      supabase.from("eventos").select("*, lugares(nombre)").eq("id", id).maybeSingle(),
      supabase.from("lugares").select("id,nombre,departamento").order("nombre"),
    ]);
    if (evRes.error) setError(evRes.error.message);
    else if (evRes.data) {
      const ev = evRes.data as Evento;
      setEvento(ev);
      setDepartamento(ev.departamento);
      setLugarId(ev.lugar_id ?? "");
    } else setError("No se encontró el evento.");
    if (lugRes.data) setLugares(lugRes.data);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    // Initial data load on mount — fetchData manages its own loading/error state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  const lugaresFiltrados = useMemo(
    () => lugares.filter((l) => l.departamento === departamento),
    [lugares, departamento],
  );

  function handleDepartamentoChange(value: string) {
    setDepartamento(value);
    setLugarId("");
  }

  const toDateValue = (iso: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  const toTimeValue = (iso: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const roundToNearest15 = (time: string) => {
    if (!time) return "";
    const [h, m] = time.split(":").map(Number);
    const roundedM = Math.round(m / 15) * 15;
    if (roundedM === 60) {
      const nh = h + 1;
      return `${String(nh).padStart(2, "0")}:00`;
    }
    return `${String(h).padStart(2, "0")}:${String(roundedM).padStart(2, "0")}`;
  };

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
        await actualizarEvento(id, formData);
      } catch (e) {
        unstable_rethrow(e);
        setError(e instanceof Error ? e.message : "Error inesperado.");
      }
    });
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error && !evento) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
        <p className="text-sm text-on-surface-variant">{error}</p>
        <Link href="/admin/eventos" className="text-sm font-medium text-primary hover:underline">Volver a eventos</Link>
      </div>
    );
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
          <h1 className="text-xl font-semibold text-on-surface md:text-2xl">Editar Evento</h1>
          <p className="mt-0.5 text-sm text-on-surface-variant">Modificá los datos del evento.</p>
        </div>
      </div>

      <form action={handleSubmit} className="mt-6 space-y-5">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label htmlFor="titulo" className="text-sm font-medium text-on-surface">Título</label>
            <input id="titulo" name="titulo" type="text" required defaultValue={evento?.titulo}
              className="mt-1.5 block w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:border-primary"
            />
          </div>

          <div>
            <label htmlFor="tipo" className="text-sm font-medium text-on-surface">Tipo</label>
            <select id="tipo" name="tipo" required defaultValue={evento?.tipo}
              className="mt-1.5 block w-full appearance-none rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 pr-8 text-sm text-on-surface outline-none transition-colors focus:border-primary"
            >
              <option value="" disabled>Seleccioná...</option>
              {TIPO_EVENTO_OPTIONS.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
            </select>
          </div>

          <div>
            <label htmlFor="departamento" className="text-sm font-medium text-on-surface">Departamento</label>
            <select id="departamento" name="departamento" required value={departamento}
              onChange={(e) => handleDepartamentoChange(e.target.value)}
              className="mt-1.5 block w-full appearance-none rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 pr-8 text-sm text-on-surface outline-none transition-colors focus:border-primary"
            >
              <option value="" disabled>Seleccioná...</option>
              {DEPARTAMENTOS.map((d) => (<option key={d} value={d}>{d}</option>))}
            </select>
          </div>

          <div>
            <label htmlFor="lugar_id" className="text-sm font-medium text-on-surface">Capilla asociada <span className="text-on-surface-variant font-normal">(opcional)</span></label>
            <select id="lugar_id" name="lugar_id" value={lugarId}
              onChange={(e) => setLugarId(e.target.value)}
              disabled={!departamento}
              aria-describedby={!departamento ? "lugar_id-hint" : undefined}
              className="mt-1.5 block w-full appearance-none rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 pr-8 text-sm text-on-surface outline-none transition-colors focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Sin capilla</option>
              {lugaresFiltrados.map((l) => (<option key={l.id} value={l.id}>{l.nombre}</option>))}
            </select>
            {!departamento && (
              <p id="lugar_id-hint" className="mt-1.5 text-xs text-on-surface-variant">
                Seleccioná primero un departamento.
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label htmlFor="ubicacion" className="text-sm font-medium text-on-surface">Ubicación <span className="text-on-surface-variant font-normal">(se completa automáticamente si seleccionás una capilla)</span></label>
            <input id="ubicacion" name="ubicacion" type="text" defaultValue={evento?.lugares?.nombre ?? ""}
              className="mt-1.5 block w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:border-primary"
            />
          </div>

          <div>
            <label htmlFor="fecha_inicio_date" className="text-sm font-medium text-on-surface">Fecha de Inicio</label>
            <DateInputDMY id="fecha_inicio_date" name="fecha_inicio_date" required defaultValueISO={toDateValue(evento?.fecha_inicio ?? "")}
              className="mt-1.5 block w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 text-sm text-on-surface outline-none transition-colors focus:border-primary"
            />
          </div>

          <div>
            <label htmlFor="fecha_inicio_time" className="text-sm font-medium text-on-surface">Hora de Inicio</label>
            <select id="fecha_inicio_time" name="fecha_inicio_time" required defaultValue={roundToNearest15(toTimeValue(evento?.fecha_inicio ?? ""))}
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
            <DateInputDMY id="fecha_fin_date" name="fecha_fin_date" defaultValueISO={toDateValue(evento?.fecha_fin ?? "")}
              className="mt-1.5 block w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 text-sm text-on-surface outline-none transition-colors focus:border-primary"
            />
          </div>

          <div>
            <label htmlFor="fecha_fin_time" className="text-sm font-medium text-on-surface">Hora de Fin <span className="text-on-surface-variant font-normal">(opcional)</span></label>
            <select id="fecha_fin_time" name="fecha_fin_time" defaultValue={roundToNearest15(toTimeValue(evento?.fecha_fin ?? ""))}
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
            <textarea id="descripcion" name="descripcion" rows={4} defaultValue={evento?.descripcion ?? ""}
              className="mt-1.5 block w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:border-primary resize-y"
            />
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center gap-2.5">
              <input
                id="activo"
                name="activo"
                type="checkbox"
                defaultChecked={evento?.activo}
                className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium text-on-surface">Activo</span>
            </label>
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
              "Guardar Cambios"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
