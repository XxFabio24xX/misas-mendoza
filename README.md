# Misas Mendoza

Aplicación web para descubrir horarios de misas, capillas, parroquias y eventos católicos en Mendoza, Argentina. Incluye un sitio público para la comunidad y un panel de administración para colaboradores.

> **Stack:** Next.js 16 · Supabase (PostgreSQL + PostGIS) · Tailwind CSS v4 · TypeScript

---

## Capturas de Pantalla

### Inicio — Capillas cercanas

<!-- Agregar screenshot: pantallas/stitch_misas_mendoza_web_app/inicio_misas_mendoza_desktop/screen.png -->
![Inicio desktop](pantallas/Home.png)

### Detalle de Capilla

<!-- Agregar screenshot: pantallas/stitch_misas_mendoza_web_app/detalle_misas_mendoza_desktop/screen.png -->
![Detalle capilla desktop](pantallas/Detalle_iglesia.png)

### Mobile

<!-- Agregar capturas del dispositivo móvil en pantallas/ cuando estén disponibles -->
> _Capturas de mobile próximamente_

### Panel de Administración

<!-- Agregar screenshot del admin cuando esté disponible -->
> _Capturas del panel admin próximamente_

---

## Funcionalidades

### Sitio Público

| Pantalla | Descripción |
|---|---|
| **Inicio (`/`)** | Muestra capillas ordenadas por distancia al usuario (geolocalización + PostGIS). Cards con nombre, dirección y horario de la próxima misa. Filtros por departamento. |
| **Detalle capilla (`/capilla/[id]`)** | Hero con imagen, datos de contacto, horarios agrupados por temporada (Todo el año / Invierno / Verano) y día, y mapa interactivo con "Cómo llegar". |
| **Eventos (`/eventos`)** | Listado de eventos con filtros por tipo (Misa especial, Retiro, Jóvenes, etc.) y zona. Fechas formateadas en español. |

### Panel de Administración (`/admin`)

Acceso protegido por login. Dos roles:
- **Super Admin:** acceso completo a todas las secciones.
- **Editor de departamento:** solo puede gestionar capillas y eventos de su departamento asignado.

| Sección | Funcionalidades |
|---|---|
| **Dashboard** | Resumen por departamento, capillas sin horarios, tabla de acceso rápido. |
| **Capillas** | CRUD completo. Formulario con: info básica, contacto, descripción, **subida de imagen con recorte interactivo** (Supabase Storage), **grilla dinámica de horarios** (semanales + mensuales fijos), notas de temporada, y selector de ubicación en mapa (Leaflet + PostGIS). |
| **Eventos** | CRUD completo. Fechas con inicio/fin, tipo, zona, ubicación con mapa. |
| **Voluntarios** _(solo admin)_ | Crear, editar y desactivar cuentas de colaboradores (crea usuario en Supabase Auth + perfil en DB). |

---

## Tech Stack

| Tecnología | Uso |
|---|---|
| **Next.js 16** | App Router, Server Components, Server Actions |
| **TypeScript** | Tipado completo cliente y servidor |
| **Tailwind CSS v4** | Design system "Serene Organic Minimalist" — tokens en `globals.css` con `@theme {}` |
| **Supabase** | PostgreSQL + PostGIS para geolocalización, Auth, Storage para imágenes |
| **react-leaflet** | Mapas interactivos (selector de ubicación y detalle de capilla) |
| **react-easy-crop** | Recorte interactivo de imágenes antes de subir |
| **lucide-react** | Íconos |
| **date-fns** | Formateo de fechas en español |

---

## Estructura del Proyecto

```
app/
├── (public)/                   # Sitio público (layout con header + bottom nav mobile)
│   ├── layout.tsx
│   ├── page.tsx                # Inicio — capillas cercanas
│   ├── capilla/[id]/page.tsx   # Detalle de capilla (Server Component)
│   └── eventos/
│       ├── page.tsx            # Listado de eventos
│       └── [id]/page.tsx       # Detalle de evento
├── admin/
│   ├── layout.tsx              # Sidebar + drawer mobile + auth guard
│   ├── page.tsx                # Dashboard
│   ├── capillas/
│   │   ├── actions.ts          # Server Actions (CRUD + upload imagen)
│   │   ├── page.tsx            # Lista de capillas
│   │   ├── nuevo/page.tsx      # Formulario creación
│   │   ├── [id]/editar/page.tsx
│   │   └── [id]/horarios/page.tsx  # Editor avanzado de horarios
│   ├── eventos/
│   │   ├── actions.ts
│   │   ├── page.tsx
│   │   ├── nuevo/page.tsx
│   │   └── [id]/editar/page.tsx
│   └── voluntarios/
│       ├── actions.ts
│       ├── page.tsx
│       ├── nuevo/page.tsx
│       └── [id]/editar/page.tsx
├── components/
│   ├── horarios-grid.tsx       # Grilla dinámica de horarios (desktop tabla + mobile cards)
│   ├── image-uploader.tsx      # File picker con validación de peso y recorte interactivo
│   ├── location-picker.tsx     # Mapa Leaflet para seleccionar coordenadas
│   ├── map-wrapper.tsx         # Dynamic import (SSR: false) para Leaflet
│   ├── bottom-nav.tsx          # Navegación inferior mobile
│   ├── back-button.tsx
│   ├── confirm-dialog.tsx
│   └── theme-toggle.tsx
├── login/page.tsx
└── globals.css                 # Tailwind v4: @theme {}, tokens, dark mode, utilities
lib/
├── supabase.ts                 # Cliente público (anon key)
├── supabase-admin.ts           # Cliente servidor (service role — solo Server Actions)
└── misas-utils.ts              # findNextMisa(), formatDistancia()
supabase/migrations/
├── 001_create_perfiles.sql     # Tabla perfiles + trigger handle_new_user
├── 002_set_coordenadas_trigger.sql
├── 003_lugar_rpc.sql           # RPCs crear_lugar / actualizar_lugar (PostGIS)
├── 004_add_ubicacion_to_eventos.sql
├── 005_horarios_avanzados.sql  # notas_horarios en lugares, dia_mes en horarios, RPCs actualizados
└── 006_get_lugares_cercanos.sql  # RPC PostGIS para búsqueda por proximidad
```

---

## Base de Datos (Supabase)

### `lugares`
| Columna | Tipo | Notas |
|---|---|---|
| `id` | `uuid` | PK |
| `nombre` | `text` | |
| `tipo` | `tipo_lugar` | enum: `parroquia`, `capilla`, `santuario` |
| `departamento` | `departamentos_mza` | enum con los 18 dptos. de Mendoza |
| `direccion` | `text` | |
| `lat`, `lng` | `float8` | |
| `coordenadas` | `geography(Point,4326)` | Calculado por RPC desde lat/lng |
| `imagen_url` | `text` | URL pública en Supabase Storage |
| `notas_horarios` | `text` | Aclaraciones de temporada (migración 005) |
| `hay_confesiones` | `boolean` | |
| `activo` | `boolean` | |

### `horarios`
| Columna | Tipo | Notas |
|---|---|---|
| `lugar_id` | `uuid` | FK → lugares |
| `dia_semana` | `int2 (nullable)` | 0=Dom … 6=Sáb. Null si es mensual |
| `dia_mes` | `int2 (nullable)` | 1–31. Para misas mensuales fijas |
| `hora` | `time` | |
| `temporada` | `text` | `'Todo el año'`, `'Invierno'`, `'Verano'` |
| `tipo_actividad` | `text` | `'Misa'`, `'Confesión'`, etc. |

### `eventos`
| Columna | Tipo |
|---|---|
| `titulo` | `text` |
| `tipo` | `text` |
| `zona` | `text` |
| `ubicacion` | `text` |
| `fecha_inicio` | `timestamptz` |
| `fecha_fin` | `timestamptz` |
| `descripcion` | `text` |
| `lat`, `lng` | `float8` |

### `perfiles`
| Columna | Tipo |
|---|---|
| `id` | `uuid` (FK → auth.users) |
| `nombre_completo` | `text` |
| `rol` | `text` — `'admin'` / `'editor_departamento'` |
| `departamento_asignado` | `text` |
| `activo` | `boolean` |
