-- ========================================
-- ÍNDICES DE PERFORMANCE PARA ELEMEN BARBER
-- ========================================

-- Índices para la tabla CITA (consultas más frecuentes)
CREATE INDEX IF NOT EXISTS idx_cita_cliente_id ON cita(cliente_id);
CREATE INDEX IF NOT EXISTS idx_cita_fecha_hora ON cita(fecha_hora);
CREATE INDEX IF NOT EXISTS idx_cita_estado ON cita(estado);
CREATE INDEX IF NOT EXISTS idx_cita_cliente_estado ON cita(cliente_id, estado);
CREATE INDEX IF NOT EXISTS idx_cita_fecha_estado ON cita(fecha_hora, estado);
CREATE INDEX IF NOT EXISTS idx_cita_recordatorio_cita ON cita(recordatorio_cita_enviado, fecha_hora);
CREATE INDEX IF NOT EXISTS idx_cita_recordatorio_resena ON cita(recordatorio_resena_enviado, fecha_hora);
CREATE INDEX IF NOT EXISTS idx_cita_servicio_fecha ON cita(servicio_id, fecha_hora);

-- Índices compuestos para consultas complejas
CREATE INDEX IF NOT EXISTS idx_cita_cliente_fecha_estado ON cita(cliente_id, fecha_hora, estado);
CREATE INDEX IF NOT EXISTS idx_cita_fecha_estado_servicio ON cita(fecha_hora, estado, servicio_id);

-- Índices para la tabla USUARIO
CREATE INDEX IF NOT EXISTS idx_usuario_email ON usuario(email);
CREATE INDEX IF NOT EXISTS idx_usuario_rol ON usuario(rol);
CREATE INDEX IF NOT EXISTS idx_usuario_baneado ON usuario(baneado);
CREATE INDEX IF NOT EXISTS idx_usuario_google_id ON usuario(google_id);

-- Índices para la tabla SERVICIO
CREATE INDEX IF NOT EXISTS idx_servicio_activo ON servicio(activo);
CREATE INDEX IF NOT EXISTS idx_servicio_nombre ON servicio(nombre);

-- Índices para la tabla RESENA
CREATE INDEX IF NOT EXISTS idx_resena_cliente_id ON resena(cliente_id);
CREATE INDEX IF NOT EXISTS idx_resena_cita_id ON resena(cita_id);
CREATE INDEX IF NOT EXISTS idx_resena_fecha_creacion ON resena(fecha_creacion);
CREATE INDEX IF NOT EXISTS idx_resena_calificacion ON resena(calificacion);
CREATE INDEX IF NOT EXISTS idx_resena_cliente_fecha ON resena(cliente_id, fecha_creacion);

-- Índices para la tabla PORTFOLIO
CREATE INDEX IF NOT EXISTS idx_portfolio_activo ON portfolio(activo);
CREATE INDEX IF NOT EXISTS idx_portfolio_fecha_creacion ON portfolio(fecha_creacion);

-- Índices para la tabla VACACIONES
CREATE INDEX IF NOT EXISTS idx_vacaciones_fecha_inicio ON vacaciones(fecha_inicio);
CREATE INDEX IF NOT EXISTS idx_vacaciones_fecha_fin ON vacaciones(fecha_fin);
CREATE INDEX IF NOT EXISTS idx_vacaciones_fecha_rango ON vacaciones(fecha_inicio, fecha_fin);

-- Índices para la tabla CONFIGURACION
CREATE INDEX IF NOT EXISTS idx_configuracion_clave ON configuracion(clave);

-- Índices para consultas de disponibilidad (críticas para performance)
CREATE INDEX IF NOT EXISTS idx_cita_disponibilidad ON cita(fecha_hora, estado, servicio_id) 
WHERE estado IN ('confirmada', 'pendiente');

-- Índices para consultas de recordatorios (batch processing)
CREATE INDEX IF NOT EXISTS idx_cita_recordatorios_pendientes ON cita(recordatorio_cita_enviado, fecha_hora, estado)
WHERE recordatorio_cita_enviado = false AND estado IN ('confirmada', 'pendiente');

CREATE INDEX IF NOT EXISTS idx_cita_resenas_pendientes ON cita(recordatorio_resena_enviado, fecha_hora, estado)
WHERE recordatorio_resena_enviado = false AND estado != 'cancelada';

-- Índices para consultas de estadísticas (admin dashboard)
CREATE INDEX IF NOT EXISTS idx_cita_stats_mensual ON cita(estado, fecha_hora)
WHERE fecha_hora >= CURRENT_DATE - INTERVAL '1 year';

-- Índices para consultas de usuarios activos
CREATE INDEX IF NOT EXISTS idx_usuario_ultima_actividad ON usuario(ultima_actividad)
WHERE baneado = false;

-- Comentarios explicativos
COMMENT ON INDEX idx_cita_cliente_id IS 'Optimiza búsquedas de citas por cliente';
COMMENT ON INDEX idx_cita_fecha_hora IS 'Optimiza consultas por rango de fechas';
COMMENT ON INDEX idx_cita_estado IS 'Optimiza filtros por estado de cita';
COMMENT ON INDEX idx_cita_disponibilidad IS 'Optimiza consultas de disponibilidad (crítico para performance)';
COMMENT ON INDEX idx_cita_recordatorios_pendientes IS 'Optimiza procesamiento de recordatorios pendientes';
COMMENT ON INDEX idx_cita_resenas_pendientes IS 'Optimiza búsqueda de citas pendientes de reseña';
COMMENT ON INDEX idx_usuario_email IS 'Optimiza autenticación y búsquedas por email';
COMMENT ON INDEX idx_resena_cliente_fecha IS 'Optimiza historial de reseñas por cliente';
