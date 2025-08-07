-- Crear tabla portfolio
CREATE TABLE portfolio (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    imagen_base64 LONGTEXT,
    url_instagram VARCHAR(500),
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
);

-- Crear índice para mejorar el rendimiento
CREATE INDEX idx_portfolio_activo ON portfolio(activo);
CREATE INDEX idx_portfolio_fecha_creacion ON portfolio(fecha_creacion); 