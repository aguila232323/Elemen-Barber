# 🚀 VARIABLES DE ENTORNO PARA NETLIFY

## 📋 **VARIABLES OBLIGATORIAS:**

### **Configuración de la API:**
```
REACT_APP_API_URL=https://api.elemenbarber.com
```

### **Configuración del Frontend:**
```
REACT_APP_FRONTEND_URL=https://elemenbarber.com
```

### **Configuración de Google OAuth:**
```
REACT_APP_GOOGLE_REDIRECT_URI=https://elemenbarber.com/auth/google/callback
```

## 🔧 **CÓMO CONFIGURARLAS EN NETLIFY:**

### **Paso 1: Ir a la configuración del sitio**
1. Ve a tu dashboard de Netlify
2. Selecciona tu sitio
3. Ve a **Site settings** → **Environment variables**

### **Paso 2: Agregar las variables**
Agrega cada variable una por una:

| Variable | Valor |
|----------|-------|
| `REACT_APP_API_URL` | `https://api.elemenbarber.com` |
| `REACT_APP_FRONTEND_URL` | `https://elemenbarber.com` |
| `REACT_APP_GOOGLE_REDIRECT_URI` | `https://elemenbarber.com/auth/google/callback` |

### **Paso 3: Configuración de build**
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Base directory**: `Front/esential-barber` (si tu repo tiene la estructura completa)

## 🌐 **CONFIGURACIÓN DE GOOGLE OAUTH:**

### **En Google Cloud Console:**
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto
3. Ve a **APIs & Services** → **Credentials**
4. Edita tu OAuth 2.0 Client ID
5. En **Authorized redirect URIs**, agrega:
   ```
   https://elemenbarber.com/auth/google/callback
   ```

## 🔍 **VERIFICACIÓN:**

### **Para verificar que las variables funcionan:**
1. Después de configurar las variables, haz un nuevo deploy
2. Abre las herramientas de desarrollador (F12)
3. Ve a la consola y verifica que no hay errores
4. Prueba el login con Google

## ⚠️ **IMPORTANTE:**

- **Todas las variables de entorno en React deben empezar con `REACT_APP_`**
- **Los cambios en las variables requieren un nuevo deploy**
- **Asegúrate de que el backend esté desplegado en Railway antes de probar**

## 🚀 **DESPUÉS DE CONFIGURAR:**

1. Haz commit y push de tus cambios
2. Netlify hará un deploy automático
3. Verifica que el sitio funcione correctamente
4. Prueba el login y las funcionalidades principales
