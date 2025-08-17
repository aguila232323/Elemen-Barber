-- Migración para limpiar portfolio (tabla ya tiene estructura correcta)
-- Limpiar todos los datos existentes para empezar desde cero
DELETE FROM portfolio;

-- Resetear el auto-increment del ID (opcional)
-- ALTER SEQUENCE portfolio_id_seq RESTART WITH 1;
