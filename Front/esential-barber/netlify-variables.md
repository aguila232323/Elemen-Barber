# ========================================
# VARIABLES DE ENTORNO PARA NETLIFY
# ========================================

## 🌐 **Configuración del Frontend en Netlify**

### **Variables de Entorno Requeridas:**

#### **1. Configuración de la Aplicación**
```bash
REACT_APP_NAME=Elemen Barber
REACT_APP_VERSION=1.0.0
NODE_ENV=production
```

#### **2. URLs del Backend**
```bash
# URL de tu backend en Railway/Heroku/etc.
REACT_APP_API_URL=https://tu-backend-domain.railway.app

# URL local para desarrollo
REACT_APP_API_URL_LOCAL=http://localhost:8080
```

#### **3. Google OAuth**
```bash
REACT_APP_GOOGLE_CLIENT_ID=tu-google-client-id.apps.googleusercontent.com
REACT_APP_GOOGLE_REDIRECT_URI=https://tu-frontend-domain.netlify.app/auth/google/callback
```

#### **4. Configuración de CORS**
```bash
REACT_APP_CORS_ORIGINS=https://tu-frontend-domain.netlify.app,http://localhost:3000
```

#### **5. Analytics y Monitoreo (Opcional)**
```bash
REACT_APP_GA_TRACKING_ID=G-XXXXXXXXXX
REACT_APP_SENTRY_DSN=https://xxxxxxxxxxxxx@xxxxx.ingest.sentry.io/xxxxx
```

#### **6. Feature Flags**
```bash
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_SENTRY=true
REACT_APP_ENABLE_PWA=true
```

## 🔧 **Configuración en Netlify Dashboard:**

### **1. Ir a tu sitio en Netlify**
- Dashboard → Tu Sitio → Site settings → Environment variables

### **2. Agregar Variables de Entorno:**

#### **Variables de Producción:**
```bash
REACT_APP_API_URL=https://tu-backend-domain.railway.app
REACT_APP_GOOGLE_CLIENT_ID=tu-google-client-id
REACT_APP_GOOGLE_REDIRECT_URI=https://tu-frontend-domain.netlify.app/auth/google/callback
REACT_APP_CORS_ORIGINS=https://tu-frontend-domain.netlify.app
```

#### **Variables de Desarrollo (Opcional):**
```bash
REACT_APP_API_URL=http://localhost:8080
REACT_APP_GOOGLE_CLIENT_ID=tu-google-client-id
REACT_APP_GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
REACT_APP_CORS_ORIGINS=http://localhost:3000
```

### **3. Configurar Dominio Personalizado:**
- Site settings → Domain management
- Agregar tu dominio personalizado
- Configurar DNS según las instrucciones de Netlify

### **4. Configurar Build Settings:**
- Build command: `npm run build`
- Publish directory: `build`
- Node version: `18` (o la versión que uses)

## 📝 **Configuración en el Código:**

### **1. Crear archivo de configuración:**
```typescript
// src/config/environment.ts
export const config = {
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:8080',
  googleClientId: process.env.REACT_APP_GOOGLE_CLIENT_ID || '',
  googleRedirectUri: process.env.REACT_APP_GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback',
  corsOrigins: process.env.REACT_APP_CORS_ORIGINS || 'http://localhost:3000',
  enableAnalytics: process.env.REACT_APP_ENABLE_ANALYTICS === 'true',
  enableSentry: process.env.REACT_APP_ENABLE_SENTRY === 'true',
  enablePWA: process.env.REACT_APP_ENABLE_PWA === 'true',
};
```

### **2. Usar en componentes:**
```typescript
import { config } from '../config/environment';

// En lugar de URLs hardcodeadas
const apiUrl = config.apiUrl;
const googleClientId = config.googleClientId;
```

## 🔍 **Verificación del Despliegue:**

### **1. Build Exitoso:**
- Verificar que el build se completa sin errores
- Revisar logs de build en Netlify

### **2. Funcionalidad:**
- La aplicación se carga correctamente
- Las llamadas a la API funcionan
- Google OAuth funciona
- Las redirecciones funcionan

### **3. Variables de Entorno:**
- Verificar que las variables se cargan correctamente
- Usar `console.log(process.env)` temporalmente para debug

## 🚨 **Notas Importantes:**

1. **REACT_APP_**: Todas las variables deben empezar con `REACT_APP_`
2. **Google OAuth**: Actualizar URLs de redirección en Google Cloud Console
3. **CORS**: El backend debe permitir tu dominio de Netlify
4. **HTTPS**: Netlify proporciona HTTPS automáticamente
5. **Cache**: Las variables se cachean en build time

## 🔄 **Actualización de Variables:**

### **1. Cambiar Variables:**
- Ir a Environment variables en Netlify
- Modificar los valores
- Hacer un nuevo deploy (trigger manual o push a GitHub)

### **2. Deploy Automático:**
- Conectar tu repositorio de GitHub
- Cada push a main/master hará deploy automático
- Las variables se aplicarán en cada build

## 📱 **Configuración PWA (Opcional):**

Si quieres habilitar PWA:
```bash
REACT_APP_ENABLE_PWA=true
```

Y crear un `manifest.json` y `service-worker.js` en la carpeta `public/`.
