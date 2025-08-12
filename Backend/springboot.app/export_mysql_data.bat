@echo off
echo Exportando datos de MySQL para migracion a PostgreSQL...
echo.

REM Configuracion de la base de datos MySQL
set MYSQL_HOST=localhost
set MYSQL_PORT=3306
set MYSQL_USER=admin
set MYSQL_PASSWORD=mqlN61Sym7DT
set MYSQL_DATABASE=EsentialBarber

REM Crear directorio para los archivos de exportacion
if not exist "mysql_export" mkdir mysql_export

echo Exportando estructura de la base de datos...
mysqldump -h %MYSQL_HOST% -P %MYSQL_PORT% -u %MYSQL_USER% -p%MYSQL_PASSWORD% --no-data --routines --triggers %MYSQL_DATABASE% > mysql_export/structure.sql

echo Exportando datos de la tabla usuario...
mysqldump -h %MYSQL_HOST% -P %MYSQL_PORT% -u %MYSQL_USER% -p%MYSQL_PASSWORD% --no-create-info --single-transaction %MYSQL_DATABASE% usuario > mysql_export/usuario_data.sql

echo Exportando datos de la tabla servicio...
mysqldump -h %MYSQL_HOST% -P %MYSQL_PORT% -u %MYSQL_USER% -p%MYSQL_PASSWORD% --no-create-info --single-transaction %MYSQL_DATABASE% servicio > mysql_export/servicio_data.sql

echo Exportando datos de la tabla cita...
mysqldump -h %MYSQL_HOST% -P %MYSQL_PORT% -u %MYSQL_USER% -p%MYSQL_PASSWORD% --no-create-info --single-transaction %MYSQL_DATABASE% cita > mysql_export/cita_data.sql

echo Exportando datos de la tabla resenas...
mysqldump -h %MYSQL_HOST% -P %MYSQL_PORT% -u %MYSQL_USER% -p%MYSQL_PASSWORD% --no-create-info --single-transaction %MYSQL_DATABASE% resenas > mysql_export/resenas_data.sql

echo Exportando datos de la tabla portfolio...
mysqldump -h %MYSQL_HOST% -P %MYSQL_PORT% -u %MYSQL_USER% -p%MYSQL_PASSWORD% --no-create-info --single-transaction %MYSQL_DATABASE% portfolio > mysql_export/portfolio_data.sql

echo Exportacion completada!
echo Los archivos se encuentran en el directorio: mysql_export
echo.
echo Archivos generados:
dir mysql_export\*.sql
echo.
pause
