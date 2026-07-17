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
  const { data } = await supabase
    .from("solicitudes")
    .select(
      "id, tipo, motivo, campo_editado, estado, created_at, lugares(nombre, departamento), perfiles(nombre_completo, email)",
    )
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-xl font-semibold text-on-surface md:text-2xl">
        Solicitudes de Baja
      </h1>
      <p className="mt-0.5 text-sm text-on-surface-variant">
        Pedidos de eliminación de capillas enviados por los editores.
      </p>

      <SolicitudesList initialSolicitudes={(data ?? []) as unknown as Solicitud[]} />
    </div>
  );
}
