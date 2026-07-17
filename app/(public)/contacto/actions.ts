"use server";

import { supabasePublic } from "@/lib/supabase-public";

const DEPARTAMENTOS_VALIDOS = [
  "Capital", "Las Heras", "Guaymallén", "Godoy Cruz", "Maipú",
  "Luján de Cuyo", "San Martín", "Junín", "Rivadavia",
];

export async function enviarMensaje(formData: FormData) {
  const tipo = formData.get("tipo") as string;
  const mensaje = (formData.get("mensaje") as string)?.trim();

  if (!mensaje || mensaje.length < 10) {
    throw new Error("El mensaje debe tener al menos 10 caracteres.");
  }
  if (!["sugerencia", "error_horario"].includes(tipo)) {
    throw new Error("Tipo de mensaje inválido.");
  }

  const lugar_nombre = (formData.get("lugar_nombre") as string)?.trim() || null;
  const departamentoRaw = formData.get("departamento") as string;

  // Buscar lugar_id si hay nombre de capilla
  let lugar_id: string | null = null;
  if (lugar_nombre) {
    const { data } = await supabasePublic
      .from("lugares")
      .select("id")
      .ilike("nombre", `%${lugar_nombre}%`)
      .limit(1)
      .maybeSingle();
    lugar_id = data?.id ?? null;
  }

  const { error } = await supabasePublic.from("mensajes").insert({
    tipo,
    mensaje,
    nombre: (formData.get("nombre") as string)?.trim() || null,
    telefono: (formData.get("telefono") as string)?.trim() || null,
    email: (formData.get("email") as string)?.trim() || null,
    lugar_id,
    lugar_nombre,
    departamento: DEPARTAMENTOS_VALIDOS.includes(departamentoRaw)
      ? departamentoRaw
      : null,
  });

  if (error) throw new Error("No se pudo enviar el mensaje. Intentá de nuevo.");
}
