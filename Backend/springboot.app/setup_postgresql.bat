@echo off
echo Configurando PostgreSQL para EsentialBarber...
echo.

REM Configuracion de PostgreSQL Docker
set PG_HOST=localhost
set PG_PORT=3005
set PG_USER=root
set PG_PASSWORD=hola
set PG_DATABASE=ElemenBarber

echo Creando base de datos %PG_DATABASE%...
psql -h %PG_HOST% -p %PG_PORT% -U %PG_USER% -c "CREATE DATABASE \"%PG_DATABASE%\" WITH ENCODING 'UTF8' LC_COLLATE='en_US.UTF-8' LC_CTYPE='en_US.UTF-8';"

echo Conectando a la base de datos %PG_DATABASE%...
psql -h %PG_HOST% -p %PG_PORT% -U %PG_USER% -d %PG_DATABASE% -f migrate_to_postgresql.sql

echo Configuracion de PostgreSQL completada!
echo.
echo Base de datos: %PG_DATABASE%
echo Usuario: %PG_USER%
echo Puerto: %PG_PORT%
echo.
echo Ahora puedes ejecutar tu aplicacion Spring Boot con PostgreSQL
echo.
pause
