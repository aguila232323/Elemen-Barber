@echo off
echo ========================================
echo Diagnostico del Backend
echo ========================================
echo.

echo 1. Verificando si el puerto 8080 esta en uso...
netstat -an | findstr :8080

echo.
echo 2. Verificando si el servidor responde...
curl -X GET http://localhost:8080/api-docs

echo.
echo 3. Verificando endpoint de verificacion...
curl -X GET http://localhost:8080/api/verificacion/estado/test@example.com

echo.
echo 4. Probando endpoint de reenvio...
curl -X POST http://localhost:8080/api/verificacion/reenviar-codigo ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\"}"

echo.
echo ========================================
echo Diagnostico completado
echo ========================================
pause 