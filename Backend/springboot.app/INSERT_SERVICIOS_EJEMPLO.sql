-- Insertar servicios de ejemplo en la tabla servicio
-- Estos servicios aparecerán en la página principal

-- Limpiar servicios existentes (opcional)
-- DELETE FROM servicio;

-- Insertar servicios de barbería
INSERT INTO servicio (nombre, descripcion, precio, duracion_minutos) VALUES
('Corte de pelo', 'Corte personalizado adaptado a tus gustos y estilo. Incluye lavado, corte y peinado.', 15.00, 30),
('Corte a máquina', 'Corte profesional con máquina para un acabado perfecto y moderno.', 12.00, 25),
('Arreglo de barba', 'Perfilado y arreglo de barba con detalle. Incluye aceites y productos de cuidado.', 8.00, 20),
('Afeitado facial', 'Afeitado clásico y cuidado de la piel con productos profesionales.', 10.00, 25),
('Corte + Barba', 'Combo completo: corte de pelo y arreglo de barba con descuento.', 20.00, 45),
('Lavado de pelo', 'Lavado y tratamiento capilar profesional con productos de calidad.', 5.00, 15),
('Secador de pelo', 'Secado y peinado para un look impecable y profesional.', 8.00, 20),
('Coloración', 'Coloración y matiz para renovar tu imagen con productos de alta calidad.', 25.00, 60),
('Arreglo de bigote', 'Perfilado y arreglo de bigote con detalle y acabado perfecto.', 6.00, 15),
('Tratamiento capilar', 'Tratamiento completo para el cuidado del cabello y cuero cabelludo.', 15.00, 30);

-- Verificar que se insertaron correctamente
SELECT 
    id,
    nombre,
    descripcion,
    CONCAT(precio, '€') as precio_formateado,
    CONCAT(duracion_minutos, ' min') as duracion_formateada
FROM servicio 
ORDER BY id; 