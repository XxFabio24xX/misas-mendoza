"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { revalidatePath } from "next/cache";

export async function crearVoluntario(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const nombre = formData.get("nombre") as string;
  const departamento = formData.get("departamento") as string;

  if (!email || !password || !nombre || !departamento) {
    return { error: "Todos los campos son obligatorios." };
  }

  const { data: authUser, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nombre, rol: "editor_departamento" },
    });

  if (authError) {
    return { error: authError.message };
  }

  if (!authUser.user) {
    return { error: "No se pudo crear el usuario." };
  }

  const { error: perfilError } = await supabaseAdmin.from("perfiles").upsert({
    id: authUser.user.id,
    nombre_completo: nombre,
    email,
    rol: "editor_departamento",
    departamento_asignado: departamento,
    activo: true,
  });

  if (perfilError) {
    console.error("ERROR CRÍTICO AL INSERTAR PERFIL:", perfilError);
    return { error: perfilError.message };
  }

  revalidatePath("/admin/voluntarios");
  return { success: true };
}

export async function actualizarVoluntario(id: string, formData: FormData) {
  const nombre = formData.get("nombre") as string;
  const email = formData.get("email") as string;
  const departamento = formData.get("departamento") as string;
  const activo = formData.get("activo") === "on";

  if (!nombre || !email || !departamento) {
    return { error: "Nombre, email y departamento son obligatorios." };
  }

  const { error: perfilError } = await supabaseAdmin
    .from("perfiles")
    .update({
      nombre_completo: nombre,
      email,
      departamento_asignado: departamento,
      activo,
    })
    .eq("id", id);

  if (perfilError) {
    console.error("ERROR AL ACTUALIZAR PERFIL:", perfilError);
    return { error: perfilError.message };
  }

  revalidatePath("/admin/voluntarios");
  return { success: true };
}

export async function eliminarVoluntario(id: string) {
  const { error: perfilError } = await supabaseAdmin
    .from("perfiles")
    .delete()
    .eq("id", id);

  if (perfilError) {
    console.error("ERROR AL ELIMINAR PERFIL:", perfilError);
    return { error: perfilError.message };
  }

  try {
    await supabaseAdmin.auth.admin.deleteUser(id);
  } catch (e) {
    console.error("ERROR AL ELIMINAR USUARIO DE AUTH:", e);
  }

  revalidatePath("/admin/voluntarios");
  return { success: true };
}
