#!/bin/bash

# Script de backup automático para PostgreSQL en Docker
# Autor: Sistema de Backup Automático
# Fecha: $(date)

# Configuración
BACKUP_DIR="/home/backups"
CONTAINER_NAME="elemen-barber-db"
DB_NAME="elemenbarber"
DB_USER="admin"
DB_PASSWORD="ElemenBarber2024!"
RETENTION_DAYS=15

# Crear directorio de backup si no existe
mkdir -p $BACKUP_DIR

# Generar nombre del archivo con timestamp
BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql.gz"

# Ruta completa del archivo
FULL_BACKUP_PATH="$BACKUP_DIR/$BACKUP_FILE"

# Log del inicio
echo "$(date): Iniciando backup de la base de datos..." >> $BACKUP_DIR/backup.log

# Verificar que el contenedor esté ejecutándose
if ! docker ps | grep -q $CONTAINER_NAME; then
    echo "$(date): ERROR - El contenedor $CONTAINER_NAME no está ejecutándose" >> $BACKUP_DIR/backup.log
    exit 1
fi

# Realizar el backup
if PGPASSWORD=$DB_PASSWORD docker exec $CONTAINER_NAME pg_dump -U $DB_USER -d $DB_NAME | gzip > $FULL_BACKUP_PATH; then
    echo "$(date): Backup completado exitosamente: $BACKUP_FILE" >> $BACKUP_DIR/backup.log
    
    # Obtener tamaño del archivo
    FILE_SIZE=$(du -h $FULL_BACKUP_PATH | cut -f1)
    echo "$(date): Tamaño del backup: $FILE_SIZE" >> $BACKUP_DIR/backup.log
    
    # Limpiar backups antiguos (más de RETENTION_DAYS días)
    find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete
    echo "$(date): Limpieza de backups antiguos completada" >> $BACKUP_DIR/backup.log
    
else
    echo "$(date): ERROR - Fallo al realizar el backup" >> $BACKUP_DIR/backup.log
    exit 1
fi

echo "$(date): Proceso de backup finalizado" >> $BACKUP_DIR/backup.log
echo "----------------------------------------" >> $BACKUP_DIR/backup.log
