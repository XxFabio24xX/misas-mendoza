import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { QuickList } from "./quick-list";

export const dynamic = "force-dynamic";

const DEPARTMENTS = ["Capital", "Las Heras", "Guaymallén", "Godoy Cruz", "Maipú"];

type Lugar = {
  id: string;
  nombre: string;
  departamento: string;
  direccion: string;
  imagen_url?: string | null;
  telefono?: string | null;
  decanato?: string | null;
  descripcion?: string | null;
  created_at: string;
};

type Horario = {
  id: string;
  lugar_id: string;
  dia_semana: number;
  hora: string;
};

function missingFields(lugar: Lugar): string[] {
  const missing: string[] = [];
  if (!lugar.direccion) missing.push("dirección");
  if (!lugar.telefono) missing.push("teléfono");
  if (!lugar.descripcion) missing.push("descripción");
  return missing;
}

export default async function AdminDashboard() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [lugaresRes, horariosRes] = await Promise.all([
    supabase.from("lugares").select("*"),
    supabase.from("horarios").select("*"),
  ]);
  const lugares = (lugaresRes.data ?? []) as Lugar[];
  const horarios = (horariosRes.data ?? []) as Horario[];

  const horariosMap = new Map<string, Horario[]>();
  for (const h of horarios) {
    if (!horariosMap.has(h.lugar_id)) horariosMap.set(h.lugar_id, []);
    horariosMap.get(h.lugar_id)!.push(h);
  }

  const deptCounts: Record<string, number> = {};
  for (const d of DEPARTMENTS) deptCounts[d] = 0;
  for (const l of lugares) {
    if (deptCounts[l.departamento] !== undefined) deptCounts[l.departamento]++;
  }

  return (
    <div>
      <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-on-surface md:text-2xl">
            Resumen Operativo
          </h1>
          <p className="mt-0.5 text-sm text-on-surface-variant">
            Vista general del estado de capillas por departamento.
          </p>
        </div>
        <Link
          href="/admin/capillas/nuevo"
          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary-container hover:text-on-primary-container md:w-auto"
        >
          <Plus className="h-4 w-4" />
          Agregar Nueva Capilla
        </Link>
      </div>

      <section className="mt-6">
        <h2 className="text-sm font-semibold text-on-surface">
          Resumen de Capillas por Departamento
        </h2>
        <div className="mt-3 grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {DEPARTMENTS.map((dept) => {
            const count = deptCounts[dept] ?? 0;
            const deptLugares = lugares.filter((l) => l.departamento === dept);
            const sinFoto = deptLugares.filter((l) => !l.imagen_url).length;
            const sinHorarios = deptLugares.filter((l) => !horariosMap.get(l.id)?.length).length;
            const incompletas = deptLugares.filter((l) => missingFields(l).length > 0).length;
            const hasIssues = sinFoto > 0 || sinHorarios > 0 || incompletas > 0;

            return (
              <div
                key={dept}
                className={`w-full wrap-break-word rounded-xl bg-secondary-container p-4 shadow-[0_4px_16px_rgba(118,146,131,0.06)] ${!hasIssues && count > 0 ? "ring-1 ring-primary/30" : ""}`}
              >
                <p className="text-sm font-semibold text-on-surface">{dept}</p>
                <p className="mt-1 text-2xl font-bold text-primary">
                  {count}
                  <span className="ml-1 text-sm font-normal text-on-surface-variant">
                    capillas
                  </span>
                </p>
                {count > 0 && (
                  <div className="mt-3 space-y-1.5">
                    {sinFoto > 0 && (
                      <p className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                        <AlertTriangle className="h-3 w-3 shrink-0 text-outline" />
                        {sinFoto} sin foto
                      </p>
                    )}
                    {sinHorarios > 0 && (
                      <p className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                        <Clock className="h-3 w-3 shrink-0 text-outline" />
                        {sinHorarios} sin horarios
                      </p>
                    )}
                    {incompletas > 0 && (
                      <p className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                        <AlertTriangle className="h-3 w-3 shrink-0 text-outline" />
                        {incompletas} incompletas
                      </p>
                    )}
                    {!hasIssues && (
                      <p className="flex items-center gap-1.5 text-xs text-primary">
                        <CheckCircle className="h-3 w-3 shrink-0" />
                        Completas
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <QuickList initialLugares={lugares} initialHorarios={horarios} />
    </div>
  );
}
