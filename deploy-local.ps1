# ========================================
# SCRIPT DE DESPLIEGUE LOCAL PARA ESENTIAL BARBER (WINDOWS)
# ========================================

Write-Host "🚀 Iniciando despliegue local de Esential Barber..." -ForegroundColor Green

# Verificar si Docker está instalado
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker está instalado: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker no está instalado. Por favor instala Docker Desktop primero." -ForegroundColor Red
    exit 1
}

# Verificar si Docker Compose está instalado
try {
    $composeVersion = docker-compose --version
    Write-Host "✅ Docker Compose está instalado: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose no está instalado. Por favor instala Docker Compose primero." -ForegroundColor Red
    exit 1
}

# Verificar si Docker Desktop está ejecutándose
try {
    docker info | Out-Null
    Write-Host "✅ Docker Desktop está ejecutándose" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Desktop no está ejecutándose. Por favor inicia Docker Desktop." -ForegroundColor Red
    exit 1
}

# Parar contenedores existentes si los hay
Write-Host "🛑 Parando contenedores existentes..." -ForegroundColor Yellow
docker-compose down

# Preguntar si limpiar imágenes antiguas
$cleanImages = Read-Host "¿Quieres limpiar imágenes Docker antiguas? (y/n)"
if ($cleanImages -eq "y" -or $cleanImages -eq "Y") {
    Write-Host "🧹 Limpiando imágenes antiguas..." -ForegroundColor Yellow
    docker system prune -f
}

# Construir y levantar los servicios
Write-Host "🔨 Construyendo y levantando servicios..." -ForegroundColor Yellow
docker-compose up --build -d

# Esperar a que los servicios estén listos
Write-Host "⏳ Esperando a que los servicios estén listos..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Verificar el estado de los contenedores
Write-Host "📊 Estado de los contenedores:" -ForegroundColor Cyan
docker-compose ps

# Verificar logs del backend
Write-Host "📋 Logs del backend:" -ForegroundColor Cyan
docker-compose logs backend --tail=20

# Verificar conectividad
Write-Host "🔍 Verificando conectividad..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/actuator/health" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend está funcionando correctamente en http://localhost:8080" -ForegroundColor Green
    } else {
        Write-Host "❌ Backend responde pero con estado: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Backend no responde. Revisa los logs con: docker-compose logs backend" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 ¡Despliegue local completado!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 URLs de acceso:" -ForegroundColor Cyan
Write-Host "   Backend API: http://localhost:8080" -ForegroundColor White
Write-Host "   Health Check: http://localhost:8080/actuator/health" -ForegroundColor White
Write-Host "   PostgreSQL: localhost:5432" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Comandos útiles:" -ForegroundColor Cyan
Write-Host "   Ver logs: docker-compose logs -f" -ForegroundColor White
Write-Host "   Parar servicios: docker-compose down" -ForegroundColor White
Write-Host "   Reiniciar: docker-compose restart" -ForegroundColor White
Write-Host "   Ver estado: docker-compose ps" -ForegroundColor White
Write-Host ""
Write-Host "💡 Para abrir en el navegador:" -ForegroundColor Cyan
Write-Host "   start http://localhost:8080" -ForegroundColor White
