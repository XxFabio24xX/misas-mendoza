-- Roles v2: super_admin (control total), admin_departamento (aprueba
-- solicitudes de su depto, edita capillas directo), editor (propone
-- cambios que pasan por aprobación).
--
-- Aplicado en producción vía Supabase MCP en 3 pasos porque ADD VALUE no
-- puede usarse en la misma transacción en la que se agrega.

-- 1) Enum: relabel preserva filas y policies existentes (Postgres trackea
-- los valores de enum por OID, no por label) + agrega el rol nuevo.
ALTER TYPE public.rol_usuario RENAME VALUE 'admin' TO 'super_admin';
ALTER TYPE public.rol_usuario RENAME VALUE 'editor_departamento' TO 'editor';
ALTER TYPE public.rol_usuario ADD VALUE 'admin_departamento';

-- 2) solicitudes_baja se generaliza a "solicitudes" (alta/baja/edicion).
ALTER TABLE public.solicitudes_baja RENAME TO solicitudes;

ALTER TABLE public.solicitudes
  ADD COLUMN tipo text NOT NULL DEFAULT 'baja' CHECK (tipo IN ('alta', 'baja', 'edicion')),
  ADD COLUMN datos_propuestos jsonb,
  ADD COLUMN revisado_por uuid REFERENCES public.perfiles(id),
  ADD COLUMN motivo_rechazo text,
  ADD COLUMN campo_editado text;

-- 3) RLS: perfiles antes dejaba leer todos los perfiles a cualquier
-- autenticado; ahora super_admin ve todos, el resto solo el suyo.
DROP POLICY IF EXISTS "Usuarios autenticados pueden leer perfiles" ON public.perfiles;

CREATE POLICY "Super admin lee todos los perfiles"
  ON public.perfiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.perfiles p
      WHERE p.id = auth.uid() AND p.rol = 'super_admin'::rol_usuario
    )
  );

CREATE POLICY "Usuarios leen su propio perfil"
  ON public.perfiles FOR SELECT
  USING (id = auth.uid());

-- solicitudes: super_admin ve todas, admin_departamento ve las de su
-- departamento (lugares.departamento y perfiles.departamento_asignado ya
-- son el mismo enum departamentos_mza, sin cast necesario), editor ve
-- solo las suyas.
DROP POLICY IF EXISTS "Admins pueden actualizar solicitudes de baja" ON public.solicitudes;
DROP POLICY IF EXISTS "Admins pueden eliminar solicitudes de baja" ON public.solicitudes;
DROP POLICY IF EXISTS "Admins pueden leer todas las solicitudes de baja" ON public.solicitudes;
DROP POLICY IF EXISTS "Usuarios activos pueden crear solicitudes de baja" ON public.solicitudes;
DROP POLICY IF EXISTS "Usuarios pueden leer sus propias solicitudes de baja" ON public.solicitudes;

CREATE POLICY "Super admin lee todas las solicitudes"
  ON public.solicitudes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE id = auth.uid() AND rol = 'super_admin'::rol_usuario
    )
  );

CREATE POLICY "Admin departamento lee las solicitudes de su departamento"
  ON public.solicitudes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.perfiles p
      JOIN public.lugares l ON l.id = solicitudes.lugar_id
      WHERE p.id = auth.uid()
        AND p.rol = 'admin_departamento'::rol_usuario
        AND p.departamento_asignado = l.departamento
    )
  );

CREATE POLICY "Usuarios leen sus propias solicitudes"
  ON public.solicitudes FOR SELECT
  USING (solicitado_por = auth.uid());

CREATE POLICY "Usuarios activos pueden crear solicitudes"
  ON public.solicitudes FOR INSERT
  WITH CHECK (
    solicitado_por = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.perfiles WHERE id = auth.uid() AND activo = true
    )
  );

CREATE POLICY "Super admin y admin departamento actualizan solicitudes"
  ON public.solicitudes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE id = auth.uid() AND rol = 'super_admin'::rol_usuario
    )
    OR EXISTS (
      SELECT 1 FROM public.perfiles p
      JOIN public.lugares l ON l.id = solicitudes.lugar_id
      WHERE p.id = auth.uid()
        AND p.rol = 'admin_departamento'::rol_usuario
        AND p.departamento_asignado = l.departamento
    )
  );

CREATE POLICY "Super admin elimina solicitudes"
  ON public.solicitudes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE id = auth.uid() AND rol = 'super_admin'::rol_usuario
    )
  );
