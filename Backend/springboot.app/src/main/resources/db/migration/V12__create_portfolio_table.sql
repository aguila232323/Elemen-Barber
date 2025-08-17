-- Crear tabla portfolio optimizada para URLs
CREATE TABLE portfolio (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    imagen_url VARCHAR(500),
    url_instagram VARCHAR(500),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
);

-- Crear índice para mejorar el rendimiento
CREATE INDEX idx_portfolio_activo ON portfolio(activo);
CREATE INDEX idx_portfolio_fecha_creacion ON portfolio(fecha_creacion); 