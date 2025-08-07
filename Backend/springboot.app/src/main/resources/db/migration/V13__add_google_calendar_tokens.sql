-- Agregar campos para Google Calendar OAuth2 tokens
ALTER TABLE usuario 
ADD COLUMN google_calendar_token TEXT,
ADD COLUMN google_calendar_refresh_token TEXT,
ADD COLUMN google_calendar_token_expiry DATETIME; 