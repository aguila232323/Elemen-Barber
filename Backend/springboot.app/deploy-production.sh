#!/bin/bash

# ========================================
# SCRIPT DE DESPLIEGUE PARA PRODUCCIÓN
# ========================================

set -e  # Salir en caso de error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Verificar dependencias
check_dependencies() {
    log "Verificando dependencias..."
    
    if ! command -v docker &> /dev/null; then
        error "Docker no está instalado"
        exit 1
    fi
    
    if ! command -v mvn &> /dev/null; then
        error "Maven no está instalado"
        exit 1
    fi
    
    if ! command -v java &> /dev/null; then
        error "Java no está instalado"
        exit 1
    fi
    
    success "Todas las dependencias están instaladas"
}

# Limpiar build anterior
clean_build() {
    log "Limpiando build anterior..."
    mvn clean
    success "Build anterior limpiado"
}

# Ejecutar tests
run_tests() {
    log "Ejecutando tests..."
    if mvn test; then
        success "Tests ejecutados correctamente"
    else
        error "Los tests fallaron"
        exit 1
    fi
}

# Construir aplicación
build_app() {
    log "Construyendo aplicación..."
    if mvn package -DskipTests; then
        success "Aplicación construida correctamente"
    else
        error "Error al construir la aplicación"
        exit 1
    fi
}

# Construir imagen Docker
build_docker_image() {
    log "Construyendo imagen Docker..."
    if docker build -t elemen-barber:latest .; then
        success "Imagen Docker construida correctamente"
    else
        error "Error al construir imagen Docker"
        exit 1
    fi
}

# Verificar imagen Docker
verify_docker_image() {
    log "Verificando imagen Docker..."
    
    # Verificar que la imagen existe
    if ! docker image inspect elemen-barber:latest &> /dev/null; then
        error "La imagen Docker no se construyó correctamente"
        exit 1
    fi
    
    # Verificar tamaño de la imagen
    IMAGE_SIZE=$(docker image inspect elemen-barber:latest --format='{{.Size}}')
    log "Tamaño de la imagen: $IMAGE_SIZE bytes"
    
    success "Imagen Docker verificada correctamente"
}

# Ejecutar health check local
run_health_check() {
    log "Ejecutando health check local..."
    
    # Iniciar contenedor temporal
    CONTAINER_ID=$(docker run -d -p 8080:8080 --env-file env.production.enhanced elemen-barber:latest)
    
    # Esperar a que la aplicación esté lista
    log "Esperando a que la aplicación esté lista..."
    sleep 30
    
    # Verificar health check
    if curl -f http://localhost:8080/health &> /dev/null; then
        success "Health check exitoso"
    else
        error "Health check falló"
        docker logs $CONTAINER_ID
        docker stop $CONTAINER_ID
        docker rm $CONTAINER_ID
        exit 1
    fi
    
    # Detener contenedor temporal
    docker stop $CONTAINER_ID
    docker rm $CONTAINER_ID
    
    success "Health check local completado"
}

# Crear backup de la base de datos
create_database_backup() {
    log "Creando backup de la base de datos..."
    
    # Crear directorio de backups si no existe
    mkdir -p backups
    
    # Crear backup con timestamp
    BACKUP_FILE="backups/elemen-barber-$(date +'%Y%m%d-%H%M%S').sql"
    
    if pg_dump $DATABASE_URL > "$BACKUP_FILE"; then
        success "Backup creado: $BACKUP_FILE"
    else
        warning "No se pudo crear backup de la base de datos"
    fi
}

# Desplegar en producción
deploy_production() {
    log "Desplegando en producción..."
    
    # Aquí puedes agregar la lógica específica para tu plataforma
    # Por ejemplo, para Railway, Heroku, AWS, etc.
    
    if [ "$DEPLOY_PLATFORM" = "railway" ]; then
        log "Desplegando en Railway..."
        # railway up
    elif [ "$DEPLOY_PLATFORM" = "heroku" ]; then
        log "Desplegando en Heroku..."
        # heroku container:push web
        # heroku container:release web
    else
        log "Plataforma de despliegue no especificada"
        log "Para desplegar manualmente:"
        log "1. Sube la imagen a tu registro: docker push tu-registro/elemen-barber:latest"
        log "2. Despliega en tu plataforma usando la imagen"
    fi
    
    success "Despliegue completado"
}

# Función principal
main() {
    log "Iniciando despliegue de producción..."
    
    # Verificar variables de entorno
    if [ -z "$DEPLOY_PLATFORM" ]; then
        warning "DEPLOY_PLATFORM no está definida, usando despliegue manual"
    fi
    
    if [ -z "$DATABASE_URL" ]; then
        warning "DATABASE_URL no está definida, saltando backup de BD"
    fi
    
    # Ejecutar pasos de despliegue
    check_dependencies
    clean_build
    run_tests
    build_app
    build_docker_image
    verify_docker_image
    run_health_check
    
    if [ ! -z "$DATABASE_URL" ]; then
        create_database_backup
    fi
    
    deploy_production
    
    success "Despliegue completado exitosamente!"
    log "La aplicación está lista para producción"
}

# Ejecutar función principal
main "$@"
