-- Trigger para actualizar coordenadas (geography) desde lat/lng

CREATE OR REPLACE FUNCTION public.set_coordenadas()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.lat IS NOT NULL AND NEW.lng IS NOT NULL THEN
    NEW.coordenadas = ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326)::geography;
  ELSE
    NEW.coordenadas = NULL;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_lugares_coordenadas
  BEFORE INSERT OR UPDATE ON public.lugares
  FOR EACH ROW
  EXECUTE FUNCTION public.set_coordenadas();

-- Poblar coordenadas faltantes en registros existentes
UPDATE public.lugares
SET lat = lat
WHERE lat IS NOT NULL AND lng IS NOT NULL AND coordenadas IS NULL;
