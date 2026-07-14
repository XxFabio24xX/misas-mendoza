import "server-only";
import { createServerSupabaseClient } from "./supabase-server";
import { supabaseAdmin } from "./supabase-admin";

export class AuthError extends Error {}

export type Perfil = {
  id: string;
  nombre_completo: string;
  email: string;
  rol: "admin" | "editor_departamento";
  departamento_asignado: string | null;
  activo: boolean;
};

/**
 * Resolves the authenticated caller's profile from the request's own session
 * cookie — never trust a user id passed in from the client for this.
 */
export async function requirePerfil(): Promise<Perfil> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new AuthError("No autenticado.");

  const { data: perfil } = await supabaseAdmin
    .from("perfiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!perfil || !(perfil as Perfil).activo) {
    throw new AuthError("Perfil inválido o inactivo.");
  }

  return perfil as Perfil;
}

/** Admins can act on any department; editors only on their own assigned one. */
export function assertDepartamentoAccess(
  perfil: Perfil,
  departamento: string | null | undefined
) {
  if (perfil.rol === "admin") return;
  if (
    perfil.rol === "editor_departamento" &&
    departamento &&
    perfil.departamento_asignado === departamento
  ) {
    return;
  }
  throw new AuthError("No tenés permisos sobre este departamento.");
}

export function assertAdmin(perfil: Perfil) {
  if (perfil.rol !== "admin") {
    throw new AuthError("Acción reservada a administradores.");
  }
}
