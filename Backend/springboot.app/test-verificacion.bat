@echo off
echo ========================================
echo Probando endpoint de reenvio de codigo
echo ========================================
echo.

echo 1. Probando endpoint de reenvio...
curl -X POST http://localhost:8080/api/verificacion/reenviar-codigo ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\"}"

echo.
echo.
echo 2. Probando endpoint de envio inicial...
curl -X POST http://localhost:8080/api/verificacion/enviar-codigo ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\"}"

echo.
echo.
echo ========================================
echo Pruebas completadas
echo ========================================
pause 