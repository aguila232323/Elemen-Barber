# 🚀 Esential Barber - Backend API

## 📋 Descripción
Backend API para la aplicación de barbería Esential Barber desarrollada en Spring Boot.

## 🏗️ Arquitectura
- **Framework**: Spring Boot 3.5.3
- **Base de datos**: PostgreSQL 15
- **Caché**: ConcurrentMapCacheManager (en memoria)
- **Autenticación**: JWT + Google OAuth
- **Email**: SMTP (Gmail)

## 🚀 Despliegue en VPS

### Prerrequisitos
- Docker y Docker Compose instalados
- Dominio configurado
- Variables de entorno configuradas

### Despliegue rápido
```bash
# 1. Clonar solo el backend
git clone https://github.com/tu-usuario/esential-barber-backend.git
cd esential-barber-backend

# 2. Configurar variables de entorno
cp env.example .env.prod
nano .env.prod

# 3. Desplegar
docker compose -f docker-compose.prod.yml up -d --build
```

### Variables de entorno requeridas
Ver archivo `env.example` para todas las variables necesarias.

## 📁 Estructura del proyecto
```
springboot.app/
├── src/                    # Código fuente
├── pom.xml                # Dependencias Maven
├── Dockerfile             # Configuración Docker
├── docker-compose.prod.yml # Docker Compose para producción
├── env.example           # Variables de entorno de ejemplo
└── README.md              # Este archivo
```

## 🔧 Endpoints principales
- **Autenticación**: `/api/auth/**`
- **Servicios**: `/api/servicios`
- **Citas**: `/api/citas/**`
- **Reseñas**: `/api/resenas/**`
- **Usuarios**: `/api/usuarios/**`
- **Health**: `/health`

## 📞 Soporte
Para soporte técnico, contacta al equipo de desarrollo.
