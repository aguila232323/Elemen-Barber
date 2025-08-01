-- Script para eliminar la columna confirmada de la tabla cita
-- Ejecutar este script si la migración automática no funciona

-- Verificar si la columna existe
SELECT COUNT(*) FROM information_schema.columns 
WHERE table_name = 'cita' AND column_name = 'confirmada';

-- Eliminar columna confirmada si existe
ALTER TABLE cita DROP COLUMN IF EXISTS confirmada;

-- Verificar que la columna se eliminó correctamente
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'cita' 
AND column_name = 'confirmada';

-- Mostrar las columnas restantes de la tabla cita
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'cita' 
ORDER BY ordinal_position; 