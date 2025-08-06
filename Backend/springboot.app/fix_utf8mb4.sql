-- Script para configurar UTF8MB4 en la base de datos
-- Ejecutar este script manualmente si las migraciones no funcionan

-- Configurar la base de datos para usar UTF8MB4
ALTER DATABASE EsentialBarber CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Configurar la tabla usuario para usar UTF8MB4
ALTER TABLE usuario CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Cambiar específicamente el campo avatar
ALTER TABLE usuario MODIFY COLUMN avatar VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Verificar la configuración
SHOW TABLE STATUS WHERE Name = 'usuario';
SHOW CREATE TABLE usuario; 