-- Sistema de mensajes: sugerencias y reportes de error de horarios
-- enviados desde el sitio público. anon puede insertar (formulario de
-- contacto sin login); solo super_admin/admin_departamento leen y
-- actualizan.
CREATE TYPE tipo_mensaje AS ENUM ('sugerencia', 'error_horario');
CREATE TYPE estado_mensaje AS ENUM ('nuevo', 'leido', 'respondido');

CREATE TABLE mensajes (
  id               uuid             PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo             tipo_mensaje     NOT NULL,
  nombre           text,
  telefono         text,
  email            text,
  mensaje          text             NOT NULL,
  lugar_id         uuid             REFERENCES lugares(id) ON DELETE SET NULL,
  lugar_nombre     text,
  departamento     departamentos_mza,
  estado           estado_mensaje   NOT NULL DEFAULT 'nuevo',
  leido_por        uuid             REFERENCES perfiles(id) ON DELETE SET NULL,
  notas_internas   text,
  created_at       timestamptz      NOT NULL DEFAULT now(),
  updated_at       timestamptz      NOT NULL DEFAULT now()
);

CREATE INDEX idx_mensajes_estado  ON mensajes(estado);
CREATE INDEX idx_mensajes_tipo    ON mensajes(tipo);
CREATE INDEX idx_mensajes_lugar   ON mensajes(lugar_id);
CREATE INDEX idx_mensajes_created ON mensajes(created_at DESC);

CREATE TRIGGER trg_mensajes_updated_at
  BEFORE UPDATE ON mensajes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE mensajes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "insertar mensajes publico"
  ON mensajes FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "super_admin lee mensajes"
  ON mensajes FOR SELECT
  TO authenticated
  USING (public.is_super_admin());

CREATE POLICY "admin_departamento lee mensajes"
  ON mensajes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM perfiles p
      WHERE p.id = auth.uid()
      AND p.rol = 'admin_departamento'
      AND (
        mensajes.departamento IS NULL
        OR p.departamento_asignado::text = mensajes.departamento::text
      )
    )
  );

CREATE POLICY "admins actualizan mensajes"
  ON mensajes FOR UPDATE
  TO authenticated
  USING (
    public.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM perfiles p
      WHERE p.id = auth.uid()
      AND p.rol = 'admin_departamento'
      AND (
        mensajes.departamento IS NULL
        OR p.departamento_asignado::text = mensajes.departamento::text
      )
    )
  );
