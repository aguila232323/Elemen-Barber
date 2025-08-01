-- Agregar campos para control de intentos de verificación y bloqueo
ALTER TABLE usuario 
ADD COLUMN verification_attempts INT DEFAULT 0 NOT NULL,
ADD COLUMN lockout_until TIMESTAMP NULL; 