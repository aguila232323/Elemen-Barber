-- Script para agregar campos de emoji y texto descriptivo a la tabla servicio
-- Ejecutar este script en la base de datos para actualizar la estructura

ALTER TABLE servicio 
ADD COLUMN emoji VARCHAR(10) NULL,
ADD COLUMN texto_descriptivo VARCHAR(200) NULL;

-- Comentarios sobre las nuevas columnas
COMMENT ON COLUMN servicio.emoji IS 'Emoji para mostrar junto al servicio en citas y pantalla de inicio';
COMMENT ON COLUMN servicio.texto_descriptivo IS 'Texto descriptivo para mostrar en la pantalla de inicio';

-- Actualizar servicios existentes con emojis y texto descriptivo originales
UPDATE servicio SET emoji = '✂️' WHERE nombre LIKE '%corte%' OR nombre LIKE '%Corte%';
UPDATE servicio SET emoji = '🧴' WHERE nombre LIKE '%tinte%' OR nombre LIKE '%Tinte%';
UPDATE servicio SET emoji = '✨' WHERE nombre LIKE '%mecha%' OR nombre LIKE '%Mecha%';
UPDATE servicio SET emoji = '💇' WHERE emoji IS NULL;

-- Actualizar servicios existentes con texto descriptivo original
UPDATE servicio SET texto_descriptivo = 'Corte de pelo profesional adaptado a tu estilo. Asesoría personalizada, técnicas modernas y acabado impecable para que siempre luzcas tu mejor versión.' WHERE nombre LIKE '%corte%' OR nombre LIKE '%Corte%';

UPDATE servicio SET texto_descriptivo = 'Coloración y matiz para un look renovado. Trabajamos con productos de alta calidad para cuidar tu cabello y lograr el tono perfecto que buscas.' WHERE nombre LIKE '%tinte%' OR nombre LIKE '%Tinte%';

UPDATE servicio SET texto_descriptivo = 'Mechas y coloración profesional para dar vida a tu cabello. Técnicas modernas de mechado que resaltan tu personalidad y estilo único.' WHERE nombre LIKE '%mecha%' OR nombre LIKE '%Mecha%';

-- Para otros servicios, usar descripción genérica
UPDATE servicio SET texto_descriptivo = 'Servicio profesional de ' || LOWER(nombre) || ' con técnicas modernas y acabado impecable.' WHERE texto_descriptivo IS NULL; 