import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { VoluntariosList } from "./voluntarios-list";

export const dynamic = "force-dynamic";

export default async function VoluntariosPage() {
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

  if (perfil?.rol !== "super_admin") redirect("/admin");

  const { data } = await supabase
    .from("perfiles")
    .select("*")
    .order("nombre_completo");

  return (
    <div>
      <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-on-surface md:text-2xl">
            Gestión de Voluntarios
          </h1>
          <p className="mt-0.5 text-sm text-on-surface-variant">
            Administrá los accesos, roles y departamentos asignados a los coordinadores.
          </p>
        </div>
        <Link
          href="/admin/voluntarios/nuevo"
          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-on-primary transition-colors hover:bg-primary-container hover:text-on-primary-container md:w-auto"
        >
          <Plus className="h-4 w-4" />
          Agregar
        </Link>
      </div>

      <VoluntariosList initialPerfiles={data ?? []} />
    </div>
  );
}
