@echo off
echo Conectando a PostgreSQL en Docker...
echo.

REM Configuracion del contenedor Docker
set CONTAINER_NAME=postgres
set PG_HOST=localhost
set PG_PORT=3005
set PG_USER=root
set PG_PASSWORD=hola
set PG_DATABASE=ElemenBarber

echo ========================================
echo Configuracion PostgreSQL Docker
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
echo Conectando a la base de datos...
echo.

REM Conectar a PostgreSQL
psql -h %PG_HOST% -p %PG_PORT% -U %PG_USER% -d %PG_DATABASE%

echo.
echo Conexion cerrada.
pause
