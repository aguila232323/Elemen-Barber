@echo off
echo ========================================
echo Probando endpoint simple de reenvio
echo ========================================
echo.

echo 1. Probando endpoint simple de reenvio...
powershell -Command "try { $response = Invoke-RestMethod -Uri 'http://localhost:8080/api/verificacion/reenviar-simple' -Method POST -Headers @{'Content-Type'='application/json'} -Body '{\"email\":\"test@example.com\"}'; Write-Host 'Exito:' $response.message } catch { Write-Host 'Error:' $_.Exception.Message }"

echo.
echo ========================================
echo Prueba completada
echo ========================================
pause 