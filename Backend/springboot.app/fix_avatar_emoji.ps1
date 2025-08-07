# Script PowerShell para solucionar el error de emojis
Write-Host "========================================" -ForegroundColor Green
Write-Host "Script para solucionar error de emojis" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Intentar diferentes ubicaciones de MySQL
$mysqlPaths = @(
    "mysql",
    "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe",
    "C:\Program Files\MySQL\MySQL Server 5.7\bin\mysql.exe",
    "C:\xampp\mysql\bin\mysql.exe",
    "C:\wamp64\bin\mysql\mysql8.0.31\bin\mysql.exe",
    "C:\wamp\bin\mysql\mysql8.0.31\bin\mysql.exe"
)

$mysqlExe = $null
foreach ($path in $mysqlPaths) {
    try {
        $result = Get-Command $path -ErrorAction SilentlyContinue
        if ($result) {
            $mysqlExe = $path
            Write-Host "MySQL encontrado en: $path" -ForegroundColor Green
            break
        }
    }
    catch {
        # Continuar con el siguiente path
    }
}

if (-not $mysqlExe) {
    Write-Host "Error: No se pudo encontrar MySQL en el sistema." -ForegroundColor Red
    Write-Host "Por favor, asegúrate de que MySQL esté instalado y agregado al PATH." -ForegroundColor Yellow
    Write-Host "O ejecuta el script SQL manualmente en MySQL Workbench." -ForegroundColor Yellow
    Read-Host "Presiona Enter para continuar"
    exit 1
}

Write-Host "Conectando a la base de datos MySQL..." -ForegroundColor Yellow
Write-Host "Ejecutando script de corrección..." -ForegroundColor Yellow

# Ejecutar el script SQL
try {
    & $mysqlExe -u admin -pmqlN61Sym7DT EsentialBarber -e "source FIX_AVATAR_EMOJI_ERROR.sql"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "Script ejecutado exitosamente!" -ForegroundColor Green
        Write-Host "El error de emojis debería estar solucionado." -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Red
        Write-Host "Error al ejecutar el script!" -ForegroundColor Red
        Write-Host "Verifica que MySQL esté ejecutándose y" -ForegroundColor Yellow
        Write-Host "que las credenciales sean correctas." -ForegroundColor Yellow
        Write-Host "========================================" -ForegroundColor Red
    }
}
catch {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "Error al ejecutar el script!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
}

Read-Host "Presiona Enter para continuar" 