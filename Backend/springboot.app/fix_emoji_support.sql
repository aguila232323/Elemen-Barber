-- Script para habilitar soporte de emojis en MySQL
-- Ejecutar este script en MySQL Workbench o línea de comandos

-- Configurar la base de datos
ALTER DATABASE EsentialBarber CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Configurar la tabla usuario
ALTER TABLE usuario CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Verificar que funciona insertando un emoji de prueba
-- UPDATE usuario SET avatar = '👨‍💼' WHERE id = 1 LIMIT 1; 