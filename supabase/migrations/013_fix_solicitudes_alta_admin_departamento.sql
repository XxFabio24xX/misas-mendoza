-- Auditoría de seguridad, hallazgo 1.1: admin_departamento no podía ver
-- (ni por lo tanto aprobar) solicitudes de tipo 'alta' de su propio
-- departamento. La policy de SELECT hacía JOIN lugares ON l.id =
-- solicitudes.lugar_id, y las altas tienen lugar_id NULL (la capilla
-- todavía no existe), así que el JOIN nunca matcheaba.
DROP POLICY IF EXISTS "Admin departamento lee las solicitudes de su departamento" ON public.solicitudes;

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
    OR (
      solicitudes.lugar_id IS NULL
      AND EXISTS (
        SELECT 1 FROM public.perfiles p
        WHERE p.id = auth.uid()
          AND p.rol = 'admin_departamento'::rol_usuario
          AND p.departamento_asignado::text = (solicitudes.datos_propuestos ->> 'departamento')
      )
    )
  );

-- Bug independiente descubierto al verificar el fix de arriba: lugar_id
-- había quedado NOT NULL (heredado de la tabla original solicitudes_baja),
-- pero crearCapilla en app/admin/capillas/actions.ts inserta lugar_id: null
-- a propósito para las solicitudes de tipo 'alta'. Sin este ALTER, esas
-- solicitudes nunca llegaban a insertarse.
ALTER TABLE public.solicitudes ALTER COLUMN lugar_id DROP NOT NULL;
