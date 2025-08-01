-- Eliminar el campo confirmada de la tabla cita
-- Este campo es redundante ya que el estado de la cita se maneja con el campo 'estado'

-- Verificar si la columna existe antes de eliminarla
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM information_schema.columns 
     WHERE table_schema = 'EsentialBarber' 
     AND table_name = 'cita' 
     AND column_name = 'confirmada') > 0,
    'ALTER TABLE cita DROP COLUMN confirmada',
    'SELECT "La columna confirmada no existe en la tabla cita" AS mensaje'
));

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar que la columna se eliminó correctamente
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ Columna confirmada eliminada exitosamente'
        ELSE '❌ La columna confirmada aún existe'
    END AS resultado
FROM information_schema.columns 
WHERE table_schema = 'EsentialBarber' 
AND table_name = 'cita' 
AND column_name = 'confirmada'; 