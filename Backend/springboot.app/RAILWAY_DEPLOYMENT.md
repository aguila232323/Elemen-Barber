# 🚀 GUÍA DE DESPLIEGUE - BACKEND EN RAILWAY

## 📋 PASOS PARA DESPLEGAR EN RAILWAY:

### 1. **Preparar el Repositorio:**
- Asegúrate de que tu código esté en GitHub
- El repositorio debe ser público o con acceso para Railway

### 2. **Crear Proyecto en Railway:**
- Ve a [railway.app](https://railway.app)
- Click en **"New Project"**
- Selecciona **"Deploy from GitHub repo"**
- Conecta tu repositorio de GitHub

### 3. **Configurar Variables de Entorno:**
Railway detectará automáticamente que es una app Java/Spring Boot y configurará:
- `DATABASE_URL`
- `PGUSER`
- `PGPASSWORD`
- `PORT`

### 4. **Variables de Entorno Adicionales:**
Agrega estas variables en Railway:

```bash
# Frontend URLs
FRONTEND_URL=https://elemenbarber.com
FRONTEND_URL_LOCAL=http://localhost:3000

# CORS Configuration
CORS_ALLOWED_ORIGINS=https://elemenbarber.com,http://localhost:3000

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Google OAuth
GOOGLE_CLIENT_ID=861425306153-5odf703ho7dt8at2r5jqpu2t9ei0iakg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
APP_GOOGLE_REDIRECT_URI=https://elemenbarber.com/auth/google/callback

# Email Configuration
SPRING_MAIL_USERNAME=elemenbarber@gmail.com
SPRING_MAIL_PASSWORD=psqv hxns rxhi eoue

# Admin Configuration
ADMIN_EMAIL=elemenbarber@gmail.com
ADMIN_GOOGLE_CALENDAR_ENABLED=true
```

### 5. **Configurar Base de Datos:**
- Railway creará automáticamente una base de datos PostgreSQL
- Las migraciones se ejecutarán automáticamente con `ddl-auto=update`

### 6. **Desplegar:**
- Railway detectará automáticamente el `Dockerfile` o `pom.xml`
- El build se ejecutará automáticamente
- La app estará disponible en la URL que Railway proporcione

## 🔧 CONFIGURACIÓN AUTOMÁTICA:

Railway detectará automáticamente:
- **Java/Spring Boot** desde el `pom.xml`
- **Base de datos PostgreSQL** y creará las variables necesarias
- **Puerto** y lo configurará automáticamente
- **Build process** basado en el `Dockerfile` o `pom.xml`

## ✅ VERIFICACIÓN:

1. **Health Check**: `/actuator/health` debe responder
2. **Base de Datos**: Las tablas deben crearse automáticamente
3. **API**: Los endpoints deben responder desde la URL de Railway
4. **Logs**: Revisa los logs en Railway para verificar el startup

## 🚨 PROBLEMAS COMUNES:

- **Build fails**: Verifica que el `pom.xml` esté correcto
- **Database connection**: Verifica que las variables de entorno estén configuradas
- **Port issues**: Railway configura automáticamente el puerto
- **Memory issues**: Railway asigna recursos automáticamente

## 📱 CONECTAR CON FRONTEND:

Una vez desplegado, actualiza las variables de entorno en Netlify con la URL de Railway:
```bash
REACT_APP_API_URL=https://api.elemenbarber.com
```
