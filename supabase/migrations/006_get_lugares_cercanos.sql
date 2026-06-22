-- RPC para obtener lugares ordenados por distancia al usuario (requiere PostGIS)
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
  distancia float8
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
    ) AS distancia
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
