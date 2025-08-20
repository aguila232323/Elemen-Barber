#!/bin/bash

# ========================================
# SCRIPT DE DESPLIEGUE PARA VPS - ESENTIAL BARBER BACKEND
# ========================================

set -e  # Salir si hay algún error

echo "🚀 Iniciando despliegue en VPS de Esential Barber Backend..."

# Verificar si estamos en el directorio correcto
if [ ! -f "docker-compose.prod.yml" ]; then
    echo "❌ Error: No se encontró docker-compose.prod.yml"
    echo "   Asegúrate de estar en el directorio del backend"
    exit 1
fi

# Verificar si existe el archivo de variables de entorno
if [ ! -f ".env.prod" ]; then
    echo "❌ Error: No se encontró .env.prod"
    echo "   Copia env.example como .env.prod y configura las variables"
    echo "   cp env.example .env.prod"
    echo "   nano .env.prod"
    exit 1
fi

# Verificar Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado"
    exit 1
fi

echo "✅ Docker y Docker Compose están instalados"

# Parar contenedores existentes
echo "🛑 Parando contenedores existentes..."
docker-compose -f docker-compose.prod.yml down

# Limpiar imágenes antiguas (opcional)
read -p "¿Quieres limpiar imágenes Docker antiguas? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🧹 Limpiando imágenes antiguas..."
    docker system prune -f
fi

# Construir y levantar servicios
echo "🔨 Construyendo y levantando servicios..."
docker-compose -f docker-compose.prod.yml up --build -d

# Esperar a que los servicios estén listos
echo "⏳ Esperando a que los servicios estén listos..."
sleep 60

# Verificar el estado de los contenedores
echo "📊 Estado de los contenedores:"
docker-compose -f docker-compose.prod.yml ps

# Verificar logs del backend
echo "📋 Logs del backend:"
docker-compose -f docker-compose.prod.yml logs backend --tail=20

# Verificar conectividad
echo "🔍 Verificando conectividad..."
if curl -f http://localhost:8080/health &> /dev/null; then
    echo "✅ Backend está funcionando correctamente en http://localhost:8080"
else
    echo "❌ Backend no responde. Revisa los logs con:"
    echo "   docker-compose -f docker-compose.prod.yml logs backend"
fi

echo ""
echo "🎉 ¡Despliegue en VPS completado!"
echo ""
echo "📱 URLs de acceso:"
echo "   Backend API: http://localhost:8080 (interno)"
echo "   Health Check: http://localhost:8080/health"
echo "   PostgreSQL: localhost:5432 (interno)"
echo ""
echo "🔧 Comandos útiles:"
echo "   Ver logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "   Parar servicios: docker-compose -f docker-compose.prod.yml down"
echo "   Reiniciar: docker-compose -f docker-compose.prod.yml restart"
echo "   Ver estado: docker-compose -f docker-compose.prod.yml ps"
echo ""
echo "🌐 Para acceder desde internet, configura Nginx como proxy reverso"
