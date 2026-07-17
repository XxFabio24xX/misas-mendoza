-- Auditoría de seguridad, hallazgo 1.2: no existía ningún trigger sobre
-- auth.users en la BD viva (la migración 001 define handle_new_user()/
-- on_auth_user_created pero nunca se aplicó tal cual — divergencia repo
-- vs. BD real, ver AGENTS.md). Se recrea con el nombre de enum correcto:
-- 'editor', no 'editor_departamento' (renombrado en la migración de roles v2).
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.perfiles (
    id,
    email,
    nombre_completo,
    rol,
    activo
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'nombre_completo',
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(
      (NEW.raw_user_meta_data->>'rol')::rol_usuario,
      'editor'::rol_usuario
    ),
    true
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
