-- Corrige la direccion de Capilla Santa Lucia (Godoy Cruz), que habia quedado
-- truncada ("A. del Valle Ben") en el scraping original de 016_seed_gran_mendoza.sql.
-- Direccion correcta confirmada por el usuario: Julio Argentino Roca 1800, Godoy Cruz.

UPDATE lugares
SET direccion = 'Julio Argentino Roca 1800',
    coordenadas = ST_SetSRID(ST_MakePoint(-68.8367975, -32.9481323), 4326)::geography
WHERE id = 'ded7462e-9351-47c7-a557-7265c2a4ec16';
