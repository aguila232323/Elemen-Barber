# 🚀 Despliegue en VPS - Esential Barber Backend

## 📋 Prerrequisitos

### 1. VPS configurado
- **Proveedor**: OVH Cloud (recomendado)
- **Sistema**: Ubuntu 25.04
- **Recursos**: 12GB RAM, 100GB SSD
- **Dominio**: Configurado y apuntando al VPS

### 2. Acceso al servidor
- SSH configurado
- Usuario con permisos sudo
- Firewall configurado

## 🎯 Pasos de Despliegue

### Paso 1: Preparar el servidor
```bash
# Conectar al VPS
ssh usuario@tu-ip-vps

# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependencias
sudo apt install -y curl wget git nano htop
```

### Paso 2: Configurar seguridad
```bash
# Crear usuario para la aplicación
sudo adduser deploy
sudo usermod -aG sudo deploy

# Configurar SSH (opcional pero recomendado)
sudo mkdir -p /home/deploy/.ssh
sudo chmod 700 /home/deploy/.ssh
sudo nano /home/deploy/.ssh/authorized_keys
# Pegar tu clave pública SSH

sudo chown -R deploy:deploy /home/deploy/.ssh
sudo chmod 600 /home/deploy/.ssh/authorized_keys

# Configurar firewall
sudo ufw allow OpenSSH
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### Paso 3: Instalar Docker
```bash
# Instalar Docker
curl -fsSL https://get.docker.com | sh

# Agregar usuario al grupo docker
sudo usermod -aG docker $USER
newgrp docker

# Verificar instalación
docker --version
docker-compose --version
```

### Paso 4: Clonar el repositorio
```bash
# Cambiar al usuario deploy
sudo su - deploy

# Clonar solo el backend
git clone https://github.com/tu-usuario/esential-barber-backend.git
cd esential-barber-backend
```

### Paso 5: Configurar variables de entorno
```bash
# Copiar archivo de ejemplo
cp env.example .env.prod

# Editar variables
nano .env.prod
```

**Variables importantes a configurar:**
- `POSTGRES_PASSWORD`: Contraseña fuerte para PostgreSQL
- `SPRING_DATASOURCE_PASSWORD`: Misma contraseña que POSTGRES_PASSWORD
- `CORS_ALLOWED_ORIGINS`: Tu dominio (ej: https://tu-dominio.com)
- `APP_FRONTEND_BASE_URL`: Tu dominio
- `APP_GOOGLE_REDIRECT_URI`: https://tu-dominio.com/auth/google/callback
- Credenciales de Google OAuth
- Credenciales de email

### Paso 6: Desplegar la aplicación
```bash
# Dar permisos al script
chmod +x deploy-vps.sh

# Ejecutar despliegue
./deploy-vps.sh
```

### Paso 7: Configurar Nginx
```bash
# Instalar Nginx
sudo apt install -y nginx

# Copiar configuración
sudo cp nginx-config.conf /etc/nginx/sites-available/esential-barber

# Editar dominio en la configuración
sudo nano /etc/nginx/sites-available/esential-barber
# Cambiar "tu-dominio.com" por tu dominio real

# Activar sitio
sudo ln -s /etc/nginx/sites-available/esential-barber /etc/nginx/sites-enabled/

# Probar configuración
sudo nginx -t

# Recargar Nginx
sudo systemctl reload nginx
```

### Paso 8: Configurar SSL con Let's Encrypt
```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtener certificado SSL
sudo certbot --nginx -d tu-dominio.com --redirect -m tu-email@correo.com --agree-tos --no-eff-email

# Verificar renovación automática
sudo certbot renew --dry-run
```

### Paso 9: Configurar backups (opcional)
```bash
# Crear script de backup
sudo mkdir -p /opt/backups
sudo nano /opt/backup_db.sh
```

Contenido del script de backup:
```bash
#!/bin/bash
DATE=$(date +%F_%H-%M)
docker exec -t $(docker ps -qf "name=esential-barber-db") pg_dump -U admin esentialbarber | gzip > /opt/backups/esentialbarber_$DATE.sql.gz
find /opt/backups -type f -mtime +7 -delete
```

```bash
# Dar permisos y configurar cron
sudo chmod +x /opt/backup_db.sh
(crontab -l 2>/dev/null; echo "0 3 * * * /opt/backup_db.sh") | crontab -
```

## 🔧 Comandos Útiles

### Gestión de la aplicación
```bash
# Ver logs
docker-compose -f docker-compose.prod.yml logs -f

# Reiniciar servicios
docker-compose -f docker-compose.prod.yml restart

# Parar servicios
docker-compose -f docker-compose.prod.yml down

# Ver estado
docker-compose -f docker-compose.prod.yml ps
```

### Gestión de Nginx
```bash
# Ver logs de Nginx
sudo tail -f /var/log/nginx/esential-barber-access.log
sudo tail -f /var/log/nginx/esential-barber-error.log

# Recargar configuración
sudo systemctl reload nginx

# Reiniciar Nginx
sudo systemctl restart nginx
```

### Gestión de SSL
```bash
# Renovar certificado manualmente
sudo certbot renew

# Ver certificados
sudo certbot certificates
```

## 🔄 Actualizaciones

### Actualizar la aplicación
```bash
cd /home/deploy/esential-barber-backend
git pull
./deploy-vps.sh
```

### Actualizar configuración
```bash
# Editar variables de entorno
nano .env.prod

# Reiniciar servicios
docker-compose -f docker-compose.prod.yml restart
```

## 🚨 Solución de Problemas

### Error: Puerto 8080 ocupado
```bash
# Ver qué usa el puerto
sudo netstat -tulpn | grep :8080

# Parar proceso
sudo kill -9 <PID>
```

### Error: Base de datos no conecta
```bash
# Ver logs de PostgreSQL
docker-compose -f docker-compose.prod.yml logs postgres

# Reiniciar solo la base de datos
docker-compose -f docker-compose.prod.yml restart postgres
```

### Error: Nginx no funciona
```bash
# Verificar configuración
sudo nginx -t

# Ver logs de error
sudo tail -f /var/log/nginx/error.log
```

## 📊 Monitoreo

### Verificar estado general
```bash
# Estado de contenedores
docker-compose -f docker-compose.prod.yml ps

# Uso de recursos
htop

# Espacio en disco
df -h

# Logs del sistema
sudo journalctl -f
```

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs: `docker-compose -f docker-compose.prod.yml logs -f`
2. Verifica el estado: `docker-compose -f docker-compose.prod.yml ps`
3. Revisa esta documentación
4. Contacta al equipo de desarrollo
