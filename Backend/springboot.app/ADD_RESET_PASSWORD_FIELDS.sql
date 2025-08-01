-- Agregar campos para recuperación de contraseña
-- Ejecutar este script en la base de datos para agregar los campos necesarios

-- Agregar columna para token de recuperación de contraseña
ALTER TABLE usuario ADD COLUMN reset_password_token VARCHAR(255) NULL;

-- Agregar columna para fecha de expiración del token de recuperación
ALTER TABLE usuario ADD COLUMN reset_password_expiry TIMESTAMP NULL;

-- Crear índice para mejorar el rendimiento de búsquedas por token
CREATE INDEX idx_reset_password_token ON usuario(reset_password_token);

-- Verificar que las columnas se agregaron correctamente
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'usuario' 
AND column_name IN ('reset_password_token', 'reset_password_expiry'); 