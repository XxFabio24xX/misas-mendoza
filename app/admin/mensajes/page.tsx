import { redirect } from "next/navigation";
import Link from "next/link";
import { requirePerfil } from "@/lib/auth-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { MensajesList, type Mensaje } from "./mensajes-list";

export const dynamic = "force-dynamic";

const ESTADOS = ["todos", "nuevo", "leido", "respondido"] as const;
const TIPOS = ["todos", "sugerencia", "error_horario"] as const;

const ESTADO_LABEL: Record<(typeof ESTADOS)[number], string> = {
  todos: "Todos",
  nuevo: "Nuevos",
  leido: "Leídos",
  respondido: "Respondidos",
};

const TIPO_LABEL: Record<(typeof TIPOS)[number], string> = {
  todos: "Todos",
  sugerencia: "Sugerencias",
  error_horario: "Errores de horario",
};

export default async function MensajesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const perfil = await requirePerfil();
  if (perfil.rol === "editor") redirect("/admin");

  const params = await searchParams;
  const filtroEstado = ESTADOS.includes(params.estado as (typeof ESTADOS)[number])
    ? (params.estado as (typeof ESTADOS)[number])
    : "todos";
  const filtroTipo = TIPOS.includes(params.tipo as (typeof TIPOS)[number])
    ? (params.tipo as (typeof TIPOS)[number])
    : "todos";

  let query = supabaseAdmin
    .from("mensajes")
    .select("*, lugar:lugares(id, nombre, slug)")
    .order("created_at", { ascending: false });

  if (perfil.rol === "admin_departamento") {
    // supabaseAdmin bypasea RLS: replicamos acá el mismo filtro que la
    // policy "admin_departamento lee mensajes" (departamento propio o NULL).
    query = query.or(
      `departamento.is.null,departamento.eq.${perfil.departamento_asignado}`,
    );
  }
  if (filtroEstado !== "todos") query = query.eq("estado", filtroEstado);
  if (filtroTipo !== "todos") query = query.eq("tipo", filtroTipo);

  const { data: mensajes } = await query;

  const nuevos = mensajes?.filter((m) => m.estado === "nuevo").length ?? 0;

  const chipClass = (active: boolean) =>
    `rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
      active
        ? "bg-primary text-on-primary border-transparent"
        : "border-outline-variant/30 bg-transparent text-on-surface-variant hover:border-outline-variant hover:text-on-surface"
    }`;

  return (
    <div>
      <h1 className="text-xl font-semibold text-on-surface md:text-2xl">
        Mensajes{nuevos > 0 ? ` (${nuevos} nuevos)` : ""}
      </h1>
      <p className="mt-0.5 text-sm text-on-surface-variant">
        Sugerencias y reportes de error enviados desde el sitio público.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {ESTADOS.map((e) => (
          <Link key={e} href={`/admin/mensajes?estado=${e}&tipo=${filtroTipo}`} className={chipClass(filtroEstado === e)}>
            {ESTADO_LABEL[e]}
          </Link>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {TIPOS.map((t) => (
          <Link key={t} href={`/admin/mensajes?estado=${filtroEstado}&tipo=${t}`} className={chipClass(filtroTipo === t)}>
            {TIPO_LABEL[t]}
          </Link>
        ))}
      </div>

      <MensajesList mensajes={(mensajes ?? []) as unknown as Mensaje[]} />
    </div>
  );
}
