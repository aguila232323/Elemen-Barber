-- Crear tabla dias_laborables
CREATE TABLE IF NOT EXISTS dias_laborables (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    dia_semana VARCHAR(20) NOT NULL,
    es_laborable BOOLEAN NOT NULL DEFAULT TRUE,
    descripcion VARCHAR(255)
);

-- Crear tabla periodo_laborable
CREATE TABLE IF NOT EXISTS periodo_laborable (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    descripcion VARCHAR(500),
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

-- Crear tabla periodo_laborable_dias (tabla de relación)
CREATE TABLE IF NOT EXISTS periodo_laborable_dias (
    periodo_id BIGINT NOT NULL,
    dia_semana VARCHAR(20) NOT NULL,
    PRIMARY KEY (periodo_id, dia_semana),
    FOREIGN KEY (periodo_id) REFERENCES periodo_laborable(id) ON DELETE CASCADE
);

-- Insertar días laborables por defecto (Lunes a Viernes)
INSERT INTO dias_laborables (dia_semana, es_laborable, descripcion) VALUES
('MONDAY', TRUE, 'Lunes'),
('TUESDAY', TRUE, 'Martes'),
('WEDNESDAY', TRUE, 'Miércoles'),
('THURSDAY', TRUE, 'Jueves'),
('FRIDAY', TRUE, 'Viernes'),
('SATURDAY', FALSE, 'Sábado'),
('SUNDAY', FALSE, 'Domingo')
ON DUPLICATE KEY UPDATE es_laborable = VALUES(es_laborable);
