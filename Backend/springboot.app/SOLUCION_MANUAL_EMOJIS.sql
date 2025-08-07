-- SOLUCIÓN MANUAL PARA EL ERROR DE EMOJIS
-- Ejecuta este script en MySQL Workbench o cualquier cliente MySQL

-- 1. Configurar la base de datos
ALTER DATABASE EsentialBarber CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 2. Configurar la tabla usuario
ALTER TABLE usuario CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 3. Configurar específicamente el campo avatar
ALTER TABLE usuario MODIFY COLUMN avatar VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 4. Verificar que funciona (opcional - descomentar para probar)
-- UPDATE usuario SET avatar = '👨‍💼' WHERE id = 1 LIMIT 1;

-- 5. Verificar la configuración
SHOW VARIABLES LIKE 'character_set_database';
SHOW VARIABLES LIKE 'collation_database';
SHOW CREATE TABLE usuario; 