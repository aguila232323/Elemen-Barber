-- Añadir campo color_google_calendar a la tabla servicio
ALTER TABLE servicio ADD COLUMN color_google_calendar VARCHAR(7) DEFAULT '#4285F4';

-- Actualizar colores por defecto para servicios existentes
UPDATE servicio SET color_google_calendar = '#4285F4' WHERE color_google_calendar IS NULL; 