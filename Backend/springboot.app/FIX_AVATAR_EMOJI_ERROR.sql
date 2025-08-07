-- Script completo para solucionar el error de emojis en el campo avatar
-- Ejecutar este script en MySQL Workbench o línea de comandos

-- 1. Configurar la base de datos completa para utf8mb4
ALTER DATABASE EsentialBarber CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 2. Configurar todas las tablas para utf8mb4
ALTER TABLE usuario CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE servicio CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE cita CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE configuracion CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE resena CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE vacaciones CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 3. Configurar específicamente el campo avatar con la configuración correcta
ALTER TABLE usuario MODIFY COLUMN avatar VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 4. Configurar otros campos de texto que podrían contener emojis
ALTER TABLE usuario MODIFY COLUMN nombre VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE usuario MODIFY COLUMN email VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE usuario MODIFY COLUMN telefono VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE usuario MODIFY COLUMN password VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE usuario MODIFY COLUMN rol VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE usuario MODIFY COLUMN verification_code VARCHAR(6) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE usuario MODIFY COLUMN reset_password_token VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE usuario MODIFY COLUMN google_picture_url VARCHAR(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 5. Configurar campos de servicio que contienen emojis
ALTER TABLE servicio MODIFY COLUMN emoji VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE servicio MODIFY COLUMN texto_descriptivo VARCHAR(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE servicio MODIFY COLUMN nombre VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE servicio MODIFY COLUMN descripcion TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 6. Configurar campos de reseñas que podrían contener emojis
ALTER TABLE resena MODIFY COLUMN comentario TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE resena MODIFY COLUMN nombre_cliente VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 7. Verificar la configuración
SHOW VARIABLES LIKE 'character_set_database';
SHOW VARIABLES LIKE 'collation_database';
SHOW CREATE TABLE usuario;
SHOW CREATE TABLE servicio;

-- 8. Probar inserción de emoji (opcional - descomentar para probar)
-- UPDATE usuario SET avatar = '👨‍💼' WHERE id = 1 LIMIT 1; 