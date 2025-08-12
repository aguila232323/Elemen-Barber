@echo off
echo Migrando a PostgreSQL en Docker...
echo.

REM Configuracion del contenedor Docker
set PG_HOST=localhost
set PG_PORT=3005
set PG_USER=root
set PG_PASSWORD=hola
set PG_DATABASE=ElemenBarber

echo ========================================
echo Migracion a PostgreSQL Docker
echo ========================================
echo Host: %PG_HOST%
echo Puerto: %PG_PORT%
echo Usuario: %PG_USER%
echo Base de datos: %PG_DATABASE%
echo ========================================
echo.

REM Verificar si el contenedor esta corriendo
echo Verificando estado del contenedor...
docker ps | findstr postgres
if %errorlevel% neq 0 (
    echo ERROR: No se encontro contenedor PostgreSQL corriendo
    echo.
    echo Contenedores activos:
    docker ps
    echo.
    pause
    exit /b 1
)

echo.
echo Creando base de datos %PG_DATABASE%...
psql -h %PG_HOST% -p %PG_PORT% -U %PG_USER% -c "CREATE DATABASE \"%PG_DATABASE%\" WITH ENCODING 'UTF8' LC_COLLATE='en_US.UTF-8' LC_CTYPE='en_US.UTF-8';"

echo.
echo Ejecutando script de migracion...
psql -h %PG_HOST% -p %PG_PORT% -U %PG_USER% -d %PG_DATABASE% -f migrate_to_postgresql.sql

echo.
echo ========================================
echo Migracion completada!
echo ========================================
echo Base de datos: %PG_DATABASE%
echo Usuario: %PG_USER%
echo Puerto: %PG_PORT%
echo.
echo Ahora puedes ejecutar tu aplicacion Spring Boot
echo.
pause
