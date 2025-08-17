-- Migración para cambiar portfolio de Base64 a URLs
-- Paso 1: Agregar nueva columna
ALTER TABLE portfolio ADD COLUMN imagen_url VARCHAR(500);

-- Paso 2: Actualizar registros existentes (ejemplo)
-- UPDATE portfolio SET imagen_url = '/images/portfolio/foto1.jpg' WHERE id = 1;
-- UPDATE portfolio SET imagen_url = '/images/portfolio/foto2.jpg' WHERE id = 2;

-- Paso 3: Eliminar columna antigua (después de verificar que todo funciona)
-- ALTER TABLE portfolio DROP COLUMN imagen_base64;
