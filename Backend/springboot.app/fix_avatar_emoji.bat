@echo off
echo ========================================
echo Script para solucionar error de emojis
echo ========================================
echo.

echo Conectando a la base de datos MySQL...
echo Ejecutando script de correccion...

mysql -u admin -pmqlN61Sym7DT EsentialBarber < FIX_AVATAR_EMOJI_ERROR.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Script ejecutado exitosamente!
    echo El error de emojis deberia estar solucionado.
    echo ========================================
) else (
    echo.
    echo ========================================
    echo Error al ejecutar el script!
    echo Verifica que MySQL este ejecutandose y
    echo que las credenciales sean correctas.
    echo ========================================
)

pause 