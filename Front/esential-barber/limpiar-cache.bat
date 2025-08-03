@echo off
echo ========================================
echo Limpiando cache de Vite
echo ========================================
echo.

echo 1. Deteniendo servidor de desarrollo...
taskkill /f /im node.exe 2>nul

echo.
echo 2. Limpiando cache de Vite...
if exist "node_modules\.vite" rmdir /s /q "node_modules\.vite"
if exist ".vite" rmdir /s /q ".vite"

echo.
echo 3. Limpiando cache de npm...
npm cache clean --force

echo.
echo 4. Reinstalando dependencias...
npm install

echo.
echo 5. Iniciando servidor de desarrollo...
npm run dev

echo.
echo ========================================
echo Cache limpiado y servidor reiniciado
echo ========================================
pause 