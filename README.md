# Misas Mendoza

Web app to manage and discover Catholic chapels, parishes, and events in Mendoza, Argentina. Includes a public-facing site for the community and an admin panel for content managers.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 (`@theme` in `globals.css`, no `tailwind.config.ts`)
- **Database:** Supabase (PostgreSQL + PostGIS)
- **Authentication:** Supabase Auth (email/password)
- **Icons:** lucide-react
- **Maps:** react-leaflet + Leaflet
- **Font:** Geist (via `next/font/google`)
- **Date formatting:** date-fns

## Features

### Public site (`/(public)`)
- **Home (`/`):** Shows chapels near the user's location (geolocation + PostGIS RPC), with cards listing next Mass time
- **Events (`/eventos`):** Lists events with filters by type and zone, formatted dates
- **Chapel detail (`/capilla/[id]`):** Server-rendered page with hero image, contact info, confession hours, grouped Mass schedule, and an interactive Leaflet map with "Cómo llegar" button

### Authentication & Authorization (`/login`)
- Login with email/password via Supabase Auth
- Two roles: `admin` and `editor_departamento`
- `editor_departamento` is scoped to a single department

### Admin panel (`/admin`)
- **Dashboard:** Department summary cards with chapel counts, quick chapel management table with search, edit, and delete
- **Capillas CRUD:** Create, edit, delete chapels with fields (name, address, department, phone, email, image URL, lat/lng, confessions checkbox). Department-scoped for editors via RBAC.
- **Eventos CRUD:** Create, edit, delete events (title, type, zone, location, start/end datetime, description). Zone-scoped for editors.
- **Voluntarios CRUD** (admin-only): Create, edit, delete volunteer accounts (creates Supabase Auth user + profile record)
- **Responsive design:** Cards on mobile (`block md:hidden`), tables on desktop (`hidden md:block`)
- **Delete confirmation** via reusable `ConfirmDialog` modal

## Database Schema (Supabase)

### `lugares` — Chapels/parishes/sanctuaries
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `nombre` | `text` | |
| `direccion` | `text` | |
| `departamento` | `departamentos_mza` | Custom enum |
| `telefono` | `text` | |
| `email` | `text` | |
| `imagen_url` | `text` | |
| `lat` | `float8` | |
| `lng` | `float8` | |
| `coordenadas` | `geography(Point, 4326)` | PostGIS, computed via RPC functions |
| `hay_confesiones` | `boolean` | |
| `created_at` | `timestamptz` | |

### `horarios` — Mass schedules
| Column | Type |
|---|---|
| `id` | `uuid` |
| `lugar_id` | `uuid` (FK → lugares) |
| `dia_semana` | `int2` (0=Sunday…6=Saturday) |
| `hora` | `text` (HH:mm) |

### `eventos` — Events
| Column | Type |
|---|---|
| `id` | `uuid` |
| `titulo` | `text` |
| `tipo` | `text` |
| `zona` | `text` |
| `ubicacion` | `text` |
| `fecha_inicio` | `timestamptz` |
| `fecha_fin` | `timestamptz` |
| `descripcion` | `text` |
| `activo` | `boolean` |
| `created_at` | `timestamptz` |

### `perfiles` — User profiles
| Column | Type |
|---|---|
| `id` | `uuid` (FK → auth.users) |
| `nombre_completo` | `text` |
| `email` | `text` |
| `rol` | `text` (`admin` / `editor_departamento`) |
| `departamento_asignado` | `text` |
| `activo` | `boolean` |
| `created_at` | `timestamptz` |

- Created by a trigger on `auth.users` insert via `handle_new_user()`
- RLS policies restrict admin operations to users with `rol = 'admin'`

### RPC functions (migrations/003_lugar_rpc.sql)
- `crear_lugar` — Inserts a chapel, building the `coordenadas` geography from `lat`/`lng`
- `actualizar_lugar` — Updates a chapel, rebuilding `coordenadas` from `lat`/`lng`

## Project Structure

```
app/
├── (public)/            # Public layout (header + bottom nav)
│   ├── layout.tsx
│   ├── page.tsx         # Home
│   ├── capilla/[id]/
│   │   └── page.tsx     # Chapel detail (server component)
│   └── eventos/
│       └── page.tsx     # Events list
├── login/
│   └── page.tsx         # Auth form
├── admin/
│   ├── layout.tsx       # Admin sidebar + mobile drawer
│   ├── page.tsx         # Dashboard
│   ├── capillas/
│   │   ├── actions.ts   # Server actions
│   │   ├── page.tsx     # List
│   │   ├── nuevo/
│   │   │   └── page.tsx # Create
│   │   └── [id]/editar/
│   │       └── page.tsx # Edit
│   ├── eventos/
│   │   ├── actions.ts
│   │   ├── page.tsx
│   │   ├── nuevo/
│   │   │   └── page.tsx
│   │   └── [id]/editar/
│   │       └── page.tsx
│   └── voluntarios/
│       ├── actions.ts
│       ├── page.tsx
│       ├── nuevo/
│       │   └── page.tsx
│       └── [id]/editar/
│           └── page.tsx
├── components/
│   ├── confirm-dialog.tsx
│   ├── Map.tsx          # Leaflet map
│   ├── map-wrapper.tsx  # Dynamic import wrapper
│   └── back-button.tsx
├── globals.css          # Tailwind v4 theme
└── layout.tsx           # Root layout
lib/
├── supabase.ts          # Public Supabase client
└── supabase-admin.ts    # Server-only admin client (service role)
supabase/migrations/
├── 001_create_perfiles.sql
├── 002_set_coordenadas_trigger.sql
└── 003_lugar_rpc.sql
```

## Setup

1. Clone the repo
2. Install dependencies:
   ```
   npm install
   ```
3. Create `.env.local` with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
4. Run the SQL migrations in `supabase/migrations/` in the Supabase SQL Editor
5. Start the dev server:
   ```
   npm run dev
   ```
