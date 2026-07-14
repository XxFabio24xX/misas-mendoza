-- US08: solicitudes de baja de capillas (los editor_departamento no pueden
-- borrar directamente; piden la baja y un admin la revisa).
CREATE TABLE public.solicitudes_baja (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lugar_id UUID NOT NULL REFERENCES public.lugares(id) ON DELETE CASCADE,
  motivo TEXT NOT NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente', 'aprobada', 'rechazada')),
  solicitado_por UUID REFERENCES public.perfiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_solicitudes_baja_lugar_id ON public.solicitudes_baja(lugar_id);
CREATE INDEX idx_solicitudes_baja_estado ON public.solicitudes_baja(estado);

ALTER TABLE public.solicitudes_baja ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins pueden leer todas las solicitudes de baja"
  ON public.solicitudes_baja FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.perfiles WHERE id = auth.uid() AND rol = 'admin'
    )
  );

CREATE POLICY "Usuarios pueden leer sus propias solicitudes de baja"
  ON public.solicitudes_baja FOR SELECT
  USING (solicitado_por = auth.uid());

CREATE POLICY "Usuarios activos pueden crear solicitudes de baja"
  ON public.solicitudes_baja FOR INSERT
  WITH CHECK (
    solicitado_por = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.perfiles WHERE id = auth.uid() AND activo = true
    )
  );

CREATE POLICY "Admins pueden actualizar solicitudes de baja"
  ON public.solicitudes_baja FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.perfiles WHERE id = auth.uid() AND rol = 'admin'
    )
  );

CREATE POLICY "Admins pueden eliminar solicitudes de baja"
  ON public.solicitudes_baja FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.perfiles WHERE id = auth.uid() AND rol = 'admin'
    )
  );
