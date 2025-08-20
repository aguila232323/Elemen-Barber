-- Migración segura para cambiar portfolio de Base64 a URLs
-- Paso 1: Agregar nueva columna solo si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'portfolio' AND column_name = 'imagen_url') THEN
        ALTER TABLE portfolio ADD COLUMN imagen_url VARCHAR(500);
    END IF;
END $$;

-- Paso 2: Limpiar datos existentes de Base64 (opcional - comentado por seguridad)
-- UPDATE portfolio SET imagen_base64 = NULL WHERE imagen_base64 IS NOT NULL;

-- Paso 3: Eliminar columna antigua (comentado hasta verificar que todo funciona)
-- ALTER TABLE portfolio DROP COLUMN IF EXISTS imagen_base64;
