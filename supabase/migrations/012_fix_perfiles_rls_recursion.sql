-- Incidente en producción: "infinite recursion detected in policy for
-- relation perfiles". La policy "Super admin lee todos los perfiles" hacía
-- un SELECT sobre perfiles dentro de una policy sobre perfiles (self
-- reference), lo que Postgres no puede evaluar sin recursión infinita.
--
-- Fix estándar de Supabase: mover el chequeo a una función SECURITY
-- DEFINER. Al ejecutarse como el owner de la función (owner de la tabla),
-- la query interna bypassea RLS y no re-dispara la policy.
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.perfiles
    WHERE id = auth.uid() AND rol = 'super_admin'::rol_usuario
  )
$$;

DROP POLICY IF EXISTS "Super admin lee todos los perfiles" ON public.perfiles;

CREATE POLICY "Super admin lee todos los perfiles"
  ON public.perfiles FOR SELECT
  USING (public.is_super_admin());

GRANT EXECUTE ON FUNCTION public.is_super_admin() TO anon, authenticated;
