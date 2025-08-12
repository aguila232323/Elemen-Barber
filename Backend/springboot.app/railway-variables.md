# ========================================
# VARIABLES DE ENTORNO PARA RAILWAY
# ========================================

## 🚀 **Configuración del Backend en Railway**

### **Variables de Entorno Requeridas:**

#### **1. Base de Datos PostgreSQL**
```bash
# Railway proporciona estas variables automáticamente
PGHOST=your-postgres-host.railway.app
PGPORT=5432
PGDATABASE=railway
PGUSER=postgres
PGPASSWORD=your-postgres-password

# Mapear a variables de Spring Boot
SPRING_DATASOURCE_URL=jdbc:postgresql://${PGHOST}:${PGPORT}/${PGDATABASE}
SPRING_DATASOURCE_USERNAME=${PGUSER}
SPRING_DATASOURCE_PASSWORD=${PGPASSWORD}
```

#### **2. Configuración de la Aplicación**
```bash
SPRING_PROFILES_ACTIVE=prod
SERVER_PORT=${PORT:8080}
SPRING_JPA_HIBERNATE_DDL_AUTO=update
SPRING_JPA_SHOW_SQL=false
```

#### **3. Seguridad JWT**
```bash
JWT_SECRET=tu-super-secret-jwt-key-muy-largo-y-seguro
JWT_EXPIRATION=86400000
```

#### **4. Google OAuth**
```bash
GOOGLE_CLIENT_ID=tu-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-google-client-secret
APP_GOOGLE_REDIRECT_URI=https://tu-frontend-domain.com/auth/google/callback
```

#### **5. Configuración de Email**
```bash
# Para Gmail
SPRING_MAIL_HOST=smtp.gmail.com
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=tu-email@gmail.com
SPRING_MAIL_PASSWORD=tu-app-password

# Para SendGrid
SPRING_MAIL_HOST=smtp.sendgrid.net
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=apikey
SPRING_MAIL_PASSWORD=tu-sendgrid-api-key
```

#### **6. Frontend y CORS**
```bash
FRONTEND_URL=https://tu-frontend-domain.com
CORS_ALLOWED_ORIGINS=https://tu-frontend-domain.com,http://localhost:3000
```

## 🔧 **Configuración en Railway Dashboard:**

### **1. Ir a tu proyecto en Railway**
- Dashboard → Tu Proyecto → Variables

### **2. Agregar Variables de Entorno:**
```bash
# Base de Datos (automático de Railway)
SPRING_DATASOURCE_URL=jdbc:postgresql://${PGHOST}:${PGPORT}/${PGDATABASE}
SPRING_DATASOURCE_USERNAME=${PGUSER}
SPRING_DATASOURCE_PASSWORD=${PGPASSWORD}

# Aplicación
SPRING_PROFILES_ACTIVE=prod
SERVER_PORT=${PORT:8080}

# JWT
JWT_SECRET=tu-jwt-secret-muy-seguro-y-largo

# Google OAuth
GOOGLE_CLIENT_ID=tu-google-client-id
GOOGLE_CLIENT_SECRET=tu-google-client-secret
APP_GOOGLE_REDIRECT_URI=https://tu-frontend.com/auth/google/callback

# Email
SPRING_MAIL_HOST=smtp.gmail.com
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=tu-email@gmail.com
SPRING_MAIL_PASSWORD=tu-app-password

# Frontend
FRONTEND_URL=https://tu-frontend.com
CORS_ALLOWED_ORIGINS=https://tu-frontend.com,http://localhost:3000
```

### **3. Configurar Base de Datos:**
- Crear servicio PostgreSQL en Railway
- Railway proporcionará automáticamente las variables PGHOST, PGPORT, etc.
- Mapear estas variables a las de Spring Boot

### **4. Desplegar:**
- Conectar tu repositorio de GitHub
- Railway detectará automáticamente que es una aplicación Java
- Usará el Dockerfile para construir y desplegar

## 📝 **Notas Importantes:**

1. **JWT_SECRET**: Debe ser muy largo y seguro en producción
2. **Google OAuth**: Actualizar URLs de redirección en Google Cloud Console
3. **Email**: Usar app passwords para Gmail, no contraseñas normales
4. **CORS**: Solo permitir dominios de producción, no localhost
5. **Base de Datos**: Railway proporciona PostgreSQL automáticamente

## 🔍 **Verificación:**

Después del despliegue, verifica que:
- La aplicación responde en `/api/servicios`
- La base de datos se conecta correctamente
- Los emails se envían
- Google OAuth funciona
- CORS está configurado correctamente
