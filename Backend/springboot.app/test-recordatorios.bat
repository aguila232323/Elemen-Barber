@echo off
echo ========================================
echo Test de Recordatorios Automaticos
echo ========================================
echo.

echo 1. Verificando si el servidor esta ejecutandose...
netstat -an | findstr :8080
echo.

echo 2. Verificando logs de recordatorios...
echo Buscando en los logs del backend por mensajes de recordatorios...
echo.

echo 3. Para probar manualmente, puedes:
echo    - Crear una cita para dentro de 1 hora
echo    - Esperar 5 minutos para que se ejecute el recordatorio automatico
echo    - O usar el endpoint manual de recordatorios
echo.

echo 4. Endpoint para enviar recordatorio manual:
echo POST http://localhost:8080/api/recordatorios/enviar-manual/{citaId}
echo.

echo ========================================
echo Test completado
echo ========================================
pause 