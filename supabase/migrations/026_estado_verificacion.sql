-- Sistema de verificación de capillas: marca si los datos de una capilla
-- fueron confirmados con la parroquia, están en revisión, o son los que
-- trajo la carga masiva de Gran Mendoza (016-018) sin confirmar todavía.

CREATE TYPE estado_verificacion AS ENUM (
  'sin_verificar',
  'en_revision',
  'verificada'
);

ALTER TABLE lugares
  ADD COLUMN estado_verificacion estado_verificacion
  NOT NULL DEFAULT 'sin_verificar';

-- Las capillas cargadas a mano antes de la migración masiva son candidatas
-- a 'verificada', pero por seguridad se deja todo en 'sin_verificar' — el
-- admin las va marcando manualmente desde el panel.

-- ── Limpieza de overloads muertos ────────────────────────────────────────
-- crear_lugar/actualizar_lugar tenían 3 firmas cada una acumuladas de
-- versiones previas del schema (9 params, 16 sin recibe_caritas, 17 con
-- recibe_caritas). Se dropean las 2 viejas antes de extender la vigente,
-- mismo criterio que la migración 009 aplicó para get_lugares_cercanos.
DROP FUNCTION IF EXISTS public.actualizar_lugar(uuid, text, text, text, text, text, text, double precision, double precision, boolean);
DROP FUNCTION IF EXISTS public.actualizar_lugar(uuid, text, text, text, text, double precision, double precision, text, text, text, text, text, text, text, boolean, boolean, text);
DROP FUNCTION IF EXISTS public.crear_lugar(text, text, text, text, text, text, double precision, double precision, boolean);
DROP FUNCTION IF EXISTS public.crear_lugar(text, text, text, text, double precision, double precision, text, text, text, text, text, text, text, boolean, boolean, text);

-- ── crear_lugar: agrega p_estado_verificacion ────────────────────────────
CREATE OR REPLACE FUNCTION public.crear_lugar(
  p_nombre text,
  p_tipo text,
  p_departamento text,
  p_direccion text,
  p_lat float8,
  p_lng float8,
  p_decanato text DEFAULT NULL,
  p_telefono text DEFAULT NULL,
  p_email text DEFAULT NULL,
  p_sitio_web text DEFAULT NULL,
  p_horario_secretaria text DEFAULT NULL,
  p_descripcion text DEFAULT NULL,
  p_imagen_url text DEFAULT NULL,
  p_hay_confesiones boolean DEFAULT false,
  p_activo boolean DEFAULT true,
  p_notas_horarios text DEFAULT NULL,
  p_recibe_caritas boolean DEFAULT false,
  p_estado_verificacion estado_verificacion DEFAULT 'sin_verificar'
) RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  v_coordenadas geography;
  v_id uuid;
BEGIN
  v_coordenadas := ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography;

  INSERT INTO public.lugares (
    nombre, tipo, departamento, direccion, lat, lng, coordenadas,
    decanato, telefono, email, sitio_web, horario_secretaria,
    descripcion, imagen_url, hay_confesiones, activo, notas_horarios,
    recibe_caritas, estado_verificacion
  ) VALUES (
    p_nombre, p_tipo::tipo_lugar, p_departamento::departamentos_mza,
    p_direccion, p_lat, p_lng, v_coordenadas,
    p_decanato, p_telefono, p_email, p_sitio_web, p_horario_secretaria,
    p_descripcion, p_imagen_url, p_hay_confesiones, p_activo, p_notas_horarios,
    p_recibe_caritas, p_estado_verificacion
  ) RETURNING id INTO v_id;

  RETURN json_build_object('success', true, 'id', v_id::text);
END;
$$;

-- ── actualizar_lugar: agrega p_estado_verificacion ───────────────────────
CREATE OR REPLACE FUNCTION public.actualizar_lugar(
  p_id uuid,
  p_nombre text,
  p_tipo text,
  p_departamento text,
  p_direccion text,
  p_lat float8,
  p_lng float8,
  p_decanato text DEFAULT NULL,
  p_telefono text DEFAULT NULL,
  p_email text DEFAULT NULL,
  p_sitio_web text DEFAULT NULL,
  p_horario_secretaria text DEFAULT NULL,
  p_descripcion text DEFAULT NULL,
  p_imagen_url text DEFAULT NULL,
  p_hay_confesiones boolean DEFAULT false,
  p_activo boolean DEFAULT true,
  p_notas_horarios text DEFAULT NULL,
  p_recibe_caritas boolean DEFAULT false,
  p_estado_verificacion estado_verificacion DEFAULT 'sin_verificar'
) RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  v_coordenadas geography;
BEGIN
  v_coordenadas := ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography;

  UPDATE public.lugares SET
    nombre = p_nombre,
    tipo = p_tipo::tipo_lugar,
    departamento = p_departamento::departamentos_mza,
    direccion = p_direccion,
    lat = p_lat,
    lng = p_lng,
    coordenadas = v_coordenadas,
    decanato = p_decanato,
    telefono = p_telefono,
    email = p_email,
    sitio_web = p_sitio_web,
    horario_secretaria = p_horario_secretaria,
    descripcion = p_descripcion,
    imagen_url = p_imagen_url,
    hay_confesiones = p_hay_confesiones,
    activo = p_activo,
    notas_horarios = p_notas_horarios,
    recibe_caritas = p_recibe_caritas,
    estado_verificacion = p_estado_verificacion,
    updated_at = now()
  WHERE id = p_id;

  RETURN json_build_object('success', true);
END;
$$;

-- CREATE OR REPLACE con una lista de parámetros distinta (se agregó
-- p_estado_verificacion) no reemplaza la firma anterior — Postgres solo
-- reemplaza cuando los tipos coinciden exactamente. Crea un overload nuevo
-- y deja la versión de 17 params colgando. Se dropea acá mismo.
DROP FUNCTION IF EXISTS public.actualizar_lugar(uuid, text, text, text, text, double precision, double precision, text, text, text, text, text, text, text, boolean, boolean, text, boolean);
DROP FUNCTION IF EXISTS public.crear_lugar(text, text, text, text, double precision, double precision, text, text, text, text, text, text, text, boolean, boolean, text, boolean);
