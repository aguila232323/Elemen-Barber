-- Agregar campo avatar a la tabla usuario
ALTER TABLE usuario ADD COLUMN avatar VARCHAR(10);

-- Comentario sobre el campo
-- El campo avatar almacena el emoji seleccionado por el usuario como avatar personalizado
-- Ejemplos: 👨‍💼, ��‍💼, 😊, 🎸, etc. 