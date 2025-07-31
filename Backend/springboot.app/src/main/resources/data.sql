-- Configuración inicial del tiempo mínimo de reserva (24 horas por defecto)
INSERT INTO configuracion (clave, valor, descripcion) 
VALUES ('tiempo_minimo_reserva', '24', 'Tiempo mínimo en horas para reservar una cita')
ON DUPLICATE KEY UPDATE valor = VALUES(valor); 