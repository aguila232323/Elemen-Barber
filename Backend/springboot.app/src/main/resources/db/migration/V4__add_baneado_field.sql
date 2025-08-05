-- Añadir campo baneado a la tabla usuario
ALTER TABLE usuario ADD COLUMN baneado BOOLEAN NOT NULL DEFAULT FALSE; 