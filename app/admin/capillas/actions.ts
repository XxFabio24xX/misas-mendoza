"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { HorarioData } from "@/app/components/horarios-grid";
import { requirePerfil, assertDepartamentoAccess, AuthError } from "@/lib/auth-server";

const ESTADOS_VERIFICACION_VALIDOS = ["sin_verificar", "en_revision", "verificada"];

/** Ground-truth department for a lugar — never trust a department string from the client. */
async function getLugarDepartamento(lugarId: string): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from("lugares")
    .select("departamento")
    .eq("id", lugarId)
    .maybeSingle();
  return data?.departamento ?? null;
}

/** Junta los campos del form de capilla en el mismo shape que espera crear_lugar/actualizar_lugar. */
function buildDatosPropuestos(formData: FormData, lat: number | null, lng: number | null) {
  const horariosJson = formData.get("horarios_json") as string | null;
  return {
    nombre: formData.get("nombre"),
    tipo: formData.get("tipo"),
    departamento: formData.get("departamento"),
    direccion: formData.get("direccion"),
    lat,
    lng,
    decanato: formData.get("decanato") || null,
    telefono: formData.get("telefono") || null,
    email: formData.get("email") || null,
    sitio_web: formData.get("sitio_web") || null,
    horario_secretaria: formData.get("horario_secretaria") || null,
    descripcion: formData.get("descripcion") || null,
    imagen_url: formData.get("imagen_url") || null,
    hay_confesiones: formData.get("hay_confesiones") === "on",
    activo: formData.get("activo") === "on",
    notas_horarios: formData.get("notas_horarios") || null,
    recibe_caritas: formData.get("recibe_caritas") === "on",
    horarios: horariosJson ? (JSON.parse(horariosJson) as HorarioData[]) : [],
  };
}

/** Ground-truth parent lugar for a horario — never trust a lugarId string from the client. */
async function getHorarioLugarId(horarioId: string): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from("horarios")
    .select("lugar_id")
    .eq("id", horarioId)
    .maybeSingle();
  return data?.lugar_id ?? null;
}

export async function crearCapilla(formData: FormData) {
  const perfil = await requirePerfil();
  const departamento = formData.get("departamento") as string;
  assertDepartamentoAccess(perfil, departamento);

  const lat = parseFloat(formData.get("lat") as string) || null;
  const lng = parseFloat(formData.get("lng") as string) || null;

  if (perfil.rol === "editor") {
    const { error: solError } = await supabaseAdmin.from("solicitudes").insert({
      tipo: "alta",
      estado: "pendiente",
      solicitado_por: perfil.id,
      lugar_id: null,
      motivo: "Solicitud de alta de nueva capilla",
      datos_propuestos: buildDatosPropuestos(formData, lat, lng),
    });
    if (solError) throw new Error(solError.message);

    revalidatePath("/admin/solicitudes");
    redirect("/admin/capillas?enviado=alta");
  }

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
    p_recibe_caritas: formData.get("recibe_caritas") === "on",
    p_estado_verificacion: "sin_verificar",
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
          reemplaza_dia: h.tipo === "mensual" ? (h.reemplaza_dia ?? false) : false,
          observacion: h.observacion ?? null,
        }));
        const { error: horError } = await supabaseAdmin.from("horarios").insert(rows);
        if (horError) throw new Error(horError.message);
      }
    }
  }

  revalidatePath("/admin/capillas");
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/mapa");
  redirect("/admin/capillas");
}

export async function actualizarCapilla(id: string, formData: FormData) {
  const perfil = await requirePerfil();
  const departamentoActual = await getLugarDepartamento(id);
  if (!departamentoActual) throw new Error("La capilla no existe.");
  assertDepartamentoAccess(perfil, departamentoActual);

  const departamentoNuevo = formData.get("departamento") as string;
  assertDepartamentoAccess(perfil, departamentoNuevo);

  const lat = parseFloat(formData.get("lat") as string) || null;
  const lng = parseFloat(formData.get("lng") as string) || null;

  if (perfil.rol === "editor") {
    const camposImportantes = ["telefono", "email", "sitio_web", "horario_secretaria", "horarios_json"];
    const tocaCampoImportante = camposImportantes.some(
      (c) => formData.has(c) && formData.get(c) !== "",
    );

    if (tocaCampoImportante) {
      const { error: solError } = await supabaseAdmin.from("solicitudes").insert({
        tipo: "edicion",
        estado: "pendiente",
        solicitado_por: perfil.id,
        lugar_id: id,
        campo_editado: camposImportantes.filter((c) => formData.has(c)).join(", "),
        motivo: "Solicitud de edición de datos importantes",
        datos_propuestos: buildDatosPropuestos(formData, lat, lng),
      });
      if (solError) throw new Error(solError.message);

      revalidatePath("/admin/solicitudes");
      redirect("/admin/capillas?enviado=edicion");
    }
  }

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
    p_recibe_caritas: formData.get("recibe_caritas") === "on",
    p_estado_verificacion: ESTADOS_VERIFICACION_VALIDOS.includes(
      formData.get("estado_verificacion") as string,
    )
      ? (formData.get("estado_verificacion") as string)
      : "sin_verificar",
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
        reemplaza_dia: h.tipo === "mensual" ? (h.reemplaza_dia ?? false) : false,
        observacion: h.observacion ?? null,
      }));
      const { error: horError } = await supabaseAdmin.from("horarios").insert(rows);
      if (horError) throw new Error(horError.message);
    }
  }

  revalidatePath("/admin/capillas");
  revalidatePath(`/admin/capillas/${id}/editar`);
  revalidatePath("/capilla/[slug]", "page");
  revalidatePath("/");
  revalidatePath("/mapa");
  redirect("/admin/capillas");
}

export async function eliminarCapilla(id: string) {
  const perfil = await requirePerfil();
  const departamento = await getLugarDepartamento(id);
  if (!departamento) throw new Error("La capilla no existe.");
  assertDepartamentoAccess(perfil, departamento);

  if (perfil.rol === "editor") {
    throw new AuthError(
      "Los editores no pueden eliminar capillas directo. Usá 'Solicitar baja' para pedir la eliminación con un motivo.",
    );
  }

  const { error } = await supabaseAdmin.from("lugares").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/capillas");
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/mapa");
}

export async function solicitarBajaCapilla(lugarId: string, motivo: string) {
  const perfil = await requirePerfil();
  const departamento = await getLugarDepartamento(lugarId);
  if (!departamento) throw new Error("La capilla no existe.");
  assertDepartamentoAccess(perfil, departamento);

  const motivoLimpio = motivo.trim();
  if (!motivoLimpio) throw new Error("El motivo es obligatorio.");

  const { error } = await supabaseAdmin.from("solicitudes").insert({
    lugar_id: lugarId,
    motivo: motivoLimpio,
    solicitado_por: perfil.id,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/capillas");
}

export async function setTemporadaActual(
  id: string,
  temporada: "Invierno" | "Verano" | null,
) {
  const perfil = await requirePerfil();
  const departamento = await getLugarDepartamento(id);
  if (!departamento) throw new Error("La capilla no existe.");
  assertDepartamentoAccess(perfil, departamento);

  const { error } = await supabaseAdmin
    .from("lugares")
    .update({ temporada_actual: temporada })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/capilla/[slug]", "page");
  revalidatePath("/");
  revalidatePath("/admin/capillas");
}

export async function toggleCapillaActiva(id: string, activo: boolean) {
  const perfil = await requirePerfil();
  const departamento = await getLugarDepartamento(id);
  if (!departamento) throw new Error("La capilla no existe.");
  assertDepartamentoAccess(perfil, departamento);

  await supabaseAdmin.from("lugares").update({ activo }).eq("id", id);
  revalidatePath("/admin/capillas");
  revalidatePath("/");
  revalidatePath("/mapa");
}

export async function agregarHorario(lugarId: string, formData: FormData) {
  const perfil = await requirePerfil();
  const departamento = await getLugarDepartamento(lugarId);
  if (!departamento) throw new Error("La capilla no existe.");
  assertDepartamentoAccess(perfil, departamento);

  const diaSemanaRaw = formData.get("dia_semana") as string;
  const diaMesRaw = formData.get("dia_mes") as string;

  const datos = {
    lugar_id: lugarId,
    dia_semana: diaSemanaRaw ? parseInt(diaSemanaRaw) : null,
    dia_mes: diaMesRaw ? parseInt(diaMesRaw) : null,
    hora: formData.get("hora") as string,
    tipo_actividad: (formData.get("tipo_actividad") as string) || "Misa",
    temporada: (formData.get("temporada") as string) || "Todo el año",
    observacion: (formData.get("observacion") as string) || null,
  };

  if (perfil.rol === "editor") {
    const { error } = await supabaseAdmin.from("solicitudes").insert({
      tipo: "edicion",
      estado: "pendiente",
      solicitado_por: perfil.id,
      lugar_id: lugarId,
      campo_editado: "horarios",
      motivo: "Solicitud de nuevo horario",
      datos_propuestos: { accion: "agregar", horario: datos },
    });
    if (error) throw new Error(error.message);

    revalidatePath(`/admin/capillas/${lugarId}/horarios`);
    revalidatePath("/admin/solicitudes");
    return { solicitud: true as const };
  }

  const { error } = await supabaseAdmin.from("horarios").insert(datos);
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/capillas/${lugarId}/horarios`);
  revalidatePath("/capilla/[slug]", "page");
}

export async function eliminarHorario(horarioId: string, lugarId: string) {
  const perfil = await requirePerfil();
  const realLugarId = await getHorarioLugarId(horarioId);
  if (!realLugarId) throw new Error("El horario no existe.");
  const departamento = await getLugarDepartamento(realLugarId);
  if (!departamento) throw new Error("La capilla no existe.");
  assertDepartamentoAccess(perfil, departamento);

  if (perfil.rol === "editor") {
    const { error } = await supabaseAdmin.from("solicitudes").insert({
      tipo: "edicion",
      estado: "pendiente",
      solicitado_por: perfil.id,
      lugar_id: lugarId,
      campo_editado: "horarios",
      motivo: "Solicitud de eliminación de horario",
      datos_propuestos: { accion: "eliminar", horario_id: horarioId },
    });
    if (error) throw new Error(error.message);

    revalidatePath(`/admin/capillas/${lugarId}/horarios`);
    revalidatePath("/admin/solicitudes");
    return { solicitud: true as const };
  }

  const { error } = await supabaseAdmin
    .from("horarios")
    .delete()
    .eq("id", horarioId);
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/capillas/${lugarId}/horarios`);
  revalidatePath("/capilla/[slug]", "page");
}

export async function editarHorario(
  horarioId: string,
  lugarId: string,
  formData: FormData,
) {
  const perfil = await requirePerfil();
  const realLugarId = await getHorarioLugarId(horarioId);
  if (!realLugarId) throw new Error("El horario no existe.");
  const departamento = await getLugarDepartamento(realLugarId);
  if (!departamento) throw new Error("La capilla no existe.");
  assertDepartamentoAccess(perfil, departamento);

  const diaSemanaRaw = formData.get("dia_semana") as string;
  const diaMesRaw = formData.get("dia_mes") as string;

  const datos = {
    dia_semana: diaSemanaRaw ? parseInt(diaSemanaRaw) : null,
    dia_mes: diaMesRaw ? parseInt(diaMesRaw) : null,
    hora: formData.get("hora") as string,
    tipo_actividad: (formData.get("tipo_actividad") as string) || "Misa",
    temporada: (formData.get("temporada") as string) || "Todo el año",
    observacion: (formData.get("observacion") as string) || null,
  };

  if (perfil.rol === "editor") {
    const { error } = await supabaseAdmin.from("solicitudes").insert({
      tipo: "edicion",
      estado: "pendiente",
      solicitado_por: perfil.id,
      lugar_id: lugarId,
      campo_editado: "horarios",
      motivo: "Solicitud de edición de horario",
      datos_propuestos: { accion: "editar", horario_id: horarioId, datos },
    });
    if (error) throw new Error(error.message);

    revalidatePath(`/admin/capillas/${lugarId}/horarios`);
    revalidatePath("/admin/solicitudes");
    return { solicitud: true as const };
  }

  const { error } = await supabaseAdmin
    .from("horarios")
    .update(datos)
    .eq("id", horarioId);
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/capillas/${lugarId}/horarios`);
  revalidatePath("/capilla/[slug]", "page");
}
