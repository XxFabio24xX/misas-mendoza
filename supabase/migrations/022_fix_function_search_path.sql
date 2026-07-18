-- P7: fijar search_path en las funciones que hoy lo tienen mutable (advisor
-- function_search_path_mutable). Se usa 'public, extensions' (NO '') porque los
-- cuerpos referencian PostGIS (ST_MakePoint/ST_Y/ST_Distance… viven en el esquema
-- extensions) y tablas como lugares/eventos; '' rompería esas referencias. En
-- Supabase, public y extensions no son escribibles por anon/authenticated, así que
-- este search_path no es hijackeable.
--
-- Las funciones SECURITY DEFINER (is_super_admin, handle_new_user) ya tienen
-- search_path='public' fijado desde migraciones previas y no se tocan acá.

ALTER FUNCTION public.actualizar_lat_lng() SET search_path = public, extensions;
ALTER FUNCTION public.set_coordenadas() SET search_path = public, extensions;
ALTER FUNCTION public.set_lugar_slug() SET search_path = public, extensions;
ALTER FUNCTION public.set_evento_slug() SET search_path = public, extensions;
ALTER FUNCTION public.set_updated_at() SET search_path = public, extensions;
ALTER FUNCTION public.slugify(text) SET search_path = public, extensions;
ALTER FUNCTION public.get_lugares(text, text) SET search_path = public, extensions;
ALTER FUNCTION public.get_lugares_cercanos(double precision, double precision, double precision) SET search_path = public, extensions;

-- Overloads restantes de crear_lugar / actualizar_lugar (todos SECURITY INVOKER
-- tras la migración 020; RLS los protege). Se fijan igual para limpiar el advisor.
ALTER FUNCTION public.crear_lugar(text, text, text, text, double precision, double precision, text, text, text, text, text, text, text, boolean, boolean, text, boolean) SET search_path = public, extensions;
ALTER FUNCTION public.crear_lugar(text, text, text, text, double precision, double precision, text, text, text, text, text, text, text, boolean, boolean, text) SET search_path = public, extensions;
ALTER FUNCTION public.crear_lugar(text, text, text, text, text, text, double precision, double precision, boolean) SET search_path = public, extensions;
ALTER FUNCTION public.actualizar_lugar(uuid, text, text, text, text, double precision, double precision, text, text, text, text, text, text, text, boolean, boolean, text, boolean) SET search_path = public, extensions;
ALTER FUNCTION public.actualizar_lugar(uuid, text, text, text, text, double precision, double precision, text, text, text, text, text, text, text, boolean, boolean, text) SET search_path = public, extensions;
ALTER FUNCTION public.actualizar_lugar(uuid, text, text, text, text, text, text, double precision, double precision, boolean) SET search_path = public, extensions;
