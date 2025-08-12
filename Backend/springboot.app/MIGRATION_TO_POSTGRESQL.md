# Migración de MySQL a PostgreSQL - EsentialBarber

Este documento contiene las instrucciones completas para migrar la aplicación EsentialBarber de MySQL a PostgreSQL.

## Prerrequisitos

1. **PostgreSQL instalado** en tu sistema
2. **Java 17** y **Maven** para compilar la aplicación
3. **Acceso a la base de datos MySQL** actual
4. **Herramientas de línea de comandos** (psql, mysqldump)

## Pasos de Migración

### 1. Preparar la Migración

#### Exportar datos de MySQL
```bash
# Ejecutar el script de exportación
export_mysql_data.bat
```

Este script exportará:
- Estructura de la base de datos
- Datos de la tabla `usuario`
- Datos de la tabla `servicio`
- Datos de la tabla `cita`
- Datos de la tabla `resenas`
- Datos de la tabla `portfolio`

### 2. Configurar PostgreSQL

#### Crear base de datos y tablas
```bash
# Ejecutar el script de configuración
setup_postgresql.bat
```

Este script:
- Crea la base de datos `EsentialBarber`
- Ejecuta el script de migración `migrate_to_postgresql.sql`
- Configura las tablas con la estructura correcta para PostgreSQL

### 3. Migrar Datos

#### Opción A: Migración automática
Si tienes los datos exportados en formato compatible, puedes usar:
```bash
# Conectar a PostgreSQL y ejecutar
psql -h localhost -U postgres -d EsentialBarber -f migrate_data_to_postgresql.sql
```

#### Opción B: Migración manual
1. Revisar los archivos exportados en `mysql_export/`
2. Convertir manualmente los datos si es necesario
3. Insertar los datos en PostgreSQL usando `psql`

### 4. Verificar la Migración

#### Comprobar tablas creadas
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

#### Verificar conteo de registros
```sql
SELECT 'Usuario' as tabla, COUNT(*) as registros FROM usuario
UNION ALL
SELECT 'Servicio', COUNT(*) FROM servicio
UNION ALL
SELECT 'Cita', COUNT(*) FROM cita
UNION ALL
SELECT 'Resenas', COUNT(*) FROM resenas
UNION ALL
SELECT 'Portfolio', COUNT(*) FROM portfolio;
```

## Cambios Realizados en el Código

### 1. Dependencias (pom.xml)
- ✅ Reemplazado `mysql-connector-java` por `postgresql`
- ✅ Actualizado el driver de base de datos

### 2. Configuración (application.properties)
- ✅ URL de conexión cambiada a PostgreSQL
- ✅ Driver class actualizado
- ✅ Dialecto de Hibernate cambiado a PostgreSQL
- ✅ Configuraciones específicas de MySQL removidas

### 3. Entidades JPA
- ✅ Removidas configuraciones específicas de MySQL (`CHARACTER SET utf8mb4`)
- ✅ Mantenida la funcionalidad de emojis (PostgreSQL soporta UTF-8 nativamente)

## Configuración de PostgreSQL

### Parámetros de Conexión
- **Host**: localhost
- **Puerto**: 3005 (Docker)
- **Base de datos**: ElemenBarber
- **Usuario**: root
- **Contraseña**: hola

### Configuración de la Base de Datos
- **Encoding**: UTF8
- **Collation**: en_US.UTF-8
- **Ctype**: en_US.UTF-8

## Ventajas de PostgreSQL

1. **Mejor soporte para tipos de datos complejos**
2. **Transacciones ACID robustas**
3. **Mejor rendimiento en consultas complejas**
4. **Soporte nativo para JSON**
5. **Mejor escalabilidad**
6. **Código abierto y comunidad activa**

## Solución de Problemas

### Error de Conexión
```bash
# Verificar que PostgreSQL esté ejecutándose
pg_ctl status -D /path/to/postgresql/data
```

### Error de Autenticación
```bash
# Verificar configuración de pg_hba.conf
# Asegurar que el usuario postgres tenga acceso local
```

### Error de Codificación
```bash
# Verificar que la base de datos esté creada con UTF8
psql -U postgres -c "SHOW server_encoding;"
```

## Próximos Pasos

1. **Probar la aplicación** con la nueva base de datos
2. **Verificar funcionalidades** críticas
3. **Optimizar consultas** si es necesario
4. **Configurar respaldos** de PostgreSQL
5. **Documentar** la nueva configuración

## Archivos de Migración

- `migrate_to_postgresql.sql` - Estructura de la base de datos
- `migrate_data_to_postgresql.sql` - Migración de datos
- `export_mysql_data.bat` - Exportación desde MySQL
- `setup_postgresql.bat` - Configuración de PostgreSQL
- `migrate_docker_postgresql.bat` - Migración específica para Docker
- `connect_docker_postgresql.bat` - Conexión directa al contenedor Docker

## Notas Importantes

- **Hacer respaldo** de la base de datos MySQL antes de migrar
- **Probar** en un entorno de desarrollo primero
- **Verificar** que todos los emojis se migren correctamente
- **Revisar** las consultas personalizadas que puedan usar sintaxis específica de MySQL

## Soporte

Si encuentras problemas durante la migración:
1. Revisar los logs de PostgreSQL
2. Verificar la conectividad de red
3. Comprobar permisos de usuario
4. Revisar la configuración de Spring Boot
