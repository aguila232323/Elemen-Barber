-- Corregir el tipo de dato LONGTEXT a TEXT en PostgreSQL
-- Este script corrige el problema de compatibilidad con PostgreSQL

-- Verificar si la columna existe y cambiar su tipo
DO $$
BEGIN
    -- Verificar si la tabla portfolio existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'portfolio') THEN
        -- Verificar si la columna imagen_base64 existe y es de tipo LONGTEXT
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'portfolio' 
            AND column_name = 'imagen_base64' 
            AND data_type = 'text'
        ) THEN
            -- La columna ya es de tipo TEXT, no hacer nada
            RAISE NOTICE 'La columna imagen_base64 ya es de tipo TEXT';
        ELSE
            -- Cambiar el tipo de dato a TEXT
            ALTER TABLE portfolio ALTER COLUMN imagen_base64 TYPE TEXT;
            RAISE NOTICE 'Columna imagen_base64 cambiada a tipo TEXT';
        END IF;
    ELSE
        RAISE NOTICE 'La tabla portfolio no existe aún';
    END IF;
END $$;
