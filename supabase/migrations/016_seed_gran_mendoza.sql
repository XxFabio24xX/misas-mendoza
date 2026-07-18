-- Seed de iglesias de Gran Mendoza extraídas de horariodemisas.com.ar y horariosmisa.com.ar
-- (uso autorizado del sitio). lat/lng quedan en el centro de Mendoza como placeholder;
-- reubicar cada pin desde el panel admin. Ver resumen de fuentes/duplicados en el chat.

-- Capilla Madre de Misericordia Pastoral Universitaria (Capital)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas, hay_confesiones, notas_horarios)
  VALUES ('Capilla Madre de Misericordia Pastoral Universitaria', 'capilla', 'Capital', 'Padre Contreras 1300', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography, true, 'Confesiones: Miércoles 16:00 hs.')
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 3, NULL::integer, '19:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 3, NULL::integer, '19:30'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar;

-- Basílica Nuestra Señora del Rosario (Capital)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas, telefono, hay_confesiones, notas_horarios)
  VALUES ('Basílica Nuestra Señora del Rosario', 'santuario', 'Capital', 'Salta 2107', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography, '+54 261 425-7070', true, 'Confesiones: antes de cada Misa lunes y viernes; sábados y domingos 15 min antes de cada Misa.')
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 1, NULL::integer, '20:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 2, NULL::integer, '20:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 3, NULL::integer, '20:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 4, NULL::integer, '20:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 5, NULL::integer, '20:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 6, NULL::integer, '20:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '11:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '20:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar;

-- Basílica San Francisco (Capital)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas, telefono, hay_confesiones, notas_horarios)
  VALUES ('Basílica San Francisco', 'santuario', 'Capital', 'Av. España 1426', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography, '+54 261 425-6606', true, 'Confesiones: días de semana a partir de las 17:30 hs.')
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 2, NULL::integer, '10:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 2, NULL::integer, '19:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 3, NULL::integer, '10:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 3, NULL::integer, '19:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 4, NULL::integer, '10:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 4, NULL::integer, '19:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 5, NULL::integer, '10:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 5, NULL::integer, '19:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 6, NULL::integer, '19:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '09:30'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '11:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '19:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar;

-- Parroquia Inmaculado Corazón de María (Capital)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas, telefono, hay_confesiones, notas_horarios)
  VALUES ('Parroquia Inmaculado Corazón de María', 'parroquia', 'Capital', 'Martín Zapata 138', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography, '+54 261 425-5460', true, 'Confesiones: viernes y sábados de 18:00 a 19:00 hs.')
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 2, NULL::integer, '19:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 3, NULL::integer, '19:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 4, NULL::integer, '19:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 5, NULL::integer, '19:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 6, NULL::integer, '19:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '09:30'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '11:30'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '20:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar;

-- Parroquia Nuestra Señora de Lourdes (Capital)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas, telefono, hay_confesiones, notas_horarios)
  VALUES ('Parroquia Nuestra Señora de Lourdes', 'parroquia', 'Capital', 'Aguado A. 160', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography, '+54 261 367-5283', true, 'Confesiones: coordinar telefónicamente con la parroquia.')
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 2, NULL::integer, '19:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 3, NULL::integer, '19:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 4, NULL::integer, '19:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 5, NULL::integer, '19:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 6, NULL::integer, '19:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '11:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '20:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar;

-- Parroquia San Agustín (Capital)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas, telefono, hay_confesiones, notas_horarios)
  VALUES ('Parroquia San Agustín', 'parroquia', 'Capital', '9 de Julio 33', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography, '+54 261 424-1171', true, 'Confesiones: 30 minutos antes de cada Misa.')
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 1, NULL::integer, '19:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 2, NULL::integer, '19:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 3, NULL::integer, '19:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 4, NULL::integer, '19:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 5, NULL::integer, '19:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 6, NULL::integer, '19:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '12:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '18:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '20:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar;

-- Capilla del Hospital Español (Godoy Cruz)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas, notas_horarios)
  VALUES ('Capilla del Hospital Español', 'capilla', 'Godoy Cruz', 'Av. San Martín 965', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography, 'Servicio sacerdotal nocturno de 21:30 a 6:30. Tel.: 4253314.')
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 1, NULL::integer, '08:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 3, NULL::integer, '08:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 5, NULL::integer, '08:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '10:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar;

-- Capilla Nuestra Señora del Perpetuo Socorro (Godoy Cruz)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas, telefono, email)
  VALUES ('Capilla Nuestra Señora del Perpetuo Socorro', 'capilla', 'Godoy Cruz', 'Beltrán 1702', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography, '+54-261-4241171', 'psamsecretaria@gmail.com')
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 0, NULL::integer, '10:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar;

-- Capilla Santa Lucía (Godoy Cruz)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas, telefono)
  VALUES ('Capilla Santa Lucía', 'capilla', 'Godoy Cruz', 'A. del Valle Ben', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography, '+54-261-439-1555')
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 6, NULL::integer, '18:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '10:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar;

-- Capilla Virgen del Valle (Godoy Cruz)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas, telefono)
  VALUES ('Capilla Virgen del Valle', 'capilla', 'Godoy Cruz', 'Talcahuano 2001', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography, '+542614274134')
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 1, NULL::integer, '07:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 2, NULL::integer, '07:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 2, NULL::integer, '18:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 3, NULL::integer, '07:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 4, NULL::integer, '07:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 5, NULL::integer, '07:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 6, NULL::integer, '19:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar;

-- Iglesia Hermanas Obreras Catequistas (Godoy Cruz)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas, telefono, email, notas_horarios)
  VALUES ('Iglesia Hermanas Obreras Catequistas', 'capilla', 'Godoy Cruz', 'Perito Moreno 449', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography, '+54-261-422-2614', 'hlilianadejs@gmail.com', 'Adoración Eucarística: 1er viernes de cada mes de 7:30 a 22:30 hs. Espacio Joven de 20:00 a 22:30 hs.')
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 1, NULL::integer, '07:30'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 2, NULL::integer, '07:30'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 3, NULL::integer, '07:30'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 4, NULL::integer, '07:30'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 5, NULL::integer, '07:30'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 6, NULL::integer, '07:30'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '18:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 1, NULL::integer, '19:00'::time, 'Misa', 'Verano', 'Enero' FROM nuevo_lugar
UNION ALL
SELECT id, 2, NULL::integer, '19:00'::time, 'Misa', 'Verano', 'Enero' FROM nuevo_lugar
UNION ALL
SELECT id, 3, NULL::integer, '19:00'::time, 'Misa', 'Verano', 'Enero' FROM nuevo_lugar
UNION ALL
SELECT id, 4, NULL::integer, '19:00'::time, 'Misa', 'Verano', 'Enero' FROM nuevo_lugar
UNION ALL
SELECT id, 5, NULL::integer, '19:00'::time, 'Misa', 'Verano', 'Enero' FROM nuevo_lugar
UNION ALL
SELECT id, 6, NULL::integer, '19:00'::time, 'Misa', 'Verano', 'Enero' FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '18:00'::time, 'Misa', 'Verano', 'Enero' FROM nuevo_lugar;

-- Iglesia Jesús Nazareno (Godoy Cruz)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas, telefono, hay_confesiones, notas_horarios)
  VALUES ('Iglesia Jesús Nazareno', 'capilla', 'Godoy Cruz', 'República del Líbano 527', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography, '+54-261-422-6469', true, 'Confesiones: Miércoles de 17:00 a 19:00 hs.')
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 3, NULL::integer, '19:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 6, NULL::integer, '18:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '09:30'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar;

-- Iglesia Nuestra Señora de Castelmonte (Godoy Cruz)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas, telefono, hay_confesiones, notas_horarios)
  VALUES ('Iglesia Nuestra Señora de Castelmonte', 'capilla', 'Godoy Cruz', 'Perito Moreno 1361', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography, '+54-261-439-5488', true, 'Confesiones: 1 hora antes de la misa y hasta 10 minutos antes de empezar cada Misa. Capilla de Adoración Permanente las 24 hs.')
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 1, NULL::integer, '19:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 2, NULL::integer, '19:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 3, NULL::integer, '19:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 4, NULL::integer, '19:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 5, NULL::integer, '19:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 6, NULL::integer, '19:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '11:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '19:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 1, NULL::integer, '20:00'::time, 'Misa', 'Verano', 'Octubre a Pascua' FROM nuevo_lugar
UNION ALL
SELECT id, 2, NULL::integer, '20:00'::time, 'Misa', 'Verano', 'Octubre a Pascua' FROM nuevo_lugar
UNION ALL
SELECT id, 3, NULL::integer, '20:00'::time, 'Misa', 'Verano', 'Octubre a Pascua' FROM nuevo_lugar
UNION ALL
SELECT id, 4, NULL::integer, '20:00'::time, 'Misa', 'Verano', 'Octubre a Pascua' FROM nuevo_lugar
UNION ALL
SELECT id, 5, NULL::integer, '20:00'::time, 'Misa', 'Verano', 'Octubre a Pascua' FROM nuevo_lugar
UNION ALL
SELECT id, 6, NULL::integer, '20:00'::time, 'Misa', 'Verano', 'Octubre a Pascua' FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '11:30'::time, 'Misa', 'Verano', 'Octubre a Pascua' FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '20:00'::time, 'Misa', 'Verano', 'Octubre a Pascua' FROM nuevo_lugar;

-- Parroquia de San Juan Marón (Eparquía Maronita) (Godoy Cruz)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas, telefono, hay_confesiones, notas_horarios)
  VALUES ('Parroquia de San Juan Marón (Eparquía Maronita)', 'parroquia', 'Godoy Cruz', 'Antonio Tomba 365', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography, '+54-2613953411', true, 'Confesiones: una hora antes de cada misa.')
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 1, NULL::integer, '08:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 1, NULL::integer, '19:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 3, NULL::integer, '19:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 4, NULL::integer, '19:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 5, NULL::integer, '19:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 6, NULL::integer, '19:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '11:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '19:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, NULL::integer, 22, '20:00'::time, 'Misa', 'Todo el año', 'Misa de intercesión de San Charbel con bendición de aceite' FROM nuevo_lugar;

-- Parroquia Espíritu Santo / Centro Misionero (Godoy Cruz)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas, telefono, email)
  VALUES ('Parroquia Espíritu Santo / Centro Misionero', 'parroquia', 'Godoy Cruz', 'Chuquisaca 590', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography, '+54-2614270630', 'svd.godoycruz.espiritusanto@gmail.com')
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 6, NULL::integer, '18:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar;

-- Parroquia Espíritu Santo (Godoy Cruz)
INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas)
VALUES ('Parroquia Espíritu Santo', 'parroquia', 'Godoy Cruz', 'Cayetano Silva 1099', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography);

-- Parroquia Nuestra Señora de Fátima (Godoy Cruz)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas, telefono)
  VALUES ('Parroquia Nuestra Señora de Fátima', 'parroquia', 'Godoy Cruz', 'Joaquín V. González 163, Villa Marini', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography, '+54-261-422-6217')
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 2, NULL::integer, '19:30'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 3, NULL::integer, '19:30'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 4, NULL::integer, '19:30'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 5, NULL::integer, '19:30'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 6, NULL::integer, '20:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '10:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, NULL::integer, 13, '20:00'::time, 'Misa', 'Todo el año', 'Misa mensual' FROM nuevo_lugar
UNION ALL
SELECT id, 6, NULL::integer, '19:30'::time, 'Misa', 'Verano', 'Enero' FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '10:00'::time, 'Misa', 'Verano', 'Enero' FROM nuevo_lugar;

-- Parroquia Nuestra Señora de Montserrat (Godoy Cruz)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas, telefono, email, hay_confesiones, horario_secretaria, notas_horarios)
  VALUES ('Parroquia Nuestra Señora de Montserrat', 'parroquia', 'Godoy Cruz', 'J. V. González y P. Benegas, Barrio Trapiche', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography, '+54-261-439-2118', 'mont-serrat@ciudad.com.ar', true, 'Miércoles de 9:00 a 12:00 hs. Martes a Viernes de 16:00 a 20:00 hs.', 'Confesiones: Miércoles y Viernes de 17:00 a 18:30 hs.')
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 2, NULL::integer, '19:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 3, NULL::integer, '19:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 4, NULL::integer, '19:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 5, NULL::integer, '19:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 6, NULL::integer, '19:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '09:30'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '11:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '19:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 2, NULL::integer, '07:30'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 3, NULL::integer, '07:30'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 4, NULL::integer, '07:30'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 5, NULL::integer, '07:30'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 6, NULL::integer, '20:00'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '09:30'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '11:00'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '20:00'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar;

-- Parroquia Nuestra Señora del Rosario de Pompeya (Godoy Cruz)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas, telefono, email, hay_confesiones, horario_secretaria, notas_horarios)
  VALUES ('Parroquia Nuestra Señora del Rosario de Pompeya', 'parroquia', 'Godoy Cruz', 'Derqui 1280', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography, '+54-9-261-800-7370', 'parroquia.pompeya01@gmail.com', true, 'Miércoles y Viernes de 17:00 a 19:00 hs.', 'Confesiones: media hora antes de misa.')
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 1, NULL::integer, '10:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 3, NULL::integer, '10:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 6, NULL::integer, '17:30'::time, 'Misa', 'Todo el año', 'Precedida de Rezo del Santo Rosario 17:00' FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '10:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar;

-- Parroquia San Adrnoldo Jansen (Godoy Cruz)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas, telefono, email)
  VALUES ('Parroquia San Adrnoldo Jansen', 'parroquia', 'Godoy Cruz', 'El Vergel 1159', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography, '+54-261-427-1684', 'sdv_godoycruz@yahoo.com.ar')
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 4, NULL::integer, '18:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '20:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar;

-- Parroquia Virgen Peregrina (Godoy Cruz)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas, telefono, hay_confesiones, notas_horarios)
  VALUES ('Parroquia Virgen Peregrina', 'parroquia', 'Godoy Cruz', 'Vélez Sarfield 2521', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography, '+54-261-436-3416', true, 'Confesiones: media hora antes de las Misas, o coordinar al 2615404604 / en Secretaría. Tel. Secretaría: 261 605 2107.')
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 4, NULL::integer, '19:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 5, NULL::integer, '19:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 6, NULL::integer, '19:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '10:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar;

-- Capilla Cristo Redentor (Godoy Cruz)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas, telefono, hay_confesiones, notas_horarios)
  VALUES ('Capilla Cristo Redentor', 'capilla', 'Godoy Cruz', 'El Zonda 2149-2199', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography, '+54-261-4271684', true, 'Confesiones: media hora antes de las misas.')
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 5, NULL::integer, '18:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '10:30'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar;

-- Capilla de la Universidad Católica (Godoy Cruz)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas, telefono, email)
  VALUES ('Capilla de la Universidad Católica', 'capilla', 'Godoy Cruz', 'Uruguay 750', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography, '+54-261-442-9400', 'lorente@uca.edu.ar')
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 2, NULL::integer, '17:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 6, NULL::integer, '18:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar;

-- Cuasiparroquia San Cayetano (Godoy Cruz)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas, telefono, email, hay_confesiones, horario_secretaria, notas_horarios)
  VALUES ('Cuasiparroquia San Cayetano', 'capilla', 'Godoy Cruz', 'Anatole France 630', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography, '+54-261-424-4591', 'sancayetanogcmza@gmail.com', true, 'Martes y Jueves de 17:00 a 19:00 hs.', 'Confesiones: Sábado y Domingo 30 minutos antes de cada misa. Tel. Secretaría fijo: 54-2618006899.')
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 2, NULL::integer, '18:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 4, NULL::integer, '18:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 6, NULL::integer, '19:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '11:30'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '19:30'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 6, NULL::integer, '21:00'::time, 'Misa', 'Verano', 'Enero y Febrero' FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '11:30'::time, 'Misa', 'Verano', 'Enero y Febrero' FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '21:00'::time, 'Misa', 'Verano', 'Enero y Febrero' FROM nuevo_lugar;

-- Parroquia Nuestra Señora de Guadalupe (Godoy Cruz)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas, telefono, email)
  VALUES ('Parroquia Nuestra Señora de Guadalupe', 'parroquia', 'Godoy Cruz', 'Salvador Civit 2250', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography, '+54-261-422-2451', 'padremichael@gmail.com')
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 4, NULL::integer, '20:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 6, NULL::integer, '20:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '20:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar;

-- Parroquia San Pedro Apóstol (Godoy Cruz)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas, telefono, hay_confesiones, notas_horarios)
  VALUES ('Parroquia San Pedro Apóstol', 'parroquia', 'Godoy Cruz', 'Vandor y Alberti, Barrio Metalúrgico', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography, '+54-261-452-1002', true, 'Confesiones: hasta Abril Martes y Viernes de 18:00 a 20:00 hs, desde Abril de 17:00 a 19:00 hs.')
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 2, NULL::integer, '19:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 3, NULL::integer, '19:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 4, NULL::integer, '19:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 5, NULL::integer, '19:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 6, NULL::integer, '19:30'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '11:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '20:30'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar;

-- Parroquia San Vicente Ferrer (Godoy Cruz)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas, telefono, email, hay_confesiones, notas_horarios)
  VALUES ('Parroquia San Vicente Ferrer', 'parroquia', 'Godoy Cruz', 'Lavalle 60', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography, '+54-261-422-1037', 'pbroedu@yahoo.com.ar', true, 'Confesiones: Padre Sergio martes 18:00-20:00; Padre Horacio viernes 9:00-12:00 y 17:00-20:00.')
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 1, NULL::integer, '08:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 2, NULL::integer, '08:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 2, NULL::integer, '19:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 3, NULL::integer, '08:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 3, NULL::integer, '19:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 4, NULL::integer, '08:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 4, NULL::integer, '19:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 5, NULL::integer, '08:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 5, NULL::integer, '19:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 6, NULL::integer, '19:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '11:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '19:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar;

-- Santuario de Schoenstatt, Nazareth del Padre Tierra de Unidad (Godoy Cruz)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas, email, horario_secretaria, notas_horarios)
  VALUES ('Santuario de Schoenstatt, Nazareth del Padre Tierra de Unidad', 'santuario', 'Godoy Cruz', 'Calle Kentenich S/N, Ingreso por Av. San Martín Sur, Barrio Portal de Benegas', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography, 'secretariaschoenstattmza@gmail.com', 'Lunes a Viernes de 9:00 a 13:00 hs, Sábados de 10:00 a 12:00 hs.', 'Apertura del Santuario: Lunes a Viernes 9:00-18:00, Sábado 9:00-20:00, Domingo 9:00-19:00. WhatsApp 2617602288. En enero no hay misas.')
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 6, NULL::integer, '19:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '18:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar;

-- Iglesia Nuestra Señora de la Soledad (Godoy Cruz)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas, telefono, hay_confesiones, notas_horarios)
  VALUES ('Iglesia Nuestra Señora de la Soledad', 'capilla', 'Godoy Cruz', 'Balcarce 267', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography, '+54 261 435-0048', true, 'Confesiones: domingos, 5 minutos antes de cada Misa y durante la misma.')
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 1, NULL::integer, '07:15'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 1, NULL::integer, '19:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 2, NULL::integer, '07:15'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 2, NULL::integer, '19:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 3, NULL::integer, '07:15'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 3, NULL::integer, '19:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 4, NULL::integer, '07:15'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 4, NULL::integer, '19:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 5, NULL::integer, '07:15'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 5, NULL::integer, '19:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 6, NULL::integer, '07:15'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 6, NULL::integer, '12:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 6, NULL::integer, '19:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '07:30'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '09:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '10:30'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '12:30'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar;

-- Parroquia Nuestra Señora del Carmen (Godoy Cruz) (Godoy Cruz)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas, telefono, hay_confesiones, notas_horarios)
  VALUES ('Parroquia Nuestra Señora del Carmen (Godoy Cruz)', 'parroquia', 'Godoy Cruz', 'Paso de los Andes 1998', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography, '+54 261 275-7733', true, 'Confesiones: viernes de 19:00 a 20:00 hs.')
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 1, NULL::integer, '19:30'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 1, NULL::integer, '20:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 2, NULL::integer, '08:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 2, NULL::integer, '19:30'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 2, NULL::integer, '20:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 3, NULL::integer, '08:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 3, NULL::integer, '19:30'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 3, NULL::integer, '20:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 4, NULL::integer, '08:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 4, NULL::integer, '19:30'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 4, NULL::integer, '20:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 5, NULL::integer, '08:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 5, NULL::integer, '19:30'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 5, NULL::integer, '20:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 6, NULL::integer, '19:30'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 6, NULL::integer, '20:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '09:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '11:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '11:30'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '20:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '20:30'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar;

-- Capilla María Mediadora de Todas las Gracias (Guaymallén)
INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas)
VALUES ('Capilla María Mediadora de Todas las Gracias', 'capilla', 'Guaymallén', 'Pacheco s/n, Puente de Hierro – Los Corralitos', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography);

-- Capilla Nuestra Señora de las Lágrimas (Guaymallén)
INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas, notas_horarios)
VALUES ('Capilla Nuestra Señora de las Lágrimas', 'capilla', 'Guaymallén', 'Tabanera 8621, Colonia Molina – Los Corralitos', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography, 'Propiedad de los Josefinos de Murialdo.');

-- Iglesia Colegio Los Olivos (Guaymallén)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas, telefono, email, hay_confesiones, notas_horarios)
  VALUES ('Iglesia Colegio Los Olivos', 'capilla', 'Guaymallén', 'Rondeau 160', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography, '+54-261-421-0650', 'info.secretaria.losolivos@apdes.edu.ar', true, 'Confesiones: diariamente de 9:00 a 13:00 hs. Sin misas de diciembre a fines de febrero.')
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 1, NULL::integer, '11:10'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 2, NULL::integer, '11:10'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 3, NULL::integer, '11:10'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 4, NULL::integer, '11:10'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 5, NULL::integer, '11:10'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar;

-- Iglesia Nuestra Señora de las Mercedes (Guaymallén)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas, telefono, hay_confesiones, notas_horarios)
  VALUES ('Iglesia Nuestra Señora de las Mercedes', 'capilla', 'Guaymallén', 'Mathus Hoyos 3294 – Bermejo', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography, '+54-261-451-2003', true, 'Confesiones: martes a viernes 1 hora antes de la misa; domingos media hora antes de cada misa.')
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 2, NULL::integer, '19:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 4, NULL::integer, '19:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 3, NULL::integer, '18:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 5, NULL::integer, '18:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '09:30'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '11:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '19:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 2, NULL::integer, '19:30'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 3, NULL::integer, '19:30'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 4, NULL::integer, '19:30'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 5, NULL::integer, '19:30'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '09:30'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '11:00'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '20:00'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar;

-- Iglesia Nuestra Señora Madre de los Migrantes (Guaymallén)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas, telefono, email, hay_confesiones, notas_horarios)
  VALUES ('Iglesia Nuestra Señora Madre de los Migrantes', 'capilla', 'Guaymallén', 'Godoy 544', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography, '+54-261-431-2116', 'mendoza@scalabrinianos.org.ar', true, 'Confesiones: 30 minutos antes de cada misa. Adoración Eucarística: martes 18:30-19:30.')
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 1, NULL::integer, '19:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 2, NULL::integer, '19:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 3, NULL::integer, '19:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 4, NULL::integer, '19:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 5, NULL::integer, '19:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 6, NULL::integer, '19:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '11:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '19:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 1, NULL::integer, '19:30'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 2, NULL::integer, '19:30'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 3, NULL::integer, '19:30'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 4, NULL::integer, '19:30'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 5, NULL::integer, '19:30'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 6, NULL::integer, '19:30'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '11:00'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '19:30'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar;

-- Iglesia Templete Jesús Misericordioso (Guaymallén)
INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas)
VALUES ('Iglesia Templete Jesús Misericordioso', 'capilla', 'Guaymallén', 'Avenida Acceso Este y Pescara', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography);

-- Parroquia Asunción de la Virgen (Guaymallén)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas, telefono, hay_confesiones, horario_secretaria, notas_horarios)
  VALUES ('Parroquia Asunción de la Virgen', 'parroquia', 'Guaymallén', 'Dorrego 1592, Cnel. Dorrego', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography, '+54-261-431-3504', true, 'Martes a Viernes de 17:00 a 20:00 hs. Sábado de 9:00 a 12:30 hs y de 17:00 a 20:00 hs.', 'Confesiones: martes, miércoles y viernes de 17:00 a 18:45 hs. Secretaría: martes a viernes 17:00-20:00, sábado 9:00-12:30 y 17:00-20:00.')
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 2, NULL::integer, '19:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 3, NULL::integer, '19:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 4, NULL::integer, '19:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 5, NULL::integer, '19:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 6, NULL::integer, '19:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '09:30'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '11:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '20:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 6, NULL::integer, '19:00'::time, 'Misa', 'Verano', 'Enero' FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '10:00'::time, 'Misa', 'Verano', 'Enero' FROM nuevo_lugar;

-- Parroquia Cristo Rey (Guaymallén)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas, telefono, hay_confesiones, notas_horarios)
  VALUES ('Parroquia Cristo Rey', 'parroquia', 'Guaymallén', 'Tropero Sosa 593', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography, '+54-261-431-2777', true, 'Confesiones: martes a viernes de 16:30 a 19:30 hs.')
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 1, NULL::integer, '19:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 2, NULL::integer, '19:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 3, NULL::integer, '19:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 4, NULL::integer, '19:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 5, NULL::integer, '19:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 6, NULL::integer, '20:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '09:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '11:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '20:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 2, NULL::integer, '20:00'::time, 'Misa', 'Verano', 'Enero y Febrero' FROM nuevo_lugar
UNION ALL
SELECT id, 3, NULL::integer, '20:00'::time, 'Misa', 'Verano', 'Enero y Febrero' FROM nuevo_lugar
UNION ALL
SELECT id, 4, NULL::integer, '20:00'::time, 'Misa', 'Verano', 'Enero y Febrero' FROM nuevo_lugar
UNION ALL
SELECT id, 5, NULL::integer, '20:00'::time, 'Misa', 'Verano', 'Enero y Febrero' FROM nuevo_lugar
UNION ALL
SELECT id, 6, NULL::integer, '20:00'::time, 'Misa', 'Verano', 'Enero y Febrero' FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '09:00'::time, 'Misa', 'Verano', 'Enero y Febrero' FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '21:00'::time, 'Misa', 'Verano', 'Enero y Febrero' FROM nuevo_lugar;

-- Parroquia María Auxiliadora (Guaymallén)
INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas, telefono, email)
VALUES ('Parroquia María Auxiliadora', 'parroquia', 'Guaymallén', 'Severo del Castillo 5047 – Los Corralitos', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography, '+54-261-4820193', 'parroquiamariaauxiliadora@yahoo.com.ar');

-- Parroquia Nuestra Señora de la Consolata (Guaymallén)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas, telefono, email, hay_confesiones, notas_horarios)
  VALUES ('Parroquia Nuestra Señora de la Consolata', 'parroquia', 'Guaymallén', 'Lemos 1564 – San José', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography, '+54-261-445-5343', 'pquia.consolata.mza@gmail.com', true, 'Confesiones: martes y viernes de 17:00 a 19:30 hs.')
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 2, NULL::integer, '19:30'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 4, NULL::integer, '19:30'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 5, NULL::integer, '19:30'::time, 'Misa', 'Todo el año', 'Dato de horario con formato ambiguo en la fuente original, verificar' FROM nuevo_lugar
UNION ALL
SELECT id, 6, NULL::integer, '19:30'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '11:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '20:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar;

-- Parroquia Nuestra Señora del Carmen (Guaymallén)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas, telefono, email, hay_confesiones, notas_horarios)
  VALUES ('Parroquia Nuestra Señora del Carmen', 'parroquia', 'Guaymallén', 'Bandera de los Andes (Carril Nacional)', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography, '+54-261-491-0606', 'delcarmenrodeo@gmail.com', true, 'Confesiones: Miércoles de 17:30 a 19:00 hs.')
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 2, NULL::integer, '08:15'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 3, NULL::integer, '08:15'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 4, NULL::integer, '08:15'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 5, NULL::integer, '08:15'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 6, NULL::integer, '19:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '11:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 6, NULL::integer, '19:00'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '11:00'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar;

-- Parroquia Sagrado Corazón de Jesús (Guaymallén) (Guaymallén)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas, telefono, email, hay_confesiones, notas_horarios)
  VALUES ('Parroquia Sagrado Corazón de Jesús (Guaymallén)', 'parroquia', 'Guaymallén', 'Cadetes Argentinos 7200 (km 11)', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography, '+54-261-491-2149', 'lgianolini@yahoo.com.ar', true, 'Confesiones: 1 hora antes y después de cada misa.')
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 2, NULL::integer, '18:30'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 3, NULL::integer, '18:30'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 4, NULL::integer, '18:30'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 5, NULL::integer, '18:30'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 6, NULL::integer, '19:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '11:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '19:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 1, NULL::integer, '19:00'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 2, NULL::integer, '19:00'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 3, NULL::integer, '19:00'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 4, NULL::integer, '19:00'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 5, NULL::integer, '19:00'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 6, NULL::integer, '20:00'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '11:00'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '20:00'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar;

-- Parroquia San Pablo (Guaymallén)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas, telefono, email)
  VALUES ('Parroquia San Pablo', 'parroquia', 'Guaymallén', 'Bombal 520', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography, '+54-261-431-3899', 'padre-a-ortiz@yahoo.com.ar')
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 3, NULL::integer, '19:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 4, NULL::integer, '19:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '11:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar;

-- Parroquia Santa Ana (Guaymallén)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas, telefono, email, hay_confesiones, notas_horarios)
  VALUES ('Parroquia Santa Ana', 'parroquia', 'Guaymallén', 'Copiapó 2361', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography, '+54-261-421-3235', 'p.santaanagllen@gmail.com', true, 'Confesiones: martes, miércoles y viernes 17:00-19:30 hs. Sábados y domingos media hora antes de cada Misa.')
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 2, NULL::integer, '19:30'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 3, NULL::integer, '19:30'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 4, NULL::integer, '19:30'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 5, NULL::integer, '19:30'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 6, NULL::integer, '19:30'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '11:30'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '19:30'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 6, NULL::integer, '20:00'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '11:00'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '20:00'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar;

-- Parroquia Virgen de Urcupiña (Guaymallén)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas, telefono, hay_confesiones, horario_secretaria, notas_horarios)
  VALUES ('Parroquia Virgen de Urcupiña', 'parroquia', 'Guaymallén', 'Mariano Moreno 3545', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography, '+54-261-421-6024', true, 'Martes y Viernes de 18:00 a 20:00 hs.', 'Confesiones: martes y viernes 17:00-19:00 hs (18:00-20:00 de Diciembre a Febrero). Secretaría: martes y viernes 18:00-20:00 hs. Adoración: jueves 8:00-20:00, domingos 9:00-10:00.')
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 2, NULL::integer, '20:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 4, NULL::integer, '20:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 5, NULL::integer, '20:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '10:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '11:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '10:00'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '20:00'::time, 'Misa', 'Verano', 'En el centro comunitario' FROM nuevo_lugar;

-- Monasterio Ntra. Sra. del Rosario (Guaymallén)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas, telefono)
  VALUES ('Monasterio Ntra. Sra. del Rosario', 'capilla', 'Guaymallén', 'Talcahuano 140', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography, '+54 261 426-5499')
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 1, NULL::integer, '08:15'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 2, NULL::integer, '08:15'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 3, NULL::integer, '08:15'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 4, NULL::integer, '08:15'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 5, NULL::integer, '08:15'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 6, NULL::integer, '08:15'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '12:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar;

-- Capilla Historica (Las Heras)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas, hay_confesiones, notas_horarios)
  VALUES ('Capilla Historica', 'capilla', 'Las Heras', 'Pascual Segura y Zapata', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography, true, 'Confesiones: los Domingos 30 minutos antes de la misa.')
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 0, NULL::integer, '09:30'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar;

-- Capilla María Reina (Las Heras)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas)
  VALUES ('Capilla María Reina', 'capilla', 'Las Heras', 'B° Infanta', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography)
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 0, NULL::integer, '09:30'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar;

-- Capilla Medalla Milagrosa (Las Heras)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas)
  VALUES ('Capilla Medalla Milagrosa', 'capilla', 'Las Heras', 'Guillermo Cano 5242, B° Estación Espejo', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography)
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 0, NULL::integer, '18:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '19:00'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar;

-- Capilla Nuestra Señora de Lourdes (Las Heras)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas, notas_horarios)
  VALUES ('Capilla Nuestra Señora de Lourdes', 'capilla', 'Las Heras', 'Esq. Cabildo Abierto y Mosconi', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography, 'Depende de la vicaría de Fátima, que está en El Algarrobal.')
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 6, NULL::integer, '19:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar;

-- Capilla San Martín de Porres (Las Heras)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas, hay_confesiones, notas_horarios)
  VALUES ('Capilla San Martín de Porres', 'capilla', 'Las Heras', 'San Rafael Esquina Neuquén', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography, true, 'Confesiones: 30 minutos antes de Misa. Pertenece a la Parroquia Divino Maestro.')
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 0, NULL::integer, '11:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar;

-- Capilla San Pantaleón (Las Heras)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas)
  VALUES ('Capilla San Pantaleón', 'capilla', 'Las Heras', 'Mza 13 Casa 20, Videla', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography)
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 2, NULL::integer, '18:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 6, NULL::integer, '19:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar;

-- Capilla San Roque (Las Heras)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas)
  VALUES ('Capilla San Roque', 'capilla', 'Las Heras', 'Río Negro y 9 de Julio', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography)
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 0, NULL::integer, '11:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar;

-- Capilla Santa Rosa de Lima (Las Heras)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas, email, notas_horarios)
  VALUES ('Capilla Santa Rosa de Lima', 'capilla', 'Las Heras', 'Barrio Santa Rosa, Manzana K', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography, 'santarosadelimacapilla@gmail.com', 'Adoración al Santísimo: Domingo de 10:00 a 11:00 hs.')
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 0, NULL::integer, '11:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar;

-- Oratorio Ceferino Namuncurá – Don Bosco (Las Heras)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas, telefono, email, hay_confesiones, notas_horarios)
  VALUES ('Oratorio Ceferino Namuncurá – Don Bosco', 'capilla', 'Las Heras', 'San Miguel 500', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography, '+54-261-430-9931', 'lasherasencargado@salesianos.org.ar', true, 'Confesiones: media hora antes de la misa. Adoración Eucarística: 1er viernes a las 18:00 hs (excepto enero y febrero).')
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 6, NULL::integer, '18:30'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '18:30'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, NULL::integer, 26, '19:00'::time, 'Misa', 'Todo el año', 'Si el día 26 cae fin de semana, ver aviso parroquial' FROM nuevo_lugar
UNION ALL
SELECT id, 5, NULL::integer, '19:00'::time, 'Misa', 'Todo el año', '1er viernes de cada mes' FROM nuevo_lugar;

-- Parroquia Divino Maestro (Las Heras)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas, telefono, hay_confesiones, horario_secretaria, notas_horarios)
  VALUES ('Parroquia Divino Maestro', 'parroquia', 'Las Heras', 'Las Glicinas esq Las Magnolias', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography, '+54-261-437-1083', true, 'Sábados de 17:00 a 19:30 hs.', 'Confesiones: 30 minutos antes de cada Misa. Adoración al Santísimo: Jueves 19:00 hs.')
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 2, NULL::integer, '18:30'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 3, NULL::integer, '18:30'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 4, NULL::integer, '18:30'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 5, NULL::integer, '18:30'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 6, NULL::integer, '19:30'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '19:30'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 2, NULL::integer, '19:00'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 3, NULL::integer, '19:00'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 4, NULL::integer, '19:00'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 5, NULL::integer, '19:00'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 6, NULL::integer, '20:00'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '20:00'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar;

-- Parroquia Nuestra Señora de la Misericordia (Las Heras)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas, telefono)
  VALUES ('Parroquia Nuestra Señora de la Misericordia', 'parroquia', 'Las Heras', 'Chacabuco 2674', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography, '+54-261-448-9773')
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 1, NULL::integer, '19:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 2, NULL::integer, '19:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 3, NULL::integer, '19:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 4, NULL::integer, '19:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 5, NULL::integer, '19:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 6, NULL::integer, '19:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '09:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '11:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '19:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 1, NULL::integer, '20:00'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 2, NULL::integer, '20:00'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 3, NULL::integer, '20:00'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 4, NULL::integer, '20:00'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 5, NULL::integer, '20:00'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 6, NULL::integer, '20:00'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '09:00'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '11:00'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '20:00'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar;

-- Parroquia San Antonio de Padua (Las Heras)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas, telefono, email, horario_secretaria, notas_horarios)
  VALUES ('Parroquia San Antonio de Padua', 'parroquia', 'Las Heras', 'Bariloche 2448, Barrio Jardín Municipal', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography, '+54-263-415-3612', 'parroquia.sanantoniomza@gmail.com', 'Martes a Viernes de 17:00 a 20:00 hs. Sábados de 9:00 a 13:00 hs.', 'Adoración Perpetua: todos los días de 6:25 a 23:25 hs.')
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 0, NULL::integer, '20:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '11:00'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar;

-- Parroquia San Miguel Arcángel (Las Heras)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas, telefono, email, horario_secretaria)
  VALUES ('Parroquia San Miguel Arcángel', 'parroquia', 'Las Heras', 'San Miguel 1580', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography, '+54-261-430-7916', 'mmdb@infovia.com.ar', 'Martes, Jueves y Sábados de 9:00 a 12:00 hs. Martes a Viernes de 16:30 a 20:00 hs. (Lunes no se atiende).')
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 2, NULL::integer, '19:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 3, NULL::integer, '19:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 4, NULL::integer, '19:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 5, NULL::integer, '19:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 6, NULL::integer, '19:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '09:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '11:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '19:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 2, NULL::integer, '20:00'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 3, NULL::integer, '20:00'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 4, NULL::integer, '20:00'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 5, NULL::integer, '20:00'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 6, NULL::integer, '20:00'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '09:00'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '11:00'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '20:00'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar;

-- Parroquia Santa Cruz (Las Heras)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas, telefono, email, hay_confesiones, horario_secretaria, notas_horarios)
  VALUES ('Parroquia Santa Cruz', 'parroquia', 'Las Heras', 'Olascoaga 750', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography, '+54-261-430-6710', 'santacruz.mendoza.ar@gmail.com', true, 'Martes y Viernes de 16:00 a 19:00 hs.', 'Confesiones: Viernes de 9:30 a 12:30, de 16:00 a 17:45 y de 19:00 a 21:00 hs.')
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 2, NULL::integer, '18:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 3, NULL::integer, '18:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 4, NULL::integer, '18:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 5, NULL::integer, '18:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 6, NULL::integer, '19:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '10:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '19:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 2, NULL::integer, '20:00'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 3, NULL::integer, '20:00'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 4, NULL::integer, '20:00'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 5, NULL::integer, '20:00'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 6, NULL::integer, '20:00'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '10:00'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '20:00'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar;

-- Capilla Nuestra Señora de la Merced (Las Heras)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas, hay_confesiones, notas_horarios)
  VALUES ('Capilla Nuestra Señora de la Merced', 'capilla', 'Las Heras', 'Siria S/N', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography, true, 'Confesiones: los Domingos 30 minutos antes de las misas.')
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 0, NULL::integer, '11:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '12:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar;

-- Capilla Divina Misericordia (Maipú)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas)
  VALUES ('Capilla Divina Misericordia', 'capilla', 'Maipú', 'J. B. Martínez y Luccini', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography)
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 6, NULL::integer, '18:30'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar;

-- Capilla Virgen de Lourdes (Maipú)
INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas, notas_horarios)
VALUES ('Capilla Virgen de Lourdes', 'capilla', 'Maipú', 'Virgen de Lourdes 95, Luzuriaga', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography, 'Adoración al Santísimo: Jueves de 8:30 a 12:30 hs.');

-- Iglesia Salón Usos Múltiples Bo Cóndor y Andes, Centro Cultural No. 30 (Maipú)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas)
  VALUES ('Iglesia Salón Usos Múltiples Bo Cóndor y Andes, Centro Cultural No. 30', 'capilla', 'Maipú', 'Los Artesanos 1200', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography)
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 6, NULL::integer, '11:30'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar;

-- Parroquia del Sagrado Corazón de Jesús (Maipú)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas, telefono, horario_secretaria, notas_horarios)
  VALUES ('Parroquia del Sagrado Corazón de Jesús', 'parroquia', 'Maipú', 'Videla Aranda s/n – Tres esquinas (Cruz de Piedra)', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography, '+54-261-499-0121', 'Martes, Miércoles y Jueves de 17:30 a 19:30 hs.', 'Adoración al Santísimo: Viernes de 17:00 a 20:00 hs.')
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 2, NULL::integer, '17:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 4, NULL::integer, '17:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 6, NULL::integer, '17:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '10:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar;

-- Parroquia Nuestra Señora de la Candelaria (Maipú)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas, telefono, email, hay_confesiones, horario_secretaria, notas_horarios)
  VALUES ('Parroquia Nuestra Señora de la Candelaria', 'parroquia', 'Maipú', 'Padre Vazquez y Pte Perón', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography, '+54-261-497-2487', 'ldpadremiguel@yahoo.com.ar', true, 'Lunes a Viernes de 9:00 a 12:30 hs y de 16:00 a 20:00 hs.', 'Confesiones: jueves 17:30-19:00, viernes 17:00-19:00, domingo 20:00 (durante la Misa). Canal de YouTube disponible.')
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 1, NULL::integer, '19:00'::time, 'Celebración de la Palabra', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 3, NULL::integer, '19:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 4, NULL::integer, '19:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 5, NULL::integer, '19:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 6, NULL::integer, '20:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '11:30'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '20:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '20:30'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar;

-- Parroquia Nuestra Señora de La Merced (Maipú)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas, telefono)
  VALUES ('Parroquia Nuestra Señora de La Merced', 'parroquia', 'Maipú', 'Padre Vázquez 158', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography, '+54-261-497-2107')
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 1, NULL::integer, '19:30'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 2, NULL::integer, '19:30'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 3, NULL::integer, '19:30'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 4, NULL::integer, '19:30'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 5, NULL::integer, '19:30'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 6, NULL::integer, '09:30'::time, 'Misa', 'Invierno', '1er sábado de cada mes' FROM nuevo_lugar
UNION ALL
SELECT id, 6, NULL::integer, '19:30'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '09:30'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '11:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '19:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 2, NULL::integer, '19:30'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 3, NULL::integer, '19:30'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 4, NULL::integer, '19:30'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 5, NULL::integer, '19:30'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 6, NULL::integer, '09:00'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 6, NULL::integer, '20:00'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '09:00'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '10:30'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '20:00'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar;

-- Parroquia Nuestra Señora del Tránsito (Maipú)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas, notas_horarios)
  VALUES ('Parroquia Nuestra Señora del Tránsito', 'parroquia', 'Maipú', 'F. Villanueva y Maza (Lunlunta)', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography, 'Dependiente de Parroquia Sagrado Corazón de Jesús.')
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 0, NULL::integer, '11:30'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar;

-- Parroquia San José Obrero (Maipú)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas, telefono, hay_confesiones, notas_horarios)
  VALUES ('Parroquia San José Obrero', 'parroquia', 'Maipú', 'López y Planes 247', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography, '+54 9 261 714-1812', true, 'Confesiones: 60 minutos antes del comienzo de cada Misa.')
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 2, NULL::integer, '20:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 3, NULL::integer, '20:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 4, NULL::integer, '20:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 5, NULL::integer, '20:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 6, NULL::integer, '20:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '11:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '21:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar;

-- Santuario de María Auxiliadora (Maipú)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas, telefono)
  VALUES ('Santuario de María Auxiliadora', 'santuario', 'Maipú', 'RP50 5268, Rodeo del Medio', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography, '+54 261 495-1084')
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 2, NULL::integer, '20:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 3, NULL::integer, '20:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 4, NULL::integer, '20:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 5, NULL::integer, '20:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 6, NULL::integer, '20:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '11:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '20:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar;

-- Capilla de la Santísima Virgen del Rosario de San Nicolás (Luján de Cuyo)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas)
  VALUES ('Capilla de la Santísima Virgen del Rosario de San Nicolás', 'capilla', 'Luján de Cuyo', 'Calle La Unión, Barrio Santa Elena', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography)
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 6, NULL::integer, '16:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 6, NULL::integer, '17:00'::time, 'Misa', 'Verano', 'Octubre a Marzo' FROM nuevo_lugar;

-- Capilla María Auxiliadora (Luján de Cuyo)
INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas)
VALUES ('Capilla María Auxiliadora', 'capilla', 'Luján de Cuyo', 'J. L. Borges s/n, Perdriel', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography);

-- Capilla Nuestra Señora de la Merced (Luján de Cuyo)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas, email)
  VALUES ('Capilla Nuestra Señora de la Merced', 'capilla', 'Luján de Cuyo', 'Piedras y Viamonte', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography, 'ps.perpetuosocorro@gmail.com')
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 0, NULL::integer, '10:00'::time, 'Misa', 'Todo el año', 'Excepto en Enero' FROM nuevo_lugar;

-- Capilla Santa Cecilia (Luján de Cuyo)
INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas)
VALUES ('Capilla Santa Cecilia', 'capilla', 'Luján de Cuyo', 'Terrada 2485, Perdriel', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography);

-- Capilla Santa Inés (Luján de Cuyo)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas, telefono, notas_horarios)
  VALUES ('Capilla Santa Inés', 'capilla', 'Luján de Cuyo', 'Libertad 1115', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography, '+54-261-498-0309', 'Via Crucis: Viernes 18:00 hs. Rezo del Rosario: 18:10 hs.')
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 6, NULL::integer, '19:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar;

-- Capilla Santa Lucía (Luján de Cuyo)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas)
  VALUES ('Capilla Santa Lucía', 'capilla', 'Luján de Cuyo', 'Viedma 401', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography)
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 6, NULL::integer, '18:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar;

-- Parroquia San José de la Montaña (Luján de Cuyo)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas, hay_confesiones, notas_horarios)
  VALUES ('Parroquia San José de la Montaña', 'parroquia', 'Luján de Cuyo', 'Valle del Sol', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography, true, 'Confesiones: media hora antes de cada misa.')
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 6, NULL::integer, '19:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '11:00'::time, 'Misa', 'Invierno', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 6, NULL::integer, '19:00'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '11:00'::time, 'Misa', 'Verano', NULL FROM nuevo_lugar;

-- Nuestra Señora de la Carrodilla (Luján de Cuyo)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas, telefono, hay_confesiones, notas_horarios)
  VALUES ('Nuestra Señora de la Carrodilla', 'capilla', 'Luján de Cuyo', 'Carrodilla 11, La Carrodilla', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography, '+54 261 436-1667', true, 'Confesiones: miércoles 10:30-12:00 y 17:00-18:30 hs; viernes 10:30-12:00 y 18:00-19:00 hs.')
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 1, NULL::integer, '19:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 2, NULL::integer, '08:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 3, NULL::integer, '08:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 4, NULL::integer, '08:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 5, NULL::integer, '19:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 6, NULL::integer, '08:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 6, NULL::integer, '19:30'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '08:30'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '11:30'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '20:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar;

-- Nuestra Señora del Perpetuo Socorro (Luján de Cuyo)
WITH nuevo_lugar AS (
  INSERT INTO lugares (nombre, tipo, departamento, direccion, coordenadas, telefono, notas_horarios)
  VALUES ('Nuestra Señora del Perpetuo Socorro', 'capilla', 'Luján de Cuyo', 'Mazzolari 1, Chacras de Coria', ST_SetSRID(ST_MakePoint(-68.8272, -32.8908), 4326)::geography, '+54 261 496-0258', 'Confesiones: consultar por teléfono con la iglesia.')
  RETURNING id
)
INSERT INTO horarios (lugar_id, dia_semana, dia_mes, hora, tipo_actividad, temporada, observacion)
SELECT id, 2, NULL::integer, '20:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 3, NULL::integer, '20:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 4, NULL::integer, '08:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 5, NULL::integer, '20:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 6, NULL::integer, '20:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '11:30'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar
UNION ALL
SELECT id, 0, NULL::integer, '20:00'::time, 'Misa', 'Todo el año', NULL FROM nuevo_lugar;
