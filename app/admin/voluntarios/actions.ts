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
  const rol = (formData.get("rol") as string) || "editor";
  const departamento = formData.get("departamento") as string | null;

  if (!email || !password || !nombre) {
    return { error: "Nombre, email y contraseña son obligatorios." };
  }
  if ((rol === "editor" || rol === "admin_departamento") && !departamento) {
    return { error: "El departamento es obligatorio para este rol." };
  }

  let userId: string | null = null;

  try {
    const { data: authUser, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { nombre, rol },
      });

    if (authError) throw new Error(authError.message);
    if (!authUser.user) throw new Error("No se pudo crear el usuario.");
    userId = authUser.user.id;

    const { error: perfilError } = await supabaseAdmin.from("perfiles").upsert({
      id: userId,
      nombre_completo: nombre,
      email,
      rol,
      departamento_asignado: rol === "super_admin" ? null : departamento,
      activo: true,
    });

    if (perfilError) throw new Error(perfilError.message);
  } catch (e) {
    // Si el perfil falla después de crear el usuario en auth.users, no dejar
    // una cuenta huérfana sin fila en perfiles (rompería requirePerfil()).
    if (userId) {
      try {
        await supabaseAdmin.auth.admin.deleteUser(userId);
      } catch (cleanupError) {
        console.error("ERROR AL LIMPIAR USUARIO HUÉRFANO:", cleanupError);
      }
    }
    return {
      error: e instanceof Error ? e.message : "Error al crear el voluntario.",
    };
  }

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
  const rol = formData.get("rol") as string;
  const departamento = formData.get("departamento_asignado") as string | null;
  const activo = formData.get("activo") === "on";
  const nuevaPassword = (formData.get("nueva_password") as string) ?? "";

  if (!nombre || !email || !rol) {
    return { error: "Nombre, email y rol son obligatorios." };
  }
  if ((rol === "editor" || rol === "admin_departamento") && !departamento) {
    return { error: "El departamento es obligatorio para este rol." };
  }
  if (nuevaPassword.trim() && nuevaPassword.trim().length < 12) {
    return { error: "La contraseña debe tener al menos 12 caracteres." };
  }

  const nuevoEmail = email.trim();
  const deptAsignado = rol === "super_admin" ? null : departamento || null;

  try {
    const [authUpdate, perfilUpdate] = await Promise.all([
      supabaseAdmin.auth.admin.updateUserById(id, { email: nuevoEmail }),
      supabaseAdmin
        .from("perfiles")
        .update({
          nombre_completo: nombre,
          email: nuevoEmail,
          rol,
          departamento_asignado: deptAsignado,
          activo,
        })
        .eq("id", id),
    ]);

    if (authUpdate.error) throw new Error(authUpdate.error.message);
    if (perfilUpdate.error) throw new Error(perfilUpdate.error.message);

    if (nuevaPassword.trim()) {
      const { error: passwordError } =
        await supabaseAdmin.auth.admin.updateUserById(id, {
          password: nuevaPassword.trim(),
        });
      if (passwordError) throw new Error(passwordError.message);
    }
  } catch (e) {
    console.error("ERROR AL ACTUALIZAR VOLUNTARIO:", e);
    return {
      error: e instanceof Error ? e.message : "Error al actualizar el voluntario.",
    };
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
