-- Configurar la base de datos completa para soportar emojis
-- Esta migración configura toda la base de datos para utf8mb4

-- Configurar la base de datos
ALTER DATABASE EsentialBarber CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Configurar todas las tablas existentes
ALTER TABLE usuario CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE servicio CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE cita CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE configuracion CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE resena CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE vacaciones CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Configurar campos específicos que contienen emojis
ALTER TABLE servicio MODIFY COLUMN emoji VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE servicio MODIFY COLUMN texto_descriptivo VARCHAR(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE servicio MODIFY COLUMN nombre VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE servicio MODIFY COLUMN descripcion TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Configurar campos de reseñas
ALTER TABLE resena MODIFY COLUMN comentario TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE resena MODIFY COLUMN nombre_cliente VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; 