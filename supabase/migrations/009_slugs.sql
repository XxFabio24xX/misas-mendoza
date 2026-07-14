-- URLs públicas legibles: /capilla/<slug> y /eventos/<slug> en vez del UUID.
-- El slug se genera desde nombre/titulo al insertar y queda estable después
-- (renombrar una capilla no rompe links ya compartidos).

CREATE OR REPLACE FUNCTION public.slugify(input text) RETURNS text
LANGUAGE sql IMMUTABLE AS $$
  SELECT trim(both '-' from regexp_replace(
    translate(lower(coalesce(input, '')), 'áéíóúäëïöüñ', 'aeiouaeioun'),
    '[^a-z0-9]+', '-', 'g'
  ));
$$;

-- ── lugares ────────────────────────────────────────────────────────────────
ALTER TABLE public.lugares ADD COLUMN IF NOT EXISTS slug TEXT;

CREATE OR REPLACE FUNCTION public.set_lugar_slug() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  base text;
  candidate text;
  n int := 2;
BEGIN
  IF NEW.slug IS NOT NULL THEN RETURN NEW; END IF;
  base := public.slugify(NEW.nombre);
  IF base = '' THEN base := 'lugar'; END IF;
  candidate := base;
  WHILE EXISTS (SELECT 1 FROM public.lugares WHERE slug = candidate AND id <> NEW.id) LOOP
    candidate := base || '-' || n;
    n := n + 1;
  END LOOP;
  NEW.slug := candidate;
  RETURN NEW;
END $$;

CREATE OR REPLACE TRIGGER trg_lugares_slug
  BEFORE INSERT OR UPDATE ON public.lugares
  FOR EACH ROW EXECUTE FUNCTION public.set_lugar_slug();

-- Backfill de filas existentes (numera duplicados por orden de creación)
WITH ranked AS (
  SELECT id, public.slugify(nombre) AS base,
         ROW_NUMBER() OVER (PARTITION BY public.slugify(nombre) ORDER BY created_at, id) AS rn
  FROM public.lugares
  WHERE slug IS NULL
)
UPDATE public.lugares l
SET slug = CASE WHEN r.rn = 1 THEN r.base ELSE r.base || '-' || r.rn END
FROM ranked r WHERE l.id = r.id;

ALTER TABLE public.lugares ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_lugares_slug ON public.lugares(slug);

-- ── eventos ────────────────────────────────────────────────────────────────
ALTER TABLE public.eventos ADD COLUMN IF NOT EXISTS slug TEXT;

CREATE OR REPLACE FUNCTION public.set_evento_slug() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  base text;
  candidate text;
  n int := 2;
BEGIN
  IF NEW.slug IS NOT NULL THEN RETURN NEW; END IF;
  base := public.slugify(NEW.titulo);
  IF base = '' THEN base := 'evento'; END IF;
  candidate := base;
  WHILE EXISTS (SELECT 1 FROM public.eventos WHERE slug = candidate AND id <> NEW.id) LOOP
    candidate := base || '-' || n;
    n := n + 1;
  END LOOP;
  NEW.slug := candidate;
  RETURN NEW;
END $$;

CREATE OR REPLACE TRIGGER trg_eventos_slug
  BEFORE INSERT OR UPDATE ON public.eventos
  FOR EACH ROW EXECUTE FUNCTION public.set_evento_slug();

WITH ranked AS (
  SELECT id, public.slugify(titulo) AS base,
         ROW_NUMBER() OVER (PARTITION BY public.slugify(titulo) ORDER BY fecha_inicio, id) AS rn
  FROM public.eventos
  WHERE slug IS NULL
)
UPDATE public.eventos e
SET slug = CASE WHEN r.rn = 1 THEN r.base ELSE r.base || '-' || r.rn END
FROM ranked r WHERE e.id = r.id;

ALTER TABLE public.eventos ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_eventos_slug ON public.eventos(slug);

-- ── RPC de cercanía: ahora devuelve también el slug ───────────────────────
-- Se eliminan TODAS las firmas previas: quedaba una versión vieja de 2
-- parámetros que generaba ambigüedad al llamarla vía PostgREST.
DROP FUNCTION IF EXISTS public.get_lugares_cercanos(float8, float8);
DROP FUNCTION IF EXISTS public.get_lugares_cercanos(float8, float8, float8);
CREATE OR REPLACE FUNCTION public.get_lugares_cercanos(
  user_lat float8,
  user_lng float8,
  radio_km float8 DEFAULT 100
)
RETURNS TABLE (
  id uuid,
  nombre text,
  tipo text,
  departamento text,
  direccion text,
  lat float8,
  lng float8,
  imagen_url text,
  hay_confesiones boolean,
  distancia float8,
  slug text
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    id,
    nombre,
    tipo::text,
    departamento::text,
    direccion,
    lat,
    lng,
    imagen_url,
    hay_confesiones,
    ST_Distance(
      coordenadas,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
    ) AS distancia,
    slug
  FROM public.lugares
  WHERE
    activo = true
    AND coordenadas IS NOT NULL
    AND ST_DWithin(
      coordenadas,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
      radio_km * 1000
    )
  ORDER BY distancia ASC
  LIMIT 30;
$$;
