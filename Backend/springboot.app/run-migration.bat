@echo off
echo 🔄 Ejecutando migración de base de datos...
echo.

REM Verificar si el servidor está ejecutándose
curl -s http://localhost:8080/api/database/migrate > nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Migración completada exitosamente
    echo.
    echo 🎉 La funcionalidad de recuperación de contraseña está lista
    echo 📝 Puedes probar la funcionalidad en tu aplicación web
) else (
    echo ❌ Error: El servidor no está ejecutándose
    echo 💡 Asegúrate de que tu aplicación Spring Boot esté iniciada
    echo.
    echo 📋 Pasos para completar la migración:
    echo 1. Inicia tu aplicación Spring Boot
    echo 2. Ejecuta: curl -X POST http://localhost:8080/api/database/migrate
    echo 3. O simplemente reinicia la aplicación (la migración se ejecutará automáticamente)
)

pause 