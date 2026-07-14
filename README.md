# Misas Mendoza

Aplicación web para descubrir horarios de misas, capillas, parroquias y eventos católicos en Mendoza, Argentina. Incluye un sitio público para la comunidad y un panel de administración para colaboradores.

> **Stack:** Next.js 16 · Supabase (PostgreSQL + PostGIS) · Tailwind CSS v4 · TypeScript · Vitest

📋 **¿Vas a trabajar en el proyecto desde otra PC?** Seguí el paso a paso en [DESARROLLO.md](DESARROLLO.md).

---

## Capturas de Pantalla

### Inicio — Capillas cercanas

![Inicio desktop](pantallas/Home.png)

### Detalle de Capilla

![Detalle capilla desktop](pantallas/Detalle_iglesia.png)

---

## Funcionalidades

### Sitio Público

| Pantalla | Descripción |
|---|---|
| **Inicio (`/`)** | Hero banner, buscador (insensible a tildes) y capillas ordenadas por distancia al usuario (geolocalización + PostGIS). Filtros combinables por localidad, día de misa (chips Lun-Dom + accesos rápidos Lun-Vie/Sábado/Domingo) y franja horaria (Mañana/Tarde/Noche). Favoritas fijadas arriba. |
| **Detalle capilla (`/capilla/[slug]`)** | Hero con imagen, botones de favorito y compartir (Web Share API), datos de contacto, badge de Cáritas, horarios agrupados por temporada (Todo el año / Invierno / Verano) y día, y mapa con "Cómo llegar". |
| **Eventos (`/eventos`)** | Listado de eventos vigentes (los pasados se ocultan solos) con filtros por tipo y departamento. Detalle en `/eventos/[slug]` con mapa si tiene capilla asociada. |
| **Mapa (`/mapa`)** | Mapa global con pins de todas las capillas activas, tooltips y popups con acceso al detalle. |

Las URLs públicas usan **slugs** legibles (`/capilla/parroquia-santiago-apostol`) generados automáticamente desde el nombre; los links viejos con UUID redirigen con 301. Hay favoritos persistidos en `localStorage` (sin cuenta), modo claro/oscuro, metadata Open Graph por página (vista previa al compartir por WhatsApp), `sitemap.xml` dinámico y `robots.txt`.

### Panel de Administración (`/admin`)

Acceso protegido por login (sesión en cookies vía `@supabase/ssr` + `proxy.ts`). Dos roles:

- **Super Admin:** acceso completo a todas las secciones. Puede eliminar capillas directamente.
- **Editor de departamento:** solo gestiona capillas y eventos de su departamento asignado. No elimina capillas: envía una **solicitud de baja** con motivo, que un admin revisa.

| Sección | Funcionalidades |
|---|---|
| **Dashboard** | Resumen por departamento, capillas sin horarios, tabla de acceso rápido. |
| **Capillas** | CRUD completo. Formulario con info básica, contacto, checkbox de Cáritas, **subida de imagen con recorte y compresión** (Supabase Storage), **grilla dinámica de horarios** (semanales + mensuales fijos, por temporada) y selector de ubicación en mapa. |
| **Eventos** | CRUD completo. Filtro en cascada departamento → capilla, fechas DD/MM/AAAA con datepicker, tipos del enum `tipo_evento`. |
| **Voluntarios** _(solo admin)_ | Crear, editar y desactivar cuentas de colaboradores (Supabase Auth + perfil). |
| **Solicitudes de Baja** _(solo admin)_ | Bandeja de pedidos de eliminación: aprobar (elimina la capilla) o rechazar, con historial. |

---

## Arquitectura

| Pieza | Detalle |
|---|---|
| **Next.js 16** | App Router, Server Components para listados, Server Actions para mutaciones, React Compiler activo. |
| **Auth** | `@supabase/ssr` con cookies. `proxy.ts` (reemplazo del middleware en Next 16) protege `/admin/*`. |
| **Clientes Supabase** | `lib/supabase.ts` (browser, componentes cliente) · `lib/supabase-server.ts` (Server Components con sesión) · `lib/supabase-public.ts` (anon server-only, vistas públicas) · `lib/supabase-admin.ts` (service role, **solo** Server Actions). |
| **Autorización** | Cada Server Action valida con `requirePerfil()` + `assertDepartamentoAccess()` (`lib/auth-server.ts`), leyendo el departamento real desde la DB (nunca del cliente). RLS activa en las tablas sensibles. |
| **Seguridad** | Content-Security-Policy en `next.config.ts`, scoped al host del proyecto Supabase. |
| **Mapas** | react-leaflet con `dynamic import { ssr: false }`. El popup del mapa usa colores fijos claros (leaflet.css fuerza card blanca). |
| **Tests** | Vitest sobre la lógica pura de `lib/` (`npm test`). |

## Estructura del Proyecto

```
app/
├── (public)/                      # Sitio público
│   ├── page.tsx                   # Inicio: buscador + filtros + capillas cercanas
│   ├── capilla/[slug]/page.tsx    # Detalle de capilla (Server Component + generateMetadata)
│   ├── eventos/page.tsx           # Listado de eventos vigentes
│   ├── eventos/[slug]/page.tsx    # Detalle de evento
│   └── mapa/page.tsx              # Mapa global
├── admin/
│   ├── layout.tsx                 # Sidebar + drawer mobile + guard de sesión
│   ├── page.tsx                   # Dashboard
│   ├── capillas/                  # CRUD + editor avanzado de horarios ([id]/horarios)
│   ├── eventos/                   # CRUD con filtro en cascada
│   ├── voluntarios/               # Gestión de cuentas (solo admin)
│   └── solicitudes/               # Bandeja de solicitudes de baja (solo admin)
├── components/                    # UI compartida (mapas, diálogos <dialog>, chips, share, etc.)
├── login/page.tsx
├── sitemap.ts / robots.ts         # SEO
└── globals.css                    # Tailwind v4: @theme, tokens, dark mode
lib/
├── supabase*.ts                   # Los 4 clientes (ver Arquitectura)
├── auth-server.ts                 # requirePerfil / assertDepartamentoAccess / assertAdmin
├── misas-utils.ts                 # findNextMisa, franjas horarias, normalizeText, distancias
├── eventos-tipos.ts               # Mapeo slug ↔ etiqueta/color del enum tipo_evento
├── departamentos.ts               # Departamentos habilitados en formularios
├── date-dmy.ts                    # Conversión DD/MM/AAAA ↔ ISO
└── *.test.ts                      # Tests de Vitest
supabase/migrations/               # 001–009, ver DESARROLLO.md para aplicarlas
proxy.ts                           # Gate de sesión para /admin/*
```

---

## Base de Datos (Supabase)

### `lugares`
| Columna | Tipo | Notas |
|---|---|---|
| `id` | `uuid` | PK |
| `nombre` | `text` | |
| `slug` | `text` | Único. Generado por trigger desde `nombre`; estable ante renombres |
| `tipo` | `tipo_lugar` | enum: `parroquia`, `capilla`, `santuario` |
| `departamento` | `departamentos_mza` | enum (9 valores; los formularios habilitan 5 por ahora) |
| `direccion` | `text` | |
| `lat`, `lng` | `float8` | |
| `coordenadas` | `geography(Point,4326)` | Calculado por RPC desde lat/lng |
| `imagen_url` | `text` | URL pública en Supabase Storage |
| `notas_horarios` | `text` | Aclaraciones de temporada |
| `hay_confesiones` | `boolean` | |
| `recibe_caritas` | `boolean` | Muestra el badge de Cáritas en el detalle |
| `activo` | `boolean` | |

### `horarios`
| Columna | Tipo | Notas |
|---|---|---|
| `lugar_id` | `uuid` | FK → lugares |
| `dia_semana` | `int (nullable)` | 0=Dom … 6=Sáb. Null si es mensual |
| `dia_mes` | `int (nullable)` | 1–31, para misas mensuales fijas |
| `hora` | `time` | |
| `temporada` | `text` | `'Todo el año'`, `'Invierno'`, `'Verano'` |
| `tipo_actividad` | `text` | `'Misa'`, etc. |

### `eventos`
| Columna | Tipo | Notas |
|---|---|---|
| `titulo` | `text` | |
| `slug` | `text` | Único, generado por trigger |
| `tipo` | `tipo_evento` | enum: `jovenes`, `aviso`, `retiro`, `especial` (ver `lib/eventos-tipos.ts`) |
| `departamento` | `departamentos_mza` | |
| `lugar_id` | `uuid (nullable)` | FK → lugares |
| `ubicacion` | `text` | Texto libre si no hay capilla asociada |
| `fecha_inicio`, `fecha_fin` | `timestamptz` | El sitio público oculta eventos vencidos |
| `descripcion` | `text` | |
| `activo` | `boolean` | |

### `perfiles`
| Columna | Tipo |
|---|---|
| `id` | `uuid` (FK → auth.users) |
| `nombre_completo` | `text` |
| `rol` | `'admin'` / `'editor_departamento'` |
| `departamento_asignado` | `text` |
| `activo` | `boolean` |

### `solicitudes_baja`
| Columna | Tipo | Notas |
|---|---|---|
| `lugar_id` | `uuid` | FK → lugares (`ON DELETE CASCADE`) |
| `motivo` | `text` | |
| `estado` | `varchar` | `pendiente` / `aprobada` / `rechazada` |
| `solicitado_por` | `uuid` | FK → perfiles |
| `created_at` | `timestamptz` | |

### RPCs
- `crear_lugar` / `actualizar_lugar` — insert/update con PostGIS y todos los campos.
- `get_lugares_cercanos(user_lat, user_lng, radio_km)` — capillas activas ordenadas por distancia (incluye `slug`).
- `slugify` + triggers `set_lugar_slug` / `set_evento_slug` — generación automática de slugs.

---

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción (incluye chequeo de TypeScript) |
| `npm run lint` | ESLint |
| `npm test` | Tests de Vitest (lógica pura de `lib/`) |
