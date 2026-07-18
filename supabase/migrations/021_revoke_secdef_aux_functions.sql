-- M-2: quitar EXECUTE de funciones SECURITY DEFINER auxiliares expuestas vía RPC.

-- handle_new_user es una función de trigger; no debe ser invocable vía RPC por nadie.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;

-- is_super_admin: la usan las RLS policies evaluadas por usuarios autenticados,
-- así que authenticated DEBE conservar EXECUTE. Solo se le quita a anon.
REVOKE EXECUTE ON FUNCTION public.is_super_admin() FROM anon;
