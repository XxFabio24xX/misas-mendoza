import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { requirePerfil, AuthError } from "@/lib/auth-server";
import { MisSolicitudesList } from "./mis-solicitudes-list";
import type { Solicitud } from "@/app/admin/solicitudes/solicitudes-list";

export const dynamic = "force-dynamic";

export default async function MisSolicitudesPage() {
  let perfil;
  try {
    perfil = await requirePerfil();
  } catch (e) {
    if (e instanceof AuthError) redirect("/login");
    throw e;
  }

  const supabase = await createServerSupabaseClient();

  // RLS ("Usuarios leen sus propias solicitudes", migración 011) ya escopea
  // esto a las propias filas; el .eq de acá es defensivo, no reemplaza la
  // policy. perfiles!solicitado_por: hay dos FKs de solicitudes hacia
  // perfiles (solicitado_por y revisado_por) — sin desambiguar, PostgREST no
  // puede resolver el embed y la query falla entera (ver admin/solicitudes/page.tsx).
  const { data, error } = await supabase
    .from("solicitudes")
    .select(
      "id, tipo, motivo, campo_editado, estado, created_at, datos_propuestos, lugares(nombre, departamento), perfiles!solicitado_por(nombre_completo, email)",
    )
    .eq("solicitado_por", perfil.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("ERROR AL CARGAR MIS SOLICITUDES:", error);
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-on-surface md:text-2xl">
        Mis solicitudes
      </h1>
      <p className="mt-0.5 text-sm text-on-surface-variant">
        Estado de tus pedidos de alta, baja y edición.
      </p>

      {error ? (
        <div
          role="status"
          aria-live="polite"
          className="mt-6 rounded-xl bg-error-container px-4 py-3 text-sm text-on-error-container"
        >
          No se pudieron cargar tus solicitudes. Intentá de nuevo.
        </div>
      ) : (
        <MisSolicitudesList solicitudes={(data ?? []) as unknown as Solicitud[]} />
      )}
    </div>
  );
}
