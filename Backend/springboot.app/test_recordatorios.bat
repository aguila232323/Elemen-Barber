@echo off
echo 🔔 Sistema de Recordatorios Automáticos - Esential Barber
echo ======================================================
echo.
echo 📋 Este script te permite probar el sistema de recordatorios:
echo.
echo 1. Ejecutar verificación manual de recordatorios automáticos
echo 2. Enviar recordatorio manual para una cita específica
echo.
echo 💡 El sistema automático se ejecuta cada 5 minutos y envía
echo    recordatorios para citas que están programadas para dentro de 1 hora.
echo.

:menu
echo Selecciona una opción:
echo [1] Ejecutar verificación manual de recordatorios
echo [2] Enviar recordatorio manual (requiere ID de cita)
echo [3] Salir
echo.
set /p opcion="Opción: "

if "%opcion%"=="1" goto automaticos
if "%opcion%"=="2" goto manual
if "%opcion%"=="3" goto salir
echo Opción inválida. Intenta de nuevo.
echo.
goto menu

:automaticos
echo.
echo 🔍 Ejecutando verificación manual de recordatorios automáticos...
curl -X POST http://localhost:8080/api/recordatorios/ejecutar-automaticos
echo.
echo.
pause
goto menu

:manual
echo.
set /p citaId="Ingresa el ID de la cita: "
echo.
echo 📧 Enviando recordatorio manual para cita ID: %citaId%
curl -X POST http://localhost:8080/api/recordatorios/enviar/%citaId%
echo.
echo.
pause
goto menu

:salir
echo.
echo 👋 ¡Hasta luego!
pause 