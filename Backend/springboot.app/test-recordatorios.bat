@echo off
echo ========================================
echo    PRUEBA DEL SISTEMA DE RECORDATORIOS
echo ========================================
echo.

echo 1. Verificando estado del sistema...
curl -X GET "http://localhost:8080/api/recordatorios/estado" -H "Authorization: Bearer %1"

echo.
echo.
echo 2. Verificando citas próximas...
curl -X GET "http://localhost:8080/api/recordatorios/citas-proximas" -H "Authorization: Bearer %1"

echo.
echo.
echo 3. Ejecutando verificación manual de recordatorios...
curl -X POST "http://localhost:8080/api/recordatorios/ejecutar-verificacion" -H "Authorization: Bearer %1"

echo.
echo.
echo 4. Verificando configuración de email...
curl -X GET "http://localhost:8080/api/recordatorios/test-email-config" -H "Authorization: Bearer %1"

echo.
echo.
echo ========================================
echo    PRUEBA COMPLETADA
echo ========================================
pause 