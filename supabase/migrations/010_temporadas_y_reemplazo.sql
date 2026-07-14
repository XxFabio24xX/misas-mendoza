-- Manejo de temporadas y misas mensuales que reemplazan las del día.
--
-- temporada_actual: cada parroquia define cuándo cambia de horarios de
-- invierno/verano (no hay fecha fija), así que es un switch manual que el
-- voluntario actualiza cuando la parroquia lo anuncia. NULL = la capilla no
-- usa horarios por temporada.
ALTER TABLE public.lugares
  ADD COLUMN IF NOT EXISTS temporada_actual TEXT
  CHECK (temporada_actual IN ('Invierno', 'Verano'));

-- reemplaza_dia: para misas mensuales fijas (dia_mes) que cancelan las misas
-- normales de ese día (ej.: misa de los enfermos los 11 — si cae sábado o
-- domingo, es la única misa del día).
ALTER TABLE public.horarios
  ADD COLUMN IF NOT EXISTS reemplaza_dia BOOLEAN NOT NULL DEFAULT false;

-- La RPC de cercanía devuelve también temporada_actual para que el inicio
-- calcule la "próxima misa" con la temporada vigente.
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
  slug text,
  temporada_actual text
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
    slug,
    temporada_actual
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
