@echo off
echo ========================================
echo Reiniciando servidor de desarrollo
echo ========================================
echo.

echo 1. Deteniendo procesos de Node.js...
taskkill /f /im node.exe 2>nul

echo.
echo 2. Limpiando cache de Vite...
if exist "node_modules\.vite" rmdir /s /q "node_modules\.vite"
if exist ".vite" rmdir /s /q ".vite"

echo.
echo 3. Limpiando cache de dist...
if exist "dist" rmdir /s /q "dist"

echo.
echo 4. Iniciando servidor de desarrollo...
npm run dev

echo.
echo ========================================
echo Servidor reiniciado
echo ========================================
pause 