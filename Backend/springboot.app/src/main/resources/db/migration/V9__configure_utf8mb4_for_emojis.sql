-- Configurar UTF8MB4 para soportar emojis en la tabla usuario
ALTER TABLE usuario CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Cambiar específicamente el campo avatar para asegurar que soporte emojis
ALTER TABLE usuario MODIFY COLUMN avatar VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- También cambiar otros campos de texto que podrían contener emojis
ALTER TABLE usuario MODIFY COLUMN nombre VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE usuario MODIFY COLUMN email VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE usuario MODIFY COLUMN telefono VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE usuario MODIFY COLUMN password VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE usuario MODIFY COLUMN rol VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE usuario MODIFY COLUMN verification_code VARCHAR(6) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE usuario MODIFY COLUMN reset_password_token VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE usuario MODIFY COLUMN google_picture_url VARCHAR(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; 