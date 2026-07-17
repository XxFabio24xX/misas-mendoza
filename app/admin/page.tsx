import Link from "next/link";
import { redirect } from "next/navigation";
import { Church, Calendar, Inbox, Users, Clock, Trash2 } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type Lugar = {
  id: string;
  nombre: string;
  departamento: string;
  slug: string;
  activo: boolean;
};

type Estado = "pendiente" | "aprobada" | "rechazada";

type Solicitud = {
  id: string;
  motivo: string;
  estado: Estado;
  created_at: string;
  lugares: { nombre: string; slug: string } | null;
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

function estadoLabel(estado: Estado): string {
  if (estado === "aprobada") return "Aprobada";
  if (estado === "rechazada") return "Rechazada";
  return "Pendiente";
}

function estadoBadgeClass(estado: Estado): string {
  if (estado === "aprobada") return "bg-primary/10 text-primary";
  if (estado === "rechazada") return "bg-error-container text-on-error-container";
  return "bg-surface-container text-on-surface-variant";
}

function StatCard({
  icon: Icon,
  label,
  sublabel,
  count,
  error,
}: {
  icon: typeof Church;
  label: string;
  sublabel: string;
  count: number;
  error?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl bg-surface-container-high p-4 md:p-5 ${
        error ? "ring-1 ring-error/30" : ""
      }`}
    >
      <div className="mb-3 flex items-start justify-between">
        <span
          className={`text-xs font-semibold uppercase tracking-wider ${
            error ? "text-error" : "text-on-surface-variant"
          }`}
        >
          {label}
        </span>
        <Icon className="h-4 w-4 text-on-surface-variant/50" />
      </div>
      <p className={`text-3xl font-bold md:text-4xl ${error ? "text-error" : "text-on-surface"}`}>
        {count}
      </p>
      <p className="mt-1 text-sm text-on-surface-variant">{sublabel}</p>
    </div>
  );
}

export default async function AdminDashboard() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const isSuperAdmin = perfil?.rol === "super_admin";
  const isAdminDepartamento = perfil?.rol === "admin_departamento";
  const departamento = perfil?.departamento_asignado ?? "";

  let lugares: Lugar[] = [];
  let lugarIdsConHorarios = new Set<string>();
  let totalEventos = 0;
  let totalVoluntarios = 0;
  let totalSolicitudes = 0;
  let solicitudes: Solicitud[] = [];

  if (isSuperAdmin) {
    const [lugaresRes, horariosRes, eventosRes, voluntariosRes, totalSolicitudesRes, solicitudesRes] =
      await Promise.all([
        supabase
          .from("lugares")
          .select("id, nombre, departamento, slug, activo")
          .eq("activo", true)
          .order("nombre"),
        supabase.from("horarios").select("lugar_id"),
        supabase
          .from("eventos")
          .select("*", { count: "exact", head: true })
          .eq("activo", true),
        supabase
          .from("perfiles")
          .select("*", { count: "exact", head: true })
          .eq("activo", true),
        supabase
          .from("solicitudes")
          .select("*", { count: "exact", head: true })
          .eq("estado", "pendiente"),
        supabase
          .from("solicitudes")
          .select("id, motivo, estado, created_at, lugares(nombre, slug)")
          .eq("estado", "pendiente")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

    lugares = (lugaresRes.data ?? []) as Lugar[];
    lugarIdsConHorarios = new Set((horariosRes.data ?? []).map((h) => h.lugar_id));
    totalEventos = eventosRes.count ?? 0;
    totalVoluntarios = voluntariosRes.count ?? 0;
    totalSolicitudes = totalSolicitudesRes.count ?? 0;
    solicitudes = (solicitudesRes.data ?? []) as unknown as Solicitud[];
  } else if (isAdminDepartamento) {
    // RLS ya restringe "solicitudes" a las del departamento de este perfil.
    const [lugaresRes, horariosRes, eventosRes, totalSolicitudesRes, solicitudesRes] =
      await Promise.all([
        supabase
          .from("lugares")
          .select("id, nombre, departamento, slug, activo")
          .eq("activo", true)
          .eq("departamento", departamento)
          .order("nombre"),
        supabase.from("horarios").select("lugar_id"),
        supabase
          .from("eventos")
          .select("*", { count: "exact", head: true })
          .eq("activo", true)
          .eq("departamento", departamento),
        supabase
          .from("solicitudes")
          .select("*", { count: "exact", head: true })
          .eq("estado", "pendiente"),
        supabase
          .from("solicitudes")
          .select("id, motivo, estado, created_at, lugares(nombre, slug)")
          .eq("estado", "pendiente")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

    lugares = (lugaresRes.data ?? []) as Lugar[];
    lugarIdsConHorarios = new Set((horariosRes.data ?? []).map((h) => h.lugar_id));
    totalEventos = eventosRes.count ?? 0;
    totalSolicitudes = totalSolicitudesRes.count ?? 0;
    solicitudes = (solicitudesRes.data ?? []) as unknown as Solicitud[];
  } else {
    // editor: stats de su departamento + estado de sus propias solicitudes.
    const [lugaresRes, horariosRes, eventosRes, misSolicitudesRes] = await Promise.all([
      supabase
        .from("lugares")
        .select("id, nombre, departamento, slug, activo")
        .eq("activo", true)
        .eq("departamento", departamento)
        .order("nombre"),
      supabase.from("horarios").select("lugar_id"),
      supabase
        .from("eventos")
        .select("*", { count: "exact", head: true })
        .eq("activo", true)
        .eq("departamento", departamento),
      supabase
        .from("solicitudes")
        .select("id, motivo, estado, created_at, lugares(nombre, slug)")
        .eq("solicitado_por", user.id)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    lugares = (lugaresRes.data ?? []) as Lugar[];
    lugarIdsConHorarios = new Set((horariosRes.data ?? []).map((h) => h.lugar_id));
    totalEventos = eventosRes.count ?? 0;
    solicitudes = (misSolicitudesRes.data ?? []) as unknown as Solicitud[];
  }

  const capillasSinHorarios = lugares.filter((l) => !lugarIdsConHorarios.has(l.id));

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold text-on-surface">
            Hola, {perfil?.nombre_completo ?? "Voluntario"}
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Resumen de la actividad en Misas Mendoza.
          </p>
        </div>
        <Link
          href="/admin/capillas/nuevo"
          className="shrink-0 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-on-primary transition-colors hover:bg-primary-container hover:text-on-primary-container"
        >
          + Agregar capilla
        </Link>
      </div>

      <div
        className={`mt-6 grid grid-cols-1 gap-3 md:gap-4 ${
          isSuperAdmin ? "md:grid-cols-4" : isAdminDepartamento ? "md:grid-cols-3" : "md:grid-cols-2"
        }`}
      >
        {isSuperAdmin ? (
          <>
            <StatCard icon={Church} label="Activas" sublabel="Capillas" count={lugares.length} />
            <StatCard icon={Calendar} label="Próximos" sublabel="Eventos" count={totalEventos} />
            <StatCard
              icon={Inbox}
              label="Pendientes"
              sublabel="Solicitudes"
              count={totalSolicitudes}
              error={totalSolicitudes > 0}
            />
            <StatCard icon={Users} label="Registrados" sublabel="Voluntarios" count={totalVoluntarios} />
          </>
        ) : isAdminDepartamento ? (
          <>
            <StatCard
              icon={Church}
              label={`En ${departamento || "tu zona"}`}
              sublabel="Capillas"
              count={lugares.length}
            />
            <StatCard icon={Calendar} label="Activos" sublabel="Eventos" count={totalEventos} />
            <StatCard
              icon={Inbox}
              label="Pendientes"
              sublabel="Solicitudes"
              count={totalSolicitudes}
              error={totalSolicitudes > 0}
            />
          </>
        ) : (
          <>
            <StatCard
              icon={Church}
              label={`En ${departamento || "tu zona"}`}
              sublabel="Capillas"
              count={lugares.length}
            />
            <StatCard icon={Calendar} label="Activos" sublabel="Eventos" count={totalEventos} />
          </>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-2xl bg-surface-container-high p-6">
          <div className="mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-on-surface-variant" />
            <h2 className="text-base font-semibold text-on-surface">Capillas sin horarios</h2>
          </div>

          {capillasSinHorarios.length === 0 ? (
            <p className="py-2 text-sm text-on-surface-variant">
              Todas las capillas tienen horarios cargados.
            </p>
          ) : (
            <div className="divide-y divide-outline-variant/20">
              {capillasSinHorarios.map((lugar) => (
                <div key={lugar.id} className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-on-surface">{lugar.nombre}</p>
                    <p className="text-xs text-on-surface-variant">Sin horarios cargados</p>
                  </div>
                  <Link
                    href={`/admin/capillas/${lugar.id}/horarios`}
                    className="ml-auto shrink-0 text-sm text-primary hover:underline"
                  >
                    Cargar →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {isSuperAdmin || isAdminDepartamento ? (
          <div className="rounded-2xl bg-surface-container-high p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Inbox className="h-4 w-4 text-on-surface-variant" />
                <h2 className="text-base font-semibold text-on-surface">Solicitudes pendientes</h2>
              </div>
              <Link href="/admin/solicitudes" className="text-xs text-primary hover:underline">
                Ver todas
              </Link>
            </div>

            {solicitudes.length === 0 ? (
              <p className="py-2 text-sm text-on-surface-variant">
                No hay solicitudes pendientes.
              </p>
            ) : (
              <div className="divide-y divide-outline-variant/20">
                {solicitudes.map((solicitud) => (
                  <div key={solicitud.id} className="flex items-start gap-3 py-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-container">
                      <Trash2 className="h-4 w-4 text-on-surface-variant" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-on-surface">
                        {solicitud.lugares?.nombre ?? "Capilla eliminada"}
                      </p>
                      <p className="truncate text-xs text-on-surface-variant">{solicitud.motivo}</p>
                    </div>
                    <span className="ml-auto shrink-0 rounded-full bg-surface-container px-2 py-0.5 text-xs text-on-surface-variant">
                      {tiempoRelativo(solicitud.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl bg-surface-container-high p-6">
            <div className="mb-4 flex items-center gap-2">
              <Inbox className="h-4 w-4 text-on-surface-variant" />
              <h2 className="text-base font-semibold text-on-surface">Mis solicitudes</h2>
            </div>

            {solicitudes.length === 0 ? (
              <p className="py-2 text-sm text-on-surface-variant">
                Todavía no enviaste solicitudes.
              </p>
            ) : (
              <div className="divide-y divide-outline-variant/20">
                {solicitudes.map((solicitud) => (
                  <div key={solicitud.id} className="flex items-center gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-on-surface">
                        {solicitud.lugares?.nombre ?? "Capilla eliminada"}
                      </p>
                      <p className="truncate text-xs text-on-surface-variant">{solicitud.motivo}</p>
                    </div>
                    <span
                      className={`ml-auto shrink-0 rounded-full px-2 py-0.5 text-xs ${estadoBadgeClass(solicitud.estado)}`}
                    >
                      {estadoLabel(solicitud.estado)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
