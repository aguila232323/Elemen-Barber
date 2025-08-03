@echo off
echo Probando envio de email...
echo.

curl -X POST http://localhost:8080/api/verificacion/enviar-codigo ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\"}"

echo.
echo Prueba completada.
pause 