-- P2 (cierre RLS): angostar las policies SELECT de perfiles de 'public' a
-- 'authenticated'. Anon nunca lee perfiles en la app (las vistas públicas solo
-- tocan lugares/horarios/eventos), así que esto no cambia el comportamiento visible,
-- y permite quitarle a anon el EXECUTE sobre is_super_admin sin romper la evaluación
-- de la policy. Verificado en transacción revertida: anon -> perfiles devuelve 0 sin error.
ALTER POLICY "Super admin lee todos los perfiles" ON public.perfiles TO authenticated;
ALTER POLICY "Usuarios leen su propio perfil"      ON public.perfiles TO authenticated;

-- Sacar is_super_admin de la API pública para anon. authenticated la conserva
-- (las policies la usan al ser evaluadas por usuarios autenticados); service_role/
-- postgres también. El warning residual del advisor para 'authenticated' es inherente
-- a este patrón (helper SECURITY DEFINER usado dentro de policies) y es aceptable.
REVOKE EXECUTE ON FUNCTION public.is_super_admin() FROM PUBLIC, anon;
