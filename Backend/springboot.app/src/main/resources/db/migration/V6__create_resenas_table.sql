-- Crear tabla de reseñas
CREATE TABLE resenas (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cita_id BIGINT NOT NULL,
    cliente_id BIGINT NOT NULL,
    calificacion INT NOT NULL CHECK (calificacion >= 1 AND calificacion <= 5),
    comentario VARCHAR(1000),
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME,
    
    -- Claves foráneas
    FOREIGN KEY (cita_id) REFERENCES citas(id) ON DELETE CASCADE,
    FOREIGN KEY (cliente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    
    -- Índices para mejorar rendimiento
    INDEX idx_resenas_cita_id (cita_id),
    INDEX idx_resenas_cliente_id (cliente_id),
    INDEX idx_resenas_fecha_creacion (fecha_creacion),
    
    -- Restricción única: una cita solo puede tener una reseña
    UNIQUE KEY uk_resena_cita (cita_id)
);

-- Insertar algunos datos de ejemplo (opcional)
INSERT INTO resenas (cita_id, cliente_id, calificacion, comentario, fecha_creacion) VALUES
(1, 1, 5, 'Excelente servicio, muy profesional y puntual. El corte quedó perfecto.', NOW()),
(2, 2, 4, 'Muy buen trabajo, el barbero es muy hábil. Recomendado.', NOW()),
(3, 3, 5, 'Increíble experiencia, el servicio superó mis expectativas.', NOW()); 