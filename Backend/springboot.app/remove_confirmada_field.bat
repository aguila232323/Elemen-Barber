@echo off
echo 🗑️ Eliminación del campo confirmada de la tabla cita
echo ====================================================
echo.
echo 📋 Este script elimina el campo 'confirmada' de la tabla cita
echo    ya que es redundante con el campo 'estado'.
echo.
echo 💡 El campo 'estado' maneja:
echo    - CONFIRMADA: Cita confirmada
echo    - PENDIENTE: Cita pendiente
echo    - CANCELADA: Cita cancelada
echo.
echo ⚠️  Esta operación es irreversible.
echo.

set /p confirmar="¿Estás seguro de que quieres continuar? (s/n): "

if /i "%confirmar%"=="s" (
    echo.
    echo 🔄 Ejecutando migración...
    echo.
    
    REM Verificar si el servidor está ejecutándose
    curl -s http://localhost:8080/api/database/migrate > nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ Migración completada exitosamente
        echo.
        echo 🎉 El campo 'confirmada' ha sido eliminado de la tabla cita
        echo 📝 Ahora todas las citas usan únicamente el campo 'estado'
        echo.
        echo 📊 Estados disponibles:
        echo    - CONFIRMADA: Cita confirmada
        echo    - PENDIENTE: Cita pendiente  
        echo    - CANCELADA: Cita cancelada
    ) else (
        echo ❌ Error: El servidor no está ejecutándose
        echo 💡 Asegúrate de que tu aplicación Spring Boot esté iniciada
        echo.
        echo 📋 Pasos para completar la migración:
        echo 1. Inicia tu aplicación Spring Boot
        echo 2. La migración se ejecutará automáticamente al iniciar
        echo 3. O ejecuta: curl -X POST http://localhost:8080/api/database/migrate
    )
) else (
    echo.
    echo ❌ Operación cancelada
)

echo.
pause 