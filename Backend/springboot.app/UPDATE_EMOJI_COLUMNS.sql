-- Script para actualizar las columnas para soportar emojis
-- Ejecuta este script en tu base de datos MySQL

USE EsentialBarber;

-- Verificar la configuración actual de la base de datos
SHOW VARIABLES LIKE 'character_set_database';
SHOW VARIABLES LIKE 'collation_database';

-- Actualizar la columna emoji para soportar utf8mb4
ALTER TABLE servicio MODIFY COLUMN emoji VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Actualizar la columna texto_descriptivo para soportar utf8mb4
ALTER TABLE servicio MODIFY COLUMN texto_descriptivo VARCHAR(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Verificar que los cambios se aplicaron correctamente
SHOW CREATE TABLE servicio; 