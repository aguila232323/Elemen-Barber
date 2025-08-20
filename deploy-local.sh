#!/bin/bash

# ========================================
# SCRIPT DE DESPLIEGUE LOCAL PARA ESENTIAL BARBER
# ========================================

echo "🚀 Iniciando despliegue local de Esential Barber..."

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Por favor instala Docker primero."
    exit 1
fi

# Verificar si Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado. Por favor instala Docker Compose primero."
    exit 1
fi

echo "✅ Docker y Docker Compose están instalados"

# Parar contenedores existentes si los hay
echo "🛑 Parando contenedores existentes..."
docker-compose down

# Limpiar imágenes antiguas (opcional)
read -p "¿Quieres limpiar imágenes Docker antiguas? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🧹 Limpiando imágenes antiguas..."
    docker system prune -f
fi

# Construir y levantar los servicios
echo "🔨 Construyendo y levantando servicios..."
docker-compose up --build -d

# Esperar a que los servicios estén listos
echo "⏳ Esperando a que los servicios estén listos..."
sleep 30

# Verificar el estado de los contenedores
echo "📊 Estado de los contenedores:"
docker-compose ps

# Verificar logs del backend
echo "📋 Logs del backend:"
docker-compose logs backend --tail=20

# Verificar conectividad
echo "🔍 Verificando conectividad..."
if curl -f http://localhost:8080/actuator/health &> /dev/null; then
    echo "✅ Backend está funcionando correctamente en http://localhost:8080"
else
    echo "❌ Backend no responde. Revisa los logs con: docker-compose logs backend"
fi

echo ""
echo "🎉 ¡Despliegue local completado!"
echo ""
echo "📱 URLs de acceso:"
echo "   Backend API: http://localhost:8080"
echo "   Health Check: http://localhost:8080/actuator/health"
echo "   PostgreSQL: localhost:5432"
echo ""
echo "🔧 Comandos útiles:"
echo "   Ver logs: docker-compose logs -f"
echo "   Parar servicios: docker-compose down"
echo "   Reiniciar: docker-compose restart"
echo "   Ver estado: docker-compose ps"
