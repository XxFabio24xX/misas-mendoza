"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { revalidatePath } from "next/cache";
import { requirePerfil, assertAdmin } from "@/lib/auth-server";

/**
 * Aprueba la solicitud eliminando la capilla. La fila de la solicitud
 * desaparece junto con ella (FK lugar_id ON DELETE CASCADE).
 */
export async function aprobarSolicitudBaja(solicitudId: string) {
  assertAdmin(await requirePerfil());

  const { data: solicitud } = await supabaseAdmin
    .from("solicitudes")
    .select("lugar_id, estado")
    .eq("id", solicitudId)
    .maybeSingle();

  if (!solicitud) throw new Error("La solicitud no existe.");
  if (solicitud.estado !== "pendiente") {
    throw new Error("La solicitud ya fue resuelta.");
  }

  const { error } = await supabaseAdmin
    .from("lugares")
    .delete()
    .eq("id", solicitud.lugar_id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/solicitudes");
  revalidatePath("/admin/capillas");
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/mapa");
}

export async function rechazarSolicitudBaja(solicitudId: string) {
  assertAdmin(await requirePerfil());

  const { error } = await supabaseAdmin
    .from("solicitudes")
    .update({ estado: "rechazada" })
    .eq("id", solicitudId)
    .eq("estado", "pendiente");
  if (error) throw new Error(error.message);

  revalidatePath("/admin/solicitudes");
}
