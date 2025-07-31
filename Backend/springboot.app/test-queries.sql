-- Script de prueba para verificar que las consultas funcionan
USE EsentialBarber;

-- Verificar que las tablas existen
SELECT 'Verificando tablas:' AS message;
SHOW TABLES;

-- Verificar índices existentes
SELECT 'Verificando índices en usuario:' AS message;
SHOW INDEX FROM usuario;

SELECT 'Verificando índices en cita:' AS message;
SHOW INDEX FROM cita;

SELECT 'Verificando índices en servicio:' AS message;
SHOW INDEX FROM servicio;

-- Probar consultas básicas
SELECT 'Probando consultas básicas:' AS message;

-- Consulta de usuarios
SELECT COUNT(*) as total_usuarios FROM usuario;

-- Consulta de citas
SELECT COUNT(*) as total_citas FROM cita;

-- Consulta de servicios
SELECT COUNT(*) as total_servicios FROM servicio;

-- Consulta con JOIN
SELECT 
    c.id as cita_id,
    c.fechaHora,
    c.estado,
    u.nombre as cliente_nombre,
    s.nombre as servicio_nombre
FROM cita c
JOIN usuario u ON c.cliente_id = u.id
JOIN servicio s ON c.servicio_id = s.id
LIMIT 5;

SELECT 'Pruebas completadas!' AS message; 