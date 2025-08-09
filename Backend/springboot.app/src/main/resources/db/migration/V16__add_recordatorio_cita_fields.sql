-- Añadir campos para evitar duplicar recordatorios de cita
ALTER TABLE cita
  ADD COLUMN IF NOT EXISTS recordatorio_cita_enviado TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fecha_recordatorio_cita DATETIME NULL;
