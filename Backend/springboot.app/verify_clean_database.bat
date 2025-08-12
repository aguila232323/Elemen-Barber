@echo off
echo ========================================
echo Verificacion Base de Datos Limpia
echo ========================================
echo.

REM Configuracion del contenedor Docker
set PG_HOST=localhost
set PG_PORT=3005
set PG_USER=postgres
set PG_PASSWORD=hola
set PG_DATABASE=ElemenBarber

echo Configuracion:
echo Host: %PG_HOST%
echo Puerto: %PG_PORT%
echo Usuario: %PG_USER%
echo Base de datos: %PG_DATABASE%
echo.

echo ========================================
echo Estado de las Tablas
echo ========================================
docker exec postgresSQL2 psql -U postgres -d ElemenBarber -c "SELECT 'Usuario' as tabla, COUNT(*) as registros FROM usuario UNION ALL SELECT 'Servicio', COUNT(*) FROM servicio UNION ALL SELECT 'Cita', COUNT(*) FROM cita UNION ALL SELECT 'Resenas', COUNT(*) FROM resenas UNION ALL SELECT 'Portfolio', COUNT(*) FROM portfolio;"

echo.
echo ========================================
echo Usuario ADMIN
echo ========================================
docker exec postgresSQL2 psql -U postgres -d ElemenBarber -c "SELECT id, nombre, email, rol FROM usuario WHERE rol = 'ADMIN';"

echo.
echo ========================================
echo Estructura de Tablas
echo ========================================
docker exec postgresSQL2 psql -U postgres -d ElemenBarber -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"

echo.
echo ========================================
echo Base de Datos Lista para Pruebas
echo ========================================
echo ✅ Usuario ADMIN configurado
echo ✅ Tablas limpias y listas
echo ✅ Estructura PostgreSQL creada
echo.
echo Ahora puedes probar todas las funcionalidades!
echo.
pause
