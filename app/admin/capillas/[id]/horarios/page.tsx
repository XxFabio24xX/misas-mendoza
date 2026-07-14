"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Clock, Loader2, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { agregarHorario, editarHorario, eliminarHorario } from "../../actions";

const DIAS = [
  { value: 0, label: "Domingo", short: "Dom" },
  { value: 1, label: "Lunes", short: "Lun" },
  { value: 2, label: "Martes", short: "Mar" },
  { value: 3, label: "Miércoles", short: "Mié" },
  { value: 4, label: "Jueves", short: "Jue" },
  { value: 5, label: "Viernes", short: "Vie" },
  { value: 6, label: "Sábado", short: "Sáb" },
];

const TIPOS_ACTIVIDAD = [
  "Misa",
  "Misa Vespertina",
  "Misa de Enfermos",
  "Misa Juvenil",
  "Misa Familiar",
  "Rosario",
  "Adoración",
  "Otro",
];

const TEMPORADAS = [
  { value: "Todo el año", label: "Todo el año" },
  { value: "Invierno", label: "Invierno (Jun–Ago)" },
  { value: "Verano", label: "Verano (Dic–Feb)" },
];

const TEMP_CHIP: Record<string, string> = {
  "Todo el año": "bg-primary/10 text-primary border border-primary/20",
  Invierno: "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
  Verano: "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
};

const TEMP_BTN_ACTIVE: Record<string, string> = {
  "Todo el año": "border-primary bg-primary/10 text-primary",
  Invierno: "border-blue-400 bg-blue-50 text-blue-700 dark:border-blue-600 dark:bg-blue-950/40 dark:text-blue-300",
  Verano: "border-amber-400 bg-amber-50 text-amber-700 dark:border-amber-600 dark:bg-amber-950/40 dark:text-amber-300",
};

const QUICK_TIMES = ["07:00", "08:00", "09:00", "10:00", "11:00", "17:00", "18:00", "19:00", "20:00", "21:00"];

type Horario = {
  id: string;
  lugar_id: string;
  dia_semana: number;
  hora: string;
  tipo_actividad: string;
  temporada: string;
  observacion?: string;
};

type Lugar = { id: string; nombre: string };

type FormState = {
  dias: number[];
  hora: string;
  tipo: string;
  tipoCustom: string;
  temporada: string;
  observacion: string;
  showObs: boolean;
};

const FORM_DEFAULT: FormState = {
  dias: [],
  hora: "08:00",
  tipo: "Misa",
  tipoCustom: "",
  temporada: "Todo el año",
  observacion: "",
  showObs: false,
};

export default function HorariosPage() {
  const params = useParams();
  const id = params.id as string;
  const [isPending, startTransition] = useTransition();

  const [lugar, setLugar] = useState<Lugar | null>(null);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [showPanel, setShowPanel] = useState(false);
  const [form, setForm] = useState<FormState>(FORM_DEFAULT);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchLugar = useCallback(async () => {
    if (!id) return;
    const { data } = await supabase.from("lugares").select("id,nombre").eq("id", id).maybeSingle();
    if (data) setLugar(data as Lugar);
    else setError("No se encontró la capilla.");
  }, [id]);

  const fetchHorarios = useCallback(async () => {
    if (!id) return;
    const { data, error: err } = await supabase
      .from("horarios").select("*").eq("lugar_id", id)
      .order("dia_semana").order("hora");
    if (err) setError(err.message);
    else if (data) setHorarios(data as Horario[]);
  }, [id]);

  useEffect(() => {
    // Initial data load on mount — fetchLugar/fetchHorarios manage their own state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    Promise.all([fetchLugar(), fetchHorarios()]).finally(() => setLoading(false));
  }, [fetchLugar, fetchHorarios]);

  const grouped = horarios.reduce<Record<number, Horario[]>>((acc, h) => {
    if (!acc[h.dia_semana]) acc[h.dia_semana] = [];
    acc[h.dia_semana].push(h);
    return acc;
  }, {});

  function openAddFor(dia?: number) {
    setForm({ ...FORM_DEFAULT, dias: dia !== undefined ? [dia] : [] });
    setShowPanel(true);
    setEditingId(null);
    setError(null);
    setSuccess(null);
  }

  function toggleDia(dia: number) {
    setForm(f => ({
      ...f,
      dias: f.dias.includes(dia) ? f.dias.filter(d => d !== dia) : [...f.dias, dia],
    }));
  }

  function selectWeekdays() {
    const wd = [1, 2, 3, 4, 5];
    const allSel = wd.every(d => form.dias.includes(d));
    setForm(f => ({
      ...f,
      dias: allSel
        ? f.dias.filter(d => !wd.includes(d))
        : [...new Set([...f.dias, ...wd])],
    }));
  }

  function selectWeekend() {
    const we = [6, 0];
    const allSel = we.every(d => form.dias.includes(d));
    setForm(f => ({
      ...f,
      dias: allSel
        ? f.dias.filter(d => !we.includes(d))
        : [...new Set([...f.dias, ...we])],
    }));
  }

  async function handleAdd() {
    if (form.dias.length === 0) {
      setError("Seleccioná al menos un día.");
      return;
    }
    startTransition(async () => {
      setError(null);
      setSuccess(null);
      try {
        const tipo = form.tipo === "Otro" ? (form.tipoCustom.trim() || "Misa") : form.tipo;
        for (const dia of [...form.dias].sort()) {
          const fd = new FormData();
          fd.set("dia_semana", String(dia));
          fd.set("hora", form.hora);
          fd.set("tipo_actividad", tipo);
          fd.set("temporada", form.temporada);
          fd.set("observacion", form.observacion.trim());
          await agregarHorario(id, fd);
        }
        await fetchHorarios();
        const count = form.dias.length;
        setSuccess(`${count === 1 ? "1 horario agregado" : `${count} horarios agregados`} correctamente.`);
        setForm(FORM_DEFAULT);
        setShowPanel(false);
      } catch (e) {
        if (e instanceof Error && !e.message.includes("NEXT_REDIRECT")) {
          setError(e.message);
        }
      }
    });
  }

  async function handleDelete(horarioId: string) {
    if (!confirm("¿Eliminar este horario?")) return;
    setError(null);
    setSuccess(null);
    try {
      await eliminarHorario(horarioId, id);
      await fetchHorarios();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al eliminar");
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!lugar) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
        <p className="text-sm text-on-surface-variant">{error ?? "No se encontró la capilla."}</p>
        <Link href="/admin/capillas" className="text-sm font-medium text-primary hover:underline">Volver a capillas</Link>
      </div>
    );
  }

  const weekdaysSelected = [1, 2, 3, 4, 5].every(d => form.dias.includes(d));
  const weekendSelected = [6, 0].every(d => form.dias.includes(d));

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={`/admin/capillas/${id}/editar`}
          className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-on-surface md:text-2xl">
            Horarios — <span className="text-primary">{lugar.nombre}</span>
          </h1>
          <p className="mt-0.5 text-sm text-on-surface-variant">
            Configurá los horarios de misa y actividades por día y temporada.
          </p>
        </div>
        {!showPanel && (
          <button onClick={() => openAddFor()}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-on-primary transition-colors hover:bg-primary-container hover:text-on-primary-container">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Agregar</span>
          </button>
        )}
      </div>

      {/* Alerts */}
      {error && (
        <div role="status" aria-live="polite" className="mt-4 rounded-lg bg-error-container px-4 py-3 text-sm text-on-error-container">{error}</div>
      )}
      {success && (
        <div role="status" aria-live="polite" className="mt-4 rounded-lg bg-primary/10 px-4 py-3 text-sm font-medium text-primary">{success}</div>
      )}

      {/* ── Visual week overview ── */}
      <div className="mt-6">
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {DIAS.map(dia => {
            const dayH = grouped[dia.value] ?? [];
            const isWeekend = dia.value === 0 || dia.value === 6;
            return (
              <div key={dia.value}
                className="flex flex-col rounded-xl bg-surface-container shadow-[0_4px_16px_rgba(118,146,131,0.06)]">
                {/* Day header */}
                <div className={`rounded-t-xl px-1 py-2 text-center text-xs font-bold ${isWeekend ? "bg-primary/10 text-primary" : "text-on-surface-variant"}`}>
                  {dia.short}
                </div>
                {/* Mass chips */}
                <div className="flex flex-1 flex-col gap-1 p-1.5">
                  {dayH.map(h => (
                    <div key={h.id}
                      className={`rounded-md px-1 py-1 text-center leading-tight ${TEMP_CHIP[h.temporada] ?? "bg-surface-container-high text-on-surface"}`}>
                      <span className="block text-xs font-semibold tabular-nums">{h.hora.slice(0, 5)}</span>
                      {h.tipo_actividad !== "Misa" && (
                        <span className="block truncate text-[9px] opacity-70">{h.tipo_actividad}</span>
                      )}
                    </div>
                  ))}
                  {dayH.length === 0 && (
                    <div className="flex flex-1 items-center justify-center py-2">
                      <span className="text-[10px] text-on-surface-variant/40">—</span>
                    </div>
                  )}
                </div>
                {/* Add button */}
                <button onClick={() => openAddFor(dia.value)} aria-label={`Agregar horario ${dia.label}`}
                  className="cursor-pointer rounded-b-xl border-t border-outline-variant/20 py-1.5 text-center text-on-surface-variant/50 transition-colors hover:bg-surface-container-high hover:text-primary">
                  <Plus className="mx-auto h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Temporada legend */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-on-surface-variant">Referencia:</span>
          {TEMPORADAS.map(t => (
            <span key={t.value} className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${TEMP_CHIP[t.value]}`}>
              {t.value}
            </span>
          ))}
        </div>
      </div>

      {/* ── Add panel ── */}
      {showPanel && (
        <div className="mt-6 rounded-xl bg-surface-container p-5 shadow-[0_4px_16px_rgba(118,146,131,0.06)] ring-1 ring-primary/20">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-semibold text-on-surface">
              <Plus className="h-4 w-4 text-primary" />
              Nuevo Horario
            </h2>
            <button onClick={() => { setShowPanel(false); setError(null); }}
              aria-label="Cerrar" className="cursor-pointer rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-high">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-5 space-y-6">

            {/* ── Day selector ── */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-on-surface">
                  Días <span className="ml-1 text-xs font-normal text-on-surface-variant">(seleccioná uno o varios)</span>
                </label>
                <div className="flex gap-2">
                  <button type="button" onClick={selectWeekdays}
                    className={`cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${weekdaysSelected ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"}`}>
                    Lun–Vie
                  </button>
                  <button type="button" onClick={selectWeekend}
                    className={`cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${weekendSelected ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"}`}>
                    Fin de semana
                  </button>
                </div>
              </div>
              <div className="mt-2 grid grid-cols-7 gap-1.5">
                {DIAS.map(dia => (
                  <button key={dia.value} type="button" onClick={() => toggleDia(dia.value)}
                    className={`cursor-pointer rounded-lg py-2.5 text-xs font-semibold transition-colors ${
                      form.dias.includes(dia.value)
                        ? "bg-primary text-on-primary shadow-sm"
                        : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
                    }`}>
                    {dia.short}
                  </button>
                ))}
              </div>
              {form.dias.length > 0 && (
                <p className="mt-1.5 text-xs text-on-surface-variant">
                  Seleccionados: {form.dias.sort().map(d => DIAS[d].short).join(", ")}
                </p>
              )}
            </div>

            {/* ── Time + Tipo ── */}
            <div className="grid gap-5 md:grid-cols-2">
              {/* Time */}
              <div>
                <label htmlFor="hora-input" className="text-sm font-medium text-on-surface">Hora</label>
                <div className="relative mt-1.5">
                  <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant/60" />
                  <input
                    id="hora-input"
                    type="time"
                    step="900"
                    value={form.hora}
                    onChange={e => setForm(f => ({ ...f, hora: e.target.value }))}
                    className="block w-full rounded-lg border border-outline-variant bg-surface-container-low py-2.5 pl-10 pr-4 text-sm text-on-surface outline-none transition-colors focus:border-primary"
                  />
                </div>
                {/* Quick time chips */}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {QUICK_TIMES.map(t => (
                    <button key={t} type="button" onClick={() => setForm(f => ({ ...f, hora: t }))}
                      className={`cursor-pointer rounded-md px-2 py-0.5 text-xs font-medium tabular-nums transition-colors ${
                        form.hora === t
                          ? "bg-primary text-on-primary"
                          : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
                      }`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tipo */}
              <div>
                <label htmlFor="tipo-select" className="text-sm font-medium text-on-surface">Tipo de actividad</label>
                <select id="tipo-select" value={form.tipo}
                  onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}
                  className="mt-1.5 block w-full appearance-none rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 pr-8 text-sm text-on-surface outline-none transition-colors focus:border-primary">
                  {TIPOS_ACTIVIDAD.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {form.tipo === "Otro" && (
                  <input
                    type="text"
                    placeholder="Especificá el tipo..."
                    value={form.tipoCustom}
                    onChange={e => setForm(f => ({ ...f, tipoCustom: e.target.value }))}
                    className="mt-2 block w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 text-sm text-on-surface outline-none transition-colors focus:border-primary"
                  />
                )}
              </div>
            </div>

            {/* ── Temporada ── */}
            <div>
              <label className="text-sm font-medium text-on-surface">Temporada</label>
              <p className="mt-0.5 text-xs text-on-surface-variant">
                Usá &quot;Invierno&quot; o &quot;Verano&quot; si la capilla cambia el horario según la época del año.
              </p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {TEMPORADAS.map(temp => (
                  <button key={temp.value} type="button"
                    onClick={() => setForm(f => ({ ...f, temporada: temp.value }))}
                    className={`cursor-pointer rounded-lg border py-2.5 text-xs font-medium transition-colors ${
                      form.temporada === temp.value
                        ? TEMP_BTN_ACTIVE[temp.value]
                        : "border-outline-variant bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
                    }`}>
                    {temp.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Observación (optional) ── */}
            <div>
              {!form.showObs ? (
                <button type="button" onClick={() => setForm(f => ({ ...f, showObs: true }))}
                  className="cursor-pointer text-xs font-medium text-on-surface-variant transition-colors hover:text-primary">
                  + Agregar observación especial
                </button>
              ) : (
                <div>
                  <label htmlFor="obs-input" className="text-sm font-medium text-on-surface">
                    Observación <span className="font-normal text-on-surface-variant">(opcional)</span>
                  </label>
                  <p className="mt-0.5 text-xs text-on-surface-variant">
                    Ej: &quot;Todos los días 11 de cada mes — Misa de Enfermos&quot;, &quot;Solo en Semana Santa&quot;, etc.
                  </p>
                  <input id="obs-input" type="text" value={form.observacion}
                    onChange={e => setForm(f => ({ ...f, observacion: e.target.value }))}
                    placeholder='Ej: "Solo los primeros domingos del mes"'
                    className="mt-1.5 block w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:border-primary"
                  />
                </div>
              )}
            </div>

            {/* ── Actions ── */}
            <div className="flex gap-3 border-t border-outline-variant/20 pt-4">
              <button type="button" onClick={() => { setShowPanel(false); setError(null); }}
                className="cursor-pointer flex-1 rounded-lg border border-outline-variant px-4 py-2.5 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container">
                Cancelar
              </button>
              <button type="button" onClick={handleAdd} disabled={isPending || form.dias.length === 0}
                className="flex flex-2 cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-on-primary transition-colors hover:bg-primary-container hover:text-on-primary-container disabled:cursor-not-allowed disabled:opacity-50">
                {isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    {form.dias.length === 0
                      ? "Seleccioná un día"
                      : form.dias.length === 1
                        ? "Agregar horario"
                        : `Agregar ${form.dias.length} horarios`}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Registered schedules ── */}
      <section className="mt-8 pb-10">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-on-surface">
            Horarios registrados
            {horarios.length > 0 && (
              <span className="ml-2 text-sm font-normal text-on-surface-variant">
                ({horarios.length})
              </span>
            )}
          </h2>
        </div>

        {horarios.length === 0 ? (
          <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-dashed border-outline-variant/50 py-14 text-center">
            <Clock className="h-10 w-10 text-on-surface-variant/30" />
            <p className="mt-3 text-sm font-medium text-on-surface-variant">Sin horarios registrados</p>
            <p className="mt-1 text-xs text-on-surface-variant/70">Usá el botón &quot;Agregar&quot; para cargar el primer horario.</p>
            <button onClick={() => openAddFor()}
              className="mt-4 inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary-container hover:text-on-primary-container">
              <Plus className="h-4 w-4" /> Agregar horario
            </button>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {DIAS.map(dia => {
              const dayH = grouped[dia.value] ?? [];
              if (dayH.length === 0) return null;
              const isWeekend = dia.value === 0 || dia.value === 6;
              return (
                <div key={dia.value} className="overflow-hidden rounded-xl bg-surface-container shadow-[0_4px_16px_rgba(118,146,131,0.06)]">
                  <div className={`flex items-center justify-between px-4 py-2.5 ${isWeekend ? "bg-primary/5" : ""}`}>
                    <h3 className={`text-sm font-semibold ${isWeekend ? "text-primary" : "text-on-surface"}`}>
                      {dia.label}
                    </h3>
                    <button onClick={() => openAddFor(dia.value)} aria-label={`Agregar horario para ${dia.label}`}
                      className="cursor-pointer inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary">
                      <Plus className="h-3 w-3" /> Agregar
                    </button>
                  </div>
                  <div className="divide-y divide-outline-variant/10">
                    {dayH.map(h =>
                      editingId === h.id ? (
                        <EditRow key={h.id} horario={h}
                          onSave={fd => {
                            startTransition(async () => {
                              setError(null);
                              try {
                                await editarHorario(h.id, id, fd);
                                setEditingId(null);
                                await fetchHorarios();
                              } catch (e) {
                                if (e instanceof Error && !e.message.includes("NEXT_REDIRECT")) {
                                  setError(e.message);
                                }
                              }
                            });
                          }}
                          onCancel={() => setEditingId(null)}
                          isPending={isPending}
                        />
                      ) : (
                        <div key={h.id} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-container-low">
                          <span className={`shrink-0 rounded-lg px-2.5 py-1.5 text-sm font-bold tabular-nums ${TEMP_CHIP[h.temporada] ?? "bg-surface-container-high text-on-surface"}`}>
                            {h.hora.slice(0, 5)}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-on-surface">{h.tipo_actividad}</p>
                            {h.observacion && (
                              <p className="mt-0.5 truncate text-xs italic text-on-surface-variant">{h.observacion}</p>
                            )}
                          </div>
                          {h.temporada !== "Todo el año" && (
                            <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${TEMP_CHIP[h.temporada]}`}>
                              {h.temporada}
                            </span>
                          )}
                          <div className="flex shrink-0 gap-1">
                            <button onClick={() => setEditingId(h.id)} aria-label="Editar horario"
                              className="cursor-pointer rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary">
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleDelete(h.id)} aria-label="Eliminar horario"
                              className="cursor-pointer rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-error">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

/* ─── Inline edit row ─── */

const inputCls = "mt-1 block w-full rounded-lg border border-outline-variant bg-surface-container px-3 py-2 text-xs text-on-surface outline-none transition-colors focus:border-primary";
const selectCls = "mt-1 block w-full appearance-none rounded-lg border border-outline-variant bg-surface-container px-3 py-2 pr-7 text-xs text-on-surface outline-none transition-colors focus:border-primary";

function EditRow({
  horario,
  onSave,
  onCancel,
  isPending,
}: {
  horario: Horario;
  onSave: (fd: FormData) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  return (
    <form action={onSave} className="bg-surface-container-lowest px-4 py-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-22.5">
          <label className="text-xs font-medium text-on-surface-variant">Día</label>
          <select name="dia_semana" defaultValue={horario.dia_semana} className={selectCls}>
            {DIAS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        </div>
        <div className="min-w-27.5">
          <label className="text-xs font-medium text-on-surface-variant">Hora</label>
          <input name="hora" type="time" step="900" defaultValue={horario.hora} className={inputCls} />
        </div>
        <div className="min-w-35 flex-1">
          <label className="text-xs font-medium text-on-surface-variant">Tipo</label>
          <input name="tipo_actividad" type="text" defaultValue={horario.tipo_actividad} className={inputCls} />
        </div>
        <div className="min-w-32.5">
          <label className="text-xs font-medium text-on-surface-variant">Temporada</label>
          <select name="temporada" defaultValue={horario.temporada} className={selectCls}>
            {TEMPORADAS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div className="min-w-40 flex-1">
          <label className="text-xs font-medium text-on-surface-variant">Observación</label>
          <input name="observacion" type="text" defaultValue={horario.observacion ?? ""} placeholder="(opcional)" className={inputCls} />
        </div>
        <div className="flex items-center gap-1.5 pb-0.5">
          <button type="submit" disabled={isPending}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-on-primary transition-colors hover:bg-primary-container hover:text-on-primary-container disabled:opacity-50">
            {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
            Guardar
          </button>
          <button type="button" onClick={onCancel}
            className="cursor-pointer rounded-lg border border-outline-variant p-2 text-on-surface-variant transition-colors hover:bg-surface-container">
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>
    </form>
  );
}
