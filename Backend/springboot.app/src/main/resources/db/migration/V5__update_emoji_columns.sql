-- Actualizar columnas para soportar emojis (utf8mb4)
-- Configurar la tabla para usar utf8mb4
ALTER TABLE servicio CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Actualizar las columnas específicas
ALTER TABLE servicio MODIFY COLUMN emoji VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE servicio MODIFY COLUMN texto_descriptivo VARCHAR(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; 