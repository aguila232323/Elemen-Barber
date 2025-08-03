@echo off
echo ========================================
echo Probando endpoint de reenvio con PowerShell
echo ========================================
echo.

echo 1. Probando endpoint de reenvio...
powershell -Command "Invoke-RestMethod -Uri 'http://localhost:8080/api/verificacion/reenviar-codigo' -Method POST -Headers @{'Content-Type'='application/json'} -Body '{\"email\":\"test@example.com\"}'"

echo.
echo ========================================
echo Prueba completada
echo ========================================
pause 