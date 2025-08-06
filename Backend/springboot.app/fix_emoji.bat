@echo off
echo Configurando soporte de emojis en la base de datos...
echo.

mysql -u root -p -e "ALTER DATABASE EsentialBarber CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" barberia
mysql -u root -p -e "ALTER TABLE usuario CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" barberia

echo.
echo Configuracion completada. Reinicia el servidor Spring Boot.
pause 