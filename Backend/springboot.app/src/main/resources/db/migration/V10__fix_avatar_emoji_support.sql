-- Migración para solucionar definitivamente el error de emojis en avatar
-- Esta migración asegura que el campo avatar tenga la configuración correcta

-- Verificar y corregir la configuración del campo avatar
ALTER TABLE usuario MODIFY COLUMN avatar VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Asegurar que la tabla completa tenga la configuración correcta
ALTER TABLE usuario CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Verificar que otros campos críticos también tengan la configuración correcta
ALTER TABLE usuario MODIFY COLUMN nombre VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE usuario MODIFY COLUMN email VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE usuario MODIFY COLUMN telefono VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE usuario MODIFY COLUMN password VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE usuario MODIFY COLUMN rol VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE usuario MODIFY COLUMN verification_code VARCHAR(6) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE usuario MODIFY COLUMN reset_password_token VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE usuario MODIFY COLUMN google_picture_url VARCHAR(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; 