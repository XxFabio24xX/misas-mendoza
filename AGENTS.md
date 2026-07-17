<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Misas Mendoza — guía para agentes

Horarios de misas de parroquias, capillas y santuarios de Mendoza. Sitio público de búsqueda por cercanía + panel de administración para que voluntarios mantengan los datos al día. Proyecto de un solo mantenedor, sin fines de lucro, infraestructura de costo cero (Vercel + Supabase free tier).

## Stack técnico

- **Next.js 16** — App Router, Server Components + Server Actions, React Compiler, Turbopack. Middleware se llama **Proxy** en esta versión (`proxy.ts` en la raíz, no `middleware.ts` — ese archivo no existe como convención acá y Next lo ignoraría).
- **Supabase** — PostgreSQL 17 + PostGIS (distancia geográfica), Auth (email/password), Storage (fotos de capillas).
- **TypeScript**, **Tailwind CSS v4** (config CSS-first en `app/globals.css`, sin `tailwind.config.js`).
- **Vitest** para tests de lógica pura en `lib/`.
- `react-leaflet` (mapas, siempre `dynamic import { ssr: false }`), `date-fns` (+ locale `es`), `browser-image-compression`.
- CI: `.github/workflows/ci.yml` corre lint + tests + build en cada push.

## Estructura de carpetas

```
app/
├── (public)/            # Sitio público: inicio, capilla/[slug], eventos, mapa, acerca
├── admin/                # Panel — layout.tsx (client) gatea nav por rol, cada page gatea su propio acceso
│   ├── capillas/         # CRUD capillas (actions.ts, capillas-list.tsx, [id]/editar, [id]/horarios)
│   ├── eventos/
│   ├── voluntarios/      # Solo super_admin — gestión de perfiles/roles
│   └── solicitudes/      # Bandeja de aprobación (alta/baja/edición)
├── components/           # UI compartida (mapas, diálogos <dialog>, chips, grillas de horario)
├── login/page.tsx
└── globals.css           # Tokens de diseño (@theme), dark mode via .dark
lib/
├── auth-server.ts        # requirePerfil / assertDepartamentoAccess / assertAdmin — ver abajo
├── supabase.ts            # cliente browser (cookies, no localStorage)
├── supabase-server.ts      # cliente server-side que respeta RLS (sesión del usuario)
├── supabase-public.ts       # cliente anon, solo lectura pública
├── supabase-admin.ts        # cliente service role — SOLO server-only, bypassea RLS
├── misas-utils.ts          # findNextMisa (temporadas/reemplazos), franjas horarias
├── eventos-tipos.ts, departamentos.ts, date-dmy.ts, ics.ts
└── *.test.ts
supabase/migrations/       # Historial numerado (001–011). Ver advertencia abajo — no es 100% fiel a la BD viva.
proxy.ts                   # Gate de sesión server-side para /admin/* (Next 16 "Proxy", ex-middleware)
```

## Roles del sistema (enum `rol_usuario`)

| Rol | Alcance | Capacidad |
|---|---|---|
| `super_admin` | Toda la arquidiócesis | Control total: CRUD directo de capillas/eventos/horarios en cualquier departamento, gestiona voluntarios, aprueba/rechaza cualquier solicitud |
| `admin_departamento` | Su `departamento_asignado` | Edita capillas/eventos/horarios directo *en su depto*, aprueba/rechaza solicitudes de su depto (**hoy solo baja — ver Fixes pendientes**) |
| `editor` | Su `departamento_asignado` | Propone cambios que requieren aprobación: alta de capilla, edición de campos de contacto/horarios, baja (todo vía tabla `solicitudes`). Puede escribir directo eventos y horarios sueltos (`agregarHorario`/`editarHorario`/`eliminarHorario`) — inconsistencia conocida, no todo pasa por aprobación todavía. |

Los nombres de rol en la BD son `super_admin` / `admin_departamento` / `editor` (renombrados desde `admin` / — / `editor_departamento` en la migración de "roles v2"). **Nunca comparar contra los nombres viejos** — quedan strings sueltos rotos si aparecen.

## Tablas principales y relaciones

- **`perfiles`** (`id` FK → `auth.users.id`) — `rol`, `departamento_asignado` (nullable, enum `departamentos_mza`), `activo`. No hay trigger que la auto-cree al hacer signup (ver advertencia); `crearVoluntario` en `voluntarios/actions.ts` la crea a mano vía `upsert`.
- **`lugares`** (capillas/parroquias/santuarios) — `departamento`, `slug` (auto por trigger), `coordenadas` (geography, calculado desde `lat`/`lng` por trigger `set_coordenadas`), `temporada_actual`.
- **`horarios`** — `lugar_id` FK, una fila por misa. `dia_semana` (0=Dom) XOR `dia_mes` (misas mensuales fijas), `reemplaza_dia` (cancela las misas normales de esa fecha).
- **`eventos`** — `lugar_id` FK nullable (puede ser texto libre en `ubicacion`), `slug` auto, `tipo` (enum `tipo_evento`).
- **`solicitudes`** (ex `solicitudes_baja`, renombrada) — `tipo` (`alta`/`baja`/`edicion`), `estado` (`pendiente`/`aprobada`/`rechazada`), `lugar_id` **nullable** (NULL en las de tipo `alta`, la capilla todavía no existe), `datos_propuestos` (jsonb, snapshot de los campos del form), `campo_editado`, `motivo`, `motivo_rechazo`, `revisado_por`.

RLS habilitada en las 5 tablas. `perfiles` solo tiene policies de `SELECT` (propio perfil, o todos si `is_super_admin()`) — todo INSERT/UPDATE/DELETE de perfiles pasa exclusivamente por Server Actions con `supabaseAdmin`.

## RPCs de Supabase

- `crear_lugar(...)` / `actualizar_lugar(...)` — encapsulan el manejo de la columna `geography`; `crear_lugar` devuelve `{success, id}`.
- `get_lugares_cercanos(user_lat, user_lng, radio_km)` — orden por distancia (PostGIS), devuelve `slug` y `temporada_actual`. Campos públicos únicamente, sin datos de contacto interno del staff.
- `slugify()` + triggers `set_lugar_slug()` / `set_evento_slug()` — generación automática de slugs, estables ante renombres.
- `is_super_admin()` — función `SECURITY DEFINER` en `public` (no en `auth`, ese schema es de Supabase/GoTrue). Existe para evitar recursión infinita de RLS: una policy de `perfiles` que hace `SELECT` sobre `perfiles` dentro de su propio `USING` causa "infinite recursion detected in policy". Si necesitás otro chequeo de rol dentro de una policy de la misma tabla, agregalo como función `SECURITY DEFINER`, no como subquery directa.

## Convenciones de código

**Autorización en Server Actions** — patrón obligatorio en todo `actions.ts`:
```ts
const perfil = await requirePerfil();                 // lib/auth-server.ts — lanza AuthError si no hay sesión o perfil inactivo
const departamento = await getLugarDepartamento(id);   // SIEMPRE el valor de la BD, nunca el que manda el form, para un recurso existente
assertDepartamentoAccess(perfil, departamento);        // super_admin: cualquiera; admin_departamento/editor: solo el propio
// o assertAdmin(perfil) para acciones exclusivas de super_admin (voluntarios, aprobar/rechazar)
```
Para *crear* un recurso nuevo (sin fila existente en la BD) sí se usa el departamento que manda el form, porque no hay "ground truth" previo — `assertDepartamentoAccess` igual valida que el caller pueda operar ahí.

**Tres clientes de Supabase, no mezclar**:
- `supabaseAdmin` (`lib/supabase-admin.ts`, service role) — únicamente en archivos `"use server"` / server-only. Bypassea RLS. Es el único que debe escribir en Server Actions.
- `createServerSupabaseClient()` (`lib/supabase-server.ts`) — Server Components, respeta RLS y la sesión de cookies.
- `supabase` (`lib/supabase.ts`, browser) — Client Components, respeta RLS.
Ningún archivo `"use client"` debe importar `supabase-admin` — rompería el bundle del browser exponiendo la service role key.

**`revalidatePath`** — cada Server Action que muta datos revalida todas las rutas donde ese dato se muestra: la propia lista admin, `/admin` (dashboard), y las rutas públicas equivalentes (`/`, `/mapa`, `/capilla/[slug]`, `/eventos`). Mirar las acciones existentes en `capillas/actions.ts` como referencia antes de agregar una nueva.

**Migraciones SQL** — usar el prefijo numérico siguiente en `supabase/migrations/` (van por 011). Escribirlas de forma idempotente cuando se pueda (`ADD COLUMN IF NOT EXISTS`, `DROP POLICY IF EXISTS`). Aplicar contra la BD real vía MCP de Supabase, no solo dejarlas en el repo — **el repo y la BD viva ya se desincronizaron una vez** (ver advertencia).

## Archivos clave

| Archivo | Propósito |
|---|---|
| [lib/auth-server.ts](lib/auth-server.ts) | `requirePerfil` / `assertDepartamentoAccess` / `assertAdmin` — toda la autorización de Server Actions pasa por acá |
| [proxy.ts](proxy.ts) | Gate de sesión server-side para `/admin/*` (Next 16 Proxy) |
| [app/admin/layout.tsx](app/admin/layout.tsx) | Nav por rol, sidebar/drawer — el gate de sesión real es `proxy.ts`, esto es solo UI |
| [app/admin/capillas/actions.ts](app/admin/capillas/actions.ts) | El más completo: ejemplo de ground-truth department check, y de la ramificación `editor` → `solicitudes` vs escritura directa |
| [app/admin/solicitudes/actions.ts](app/admin/solicitudes/actions.ts) | Aprobación de solicitudes; aplica `datos_propuestos` vía las RPC al aprobar alta/edición |
| [lib/misas-utils.ts](lib/misas-utils.ts) | `findNextMisa` — lógica de "próxima misa" con temporadas y reemplazos, la parte más delicada del dominio |
| [supabase/migrations/](supabase/migrations/) | Historial de schema — leer antes de asumir la forma de una tabla |

## Lo que NO tocar sin mostrar el SQL/diff primero

- **RLS policies** — no reescribir por intuición. Antes de tocar una policy, consultar `pg_policies` vía MCP para ver el estado real (el repo puede no coincidir con la BD viva) y mostrar el SQL al usuario antes de aplicarlo.
- **Migraciones ya aplicadas** (001–011) — no editarlas retroactivamente; agregar una nueva con el número siguiente.
- **`proxy.ts`** — es la única capa de gate de sesión real para `/admin/*`. No crear `middleware.ts` en paralelo (no es una convención válida en Next 16, sería un archivo muerto).
- **Tokens de diseño** (`app/globals.css`, `DESIGN.md`, `DESIGNdark.md` en `pantallas/`) — paleta "Warm Organic" sage green, no introducir colores fuera de las variables `--color-*` existentes.
- **`SUPABASE_SERVICE_ROLE_KEY`** — solo en `lib/supabase-admin.ts`. Si algo parece necesitar la service role desde el cliente, la solución es una Server Action, no exponer la key.

## Advertencia: el repo y la base de datos viva pueden diverger

El schema base (`lugares`, `horarios`, `eventos` y sus enums) nunca quedó capturado en una migración — se creó a mano en algún momento. Las RLS policies también se editaron directo en producción más de una vez sin dejar migración. **Antes de asumir que una policy, trigger, o columna existe tal como dice un archivo de `supabase/migrations/`, verificarlo contra la BD real vía MCP** (`SELECT ... FROM pg_policies`, `pg_trigger`, `information_schema.columns`). Confirmado además: no existe ningún trigger sobre `auth.users` en la base viva (a pesar de que la migración 001 define `handle_new_user()`/`on_auth_user_created`) — cualquier alta de usuario debe crear su fila en `perfiles` explícitamente desde el código, no asumir que se autogenera.
