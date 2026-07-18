-- Quita el LIMIT 30 interno de get_lugares_cercanos: con paginacion classica
-- en el frontend (app/(public)/page.tsx), la funcion debe devolver todos los
-- lugares dentro del radio, no solo los primeros 30 mas cercanos.

CREATE OR REPLACE FUNCTION public.get_lugares_cercanos(user_lat double precision, user_lng double precision, radio_km double precision DEFAULT 100)
 RETURNS TABLE(id uuid, nombre text, tipo text, departamento text, direccion text, lat double precision, lng double precision, imagen_url text, hay_confesiones boolean, distancia double precision, slug text, temporada_actual text)
 LANGUAGE sql
 STABLE
AS $function$
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
  ORDER BY distancia ASC;
$function$
;
