# Guía de Desarrollo — Configurar el proyecto en otra PC

Paso a paso para retomar el trabajo en una máquina nueva. El repositorio vive en
`https://github.com/XxFabio24xX/misas-mendoza`.

## 1. Requisitos

- **Node.js 20 o superior** (el proyecto se desarrolla con Node 24)
- **Git**
- Acceso al dashboard de Supabase del proyecto (para las credenciales)

## 2. Clonar y configurar Git

```bash
git clone https://github.com/XxFabio24xX/misas-mendoza.git
cd misas-mendoza
```

⚠️ **Configurá tu identidad de Git en cada PC nueva** (es configuración local,
no viaja con el clon). Si no lo hacés, los commits salen con el usuario de
Windows de la máquina en vez de tu cuenta de GitHub:

```bash
git config user.name "XxFabio24xX"
git config user.email "fabioescudero14@gmail.com"
```

Verificá con `git config user.name` antes del primer commit.

## 3. Instalar dependencias

```bash
npm install
```

## 4. Variables de entorno

Creá el archivo `.env.local` en la raíz (está en `.gitignore`, nunca se sube):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<proyecto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>
```

Los tres valores están en el dashboard de Supabase → **Project Settings → API**:
- *Project URL* → `NEXT_PUBLIC_SUPABASE_URL`
- *anon public* → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- *service_role* → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ secreta: saltea RLS, nunca
  la expongas en el cliente ni la subas a ningún lado)

Sin este archivo `npm run dev` arranca pero todo falla al consultar datos, y
`npm run build` corta en la recolección de páginas.

## 5. Verificar que todo funciona

```bash
npm run lint    # sin errores
npm test        # 30 tests en verde
npm run build   # compila y genera todas las rutas
npm run dev     # http://localhost:3000
```

Si las cuatro pasan, la PC quedó lista.

## 6. Flujo de trabajo diario

1. `git pull` antes de empezar (para traer lo hecho en otras PCs).
2. Trabajar en `main` (no usamos ramas por ahora).
3. Antes de pushear: `npm run lint && npm test && npm run build` en verde.
4. `git push` → **Vercel despliega automáticamente** cada push a `main`.

## 7. Migraciones de base de datos

Las migraciones viven en `supabase/migrations/` numeradas (001–026) y **se
aplican a mano** en el dashboard de Supabase → **SQL Editor** (no hay CLI
configurada) — o vía el MCP de Supabase (`apply_migration`) si trabajás con
un agente que lo tenga conectado. Reglas:

- Se corren **en orden** y una sola vez cada una. Las ya aplicadas en el
  proyecto actual son la 001 a la 026.
- Si un cambio de código depende de una migración nueva, **primero se corre la
  migración en Supabase y después se pushea el código** — al revés, producción
  queda rota entre el deploy y la migración.
- Al crear una migración nueva: archivo `0XX_descripcion.sql`, commitearlo
  junto con el código que lo usa.

## 8. Cosas no obvias del proyecto

- **Next 16**: `proxy.ts` en la raíz reemplaza al viejo `middleware.ts` (misma
  idea, otro nombre). La documentación local está en
  `node_modules/next/dist/docs/` — consultarla antes que la memoria, hay
  breaking changes respecto a versiones anteriores.
- **Enum `tipo_evento`**: los valores reales son `jovenes`, `aviso`, `retiro`,
  `especial` (minúscula, sin tilde). El mapeo a etiquetas visibles está
  centralizado en `lib/eventos-tipos.ts` — nunca mandar la etiqueta como valor.
- **Departamentos**: la lista de los formularios está en `lib/departamentos.ts`
  (9 habilitados, coincide 1 a 1 con el enum `departamentos_mza` de la DB). A
  futuro serán todos los de Mendoza — se agregan ahí, en un solo lugar.
- **Slugs**: las URLs públicas (`/capilla/...`, `/eventos/...`) usan slugs
  generados por triggers en la DB (migración 009). No se setean desde el
  código; una vez creado, el slug no cambia aunque se renombre la capilla.
- **Popup del mapa**: usa colores fijos claros a propósito (leaflet.css fuerza
  la tarjeta blanca sin importar el tema). No "corregirlo" a tokens del theme.
- **Cuatro clientes de Supabase** según contexto (ver Arquitectura en el
  README). Regla rápida: componente cliente → `supabase.ts`; Server Component
  público → `supabase-public.ts`; Server Component con sesión →
  `supabase-server.ts`; Server Action → `supabase-admin.ts` siempre validando
  con `requirePerfil()` primero.
