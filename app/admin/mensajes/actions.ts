"use server";

import { requirePerfil, AuthError } from "@/lib/auth-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { revalidatePath } from "next/cache";

export async function actualizarMensaje(
  mensajeId: string,
  campos: { estado?: string; notas_internas?: string },
) {
  const perfil = await requirePerfil();
  if (perfil.rol === "editor") throw new AuthError("Sin permisos.");

  // supabaseAdmin bypasea RLS: replicamos acá el ground-truth check de
  // departamento (mismo patrón que assertPuedeGestionarSolicitud en
  // solicitudes/actions.ts) para que admin_departamento no pueda tocar
  // mensajes de otro departamento.
  if (perfil.rol === "admin_departamento") {
    const { data: mensaje } = await supabaseAdmin
      .from("mensajes")
      .select("departamento")
      .eq("id", mensajeId)
      .maybeSingle();
    if (!mensaje) throw new Error("El mensaje no existe.");
    if (mensaje.departamento !== null && mensaje.departamento !== perfil.departamento_asignado) {
      throw new AuthError("Este mensaje no pertenece a tu departamento.");
    }
  }

  const { error } = await supabaseAdmin
    .from("mensajes")
    .update({
      ...campos,
      leido_por: perfil.id,
    })
    .eq("id", mensajeId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/mensajes");
}
