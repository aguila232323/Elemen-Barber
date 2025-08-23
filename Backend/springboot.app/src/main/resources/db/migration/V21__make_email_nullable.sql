-- Migración para hacer el campo email nullable en la tabla usuario
-- Esto permite crear usuarios sin email para personas mayores sin móvil

-- Modificar la columna email para permitir valores NULL (PostgreSQL)
ALTER TABLE usuario ALTER COLUMN email DROP NOT NULL;

-- Comentario explicativo
-- Esta migración permite que el admin pueda crear usuarios con solo nombre
-- para personas mayores que no tienen email ni móvil
-- Los recordatorios de citas para estos usuarios deberán ser gestionados manualmente
