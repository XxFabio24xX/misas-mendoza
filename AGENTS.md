<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Misas Mendoza — guía para agentes

App web para horarios de misas, parroquias, capillas y santuarios católicos de Mendoza. Sitio público de búsqueda por cercanía + panel de administración para que voluntarios mantengan los datos al día. Proyecto de un solo mantenedor, sin fines de lucro, infraestructura de costo cero (Vercel + Supabase free tier).

## Stack técnico

- **Frontend**: Next.js 16 — App Router, Server Components + Server Actions, React Compiler, Turbopack (es el bundler por defecto de `next build`/`next dev` en esta versión — ver advertencia de Turbopack más abajo). Middleware se llama **Proxy** en esta versión (`proxy.ts` en la raíz, no `middleware.ts` — ese archivo no existe como convención acá y Next lo ignoraría).
- **TypeScript**, **Tailwind CSS v4** (config CSS-first en `app/globals.css`, sin `tailwind.config.js`).
- **Base de datos**: Supabase — PostgreSQL 17 + PostGIS (distancia geográfica), Auth (email/password), Storage (fotos de capillas, bucket `imagenes_capillas`).
- **Mapa**: `react-leaflet` / Leaflet.js — siempre `dynamic import` con `{ ssr: false }` (Leaflet toca `window` en el import top-level y rompe el build en SSR si no).
- **Testing**: Vitest — 30 tests de lógica pura en `lib/*.test.ts` (`date-dmy`, `eventos-tipos`, `ics`, `misas-utils`).
- **CI**: GitHub Actions, `.github/workflows/ci.yml` — corre lint + tests + build en cada push (job `verify`).
- **Hosting**: Vercel (plan gratuito).
- Otras libs: `date-fns` (+ locale `es`), `browser-image-compression`.

### Turbopack y next.config.ts

Turbopack no soporta plugins que inyecten una función `webpack(config)` en `next.config.ts` — si alguna dependencia lo requiere, `next build` falla directo ("If your project has a custom webpack configuration..."). Antes de instalar algo que toque `next.config.ts`, confirmar que sea compatible con Turbopack o que el plan sea usar `--webpack` explícitamente. Confirmado empíricamente con `next-pwa`, `@ducanh2912/next-pwa` y `@serwist/next` — los tres generan el service worker vía `workbox-webpack-plugin`, mismo problema de fondo en los tres, cambiar de paquete no lo evita.

**PWA/offline**: por eso el soporte offline (`public/sw.js`) es un service worker escrito a mano, sin Workbox — cache-first para assets estáticos propios (`/_next/static/`, `/icons/`, imágenes), network-first con fallback a caché para navegación entre páginas. Nunca cachea respuestas de Supabase (dependen de ubicación/parámetros del usuario; cachearlas serviría datos incorrectos, no solo desactualizados). Se registra desde `app/components/register-sw.tsx`, solo en producción (`NODE_ENV === "production"`, para no interferir con HMR en desarrollo).

## Estructura de carpetas

```
app/
├── (public)/                       # Sitio público
│   ├── page.tsx                     # Home: búsqueda por cercanía, filtros, paginación
│   ├── acerca/page.tsx               # Server Component async: trae stats reales de Supabase
│   ├── capilla/[slug]/page.tsx        # Detalle de capilla, generateMetadata con og:image
│   ├── contacto/page.tsx + actions.ts   # Form público de sugerencias/reportes → tabla mensajes
│   ├── eventos/page.tsx + [slug]/page.tsx
│   ├── mapa/page.tsx
│   └── layout.tsx                    # Header + BottomNav
├── admin/                          # Panel — layout.tsx (client) gatea nav por rol, cada page gatea su propio acceso
│   ├── page.tsx                      # Dashboard
│   ├── capillas/                     # CRUD capillas: actions.ts, page.tsx, capillas-list.tsx,
│   │                                   [id]/editar/page.tsx, [id]/horarios/page.tsx, nuevo/page.tsx
│   ├── eventos/                      # actions.ts, page.tsx, [id]/editar, nuevo
│   ├── mensajes/                     # actions.ts, page.tsx (filtros server-side), mensajes-list.tsx, mensaje-drawer.tsx
│   ├── solicitudes/                  # actions.ts, page.tsx, solicitudes-list.tsx — bandeja de aprobación
│   └── voluntarios/                  # Solo super_admin — actions.ts, page.tsx, voluntarios-list.tsx, [id]/editar, nuevo
├── components/                      # UI compartida (mapas, diálogos, chips, candle-loader, animated-counter, etc.)
├── login/page.tsx
├── opengraph-image.tsx               # og:image genérica (ImageResponse), fallback del sitio
├── manifest.ts                       # PWA manifest (instalable + offline básico, ver public/sw.js)
└── layout.tsx + globals.css          # Metadata global + tokens de diseño (@theme), dark mode via .dark
lib/
├── auth-server.ts                     # requirePerfil / assertDepartamentoAccess / assertAdmin
├── supabase.ts                        # cliente browser (cookies, no localStorage)
├── supabase-server.ts                  # cliente server-side que respeta RLS (sesión del usuario)
├── supabase-public.ts                   # cliente anon, solo lectura pública
├── supabase-admin.ts                    # cliente service role — SOLO server-only, bypassea RLS
├── misas-utils.ts                      # findNextMisa, temporadaVigente, franjas horarias, normalizeText
├── eventos-tipos.ts, departamentos.ts, date-dmy.ts, ics.ts
└── *.test.ts
supabase/migrations/                 # Historial numerado 001–026. Ver advertencia — no es 100% fiel a la BD viva.
proxy.ts                             # Gate de sesión server-side para /admin/* (Next 16 "Proxy", ex-middleware)
```

## Roles del sistema (enum `rol_usuario`)

| Rol | Alcance | Capacidad |
|---|---|---|
| `super_admin` | Toda la arquidiócesis | Control total: CRUD directo de capillas/eventos/horarios en cualquier departamento, gestiona voluntarios, aprueba/rechaza cualquier solicitud |
| `admin_departamento` | Su `departamento_asignado` | Edita capillas/eventos/horarios directo *en su depto*, aprueba/rechaza solicitudes de su depto |
| `editor` | Su `departamento_asignado` | Propone cambios que requieren aprobación vía tabla `solicitudes`: alta/edición/baja de capilla, horarios sueltos en el editor avanzado (`[id]/horarios`), y alta/edición/baja de eventos. Todo lo que un editor escribe pasa por aprobación — no queda ninguna escritura directa a la BD. |

Los nombres de rol en la BD son `super_admin` / `admin_departamento` / `editor` (renombrados desde `admin` / — / `editor_departamento` en la migración 011 "roles v2"). **Nunca comparar contra los nombres viejos** — quedan strings sueltos rotos si aparecen.

## Tablas principales (schema real verificado vía MCP)

- **`perfiles`** (`id` FK → `auth.users.id`) — `rol` (enum `rol_usuario`), `departamento_asignado` (nullable, enum `departamentos_mza`), `nombre_completo`, `email`, `activo`. Solo 6 columnas. No hay trigger que la auto-cree al hacer signup (ver advertencia); `crearVoluntario` en `voluntarios/actions.ts` la crea a mano vía `upsert`.
- **`lugares`** (capillas/parroquias/santuarios) — `nombre`, `tipo` (enum `tipo_lugar`: `parroquia`/`capilla`/`santuario`), `departamento` (enum `departamentos_mza`), `direccion`, `lat`/`lng` + `coordenadas` (geography, calculado por trigger `set_coordenadas`), `slug` (auto por trigger `set_lugar_slug`), `imagen_url`, `hay_confesiones`, `recibe_caritas`, `activo`, `temporada_actual`, `estado_verificacion` (enum: `sin_verificar`/`en_revision`/`verificada`, migración 026), `notas_horarios`, `decanato`, `telefono`, `email`, `sitio_web`, `horario_secretaria`, `descripcion`.
- **`horarios`** — `lugar_id` FK, una fila por misa/actividad. `dia_semana` (0=Dom, nullable) XOR `dia_mes` (misas mensuales fijas, nullable), `hora`, `tipo_actividad`, `temporada`, `reemplaza_dia` (NOT NULL, cancela las misas normales de esa fecha), `observacion`.
- **`eventos`** — `lugar_id` FK nullable (puede ser texto libre en `ubicacion`), `titulo`, `descripcion`, `fecha_inicio`/`fecha_fin`, `tipo` (enum `tipo_evento`), `departamento` (enum), `activo`, `slug` (auto).
- **`mensajes`** — sugerencias y reportes de error enviados desde `/contacto` (anon puede insertar). `tipo` (enum: `sugerencia`/`error_horario`), `estado` (enum: `nuevo`/`leido`/`respondido`), `nombre`/`telefono`/`email` (nullable, puede ser anónimo), `lugar_id` nullable, `lugar_nombre`, `departamento`, `notas_internas`, `leido_por`.
- **`solicitudes`** — `tipo` (`alta`/`baja`/`edicion`, CHECK), `estado` (`pendiente`/`aprobada`/`rechazada`, CHECK), `lugar_id` **nullable** (NULL en las de tipo `alta`, la capilla todavía no existe), `datos_propuestos` (jsonb — shape variable: campos completos de capilla para altas/ediciones de capilla, o `{ accion, horario/horario_id/datos }` para ediciones de horarios sueltos, distinguido por `campo_editado === "horarios"`), `campo_editado`, `motivo`, `motivo_rechazo`, `revisado_por`, `solicitado_por`.

RLS habilitada en las 6 tablas. `perfiles` solo tiene policies de `SELECT` (propio perfil, o todos si `is_super_admin()`, angostado a rol `authenticated` desde la migración 024) — todo INSERT/UPDATE/DELETE de perfiles pasa exclusivamente por Server Actions con `supabaseAdmin`.

## RPCs de Supabase (verificado vía `pg_proc`)

- `crear_lugar(...)` / `actualizar_lugar(...)` — encapsulan el manejo de la columna `coordenadas` (geography) y el `estado_verificacion`; `crear_lugar` devuelve `{success, id}`.
- `get_lugares_cercanos(user_lat, user_lng, radio_km)` — orden por distancia (PostGIS), sin `LIMIT` interno desde la migración 019 (la paginación es responsabilidad del frontend). Devuelve `slug` y `temporada_actual`, campos públicos únicamente.
- `get_lugares(filtro_departamento, filtro_busqueda)` — variante sin geolocalización.
- `slugify(input)` + triggers `set_lugar_slug()` / `set_evento_slug()` — generación automática de slugs, estables ante renombres.
- `is_super_admin()` — función `SECURITY DEFINER` en `public` (no en `auth`). Existe para evitar recursión infinita de RLS en policies de `perfiles`. Si necesitás otro chequeo de rol dentro de una policy de la misma tabla, agregalo como función `SECURITY DEFINER`, no como subquery directa.
- No existe ningún RPC de tipo "get_lugar_detalle" — el detalle de capilla se resuelve con un `select()` directo contra `lugares`/`horarios` desde el Server Component.

## Migraciones aplicadas (001–026)

| # | Propósito |
|---|---|
| 001 | Crea `perfiles` (roles originales `admin`/`editor_departamento`, ya renombrados en 011) |
| 002 | Trigger que calcula `coordenadas` (geography) desde `lat`/`lng` |
| 003 | RPCs `crear_lugar`/`actualizar_lugar` para manejar la columna geography |
| 004 | Agrega `ubicacion` a `eventos` |
| 005 | Horarios avanzados: `notas_horarios` en lugares, `dia_mes` en horarios, `dia_semana` nullable |
| 006 | RPC `get_lugares_cercanos` (requiere PostGIS) |
| 007 | Agrega `recibe_caritas` a lugares |
| 008 | Tabla `solicitudes_baja` (editores no pueden borrar directo, piden la baja) |
| 009 | Slugs públicos legibles (`/capilla/<slug>`, `/eventos/<slug>`) |
| 010 | Temporadas y misas mensuales que reemplazan las del día |
| 011 | Roles v2: `super_admin`/`admin_departamento`/`editor` |
| 012 | Fix incidente de producción: recursión infinita en RLS de `perfiles` |
| 013 | Fix auditoría: `admin_departamento` no veía solicitudes de tipo `alta` de su depto |
| 014 | Recrea el trigger `handle_new_user` sobre `auth.users` (no existía en la BD viva pese a estar en 001) |
| 015 | Tabla `mensajes` (sugerencias/reportes públicos) |
| 016 | Seed de capillas de Gran Mendoza (scraping autorizado), coordenadas placeholder |
| 017 | Geocodifica coordenadas reales de las capillas cargadas en 016 |
| 018 | Corrige dirección truncada de Capilla Santa Lucía |
| 019 | Quita el `LIMIT` interno de `get_lugares_cercanos` (paginación pasa al frontend) |
| 020 | Fix crítico: overloads `SECURITY DEFINER` huérfanos de `crear_lugar`/`actualizar_lugar` |
| 021 | Revoca `EXECUTE` de funciones `SECURITY DEFINER` auxiliares (`handle_new_user`) |
| 022 | Fija `search_path` en funciones con `search_path` mutable |
| 023 | Revoca `handle_new_user` también de `PUBLIC` (el revoke de 021 no alcanzaba) |
| 024 | Angosta policies `SELECT` de `perfiles` de `public` a `authenticated` |
| 025 | Fix de listado del bucket `imagenes_capillas` (acceso directo por URL no necesita RLS) |
| 026 | Columna `estado_verificacion` en lugares + RPCs actualizadas |

## Convenciones obligatorias

**Autorización en Server Actions** — patrón obligatorio en todo `actions.ts`:
```ts
const perfil = await requirePerfil();                 // lib/auth-server.ts — lanza AuthError si no hay sesión o perfil inactivo
const departamento = await getLugarDepartamento(id);   // SIEMPRE el valor de la BD, nunca el que manda el form, para un recurso existente
assertDepartamentoAccess(perfil, departamento);        // super_admin: cualquiera; admin_departamento/editor: solo el propio (compara contra un STRING de departamento, no un id)
// o assertAdmin(perfil) para acciones exclusivas de super_admin (voluntarios, aprobar/rechazar)
```
Para *crear* un recurso nuevo (sin fila existente en la BD) sí se usa el departamento que manda el form, porque no hay "ground truth" previo — `assertDepartamentoAccess` igual valida que el caller pueda operar ahí.

**Tres clientes de Supabase, no mezclar**:
- `supabaseAdmin` (`lib/supabase-admin.ts`, service role) — únicamente en archivos `"use server"` / server-only. Bypassea RLS. Es el único que debe escribir en Server Actions.
- `createServerSupabaseClient()` (`lib/supabase-server.ts`) — Server Components, respeta RLS y la sesión de cookies.
- `supabase` (`lib/supabase.ts`, browser) — Client Components, respeta RLS.
Ningún archivo `"use client"` debe importar `supabase-admin` — rompería el bundle del browser exponiendo la service role key.

**`revalidatePath`** — cada Server Action que muta datos revalida todas las rutas donde ese dato se muestra: la propia lista admin, `/admin` (dashboard), y las rutas públicas equivalentes (`/`, `/mapa`, `/capilla/[slug]`, `/eventos`). Mirar las acciones existentes en `capillas/actions.ts` como referencia antes de agregar una nueva.

**Mapa** — siempre `dynamic import` con `{ ssr: false }` para cualquier componente que use `react-leaflet`/Leaflet.

**Colores** — siempre vía las variables `--color-*` definidas en `app/globals.css` (`@theme`), nunca hex hardcodeado ni clases Tailwind crudas tipo `blue-500`/`amber-400` (rompen dark mode). Si hace falta un color que no tiene token todavía (ej. estados de temporada, Cáritas), agregar el par light/dark en `globals.css` antes de usarlo.

**Migraciones SQL** — usar el prefijo numérico siguiente en `supabase/migrations/` (van por 026). Escribirlas de forma idempotente cuando se pueda (`ADD COLUMN IF NOT EXISTS`, `DROP POLICY IF EXISTS`). Aplicar contra la BD real vía MCP de Supabase, no solo dejarlas en el repo — **el repo y la BD viva ya se desincronizaron una vez** (ver advertencia).

**`proxy.ts`** — único gate de sesión real para `/admin/*`. Nunca crear `middleware.ts` en paralelo (no es una convención válida en Next 16, sería un archivo muerto).

## Archivos clave

| Archivo | Propósito |
|---|---|
| [lib/auth-server.ts](lib/auth-server.ts) | `requirePerfil` / `assertDepartamentoAccess` / `assertAdmin` — toda la autorización de Server Actions pasa por acá |
| [lib/supabase-admin.ts](lib/supabase-admin.ts) | Cliente con service role — server-only |
| [lib/misas-utils.ts](lib/misas-utils.ts) | `findNextMisa` (temporadas/reemplazos), `temporadaVigente`, `normalizeText`, franjas horarias — la parte más delicada del dominio |
| [lib/departamentos.ts](lib/departamentos.ts) | Lista de los 9 departamentos habilitados (subconjunto del enum `departamentos_mza`) |
| [proxy.ts](proxy.ts) | Gate de sesión server-side para `/admin/*` (Next 16 Proxy) |
| [app/admin/layout.tsx](app/admin/layout.tsx) | Nav por rol, sidebar/drawer, auto-logout por inactividad (1h) — el gate de sesión real es `proxy.ts`, esto es solo UI |
| [app/admin/capillas/actions.ts](app/admin/capillas/actions.ts) | El más completo: ground-truth department check, ramificación `editor` → `solicitudes` (capillas y horarios sueltos) |
| [app/admin/solicitudes/actions.ts](app/admin/solicitudes/actions.ts) | Aprobación de solicitudes; ramifica por `campo_editado` — RPC (alta/edición de capilla), directo contra `horarios` (horarios sueltos), o directo contra `eventos` (alta/edición/baja de evento) |
| [app/components/candle-loader.tsx](app/components/candle-loader.tsx) | Loader animado usado en todo el panel admin y algunas vistas públicas |
| [app/components/animated-counter.tsx](app/components/animated-counter.tsx) | Contador que anima al entrar en viewport (usado en `/acerca`) |
| [public/sw.js](public/sw.js) | Service worker manual (sin Workbox, ver sección Turbopack) — cache-first de assets propios, network-first de páginas |
| [supabase/migrations/](supabase/migrations/) | Historial de schema — leer antes de asumir la forma de una tabla |
| [pantallas/DESIGN.md](pantallas/DESIGN.md) | Sistema de diseño light ("Warm Organic", sage green) |
| [pantallas/DESIGNdark.md](pantallas/DESIGNdark.md) | Sistema de diseño dark |

## Agentes y skills instalados

Instalados con `npx claude-code-templates@latest` (paquete de terceros, no escrito para este proyecto). Viven en `.claude/agents/` y `.claude/skills/`, no son parte del código de la app.

**Agentes** (`.claude/agents/*.md`):

| Agente | Para qué |
|---|---|
| `frontend-developer` | Desarrollo frontend completo, multi-framework (React/Vue/Angular) |
| `fullstack-developer` | Features que cruzan DB + API + frontend como una unidad |
| `backend-architect` | Diseño de arquitectura backend: APIs, límites de servicio, event-driven |
| `database-architect` | Diseño de esquemas, modelado de datos, selección de tecnología de BD |
| `ui-ux-designer` | Revisión de UI/UX, accesibilidad, crítica de diseño visual |
| `code-reviewer` | Revisión de código: calidad, seguridad, mantenibilidad |
| `security-auditor` | Auditorías de seguridad y compliance |

**Skills** (`.claude/skills/*/SKILL.md`):

| Skill | Para qué |
|---|---|
| `frontend-design` | Interfaces frontend de alta calidad, evita estética genérica de IA |
| `ui-ux-pro-max` | Base de estilos/paletas/tipografías/gráficos para decisiones de diseño |
| `senior-backend` | Scaffolding de APIs, optimización de queries, seguridad backend |
| `senior-frontend` | Scaffolding de componentes, performance, bundle analysis |
| `senior-architect` | Diagramas de arquitectura, decisiones de stack, trade-offs |
| `code-reviewer` | Análisis automatizado de código, checklist de revisión |

Son genéricos y no conocen las particularidades de este repo. Cuando se invoquen acá, las convenciones de este `AGENTS.md` (roles, RLS, los tres clientes de Supabase, paleta de diseño en `pantallas/DESIGN.md`/`DESIGNdark.md`, etc.) tienen prioridad sobre cualquier recomendación genérica que hagan.

## Gaps conocidos y documentados

- **`eventos/[slug]` sin imagen OG propia dedicada de evento**: tiene `openGraph.images` (agregado junto con las mejoras de metadata), pero si el evento no tiene lugar/imagen asociada cae al fallback genérico del sitio, no a una imagen específica del tipo de evento.

## Lo que NO tocar sin mostrar el SQL/diff primero

- **RLS policies** — no reescribir por intuición. Antes de tocar una policy, consultar `pg_policies` vía MCP para ver el estado real (el repo puede no coincidir con la BD viva) y mostrar el SQL al usuario antes de aplicarlo.
- **Migraciones ya aplicadas** (001–026) — no editarlas retroactivamente; agregar una nueva con el número siguiente.
- **`proxy.ts`** — es la única capa de gate de sesión real para `/admin/*`. No crear `middleware.ts` en paralelo.
- **Tokens de diseño** (`app/globals.css`, `pantallas/DESIGN.md`, `pantallas/DESIGNdark.md`) — paleta "Warm Organic" sage green, no introducir colores fuera de las variables `--color-*` existentes.
- **`SUPABASE_SERVICE_ROLE_KEY`** — solo en `lib/supabase-admin.ts`. Si algo parece necesitar la service role desde el cliente, la solución es una Server Action, no exponer la key.

## Advertencia: el repo y la base de datos viva pueden diverger

El schema base (`lugares`, `horarios`, `eventos` y sus enums) nunca quedó capturado en una migración — se creó a mano en algún momento. Las RLS policies también se editaron directo en producción más de una vez sin dejar migración. **Antes de asumir que una policy, trigger, o columna existe tal como dice un archivo de `supabase/migrations/`, verificarlo contra la BD real vía MCP** (`SELECT ... FROM pg_policies`, `pg_trigger`, `information_schema.columns`, `pg_proc`). Confirmado además: no existe ningún trigger sobre `auth.users` en la base viva a menos que se haya aplicado la migración 014 — cualquier alta de usuario debe crear su fila en `perfiles` explícitamente desde el código, no asumir que se autogenera.
