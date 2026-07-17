"use client";

import { Suspense, useEffect, useMemo, useState, useTransition } from "react";
import { unstable_rethrow, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { TIPO_EVENTO_OPTIONS } from "@/lib/eventos-tipos";
import { DEPARTAMENTOS } from "@/lib/departamentos";
import DateInputDMY from "@/app/components/date-input-dmy";
import { crearEvento } from "../actions";
import { Breadcrumb } from "@/app/admin/components/breadcrumb";
import { CandleLoader } from "@/app/components/candle-loader";

const HORARIOS = Array.from({ length: 96 }, (_, i) => {
  const h = String(Math.floor(i / 4)).padStart(2, "0");
  const m = String((i % 4) * 15).padStart(2, "0");
  return `${h}:${m}`;
});

type Lugar = { id: string; nombre: string; departamento: string };

type EventoBase = {
  titulo: string;
  tipo: string;
  departamento: string;
  lugar_id: string | null;
  ubicacion: string | null;
  descripcion: string | null;
};

// useSearchParams exige un boundary de Suspense en páginas estáticas.
export default function NuevoEventoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <CandleLoader size="md" />
        </div>
      }
    >
      <NuevoEventoForm />
    </Suspense>
  );
}

function NuevoEventoForm() {
  const searchParams = useSearchParams();
  const duplicarId = searchParams.get("duplicar");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [lugares, setLugares] = useState<Lugar[]>([]);
  const [departamento, setDepartamento] = useState("");
  const [lugarId, setLugarId] = useState("");
  const [base, setBase] = useState<EventoBase | null>(null);
  const [baseLoading, setBaseLoading] = useState(duplicarId !== null);
  const [esEditor, setEsEditor] = useState(false);

  useEffect(() => {
    supabase.from("lugares").select("id,nombre,departamento").order("nombre").then(({ data }) => {
      if (data) setLugares(data);
    });
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase
        .from("perfiles")
        .select("rol")
        .eq("id", user.id)
        .single();
      setEsEditor(data?.rol === "editor");
    });
  }, []);

  // Modo duplicar: precarga todo menos las fechas. El form se renderiza recién
  // cuando llegan los datos, así los defaultValue de los inputs no controlados
  // toman el valor correcto.
  useEffect(() => {
    if (!duplicarId) return;
    supabase
      .from("eventos")
      .select("titulo, tipo, departamento, lugar_id, ubicacion, descripcion")
      .eq("id", duplicarId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          const evento = data as EventoBase;
          setBase(evento);
          setDepartamento(evento.departamento);
          setLugarId(evento.lugar_id ?? "");
        }
        setBaseLoading(false);
      });
  }, [duplicarId]);

  const lugaresFiltrados = useMemo(
    () => lugares.filter((l) => l.departamento === departamento),
    [lugares, departamento],
  );

  function handleDepartamentoChange(value: string) {
    setDepartamento(value);
    setLugarId("");
  }

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
        unstable_rethrow(e);
        setError(e instanceof Error ? e.message : "Error inesperado.");
      }
    });
  }

  if (baseLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <CandleLoader size="md" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Breadcrumb items={[
        { label: "Eventos", href: "/admin/eventos" },
        { label: "Nuevo evento" },
      ]} />
      <div>
        <h1 className="text-xl font-semibold text-on-surface md:text-2xl">Nuevo Evento</h1>
        <p className="mt-0.5 text-sm text-on-surface-variant">
          {base
            ? "Duplicando un evento existente: revisá los datos y completá las fechas."
            : "Creá un nuevo evento o aviso para la comunidad."}
        </p>
      </div>

      {esEditor && (
        <div className="mt-6 rounded-xl bg-secondary-container
                        px-5 py-4 text-sm text-on-secondary-container">
          <strong>Modo editor:</strong> Los eventos que propongas
          serán revisados por el administrador de tu departamento
          antes de publicarse.
        </div>
      )}

      <form action={handleSubmit} className="mt-6 space-y-5">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label htmlFor="titulo" className="text-sm font-medium text-on-surface">Título</label>
            <input id="titulo" name="titulo" type="text" required defaultValue={base?.titulo}
              placeholder="Ej: Retiro Espiritual de Cuaresma"
              className="mt-1.5 block w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:border-primary"
            />
          </div>

          <div>
            <label htmlFor="tipo" className="text-sm font-medium text-on-surface">Tipo</label>
            <select id="tipo" name="tipo" required defaultValue={base?.tipo ?? ""}
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
            <input id="ubicacion" name="ubicacion" type="text" defaultValue={base?.ubicacion ?? ""}
              placeholder="Ej: Parroquia Santiago Apóstol, Godoy Cruz"
              className="mt-1.5 block w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:border-primary"
            />
          </div>

          <div>
            <label htmlFor="fecha_inicio_date" className="text-sm font-medium text-on-surface">Fecha de Inicio</label>
            <DateInputDMY id="fecha_inicio_date" name="fecha_inicio_date" required
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
            <DateInputDMY id="fecha_fin_date" name="fecha_fin_date"
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
            <textarea id="descripcion" name="descripcion" rows={4} defaultValue={base?.descripcion ?? ""}
              placeholder="Describí los detalles del evento..."
              className="mt-1.5 block w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:border-primary resize-y"
            />
          </div>

          <div className="md:col-span-2 flex items-start gap-3 pt-2">
            <input
              type="checkbox"
              id="activo"
              name="activo"
              defaultChecked
              className="mt-0.5 h-4 w-4 rounded border-outline-variant
                         accent-primary cursor-pointer"
            />
            <div>
              <label htmlFor="activo"
                     className="text-sm font-medium text-on-surface
                                cursor-pointer">
                Publicar evento
              </label>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Si está desmarcado, el evento no será visible al público.
              </p>
            </div>
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
