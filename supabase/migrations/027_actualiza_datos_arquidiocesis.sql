-- 027: Actualiza datos con la información publicada por la Arquidiócesis de Mendoza
-- Fuente: https://arquimendoza.org.ar/wordpress/parroquias-y-templos-2/ (fichas por parroquia),
-- consultada el 2026-09-27 con autorización de la Arquidiócesis.
--
-- Alcance (acordado a partir del informe de cruce):
--   1. Corrige el horario vespertino de invierno de Santiago Apóstol y San Nicolás.
--   2. Completa horario de secretaría y email donde no había dato.
--   3. Reemplaza teléfonos y horarios de secretaría distintos.
-- Queda afuera: direcciones, lugares verificados por voluntarios
-- (Nuestra Señora del Perpetuo Socorro), datos que parecen cargados con error en la
-- fuente (teléfonos compartidos entre Pompeya y San Cayetano, un teléfono de 6 dígitos,
-- la secretaría de Pompeya) y cruces de nombre con dirección distinta.
--
-- Cada UPDATE está condicionado al valor anterior: si un voluntario editó el campo
-- después del relevamiento, esa fila no se toca. Es idempotente.

-- Parroquia Santiago Apóstol y San Nicolás: misa vespertina del 1/3 al 31/10 es a las 19:30 (7 filas)
UPDATE public.horarios SET hora = '19:30'
WHERE lugar_id = (SELECT id FROM public.lugares WHERE slug = 'parroquia-santiago-apostol-y-san-nicolas') AND temporada = 'Invierno' AND hora = '19:15';

-- Parroquia Asunción de la Virgen
UPDATE public.lugares SET telefono = '+54-261-271-8793', horario_secretaria = 'Martes a Viernes de 17 a 19 hs. Sábados de 9 a 12 hs.', email = 'pquiasuncion@gmail.com'
WHERE slug = 'parroquia-asuncion-de-la-virgen' AND telefono = '+54-261-431-3504' AND horario_secretaria = 'Martes a Viernes de 17:00 a 20:00 hs. Sábado de 9:00 a 12:30 hs y de 17:00 a 20:00 hs.' AND email IS NULL;

-- Parroquia Inmaculado Corazón de María
UPDATE public.lugares SET telefono = '+54-261-434-0129', horario_secretaria = 'Martes a Viernes de 16 a 19 hs. Sábados de 10:30 a 12:30h', email = 'corazondemaria1919@hotmail.com'
WHERE slug = 'parroquia-inmaculado-corazon-de-maria' AND telefono = '+54 261 425-5460' AND horario_secretaria IS NULL AND email IS NULL;

-- Parroquia María Auxiliadora
UPDATE public.lugares SET horario_secretaria = 'Martes a Sábados 16.30 a 19.30 hs.'
WHERE slug = 'parroquia-maria-auxiliadora' AND horario_secretaria = 'Martes a Sábado de 17:00 a 20:30 hs.';

-- Santuario de María Auxiliadora
UPDATE public.lugares SET telefono = '+54-261-715-8978', horario_secretaria = 'Martes, Jueves y Sábado 8.30 a 12.30 hs. Miércoles y Viernes: 16 a 20 hs.'
WHERE slug = 'santuario-de-maria-auxiliadora' AND telefono = '+54 261 495-1084' AND horario_secretaria IS NULL;

-- Parroquia Nuestra Señora de la Candelaria
UPDATE public.lugares SET horario_secretaria = 'Horario Invierno Lunes 15:00 a 19:00 hs. Martes a Viernes 8:30 a 12:30 y de 15:00 a 19:00 hs. Sábados 9:00 a 13:00 hs. Horario Verano Lunes 16 a 20 hs. Martes a Viernes 8:00 a 12:00 y de 16:00 a 20:00 hs. Sábados 8:30 a 12.30 hs.'
WHERE slug = 'parroquia-nuestra-senora-de-la-candelaria' AND horario_secretaria = 'Lunes a Viernes de 9:00 a 12:30 hs y de 16:00 a 20:00 hs.';

-- Nuestra Señora de la Carrodilla
UPDATE public.lugares SET horario_secretaria = 'Martes a Viernes de 16.30 a 19.30 hs.', email = 'omicarrodilla@yahoo.com.ar'
WHERE slug = 'nuestra-senora-de-la-carrodilla' AND horario_secretaria IS NULL AND email IS NULL;

-- Parroquia Nuestra Señora de la Consolata
UPDATE public.lugares SET telefono = '+54-261-715-7665', horario_secretaria = 'Martes a Sábados de 9:00 a 12:00 hs.'
WHERE slug = 'parroquia-nuestra-senora-de-la-consolata' AND telefono = '+54-261-445-5343' AND horario_secretaria IS NULL;

-- Parroquia Nuestra Señora de Montserrat
UPDATE public.lugares SET telefono = '+54-261-613-4847', horario_secretaria = 'Martes a Viernes de 16 a 20 hs. Miércoles de 8 a 12 hs.'
WHERE slug = 'parroquia-nuestra-senora-de-montserrat' AND telefono = '+54-261-439-2118' AND horario_secretaria = 'Miércoles de 9:00 a 12:00 hs. Martes a Viernes de 16:00 a 20:00 hs.';

-- Parroquia Nuestra Señora del Carmen (Godoy Cruz)
UPDATE public.lugares SET horario_secretaria = 'Desde el 1 de mayo: Martes y Jueves 17.30 a 19.30 hs Miércoles de 10 a 12 hs Desde el 1er lunes de septiembre: Martes y Jueves 18 a 20 hs Miércoles de 10 a 12 hs', email = 'parroquiadelcarmendonorione@gmail.com'
WHERE slug = 'parroquia-nuestra-senora-del-carmen-godoy-cruz' AND horario_secretaria IS NULL AND email IS NULL;

-- Parroquia Cristo Rey
UPDATE public.lugares SET telefono = '+54-261-418-7979', horario_secretaria = 'Desde Semana Santa a Septiembre Martes y jueves de 16:00h a 19:00h. Miércoles y viernes de 17:00h a 19:00h Desde Octubre hasta Semana Santa Martes y Jueves de 17:00 a 20:00 hs. Miércoles y Viernes de 18:00 a 20:00 hs.'
WHERE slug = 'parroquia-cristo-rey' AND telefono = '+54-261-431-2777' AND horario_secretaria IS NULL;

-- Iglesia Nuestra Señora Madre de los Migrantes
UPDATE public.lugares SET telefono = '+54-261-800-4268', horario_secretaria = 'Martes y Viernes de 17:00 a 18:30 hs.'
WHERE slug = 'iglesia-nuestra-senora-madre-de-los-migrantes' AND telefono = '+54-261-431-2116' AND horario_secretaria IS NULL;

-- Parroquia Sagrado Corazón de Jesús (Guaymallén)
UPDATE public.lugares SET horario_secretaria = 'Martes a Viernes 17:00 a 19:00 hs. Sábados 10:30 a 12:30 hs.'
WHERE slug = 'parroquia-sagrado-corazon-de-jesus-guaymallen' AND horario_secretaria IS NULL;

-- Parroquia San Antonio de Padua
UPDATE public.lugares SET telefono = '+54-261-444-0749', horario_secretaria = 'Martes a Jueves 17 a 19:30 hs. Sábados de 9 a 11:30 hs.'
WHERE slug = 'parroquia-san-antonio-de-padua' AND telefono = '+54-263-415-3612' AND horario_secretaria = 'Martes a Viernes de 17:00 a 20:00 hs. Sábados de 9:00 a 13:00 hs.';

-- Cuasiparroquia San Cayetano
UPDATE public.lugares SET horario_secretaria = 'Lunes, Martes y Jueves de 16:30 a 18:30h'
WHERE slug = 'cuasiparroquia-san-cayetano' AND horario_secretaria = 'Martes y Jueves de 17:00 a 19:00 hs.';

-- Parroquia Divino Maestro
UPDATE public.lugares SET horario_secretaria = 'Horario de Invierno: Sábados de 17:30 a 18:30hs. Horario de Verano: Sábados de 17:30 a 19:30hs.'
WHERE slug = 'parroquia-divino-maestro' AND horario_secretaria = 'Sábados de 17:00 a 19:30 hs.';

-- Parroquia San José Obrero
UPDATE public.lugares SET horario_secretaria = 'Martes, Jueves y Sábados de 10:00 a 12:00 hs. Miércoles y Viernes de 18:00 a 20:00 hs.', email = 'sanjoseobrero@gmail.com'
WHERE slug = 'parroquia-san-jose-obrero' AND horario_secretaria IS NULL AND email IS NULL;

-- Parroquia San Pablo
UPDATE public.lugares SET horario_secretaria = 'Martes a Viernes de 17 a 19 hs.'
WHERE slug = 'parroquia-san-pablo' AND horario_secretaria IS NULL;

-- Parroquia San Vicente Ferrer
UPDATE public.lugares SET horario_secretaria = 'Horario invierno Desde Semana Santa hasta Octubre Martes a Viernes de 9 a 12 hs. y 16 a 19 hs. Sàbados de 10 a 12 hs. Horario verano Desde Octubre hasta Semana Santa Martes a Viernes 9 a 12 hs. y 17 a 20 hs. Sábados de 10 a 12 hs.'
WHERE slug = 'parroquia-san-vicente-ferrer' AND horario_secretaria IS NULL;

-- Parroquia Santa Ana
UPDATE public.lugares SET telefono = '+54-261-802-7217', horario_secretaria = 'Martes y Viernes de 9 a 12 hs y de 16 a 19 hs. Sábados de 9 a 12 hs.'
WHERE slug = 'parroquia-santa-ana' AND telefono = '+54-261-421-3235' AND horario_secretaria IS NULL;

-- Parroquia Santa Cruz
UPDATE public.lugares SET telefono = '+54-261-526-3831', horario_secretaria = 'Abril a Septiembre Martes a Viernes de 16:30 a 19:30 hs. Octubre a Marzo Martes a Viernes de 17:30 a 20:30 hs.'
WHERE slug = 'parroquia-santa-cruz' AND telefono = '+54-261-430-6710' AND horario_secretaria = 'Martes y Viernes de 16:00 a 19:00 hs.';

-- Parroquia Virgen de Urcupiña
UPDATE public.lugares SET telefono = '+54-261-469-0338', horario_secretaria = 'Miércoles 18:30 a 20:00 hs. Sábados 18:30 a 20:00 hs.'
WHERE slug = 'parroquia-virgen-de-urcupina' AND telefono = '+54-261-421-6024' AND horario_secretaria = 'Martes y Viernes de 18:00 a 20:00 hs.';

-- Parroquia Virgen Peregrina
UPDATE public.lugares SET telefono = '+54-261-536-3541', horario_secretaria = 'Abril a Septiembre Jueves y Sábados de 17 a 19 hs. Octubre a Marzo Jueves y Sábados de 18 a 20 hs.'
WHERE slug = 'parroquia-virgen-peregrina' AND telefono = '+54-261-436-3416' AND horario_secretaria IS NULL;

-- ─────────────────────────────────────────────────────────────────────────
-- Aplicada el 2026-09-27 vía supabase-js con la service role (el conector MCP
-- no tenía permisos en ese momento): 7 filas de horarios y 22 lugares.
-- Como no pasó por `apply_migration`, no figura en el historial de
-- migraciones de Supabase.
--
-- Reversión (valores previos al relevamiento), por si hiciera falta:
-- -- Reversión de 027 (restaura los valores previos al relevamiento del 2026-09-27)
-- UPDATE public.horarios SET hora = '19:15' WHERE lugar_id = (SELECT id FROM public.lugares WHERE slug = 'parroquia-santiago-apostol-y-san-nicolas') AND temporada = 'Invierno' AND hora = '19:30';
-- UPDATE public.lugares SET telefono = '+54-261-431-3504', horario_secretaria = 'Martes a Viernes de 17:00 a 20:00 hs. Sábado de 9:00 a 12:30 hs y de 17:00 a 20:00 hs.', email = NULL WHERE slug = 'parroquia-asuncion-de-la-virgen';
-- UPDATE public.lugares SET telefono = '+54 261 425-5460', horario_secretaria = NULL, email = NULL WHERE slug = 'parroquia-inmaculado-corazon-de-maria';
-- UPDATE public.lugares SET horario_secretaria = 'Martes a Sábado de 17:00 a 20:30 hs.' WHERE slug = 'parroquia-maria-auxiliadora';
-- UPDATE public.lugares SET telefono = '+54 261 495-1084', horario_secretaria = NULL WHERE slug = 'santuario-de-maria-auxiliadora';
-- UPDATE public.lugares SET horario_secretaria = 'Lunes a Viernes de 9:00 a 12:30 hs y de 16:00 a 20:00 hs.' WHERE slug = 'parroquia-nuestra-senora-de-la-candelaria';
-- UPDATE public.lugares SET horario_secretaria = NULL, email = NULL WHERE slug = 'nuestra-senora-de-la-carrodilla';
-- UPDATE public.lugares SET telefono = '+54-261-445-5343', horario_secretaria = NULL WHERE slug = 'parroquia-nuestra-senora-de-la-consolata';
-- UPDATE public.lugares SET telefono = '+54-261-439-2118', horario_secretaria = 'Miércoles de 9:00 a 12:00 hs. Martes a Viernes de 16:00 a 20:00 hs.' WHERE slug = 'parroquia-nuestra-senora-de-montserrat';
-- UPDATE public.lugares SET horario_secretaria = NULL, email = NULL WHERE slug = 'parroquia-nuestra-senora-del-carmen-godoy-cruz';
-- UPDATE public.lugares SET telefono = '+54-261-431-2777', horario_secretaria = NULL WHERE slug = 'parroquia-cristo-rey';
-- UPDATE public.lugares SET telefono = '+54-261-431-2116', horario_secretaria = NULL WHERE slug = 'iglesia-nuestra-senora-madre-de-los-migrantes';
-- UPDATE public.lugares SET horario_secretaria = NULL WHERE slug = 'parroquia-sagrado-corazon-de-jesus-guaymallen';
-- UPDATE public.lugares SET telefono = '+54-263-415-3612', horario_secretaria = 'Martes a Viernes de 17:00 a 20:00 hs. Sábados de 9:00 a 13:00 hs.' WHERE slug = 'parroquia-san-antonio-de-padua';
-- UPDATE public.lugares SET horario_secretaria = 'Martes y Jueves de 17:00 a 19:00 hs.' WHERE slug = 'cuasiparroquia-san-cayetano';
-- UPDATE public.lugares SET horario_secretaria = 'Sábados de 17:00 a 19:30 hs.' WHERE slug = 'parroquia-divino-maestro';
-- UPDATE public.lugares SET horario_secretaria = NULL, email = NULL WHERE slug = 'parroquia-san-jose-obrero';
-- UPDATE public.lugares SET horario_secretaria = NULL WHERE slug = 'parroquia-san-pablo';
-- UPDATE public.lugares SET horario_secretaria = NULL WHERE slug = 'parroquia-san-vicente-ferrer';
-- UPDATE public.lugares SET telefono = '+54-261-421-3235', horario_secretaria = NULL WHERE slug = 'parroquia-santa-ana';
-- UPDATE public.lugares SET telefono = '+54-261-430-6710', horario_secretaria = 'Martes y Viernes de 16:00 a 19:00 hs.' WHERE slug = 'parroquia-santa-cruz';
-- UPDATE public.lugares SET telefono = '+54-261-421-6024', horario_secretaria = 'Martes y Viernes de 18:00 a 20:00 hs.' WHERE slug = 'parroquia-virgen-de-urcupina';
-- UPDATE public.lugares SET telefono = '+54-261-436-3416', horario_secretaria = NULL WHERE slug = 'parroquia-virgen-peregrina';
