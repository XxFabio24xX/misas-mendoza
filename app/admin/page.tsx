import Link from "next/link";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Church, Calendar, Inbox, Users, CheckCircle } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type Lugar = {
  id: string;
  nombre: string;
  departamento: string;
  slug: string;
  activo: boolean;
};

type Solicitud = {
  id: string;
  created_at: string;
  lugares: { nombre: string; slug: string } | null;
};

function StatCard({
  icon: Icon,
  count,
  label,
  highlight,
}: {
  icon: typeof Church;
  count: number;
  label: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border border-outline-variant/30 p-5 ${
        highlight ? "bg-error-container text-on-error-container" : "bg-surface-container"
      }`}
    >
      <Icon
        className={`h-5 w-5 float-right opacity-50 ${
          highlight ? "text-on-error-container" : "text-on-surface-variant"
        }`}
      />
      <p className={`text-3xl font-bold ${highlight ? "text-on-error-container" : "text-primary"}`}>
        {count}
      </p>
      <p
        className={`text-xs font-semibold uppercase tracking-wider ${
          highlight ? "text-on-error-container" : "text-on-surface-variant"
        }`}
      >
        {label}
      </p>
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

  const isAdmin = perfil?.rol === "admin";

  let lugares: Lugar[] = [];
  let lugarIdsConHorarios = new Set<string>();
  let totalEventos = 0;
  let totalVoluntarios = 0;
  let solicitudes: Solicitud[] = [];
  let totalSolicitudes = 0;

  if (isAdmin) {
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
          .from("solicitudes_baja")
          .select("*", { count: "exact", head: true })
          .eq("estado", "pendiente"),
        supabase
          .from("solicitudes_baja")
          .select("id, created_at, lugares(nombre, slug)")
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
  } else {
    const [lugaresRes, horariosRes, eventosRes] = await Promise.all([
      supabase
        .from("lugares")
        .select("id, nombre, departamento, slug, activo")
        .eq("activo", true)
        .eq("departamento", perfil?.departamento_asignado ?? "")
        .order("nombre"),
      supabase.from("horarios").select("lugar_id"),
      supabase
        .from("eventos")
        .select("*", { count: "exact", head: true })
        .eq("activo", true)
        .eq("departamento", perfil?.departamento_asignado ?? ""),
    ]);

    lugares = (lugaresRes.data ?? []) as Lugar[];
    lugarIdsConHorarios = new Set((horariosRes.data ?? []).map((h) => h.lugar_id));
    totalEventos = eventosRes.count ?? 0;
  }

  const capillasSinHorarios = lugares.filter((l) => !lugarIdsConHorarios.has(l.id));

  return (
    <div>
      <h1 className="text-xl font-semibold text-on-surface md:text-2xl">
        Hola, {perfil?.nombre_completo ?? "Voluntario"} 👋
      </h1>
      <p className="mt-0.5 text-sm text-on-surface-variant">
        {isAdmin
          ? "Vista general de toda la arquidiócesis"
          : `Vista de ${perfil?.departamento_asignado ?? "tu departamento"}`}
      </p>

      <section
        className={`mt-6 grid grid-cols-2 gap-3 ${isAdmin ? "md:grid-cols-4" : ""}`}
      >
        {isAdmin ? (
          <>
            <StatCard icon={Church} count={lugares.length} label="Capillas activas" />
            <StatCard icon={Calendar} count={totalEventos} label="Eventos activos" />
            <StatCard
              icon={Inbox}
              count={totalSolicitudes ?? 0}
              label="Solicitudes pendientes"
              highlight={(totalSolicitudes ?? 0) > 0}
            />
            <StatCard icon={Users} count={totalVoluntarios} label="Voluntarios activos" />
          </>
        ) : (
          <>
            <StatCard
              icon={Church}
              count={lugares.length}
              label={`Capillas en ${perfil?.departamento_asignado ?? "tu zona"}`}
            />
            <StatCard icon={Calendar} count={totalEventos} label="Eventos activos en tu zona" />
          </>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-on-surface">⚠️ Capillas sin horarios</h2>
        <p className="mt-0.5 text-xs text-on-surface-variant">
          {isAdmin ? "De toda la arquidiócesis" : perfil?.departamento_asignado}
        </p>

        {capillasSinHorarios.length === 0 ? (
          <p className="mt-4 flex items-center gap-1.5 text-sm text-primary">
            <CheckCircle className="h-4 w-4 shrink-0" />
            Todas las capillas tienen horarios cargados ✓
          </p>
        ) : (
          <>
            <div className="mt-3 divide-y divide-outline-variant/20 rounded-xl bg-surface-container px-4">
              {capillasSinHorarios.slice(0, 10).map((lugar) => (
                <div key={lugar.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-on-surface">{lugar.nombre}</p>
                    <p className="text-xs text-on-surface-variant">{lugar.departamento}</p>
                  </div>
                  <Link
                    href={`/admin/capillas/${lugar.id}/horarios`}
                    className="shrink-0 text-sm text-primary hover:underline"
                  >
                    Cargar horarios →
                  </Link>
                </div>
              ))}
            </div>
            {capillasSinHorarios.length > 10 && (
              <Link
                href="/admin/capillas"
                className="mt-3 inline-block text-sm text-primary hover:underline"
              >
                Ver todas ({capillasSinHorarios.length})
              </Link>
            )}
          </>
        )}
      </section>

      {isAdmin && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold text-on-surface">
            📋 Solicitudes de baja pendientes
          </h2>

          {solicitudes.length === 0 ? (
            <p className="mt-4 flex items-center gap-1.5 text-sm text-primary">
              <CheckCircle className="h-4 w-4 shrink-0" />
              No hay solicitudes pendientes ✓
            </p>
          ) : (
            <>
              <div className="mt-3 divide-y divide-outline-variant/20 rounded-xl bg-surface-container px-4">
                {solicitudes.slice(0, 5).map((solicitud) => (
                  <div key={solicitud.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-on-surface">
                        {solicitud.lugares?.nombre ?? "Capilla eliminada"}
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        {format(new Date(solicitud.created_at), "d MMM yyyy", { locale: es })}
                      </p>
                    </div>
                    <Link
                      href="/admin/solicitudes"
                      className="shrink-0 text-sm text-primary hover:underline"
                    >
                      Revisar →
                    </Link>
                  </div>
                ))}
              </div>
              {totalSolicitudes > 5 && (
                <Link
                  href="/admin/solicitudes"
                  className="mt-3 inline-block text-sm text-primary hover:underline"
                >
                  Ver todas en Solicitudes →
                </Link>
              )}
            </>
          )}
        </section>
      )}
    </div>
  );
}
