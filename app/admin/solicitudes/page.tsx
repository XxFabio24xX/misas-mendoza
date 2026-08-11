import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { SolicitudesList, type Solicitud } from "./solicitudes-list";

export const dynamic = "force-dynamic";

export default async function SolicitudesPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("rol")
    .eq("id", user.id)
    .maybeSingle();

  if (perfil?.rol !== "super_admin" && perfil?.rol !== "admin_departamento") redirect("/admin");

  // RLS: super_admin lee todas, admin_departamento solo las de su depto.
  // perfiles!solicitado_por: hay dos FKs de solicitudes hacia perfiles
  // (solicitado_por y revisado_por) — sin desambiguar, PostgREST no puede
  // resolver el embed ("more than one relationship was found") y la query
  // falla entera.
  const { data, error } = await supabase
    .from("solicitudes")
    .select(
      "id, tipo, motivo, campo_editado, estado, created_at, lugares(nombre, departamento), perfiles!solicitado_por(nombre_completo, email)",
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("ERROR AL CARGAR SOLICITUDES:", error);
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-on-surface md:text-2xl">
        Solicitudes
      </h1>
      <p className="mt-0.5 text-sm text-on-surface-variant">
        Pedidos de alta, baja y edición enviados por los editores.
      </p>

      {error ? (
        <div
          role="status"
          aria-live="polite"
          className="mt-6 rounded-xl bg-error-container px-4 py-3 text-sm text-on-error-container"
        >
          No se pudieron cargar las solicitudes. Intentá de nuevo.
        </div>
      ) : (
        <SolicitudesList initialSolicitudes={(data ?? []) as unknown as Solicitud[]} />
      )}
    </div>
  );
}
