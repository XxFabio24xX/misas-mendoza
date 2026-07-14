import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { EventosList } from "./eventos-list";

export const dynamic = "force-dynamic";

export default async function EventosPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  let query = supabase.from("eventos").select("*, lugares(nombre)");
  if (perfil?.rol === "editor_departamento" && perfil?.departamento_asignado) {
    query = query.eq("departamento", perfil.departamento_asignado);
  }
  query = query.order("fecha_inicio", { ascending: false });

  const { data } = await query;

  return (
    <div>
      <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-on-surface md:text-2xl">
            Gestión de Eventos
          </h1>
          <p className="mt-0.5 text-sm text-on-surface-variant">
            Administrá los eventos y avisos de la comunidad.
          </p>
        </div>
        <Link
          href="/admin/eventos/nuevo"
          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-on-primary transition-colors hover:bg-primary-container hover:text-on-primary-container md:w-auto"
        >
          <Plus className="h-4 w-4" />
          Agregar
        </Link>
      </div>

      <EventosList initialEventos={data ?? []} />
    </div>
  );
}
