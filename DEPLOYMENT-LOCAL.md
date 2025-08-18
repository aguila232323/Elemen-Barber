# 🚀 Despliegue Local - Esential Barber

## 📋 Prerrequisitos

### 1. Instalar Docker
- **Windows**: Descargar Docker Desktop desde [docker.com](https://www.docker.com/products/docker-desktop)
- **macOS**: Descargar Docker Desktop desde [docker.com](https://www.docker.com/products/docker-desktop)
- **Linux**: Ejecutar `curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh`

### 2. Instalar Docker Compose
- **Windows/macOS**: Viene incluido con Docker Desktop
- **Linux**: `sudo apt-get install docker-compose` o `sudo yum install docker-compose`

### 3. Verificar instalación
```bash
docker --version
docker-compose --version
```

## 🎯 Despliegue Rápido

### Opción 1: Script automático (Recomendado)
```bash
# Dar permisos de ejecución
chmod +x deploy-local.sh

# Ejecutar despliegue
./deploy-local.sh
```

### Opción 2: Comandos manuales
```bash
# 1. Parar contenedores existentes
docker-compose down

# 2. Construir y levantar servicios
docker-compose up --build -d

# 3. Verificar estado
docker-compose ps

# 4. Ver logs
docker-compose logs -f
```

## 🔍 Verificación

### 1. Verificar servicios
```bash
# Estado de contenedores
docker-compose ps

# Logs del backend
docker-compose logs backend --tail=20
```

### 2. Probar endpoints
```bash
# Health check
curl http://localhost:8080/actuator/health

# API principal
curl http://localhost:8080/api/v1/health
```

### 3. Acceder a bases de datos
- **PostgreSQL**: `localhost:5432`
  - Usuario: `admin`
  - Contraseña: `admin123`
  - Base de datos: `esentialbarber`

## 🛠️ Comandos Útiles

### Gestión de contenedores
```bash
# Ver logs en tiempo real
docker-compose logs -f

# Reiniciar servicios
docker-compose restart

# Parar todos los servicios
docker-compose down

# Parar y eliminar volúmenes
docker-compose down -v
```

### Debugging
```bash
# Entrar al contenedor del backend
docker-compose exec backend sh

# Ver logs específicos
docker-compose logs backend --tail=50

# Ver uso de recursos
docker stats
```

### Limpieza
```bash
# Limpiar imágenes no utilizadas
docker system prune -f

# Limpiar volúmenes
docker volume prune -f

# Limpiar todo
docker system prune -a -f
```

## 🔧 Configuración

### Variables de entorno
Las variables están configuradas en `docker-compose.yml` para desarrollo local:

- **Base de datos**: PostgreSQL local
- **Caché**: En memoria (ConcurrentMapCacheManager)
- **CORS**: Configurado para localhost
- **Google OAuth**: Configurado para desarrollo

### Puertos utilizados
- **8080**: Backend Spring Boot
- **5432**: PostgreSQL

## 🚨 Solución de Problemas

### Error: Puerto ya en uso
```bash
# Ver qué usa el puerto
netstat -tulpn | grep :8080

# Parar proceso
sudo kill -9 <PID>
```

### Error: Permisos Docker
```bash
# Agregar usuario al grupo docker
sudo usermod -aG docker $USER

# Reiniciar sesión
newgrp docker
```

### Error: Memoria insuficiente
```bash
# Aumentar memoria en Docker Desktop
# Settings > Resources > Memory: 4GB mínimo
```

### Error: Base de datos no conecta
```bash
# Verificar logs de PostgreSQL
docker-compose logs postgres

# Reiniciar solo la base de datos
docker-compose restart postgres
```

## 📱 URLs de Acceso

- **Backend API**: http://localhost:8080
- **Health Check**: http://localhost:8080/actuator/health
- **Swagger UI**: http://localhost:8080/swagger-ui.html (si está configurado)

## 🔄 Actualización

Para actualizar el código:
```bash
# 1. Parar servicios
docker-compose down

# 2. Reconstruir con nuevo código
docker-compose up --build -d

# 3. Verificar
docker-compose ps
```

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs: `docker-compose logs -f`
2. Verifica el estado: `docker-compose ps`
3. Revisa este documento
4. Contacta al equipo de desarrollo
