-- Script para actualizar la base de datos con campos de verificación
-- Ejecutar este script si la migración automática no funciona

-- Verificar si las columnas ya existen
SELECT COUNT(*) FROM information_schema.columns 
WHERE table_name = 'usuario' AND column_name = 'verification_attempts';

-- Agregar columna verification_attempts si no existe
ALTER TABLE usuario 
ADD COLUMN IF NOT EXISTS verification_attempts INT DEFAULT 0 NOT NULL;

-- Agregar columna lockout_until si no existe
ALTER TABLE usuario 
ADD COLUMN IF NOT EXISTS lockout_until TIMESTAMP NULL;

-- Verificar que las columnas se agregaron correctamente
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'usuario' 
AND column_name IN ('verification_attempts', 'lockout_until'); 