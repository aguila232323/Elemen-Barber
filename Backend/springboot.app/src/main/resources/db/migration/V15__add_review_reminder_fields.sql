-- Añadir campos para recordatorio de reseña en citas
ALTER TABLE cita
  ADD COLUMN IF NOT EXISTS recordatorio_resena_enviado TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fecha_recordatorio_resena DATETIME NULL;