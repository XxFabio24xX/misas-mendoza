"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { revalidatePath } from "next/cache";
import { requirePerfil, assertAdmin, AuthError } from "@/lib/auth-server";

export async function crearVoluntario(formData: FormData) {
  try {
    assertAdmin(await requirePerfil());
  } catch (e) {
    return { error: e instanceof AuthError ? e.message : "No autorizado." };
  }

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const nombre = formData.get("nombre") as string;
  const rol = (formData.get("rol") as string) || "editor_departamento";
  const departamento = formData.get("departamento") as string | null;

  if (!email || !password || !nombre) {
    return { error: "Nombre, email y contraseña son obligatorios." };
  }
  if (rol === "editor_departamento" && !departamento) {
    return { error: "El departamento es obligatorio para editores." };
  }

  const { data: authUser, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nombre, rol },
    });

  if (authError) return { error: authError.message };
  if (!authUser.user) return { error: "No se pudo crear el usuario." };

  const { error: perfilError } = await supabaseAdmin.from("perfiles").upsert({
    id: authUser.user.id,
    nombre_completo: nombre,
    email,
    rol,
    departamento_asignado: rol === "admin" ? null : departamento,
    activo: true,
  });

  if (perfilError) return { error: perfilError.message };

  revalidatePath("/admin/voluntarios");
  return { success: true };
}

export async function actualizarVoluntario(id: string, formData: FormData) {
  try {
    assertAdmin(await requirePerfil());
  } catch (e) {
    return { error: e instanceof AuthError ? e.message : "No autorizado." };
  }

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
  try {
    assertAdmin(await requirePerfil());
  } catch (e) {
    return { error: e instanceof AuthError ? e.message : "No autorizado." };
  }

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
