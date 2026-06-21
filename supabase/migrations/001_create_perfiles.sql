CREATE TABLE perfiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre_completo TEXT NOT NULL,
  email TEXT NOT NULL,
  rol TEXT NOT NULL CHECK (rol IN ('admin', 'editor_departamento')),
  departamento_asignado TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden leer su propio perfil"
  ON perfiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins pueden leer todos los perfiles"
  ON perfiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'admin'
    )
  );

CREATE POLICY "Admins pueden insertar perfiles"
  ON perfiles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'admin'
    )
  );

CREATE POLICY "Admins pueden actualizar perfiles"
  ON perfiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'admin'
    )
  );

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.perfiles (id, nombre_completo, email, rol)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'nombre_completo', 'Voluntario'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'rol', 'editor_departamento')
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
