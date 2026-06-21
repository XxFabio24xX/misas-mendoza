-- RPC functions to handle geography column (coordenadas) + full place CRUD

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
  p_activo boolean DEFAULT true
) RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  v_coordenadas geography;
BEGIN
  v_coordenadas := ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography;

  INSERT INTO public.lugares (
    nombre, tipo, departamento, direccion, lat, lng, coordenadas,
    decanato, telefono, email, sitio_web, horario_secretaria,
    descripcion, imagen_url, hay_confesiones, activo
  ) VALUES (
    p_nombre, p_tipo::tipo_lugar, p_departamento::departamentos_mza,
    p_direccion, p_lat, p_lng, v_coordenadas,
    p_decanato, p_telefono, p_email, p_sitio_web, p_horario_secretaria,
    p_descripcion, p_imagen_url, p_hay_confesiones, p_activo
  );

  RETURN json_build_object('success', true);
END;
$$;

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
  p_activo boolean DEFAULT true
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
    updated_at = now()
  WHERE id = p_id;

  RETURN json_build_object('success', true);
END;
$$;
