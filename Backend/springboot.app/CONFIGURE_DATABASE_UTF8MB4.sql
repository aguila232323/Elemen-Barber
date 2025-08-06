-- Script para configurar la base de datos para soportar emojis
-- Ejecuta este script en tu base de datos MySQL

-- Configurar la base de datos para usar utf8mb4
ALTER DATABASE EsentialBarber CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Verificar la configuración
SHOW VARIABLES LIKE 'character_set_database';
SHOW VARIABLES LIKE 'collation_database';

-- Configurar la tabla servicio
ALTER TABLE servicio CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Actualizar las columnas específicas
ALTER TABLE servicio MODIFY COLUMN emoji VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE servicio MODIFY COLUMN texto_descriptivo VARCHAR(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Verificar la estructura de la tabla
SHOW CREATE TABLE servicio; 