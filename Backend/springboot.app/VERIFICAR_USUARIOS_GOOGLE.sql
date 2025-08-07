-- Script para verificar usuarios de Google
-- Ejecutar en MySQL Workbench o cualquier cliente MySQL

-- Verificar todos los usuarios y sus contraseñas
SELECT 
    id,
    email,
    nombre,
    password,
    CASE 
        WHEN password = 'GOOGLE_AUTH' THEN 'GOOGLE_USER'
        ELSE 'NORMAL_USER'
    END as user_type,
    google_picture_url,
    CASE 
        WHEN google_picture_url IS NOT NULL AND google_picture_url LIKE '%googleusercontent.com%' THEN 'HAS_GOOGLE_PICTURE'
        ELSE 'NO_GOOGLE_PICTURE'
    END as picture_status
FROM usuario 
ORDER BY user_type DESC, email;

-- Verificar específicamente usuarios de Google
SELECT 
    id,
    email,
    nombre,
    password,
    google_picture_url
FROM usuario 
WHERE password = 'GOOGLE_AUTH';

-- Verificar usuarios con imagen de Google pero que podrían no estar marcados como Google
SELECT 
    id,
    email,
    nombre,
    password,
    google_picture_url
FROM usuario 
WHERE google_picture_url IS NOT NULL 
  AND google_picture_url LIKE '%googleusercontent.com%'
  AND password != 'GOOGLE_AUTH';

-- Actualizar usuarios que tienen imagen de Google pero no están marcados como Google
-- (Descomenta la siguiente línea si necesitas corregir usuarios)
-- UPDATE usuario SET password = 'GOOGLE_AUTH' WHERE google_picture_url IS NOT NULL AND google_picture_url LIKE '%googleusercontent.com%' AND password != 'GOOGLE_AUTH'; 