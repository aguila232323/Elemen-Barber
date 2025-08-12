-- Script para migrar datos de MySQL a PostgreSQL
-- Este script debe ejecutarse después de crear las tablas en PostgreSQL
-- Los datos deben exportarse primero desde MySQL usando mysqldump

-- Ejemplo de migración de datos (ajustar según los datos reales de tu base de datos)

-- Migrar usuarios (ajustar valores según tus datos reales)
INSERT INTO usuario (nombre, email, telefono, password, rol, verification_code, is_email_verified, 
                    verification_code_expiry, verification_attempts, lockout_until, reset_password_token, 
                    reset_password_expiry, baneado, google_picture_url, avatar, google_calendar_token, 
                    google_calendar_refresh_token, google_calendar_token_expiry)
SELECT 
    nombre, 
    email, 
    telefono, 
    password, 
    rol, 
    verificationCode, 
    isEmailVerified, 
    verificationCodeExpiry, 
    verificationAttempts, 
    lockoutUntil, 
    resetPasswordToken, 
    resetPasswordExpiry, 
    baneado, 
    googlePictureUrl, 
    avatar, 
    googleCalendarToken, 
    googleCalendarRefreshToken, 
    googleCalendarTokenExpiry
FROM mysql_exported_data.usuario;

-- Migrar servicios
INSERT INTO servicio (nombre, descripcion, precio, duracion_minutos, emoji, texto_descriptivo, color_google_calendar)
SELECT 
    nombre, 
    descripcion, 
    precio, 
    duracionMinutos, 
    emoji, 
    textoDescriptivo, 
    colorGoogleCalendar
FROM mysql_exported_data.servicio;

-- Migrar citas
INSERT INTO cita (cliente_id, servicio_id, fecha_hora, estado, comentario, fija, periodicidad_dias, 
                 recordatorio_resena_enviado, fecha_recordatorio_resena, recordatorio_cita_enviado, fecha_recordatorio_cita)
SELECT 
    cliente_id, 
    servicio_id, 
    fechaHora, 
    estado, 
    comentario, 
    fija, 
    periodicidadDias, 
    recordatorioResenaEnviado, 
    fechaRecordatorioResena, 
    recordatorioCitaEnviado, 
    fechaRecordatorioCita
FROM mysql_exported_data.cita;

-- Migrar reseñas
INSERT INTO resenas (cliente_id, servicio_id, cita_id, calificacion, comentario, fecha_creacion, fecha_actualizacion)
SELECT 
    cliente_id, 
    servicio_id, 
    cita_id, 
    calificacion, 
    comentario, 
    fecha_creacion, 
    fecha_actualizacion
FROM mysql_exported_data.resenas;

-- Migrar portfolio
INSERT INTO portfolio (titulo, descripcion, imagen_url, fecha_creacion, activo)
SELECT 
    titulo, 
    descripcion, 
    imagen_url, 
    fecha_creacion, 
    activo
FROM mysql_exported_data.portfolio;

-- Verificar la migración
SELECT 'Usuario' as tabla, COUNT(*) as registros FROM usuario
UNION ALL
SELECT 'Servicio', COUNT(*) FROM servicio
UNION ALL
SELECT 'Cita', COUNT(*) FROM cita
UNION ALL
SELECT 'Resenas', COUNT(*) FROM resenas
UNION ALL
SELECT 'Portfolio', COUNT(*) FROM portfolio;

-- Nota: Este script asume que tienes los datos exportados de MySQL en una base de datos temporal
-- llamada 'mysql_exported_data'. Ajusta los nombres de las tablas y campos según tu estructura real.

-- Para conectar a tu contenedor Docker:
-- psql -h localhost -p 3005 -U root -d ElemenBarber -f migrate_data_to_postgresql.sql
