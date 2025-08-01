@echo off
echo 🎯 Insertando Servicios de Ejemplo - Esential Barber
echo ====================================================
echo.
echo 📋 Este script inserta servicios de ejemplo en la base de datos
echo    que aparecerán en la página principal.
echo.
echo 💡 Los servicios incluyen:
echo    - Cortes de pelo
echo    - Arreglo de barba
echo    - Tratamientos capilares
echo    - Y más...
echo.

set /p confirmar="¿Quieres insertar los servicios de ejemplo? (s/n): "

if /i "%confirmar%"=="s" (
    echo.
    echo 🔄 Insertando servicios de ejemplo...
    echo.
    
    REM Verificar si el servidor está ejecutándose
    curl -s http://localhost:8080/api/servicios > nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ Servidor conectado correctamente
        echo.
        echo 📊 Servicios disponibles en la base de datos:
        curl -s http://localhost:8080/api/servicios | findstr /C:"nombre" /C:"precio"
        echo.
        echo 🎉 Los servicios están listos para aparecer en la página principal
        echo.
        echo 💡 Para agregar más servicios, usa el panel de administración
        echo    o ejecuta el script SQL directamente en MySQL
    ) else (
        echo ❌ Error: El servidor no está ejecutándose
        echo 💡 Asegúrate de que tu aplicación Spring Boot esté iniciada
        echo.
        echo 📋 Pasos para completar:
        echo 1. Inicia tu aplicación Spring Boot
        echo 2. Ejecuta el script SQL: INSERT_SERVICIOS_EJEMPLO.sql
        echo 3. O usa el panel de administración para agregar servicios
    )
) else (
    echo.
    echo ❌ Operación cancelada
)

echo.
pause 