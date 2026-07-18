-- C-1 (CRÍTICO): Eliminar los overloads SECURITY DEFINER huérfanos de
-- crear_lugar / actualizar_lugar.
--
-- Problema: estos overloads viejos (quedaron de la evolución del esquema) corren
-- como owner=postgres (SECURITY DEFINER → ignoran RLS) y tienen EXECUTE concedido a
-- anon/authenticated. Quedan expuestos en POST /rest/v1/rpc/crear_lugar y
-- /rest/v1/rpc/actualizar_lugar → cualquiera con la anon key (pública, embebida en el
-- bundle del browser) puede crear o sobrescribir cualquier capilla, sorteando por
-- completo la autorización de los Server Actions (requirePerfil / assertDepartamentoAccess).
-- Verificado con PoC real como rol anon (insert exitoso, revertido con ROLLBACK).
--
-- Por qué es seguro eliminarlos: la app usa los overloads SECURITY INVOKER de
--   - crear_lugar     : 17 args (…, p_notas_horarios text, p_recibe_caritas boolean)
--   - actualizar_lugar: 18 args (…, p_notas_horarios text, p_recibe_caritas boolean)
-- llamados por nombre vía supabaseAdmin (service_role). Los overloads que se eliminan
-- NO tienen los parámetros p_notas_horarios / p_recibe_caritas, por lo que la
-- resolución por nombre de supabase-js nunca puede caer en ellos.

-- 1) REVOKE primero: cierra el hueco de inmediato aunque el DROP fallara.
REVOKE EXECUTE ON FUNCTION public.crear_lugar(
  text, text, text, text, text, text, text, text, text, text, text,
  boolean, boolean, double precision, double precision
) FROM anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.actualizar_lugar(
  uuid, text, text, text, text, text, text, text, text, text, text, text,
  boolean, boolean, double precision, double precision
) FROM anon, authenticated;

-- 2) DROP (sin CASCADE a propósito: si algo dependiera de ellos, preferimos que
--    falle en vez de borrar dependencias en silencio).
DROP FUNCTION public.crear_lugar(
  text, text, text, text, text, text, text, text, text, text, text,
  boolean, boolean, double precision, double precision
);

DROP FUNCTION public.actualizar_lugar(
  uuid, text, text, text, text, text, text, text, text, text, text, text,
  boolean, boolean, double precision, double precision
);
