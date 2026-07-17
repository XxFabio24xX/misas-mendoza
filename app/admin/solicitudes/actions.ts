"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { revalidatePath } from "next/cache";
import { requirePerfil, AuthError, type Perfil } from "@/lib/auth-server";
import type { HorarioData } from "@/app/components/horarios-grid";

/**
 * Super admin puede gestionar cualquier solicitud; admin_departamento solo
 * las de su propio departamento. Las de tipo "alta" todavía no tienen
 * lugar_id (la capilla no existe hasta que se aprueban), así que el
 * departamento sale de datos_propuestos en ese caso.
 */
async function assertPuedeGestionarSolicitud(perfil: Perfil, solicitudId: string) {
  if (perfil.rol === "super_admin") return;

  if (perfil.rol !== "admin_departamento") {
    throw new AuthError("No tenés permisos para gestionar solicitudes.");
  }

  const { data: solicitud } = await supabaseAdmin
    .from("solicitudes")
    .select("lugar_id, datos_propuestos, lugares(departamento)")
    .eq("id", solicitudId)
    .maybeSingle();

  if (!solicitud) throw new Error("La solicitud no existe.");

  const departamento =
    (solicitud.lugares as { departamento?: string } | null)?.departamento ??
    (solicitud.datos_propuestos as { departamento?: string } | null)?.departamento;

  if (perfil.departamento_asignado !== departamento) {
    throw new AuthError("Esta solicitud no pertenece a tu departamento.");
  }
}

/**
 * Aprueba la solicitud eliminando la capilla. La fila de la solicitud
 * desaparece junto con ella (FK lugar_id ON DELETE CASCADE).
 */
export async function aprobarSolicitudBaja(solicitudId: string) {
  const perfil = await requirePerfil();
  await assertPuedeGestionarSolicitud(perfil, solicitudId);

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
  const perfil = await requirePerfil();
  await assertPuedeGestionarSolicitud(perfil, solicitudId);

  const { error } = await supabaseAdmin
    .from("solicitudes")
    .update({ estado: "rechazada" })
    .eq("id", solicitudId)
    .eq("estado", "pendiente");
  if (error) throw new Error(error.message);

  revalidatePath("/admin/solicitudes");
}

/** Aprueba una solicitud de alta: crea la capilla con los datos propuestos. */
export async function aprobarSolicitudAlta(solicitudId: string) {
  const perfil = await requirePerfil();
  await assertPuedeGestionarSolicitud(perfil, solicitudId);

  const { data: solicitud } = await supabaseAdmin
    .from("solicitudes")
    .select("datos_propuestos, estado")
    .eq("id", solicitudId)
    .maybeSingle();

  if (!solicitud) throw new Error("La solicitud no existe.");
  if (solicitud.estado !== "pendiente") {
    throw new Error("La solicitud ya fue resuelta.");
  }

  const datos = solicitud.datos_propuestos as Record<string, unknown>;

  const { data: lugar, error } = await supabaseAdmin.rpc("crear_lugar", {
    p_nombre: datos.nombre,
    p_tipo: datos.tipo,
    p_departamento: datos.departamento,
    p_direccion: datos.direccion,
    p_lat: datos.lat,
    p_lng: datos.lng,
    p_decanato: datos.decanato ?? null,
    p_telefono: datos.telefono ?? null,
    p_email: datos.email ?? null,
    p_sitio_web: datos.sitio_web ?? null,
    p_horario_secretaria: datos.horario_secretaria ?? null,
    p_descripcion: datos.descripcion ?? null,
    p_imagen_url: datos.imagen_url ?? null,
    p_hay_confesiones: datos.hay_confesiones ?? false,
    p_activo: datos.activo ?? true,
    p_notas_horarios: datos.notas_horarios ?? null,
    p_recibe_caritas: datos.recibe_caritas ?? false,
  });
  if (error) throw new Error(error.message);

  const lugarId = (lugar as { id?: string } | null)?.id;
  const horarios = (datos.horarios as HorarioData[] | undefined) ?? [];
  if (lugarId && horarios.length > 0) {
    const rows = horarios.map((h) => ({
      lugar_id: lugarId,
      dia_semana: h.tipo === "semanal" ? h.dia_semana : null,
      dia_mes: h.tipo === "mensual" ? h.dia_mes : null,
      hora: h.hora,
      temporada: h.temporada,
      tipo_actividad: "Misa",
      reemplaza_dia: h.tipo === "mensual" ? (h.reemplaza_dia ?? false) : false,
      observacion: h.observacion ?? null,
    }));
    await supabaseAdmin.from("horarios").insert(rows);
  }

  await supabaseAdmin
    .from("solicitudes")
    .update({ estado: "aprobada", revisado_por: perfil.id })
    .eq("id", solicitudId);

  revalidatePath("/admin/solicitudes");
  revalidatePath("/admin/capillas");
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/mapa");
}

/** Aprueba una solicitud de edición: aplica los datos propuestos a la capilla existente. */
export async function aprobarSolicitudEdicion(solicitudId: string) {
  const perfil = await requirePerfil();
  await assertPuedeGestionarSolicitud(perfil, solicitudId);

  const { data: solicitud } = await supabaseAdmin
    .from("solicitudes")
    .select("lugar_id, datos_propuestos, estado")
    .eq("id", solicitudId)
    .maybeSingle();

  if (!solicitud) throw new Error("La solicitud no existe.");
  if (solicitud.estado !== "pendiente") {
    throw new Error("La solicitud ya fue resuelta.");
  }

  const datos = solicitud.datos_propuestos as Record<string, unknown>;

  const { error } = await supabaseAdmin.rpc("actualizar_lugar", {
    p_id: solicitud.lugar_id,
    p_nombre: datos.nombre,
    p_tipo: datos.tipo,
    p_departamento: datos.departamento,
    p_direccion: datos.direccion,
    p_lat: datos.lat,
    p_lng: datos.lng,
    p_decanato: datos.decanato ?? null,
    p_telefono: datos.telefono ?? null,
    p_email: datos.email ?? null,
    p_sitio_web: datos.sitio_web ?? null,
    p_horario_secretaria: datos.horario_secretaria ?? null,
    p_descripcion: datos.descripcion ?? null,
    p_imagen_url: datos.imagen_url ?? null,
    p_hay_confesiones: datos.hay_confesiones ?? false,
    p_activo: datos.activo ?? true,
    p_notas_horarios: datos.notas_horarios ?? null,
    p_recibe_caritas: datos.recibe_caritas ?? false,
  });
  if (error) throw new Error(error.message);

  const horarios = datos.horarios as HorarioData[] | undefined;
  if (horarios !== undefined && solicitud.lugar_id) {
    await supabaseAdmin.from("horarios").delete().eq("lugar_id", solicitud.lugar_id);

    if (horarios.length > 0) {
      const rows = horarios.map((h) => ({
        lugar_id: solicitud.lugar_id,
        dia_semana: h.tipo === "semanal" ? h.dia_semana : null,
        dia_mes: h.tipo === "mensual" ? h.dia_mes : null,
        hora: h.hora,
        temporada: h.temporada,
        tipo_actividad: "Misa",
        reemplaza_dia: h.tipo === "mensual" ? (h.reemplaza_dia ?? false) : false,
        observacion: h.observacion ?? null,
      }));
      await supabaseAdmin.from("horarios").insert(rows);
    }
  }

  await supabaseAdmin
    .from("solicitudes")
    .update({ estado: "aprobada", revisado_por: perfil.id })
    .eq("id", solicitudId);

  revalidatePath("/admin/solicitudes");
  revalidatePath("/admin/capillas");
  revalidatePath("/capilla/[slug]", "page");
  revalidatePath("/");
  revalidatePath("/mapa");
}
