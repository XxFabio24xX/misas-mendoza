"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { HorarioData } from "@/app/components/horarios-grid";

export async function crearCapilla(formData: FormData) {
  const lat = parseFloat(formData.get("lat") as string) || null;
  const lng = parseFloat(formData.get("lng") as string) || null;

  const { data, error } = await supabaseAdmin.rpc("crear_lugar", {
    p_nombre: formData.get("nombre"),
    p_tipo: formData.get("tipo"),
    p_departamento: formData.get("departamento"),
    p_direccion: formData.get("direccion"),
    p_lat: lat,
    p_lng: lng,
    p_decanato: formData.get("decanato") || null,
    p_telefono: formData.get("telefono") || null,
    p_email: formData.get("email") || null,
    p_sitio_web: formData.get("sitio_web") || null,
    p_horario_secretaria: formData.get("horario_secretaria") || null,
    p_descripcion: formData.get("descripcion") || null,
    p_imagen_url: formData.get("imagen_url") || null,
    p_hay_confesiones: formData.get("hay_confesiones") === "on",
    p_activo: formData.get("activo") === "on",
    p_notas_horarios: formData.get("notas_horarios") || null,
  });

  if (error) throw new Error(error.message);

  const lugarId = (data as { id?: string })?.id;
  if (!lugarId) throw new Error("La RPC crear_lugar no devolvió un ID. Verificá que la migración 005 esté aplicada en Supabase.");
  if (lugarId) {
    const horariosJson = formData.get("horarios_json") as string;
    if (horariosJson) {
      const horarios: HorarioData[] = JSON.parse(horariosJson);
      if (horarios.length > 0) {
        const rows = horarios.map((h) => ({
          lugar_id: lugarId,
          dia_semana: h.tipo === "semanal" ? h.dia_semana : null,
          dia_mes: h.tipo === "mensual" ? h.dia_mes : null,
          hora: h.hora,
          temporada: h.temporada,
          tipo_actividad: "Misa",
        }));
        const { error: horError } = await supabaseAdmin.from("horarios").insert(rows);
        if (horError) throw new Error(horError.message);
      }
    }
  }

  revalidatePath("/admin/capillas");
  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin/capillas");
}

export async function actualizarCapilla(id: string, formData: FormData) {
  const lat = parseFloat(formData.get("lat") as string) || null;
  const lng = parseFloat(formData.get("lng") as string) || null;

  const { error } = await supabaseAdmin.rpc("actualizar_lugar", {
    p_id: id,
    p_nombre: formData.get("nombre"),
    p_tipo: formData.get("tipo"),
    p_departamento: formData.get("departamento"),
    p_direccion: formData.get("direccion"),
    p_lat: lat,
    p_lng: lng,
    p_decanato: formData.get("decanato") || null,
    p_telefono: formData.get("telefono") || null,
    p_email: formData.get("email") || null,
    p_sitio_web: formData.get("sitio_web") || null,
    p_horario_secretaria: formData.get("horario_secretaria") || null,
    p_descripcion: formData.get("descripcion") || null,
    p_imagen_url: formData.get("imagen_url") || null,
    p_hay_confesiones: formData.get("hay_confesiones") === "on",
    p_activo: formData.get("activo") === "on",
    p_notas_horarios: formData.get("notas_horarios") || null,
  });

  if (error) throw new Error(error.message);

  const horariosJson = formData.get("horarios_json") as string;
  if (horariosJson !== null) {
    const horarios: HorarioData[] = JSON.parse(horariosJson);

    await supabaseAdmin.from("horarios").delete().eq("lugar_id", id);

    if (horarios.length > 0) {
      const rows = horarios.map((h) => ({
        lugar_id: id,
        dia_semana: h.tipo === "semanal" ? h.dia_semana : null,
        dia_mes: h.tipo === "mensual" ? h.dia_mes : null,
        hora: h.hora,
        temporada: h.temporada,
        tipo_actividad: "Misa",
      }));
      const { error: horError } = await supabaseAdmin.from("horarios").insert(rows);
      if (horError) throw new Error(horError.message);
    }
  }

  revalidatePath("/admin/capillas");
  revalidatePath(`/admin/capillas/${id}/editar`);
  revalidatePath(`/capilla/${id}`);
  revalidatePath("/");
  redirect("/admin/capillas");
}

export async function eliminarCapilla(id: string) {
  const { error } = await supabaseAdmin.from("lugares").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/capillas");
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function toggleCapillaActiva(id: string, activo: boolean) {
  await supabaseAdmin.from("lugares").update({ activo }).eq("id", id);
  revalidatePath("/admin/capillas");
  revalidatePath("/");
}

export async function agregarHorario(lugarId: string, formData: FormData) {
  const diaSemanaRaw = formData.get("dia_semana") as string;
  const diaMesRaw = formData.get("dia_mes") as string;

  const { error } = await supabaseAdmin.from("horarios").insert({
    lugar_id: lugarId,
    dia_semana: diaSemanaRaw ? parseInt(diaSemanaRaw) : null,
    dia_mes: diaMesRaw ? parseInt(diaMesRaw) : null,
    hora: formData.get("hora") as string,
    tipo_actividad: (formData.get("tipo_actividad") as string) || "Misa",
    temporada: (formData.get("temporada") as string) || "Todo el año",
    observacion: (formData.get("observacion") as string) || null,
  });
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/capillas/${lugarId}/horarios`);
  revalidatePath(`/capilla/${lugarId}`);
}

export async function eliminarHorario(horarioId: string, lugarId: string) {
  const { error } = await supabaseAdmin
    .from("horarios")
    .delete()
    .eq("id", horarioId);
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/capillas/${lugarId}/horarios`);
  revalidatePath(`/capilla/${lugarId}`);
}

export async function editarHorario(
  horarioId: string,
  lugarId: string,
  formData: FormData,
) {
  const diaSemanaRaw = formData.get("dia_semana") as string;
  const diaMesRaw = formData.get("dia_mes") as string;

  const { error } = await supabaseAdmin
    .from("horarios")
    .update({
      dia_semana: diaSemanaRaw ? parseInt(diaSemanaRaw) : null,
      dia_mes: diaMesRaw ? parseInt(diaMesRaw) : null,
      hora: formData.get("hora") as string,
      tipo_actividad: (formData.get("tipo_actividad") as string) || "Misa",
      temporada: (formData.get("temporada") as string) || "Todo el año",
      observacion: (formData.get("observacion") as string) || null,
    })
    .eq("id", horarioId);
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/capillas/${lugarId}/horarios`);
  revalidatePath(`/capilla/${lugarId}`);
}
