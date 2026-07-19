"use client";

import { useRef, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

const DIAS_SEMANA = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const TEMPORADAS = ["Todo el año", "Invierno", "Verano"] as const;

type Temporada = (typeof TEMPORADAS)[number];

export type HorarioData = {
  tipo: "semanal" | "mensual";
  dia_semana: number;
  dia_mes: number;
  hora: string;
  temporada: Temporada;
  /** Solo mensuales: esta misa cancela las misas normales del día. */
  reemplaza_dia?: boolean;
  /** No se edita acá, pero se preserva en el round-trip guardar/cargar. */
  observacion?: string | null;
};

type HorarioRow = HorarioData & { _key: string };

type Props = {
  initialHorarios?: HorarioData[];
  name?: string;
};

const INPUT_CLS =
  "rounded-lg border border-outline-variant bg-surface-container px-3 py-1.5 text-sm text-on-surface outline-none transition-colors focus:border-primary";

export function HorariosGrid({ initialHorarios = [], name = "horarios_json" }: Props) {
  const counter = useRef(0);
  const makeKey = () => `h${counter.current++}`;

  const [rows, setRows] = useState<HorarioRow[]>(() =>
    initialHorarios.map((h, i) => ({ ...h, _key: `init-${i}` }))
  );

  const addRow = () =>
    setRows((prev) => [
      ...prev,
      { _key: makeKey(), tipo: "semanal", dia_semana: 0, dia_mes: 1, hora: "08:00", temporada: "Todo el año" },
    ]);

  const removeRow = (key: string) =>
    setRows((prev) => prev.filter((r) => r._key !== key));

  const updateRow = (key: string, patch: Partial<HorarioRow>) =>
    setRows((prev) => prev.map((r) => (r._key === key ? { ...r, ...patch } : r)));

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const jsonValue = JSON.stringify(rows.map(({ _key, ...rest }) => rest));

  return (
    <div>
      <input type="hidden" name={name} value={jsonValue} />

      {/* Desktop table */}
      {rows.length > 0 && (
        <div className="hidden overflow-hidden rounded-xl border border-outline-variant/30 md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant/20 bg-surface-container-low">
                {["Tipo", "Día", "Hora", "Temporada", ""].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {rows.map((row) => (
                <tr key={row._key} className="bg-surface-container-low/40">
                  <td className="px-4 py-2">
                    <select
                      value={row.tipo}
                      onChange={(e) =>
                        updateRow(row._key, { tipo: e.target.value as HorarioRow["tipo"] })
                      }
                      className={INPUT_CLS}
                    >
                      <option value="semanal">Semanal</option>
                      <option value="mensual">Mensual Fijo</option>
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    {row.tipo === "semanal" ? (
                      <select
                        value={row.dia_semana}
                        onChange={(e) => updateRow(row._key, { dia_semana: Number(e.target.value) })}
                        className={INPUT_CLS}
                      >
                        {DIAS_SEMANA.map((d, i) => (
                          <option key={i} value={i}>
                            {d}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={1}
                            max={31}
                            value={row.dia_mes}
                            onChange={(e) => updateRow(row._key, { dia_mes: Number(e.target.value) })}
                            className={`${INPUT_CLS} w-20`}
                          />
                          <span className="text-xs text-on-surface-variant">del mes</span>
                        </div>
                        <label className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                          <input
                            type="checkbox"
                            checked={row.reemplaza_dia ?? false}
                            onChange={(e) => updateRow(row._key, { reemplaza_dia: e.target.checked })}
                            className="h-3.5 w-3.5 rounded border-outline-variant text-primary"
                          />
                          Reemplaza las misas del día
                        </label>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="time"
                      value={row.hora}
                      onChange={(e) => updateRow(row._key, { hora: e.target.value })}
                      className={INPUT_CLS}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <select
                      value={row.temporada}
                      onChange={(e) =>
                        updateRow(row._key, { temporada: e.target.value as Temporada })
                      }
                      className={INPUT_CLS}
                    >
                      {TEMPORADAS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => removeRow(row._key)}
                      aria-label="Eliminar horario"
                      className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-error-container hover:text-error"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {rows.map((row, i) => (
          <div
            key={row._key}
            className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                Horario {i + 1}
              </span>
              <button
                type="button"
                onClick={() => removeRow(row._key)}
                aria-label="Eliminar"
                className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-error-container hover:text-error"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-on-surface-variant">Tipo</label>
                <select
                  value={row.tipo}
                  onChange={(e) =>
                    updateRow(row._key, { tipo: e.target.value as HorarioRow["tipo"] })
                  }
                  className="mt-1 block w-full rounded-lg border border-outline-variant/30 bg-surface-container px-3 py-2 text-sm text-on-surface outline-none focus:border-primary"
                >
                  <option value="semanal">Semanal</option>
                  <option value="mensual">Mensual Fijo</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-on-surface-variant">
                  {row.tipo === "semanal" ? "Día de la semana" : "Día del mes"}
                </label>
                {row.tipo === "semanal" ? (
                  <select
                    value={row.dia_semana}
                    onChange={(e) => updateRow(row._key, { dia_semana: Number(e.target.value) })}
                    className="mt-1 block w-full rounded-lg border border-outline-variant/30 bg-surface-container px-3 py-2 text-sm text-on-surface outline-none focus:border-primary"
                  >
                    {DIAS_SEMANA.map((d, i) => (
                      <option key={i} value={i}>
                        {d}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={row.dia_mes}
                    onChange={(e) => updateRow(row._key, { dia_mes: Number(e.target.value) })}
                    className="mt-1 block w-full rounded-lg border border-outline-variant/30 bg-surface-container px-3 py-2 text-sm text-on-surface outline-none focus:border-primary"
                  />
                )}
              </div>
              {row.tipo === "mensual" && (
                <label className="col-span-2 flex items-center gap-2 text-xs text-on-surface-variant">
                  <input
                    type="checkbox"
                    checked={row.reemplaza_dia ?? false}
                    onChange={(e) => updateRow(row._key, { reemplaza_dia: e.target.checked })}
                    className="h-3.5 w-3.5 rounded border-outline-variant text-primary"
                  />
                  Reemplaza las misas normales del día
                </label>
              )}
              <div>
                <label className="text-xs font-medium text-on-surface-variant">Hora</label>
                <input
                  type="time"
                  value={row.hora}
                  onChange={(e) => updateRow(row._key, { hora: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-outline-variant/30 bg-surface-container px-3 py-2 text-sm text-on-surface outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-on-surface-variant">Temporada</label>
                <select
                  value={row.temporada}
                  onChange={(e) =>
                    updateRow(row._key, { temporada: e.target.value as Temporada })
                  }
                  className="mt-1 block w-full rounded-lg border border-outline-variant/30 bg-surface-container px-3 py-2 text-sm text-on-surface outline-none focus:border-primary"
                >
                  {TEMPORADAS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {rows.length === 0 && (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-outline-variant/50 py-8 text-sm text-on-surface-variant">
          No hay horarios. Hacé clic en &ldquo;Agregar Horario&rdquo; para empezar.
        </div>
      )}

      <button
        type="button"
        onClick={addRow}
        className="mt-4 flex items-center gap-2 rounded-lg border border-outline-variant px-4 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
      >
        <Plus className="h-4 w-4" />
        Agregar Horario
      </button>
    </div>
  );
}
