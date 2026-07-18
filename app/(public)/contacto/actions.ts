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
  if (mensaje.length > 2000) {
    throw new Error("El mensaje es demasiado largo.");
  }
  if (!["sugerencia", "error_horario"].includes(tipo)) {
    throw new Error("Tipo de mensaje inválido.");
  }

  // Rechazar contenido que parezca HTML/script en el cuerpo del mensaje.
  const contieneHTML = (s: string) => /<[^>]*>/.test(s);
  if (contieneHTML(mensaje)) {
    throw new Error("El mensaje contiene caracteres no permitidos.");
  }

  const nombre = (formData.get("nombre") as string)?.trim() || null;
  const telefono = (formData.get("telefono") as string)?.trim() || null;
  const email = (formData.get("email") as string)?.trim() || null;
  const lugar_nombre = (formData.get("lugar_nombre") as string)?.trim() || null;
  const departamentoRaw = formData.get("departamento") as string;

  if (nombre && nombre.length > 100) {
    throw new Error("Nombre demasiado largo.");
  }
  if (email && email.length > 200) {
    throw new Error("Email demasiado largo.");
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("El formato del email no es válido.");
  }
  if (telefono && telefono.length > 20) {
    throw new Error("Teléfono inválido.");
  }
  if (lugar_nombre && lugar_nombre.length > 200) {
    throw new Error("Nombre de capilla demasiado largo.");
  }

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
    nombre,
    telefono,
    email,
    lugar_id,
    lugar_nombre,
    departamento: DEPARTAMENTOS_VALIDOS.includes(departamentoRaw)
      ? departamentoRaw
      : null,
  });

  if (error) throw new Error("No se pudo enviar el mensaje. Intentá de nuevo.");
}
