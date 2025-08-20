-- ========================================
-- SCRIPT PARA APLICAR ÍNDICES DE PERFORMANCE
-- ========================================
-- Ejecutar este script en tu base de datos PostgreSQL para optimizar consultas

-- Verificar que estamos en la base de datos correcta
SELECT current_database() as "Base de Datos Actual";

-- ========================================
-- ÍNDICES PARA LA TABLA CITA
-- ========================================

-- Índices básicos
CREATE INDEX IF NOT EXISTS idx_cita_cliente_id ON cita(cliente_id);
CREATE INDEX IF NOT EXISTS idx_cita_fecha_hora ON cita(fecha_hora);
CREATE INDEX IF NOT EXISTS idx_cita_estado ON cita(estado);
CREATE INDEX IF NOT EXISTS idx_cita_servicio_id ON cita(servicio_id);

-- Índices compuestos para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_cita_cliente_estado ON cita(cliente_id, estado);
CREATE INDEX IF NOT EXISTS idx_cita_fecha_estado ON cita(fecha_hora, estado);
CREATE INDEX IF NOT EXISTS idx_cita_cliente_fecha_estado ON cita(cliente_id, fecha_hora, estado);
CREATE INDEX IF NOT EXISTS idx_cita_fecha_estado_servicio ON cita(fecha_hora, estado, servicio_id);

-- Índices para recordatorios
CREATE INDEX IF NOT EXISTS idx_cita_recordatorio_cita ON cita(recordatorio_cita_enviado, fecha_hora);
CREATE INDEX IF NOT EXISTS idx_cita_recordatorio_resena ON cita(recordatorio_resena_enviado, fecha_hora);

-- Índices para consultas de disponibilidad (críticas)
CREATE INDEX IF NOT EXISTS idx_cita_disponibilidad ON cita(fecha_hora, estado, servicio_id) 
WHERE estado IN ('confirmada', 'pendiente');

-- Índices para procesamiento de recordatorios
CREATE INDEX IF NOT EXISTS idx_cita_recordatorios_pendientes ON cita(recordatorio_cita_enviado, fecha_hora, estado)
WHERE recordatorio_cita_enviado = false AND estado IN ('confirmada', 'pendiente');

CREATE INDEX IF NOT EXISTS idx_cita_resenas_pendientes ON cita(recordatorio_resena_enviado, fecha_hora, estado)
WHERE recordatorio_resena_enviado = false AND estado != 'cancelada';

-- ========================================
-- ÍNDICES PARA LA TABLA USUARIO
-- ========================================

CREATE INDEX IF NOT EXISTS idx_usuario_email ON usuario(email);
CREATE INDEX IF NOT EXISTS idx_usuario_rol ON usuario(rol);
CREATE INDEX IF NOT EXISTS idx_usuario_baneado ON usuario(baneado);
CREATE INDEX IF NOT EXISTS idx_usuario_google_id ON usuario(google_id);

-- ========================================
-- ÍNDICES PARA LA TABLA SERVICIO
-- ========================================

CREATE INDEX IF NOT EXISTS idx_servicio_activo ON servicio(activo);
CREATE INDEX IF NOT EXISTS idx_servicio_nombre ON servicio(nombre);

-- ========================================
-- ÍNDICES PARA LA TABLA RESENA
-- ========================================

CREATE INDEX IF NOT EXISTS idx_resena_cliente_id ON resena(cliente_id);
CREATE INDEX IF NOT EXISTS idx_resena_cita_id ON resena(cita_id);
CREATE INDEX IF NOT EXISTS idx_resena_fecha_creacion ON resena(fecha_creacion);
CREATE INDEX IF NOT EXISTS idx_resena_calificacion ON resena(calificacion);
CREATE INDEX IF NOT EXISTS idx_resena_cliente_fecha ON resena(cliente_id, fecha_creacion);

-- ========================================
-- ÍNDICES PARA LA TABLA PORTFOLIO
-- ========================================

CREATE INDEX IF NOT EXISTS idx_portfolio_activo ON portfolio(activo);
CREATE INDEX IF NOT EXISTS idx_portfolio_fecha_creacion ON portfolio(fecha_creacion);

-- ========================================
-- ÍNDICES PARA LA TABLA VACACIONES
-- ========================================

CREATE INDEX IF NOT EXISTS idx_vacaciones_fecha_inicio ON vacaciones(fecha_inicio);
CREATE INDEX IF NOT EXISTS idx_vacaciones_fecha_fin ON vacaciones(fecha_fin);
CREATE INDEX IF NOT EXISTS idx_vacaciones_fecha_rango ON vacaciones(fecha_inicio, fecha_fin);

-- ========================================
-- ÍNDICES PARA LA TABLA CONFIGURACION
-- ========================================

CREATE INDEX IF NOT EXISTS idx_configuracion_clave ON configuracion(clave);

-- ========================================
-- ÍNDICES PARA ESTADÍSTICAS
-- ========================================

-- Índices para consultas de estadísticas mensuales
CREATE INDEX IF NOT EXISTS idx_cita_stats_mensual ON cita(estado, fecha_hora)
WHERE fecha_hora >= CURRENT_DATE - INTERVAL '1 year';

-- ========================================
-- VERIFICACIÓN DE ÍNDICES CREADOS
-- ========================================

-- Mostrar todos los índices creados
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('cita', 'usuario', 'servicio', 'resena', 'portfolio', 'vacaciones', 'configuracion')
ORDER BY tablename, indexname;

-- ========================================
-- ANÁLISIS DE PERFORMANCE
-- ========================================

-- Analizar las tablas para optimizar el planificador
ANALYZE cita;
ANALYZE usuario;
ANALYZE servicio;
ANALYZE resena;
ANALYZE portfolio;
ANALYZE vacaciones;
ANALYZE configuracion;

-- ========================================
-- ESTADÍSTICAS DE ÍNDICES
-- ========================================

-- Mostrar estadísticas de uso de índices
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as "Escaneos del Índice",
    idx_tup_read as "Tuplas Leídas",
    idx_tup_fetch as "Tuplas Obtenidas"
FROM pg_stat_user_indexes 
WHERE tablename IN ('cita', 'usuario', 'servicio', 'resena', 'portfolio', 'vacaciones', 'configuracion')
ORDER BY idx_scan DESC;

-- ========================================
-- MONITOREO DE CONSULTAS LENTAS
-- ========================================

-- Habilitar logging de consultas lentas (opcional)
-- ALTER SYSTEM SET log_min_duration_statement = '1000'; -- Log queries > 1 segundo
-- ALTER SYSTEM SET log_statement = 'all'; -- Log todas las queries
-- SELECT pg_reload_conf();

-- ========================================
-- LIMPIEZA DE CACHE
-- ========================================

-- Limpiar cache de estadísticas
SELECT pg_stat_reset();

-- ========================================
-- VERIFICACIÓN FINAL
-- ========================================

-- Verificar que todos los índices están activos
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes 
WHERE tablename = 'cita' 
ORDER BY indexname;

-- Mensaje de confirmación
SELECT 'Índices de performance aplicados exitosamente' as "Estado";
