-- Script para verificar horarios de sábados
-- Ejecutar en MySQL Workbench o cualquier cliente MySQL

-- Verificar citas existentes en sábados
SELECT 
    id,
    fecha_hora,
    TIME(fecha_hora) as hora,
    DAYOFWEEK(fecha_hora) as dia_semana,
    CASE 
        WHEN DAYOFWEEK(fecha_hora) = 7 THEN 'SÁBADO'
        ELSE 'OTRO DÍA'
    END as tipo_dia
FROM cita 
WHERE DAYOFWEEK(fecha_hora) = 7  -- 7 = Sábado
  AND estado != 'cancelada'
ORDER BY fecha_hora;

-- Verificar citas en sábados después de las 14:15
SELECT 
    id,
    fecha_hora,
    TIME(fecha_hora) as hora,
    estado
FROM cita 
WHERE DAYOFWEEK(fecha_hora) = 7  -- 7 = Sábado
  AND TIME(fecha_hora) >= '14:15:00'
  AND estado != 'cancelada'
ORDER BY fecha_hora;

-- Contar citas por hora en sábados
SELECT 
    TIME(fecha_hora) as hora,
    COUNT(*) as total_citas,
    COUNT(CASE WHEN estado = 'confirmada' THEN 1 END) as confirmadas,
    COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as pendientes,
    COUNT(CASE WHEN estado = 'completada' THEN 1 END) as completadas
FROM cita 
WHERE DAYOFWEEK(fecha_hora) = 7  -- 7 = Sábado
  AND estado != 'cancelada'
GROUP BY TIME(fecha_hora)
ORDER BY hora;

-- Verificar si hay citas en el nuevo horario (14:15 - 15:00)
SELECT 
    id,
    fecha_hora,
    TIME(fecha_hora) as hora,
    estado,
    CASE 
        WHEN TIME(fecha_hora) = '14:15:00' THEN 'NUEVO HORARIO - 14:15'
        WHEN TIME(fecha_hora) = '15:00:00' THEN 'NUEVO HORARIO - 15:00'
        ELSE 'OTRO HORARIO'
    END as tipo_horario
FROM cita 
WHERE DAYOFWEEK(fecha_hora) = 7  -- 7 = Sábado
  AND TIME(fecha_hora) IN ('14:15:00', '15:00:00')
  AND estado != 'cancelada'
ORDER BY fecha_hora; 