"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function crearEvento(formData: FormData) {
  const titulo = formData.get("titulo") as string;
  const tipo = formData.get("tipo") as string;
  const departamento = formData.get("departamento") as string;
  const lugar_id = (formData.get("lugar_id") as string) || null;
  const ubicacion = formData.get("ubicacion") as string;
  const fecha_inicio = formData.get("fecha_inicio") as string;
  const fecha_fin = formData.get("fecha_fin") as string;
  const descripcion = (formData.get("descripcion") as string) || "";

  const { error } = await supabaseAdmin.from("eventos").insert({
    titulo,
    tipo,
    departamento,
    lugar_id,
    ubicacion,
    fecha_inicio: new Date(fecha_inicio).toISOString(),
    fecha_fin: fecha_fin ? new Date(fecha_fin).toISOString() : null,
    descripcion,
    activo: true,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/admin/eventos");
  revalidatePath("/eventos");
  redirect("/admin/eventos");
}

export async function actualizarEvento(id: string, formData: FormData) {
  const titulo = formData.get("titulo") as string;
  const tipo = formData.get("tipo") as string;
  const departamento = formData.get("departamento") as string;
  const lugar_id = (formData.get("lugar_id") as string) || null;
  const ubicacion = formData.get("ubicacion") as string;
  const fecha_inicio = formData.get("fecha_inicio") as string;
  const fecha_fin = formData.get("fecha_fin") as string;
  const descripcion = (formData.get("descripcion") as string) || "";
  const activo = formData.get("activo") === "on";

  const { error } = await supabaseAdmin
    .from("eventos")
    .update({
      titulo,
      tipo,
      departamento,
      lugar_id,
      ubicacion,
      fecha_inicio: new Date(fecha_inicio).toISOString(),
      fecha_fin: fecha_fin ? new Date(fecha_fin).toISOString() : null,
      descripcion,
      activo,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/eventos");
  revalidatePath(`/admin/eventos/${id}/editar`);
  revalidatePath("/eventos");
  redirect("/admin/eventos");
}

export async function eliminarEvento(id: string) {
  const { error } = await supabaseAdmin.from("eventos").delete().eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/eventos");
  revalidatePath("/eventos");
}
