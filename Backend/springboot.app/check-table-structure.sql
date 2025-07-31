-- Verificar estructura de las tablas
USE EsentialBarber;

-- Verificar estructura de la tabla cita
DESCRIBE cita;

-- Verificar estructura de la tabla usuario
DESCRIBE usuario;

-- Verificar estructura de la tabla servicio
DESCRIBE servicio;

-- Verificar datos existentes
SELECT 'Datos en usuario:' AS message;
SELECT COUNT(*) as total FROM usuario;

SELECT 'Datos en cita:' AS message;
SELECT COUNT(*) as total FROM cita;

SELECT 'Datos en servicio:' AS message;
SELECT COUNT(*) as total FROM servicio; 