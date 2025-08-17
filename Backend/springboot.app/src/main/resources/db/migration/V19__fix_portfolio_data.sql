-- Migración para limpiar portfolio y preparar para nuevas imágenes
-- Paso 1: Asegurar que la columna imagen_url existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'portfolio' AND column_name = 'imagen_url') THEN
        ALTER TABLE portfolio ADD COLUMN imagen_url VARCHAR(500);
    END IF;
END $$;

-- Paso 2: Limpiar todos los datos existentes
DELETE FROM portfolio;

-- Paso 3: Resetear el auto-increment del ID (opcional)
-- ALTER SEQUENCE portfolio_id_seq RESTART WITH 1;
