-- Eliminar columna confirmada de la tabla cita
-- El estado de confirmación se maneja a través del campo 'estado'
ALTER TABLE cita DROP COLUMN IF EXISTS confirmada; 