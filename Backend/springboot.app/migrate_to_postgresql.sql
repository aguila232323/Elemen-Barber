-- Script de migración de MySQL a PostgreSQL para EsentialBarber
-- Ejecutar este script en PostgreSQL después de crear la base de datos

-- Crear la base de datos (ejecutar como superusuario)
-- CREATE DATABASE "EsentialBarber" WITH ENCODING 'UTF8' LC_COLLATE='en_US.UTF-8' LC_CTYPE='en_US.UTF-8';

-- Conectar a la base de datos EsentialBarber
-- \c "EsentialBarber";

-- Crear extensión para UUID si es necesaria
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla usuario
CREATE TABLE IF NOT EXISTS usuario (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'CLIENTE',
    verification_code VARCHAR(6),
    is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verification_code_expiry TIMESTAMP,
    verification_attempts INTEGER NOT NULL DEFAULT 0,
    lockout_until TIMESTAMP,
    reset_password_token VARCHAR(255),
    reset_password_expiry TIMESTAMP,
    baneado BOOLEAN NOT NULL DEFAULT FALSE,
    google_picture_url VARCHAR(500),
    avatar VARCHAR(10),
    google_calendar_token VARCHAR(1000),
    google_calendar_refresh_token VARCHAR(1000),
    google_calendar_token_expiry TIMESTAMP
);

-- Tabla servicio
CREATE TABLE IF NOT EXISTS servicio (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(500),
    precio DECIMAL(10,2) NOT NULL,
    duracion_minutos INTEGER NOT NULL,
    emoji VARCHAR(10),
    texto_descriptivo VARCHAR(200),
    color_google_calendar VARCHAR(7)
);

-- Tabla cita
CREATE TABLE IF NOT EXISTS cita (
    id BIGSERIAL PRIMARY KEY,
    cliente_id BIGINT NOT NULL REFERENCES usuario(id),
    servicio_id BIGINT NOT NULL REFERENCES servicio(id),
    fecha_hora TIMESTAMP NOT NULL,
    estado VARCHAR(50) DEFAULT 'pendiente',
    comentario VARCHAR(500),
    fija BOOLEAN DEFAULT FALSE,
    periodicidad_dias INTEGER,
    recordatorio_resena_enviado BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_recordatorio_resena TIMESTAMP,
    recordatorio_cita_enviado BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_recordatorio_cita TIMESTAMP
);

-- Tabla resenas
CREATE TABLE IF NOT EXISTS resenas (
    id BIGSERIAL PRIMARY KEY,
    cliente_id BIGINT NOT NULL REFERENCES usuario(id),
    servicio_id BIGINT NOT NULL REFERENCES servicio(id),
    cita_id BIGINT REFERENCES cita(id),
    calificacion INTEGER NOT NULL CHECK (calificacion >= 1 AND calificacion <= 5),
    comentario TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla portfolio
CREATE TABLE IF NOT EXISTS portfolio (
    id BIGSERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    imagen_url VARCHAR(500),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_usuario_email ON usuario(email);
CREATE INDEX IF NOT EXISTS idx_cita_cliente_id ON cita(cliente_id);
CREATE INDEX IF NOT EXISTS idx_cita_servicio_id ON cita(servicio_id);
CREATE INDEX IF NOT EXISTS idx_cita_fecha_hora ON cita(fecha_hora);
CREATE INDEX IF NOT EXISTS idx_resenas_cliente_id ON resenas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_resenas_servicio_id ON resenas(servicio_id);

-- Insertar datos de ejemplo si es necesario
-- INSERT INTO servicio (nombre, descripcion, precio, duracion_minutos, emoji, texto_descriptivo) 
-- VALUES ('Corte de Cabello', 'Corte de cabello profesional', 25.00, 30, '💇‍♂️', 'Corte moderno y elegante');

-- Comentarios sobre la migración
COMMENT ON TABLE usuario IS 'Tabla de usuarios del sistema de barbería';
COMMENT ON TABLE servicio IS 'Tabla de servicios ofrecidos por la barbería';
COMMENT ON TABLE cita IS 'Tabla de citas programadas';
COMMENT ON TABLE resenas IS 'Tabla de reseñas de los clientes';
COMMENT ON TABLE portfolio IS 'Tabla del portafolio de trabajos';

-- Verificar que las tablas se crearon correctamente
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
