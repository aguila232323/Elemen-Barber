@echo off
echo ========================================
echo Prueba de Conexion a PostgreSQL
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

echo Verificando conexion...
docker exec postgresSQL2 psql -U postgres -d ElemenBarber -c "SELECT 'Conexion exitosa!' as status, current_timestamp as hora;"

echo.
echo Verificando tablas creadas...
docker exec postgresSQL2 psql -U postgres -d ElemenBarber -c "SELECT COUNT(*) as total_tablas FROM information_schema.tables WHERE table_schema = 'public';"

echo.
echo Listando tablas:
docker exec postgresSQL2 psql -U postgres -d ElemenBarber -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"

echo.
echo ========================================
echo Prueba completada!
echo ========================================
echo.
pause
