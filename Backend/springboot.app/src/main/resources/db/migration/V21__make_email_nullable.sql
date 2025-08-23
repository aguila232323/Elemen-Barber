-- Migración para hacer el campo email nullable en la tabla usuario
-- Esto permite crear usuarios sin email para personas mayores sin móvil

-- Modificar la columna email para permitir valores NULL
ALTER TABLE usuario MODIFY COLUMN email VARCHAR(100) NULL;

-- Crear un índice único que permita valores NULL (MySQL permite múltiples NULL en índices únicos)
-- Esto ya está manejado por la anotación @Column(unique = true) en la entidad

-- Comentario explicativo
-- Esta migración permite que el admin pueda crear usuarios con solo nombre
-- para personas mayores que no tienen email ni móvil
-- Los recordatorios de citas para estos usuarios deberán ser gestionados manualmente
