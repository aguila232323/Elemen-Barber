# 🚀 GUÍA DE DESPLIEGUE - FRONTEND EN NETLIFY

## 📋 PASOS PARA DESPLEGAR EN NETLIFY:

### 1. **Preparar el Repositorio:**
- Asegúrate de que tu código esté en GitHub
- El repositorio debe ser público o con acceso para Netlify

### 2. **Crear Variables de Entorno:**
En Netlify, ve a **Site settings > Environment variables** y agrega:

```bash
REACT_APP_API_URL=https://api.elemenbarber.com
REACT_APP_FRONTEND_URL=https://elemenbarber.com
REACT_APP_GOOGLE_REDIRECT_URI=https://elemenbarber.com/auth/google/callback
```

### 3. **Configurar Google OAuth:**
- Ve a [Google Cloud Console](https://console.cloud.google.com)
- En **Credentials > OAuth 2.0 Client IDs**
- Agrega la URL de redirección de Netlify:
  ```
  https://elemenbarber.com/auth/google/callback
  ```

### 4. **Desplegar en Netlify:**
- Ve a [netlify.com](https://netlify.com)
- Click en **"New site from Git"**
- Conecta tu repositorio de GitHub
- Configura:
  - **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Base directory**: `Front/esential-barber` (si tu repo tiene la estructura completa)
  - **Node version**: `18` o superior

### 5. **Configurar Dominio Personalizado (Opcional):**
- En Netlify, ve a **Domain management**
- Agrega tu dominio personalizado
- Configura los registros DNS según las instrucciones

## 🔧 CONFIGURACIÓN DEL BACKEND (RAILWAY):

### 1. **Variables de Entorno en Railway:**
```bash
FRONTEND_URL=https://your-netlify-app.netlify.app
CORS_ALLOWED_ORIGINS=https://your-netlify-app.netlify.app
```

### 2. **Verificar CORS:**
Asegúrate de que tu backend permita requests desde Netlify.

## ✅ VERIFICACIÓN:

1. **Frontend**: Debe cargar en Netlify
2. **Backend**: Debe responder desde Railway
3. **Google OAuth**: Debe funcionar con la nueva URL
4. **CORS**: No debe haber errores de CORS

## 🚨 PROBLEMAS COMUNES:

- **CORS errors**: Verifica las variables de entorno en Railway
- **Google OAuth**: Asegúrate de actualizar las URLs de redirección
- **Build fails**: Verifica que el comando de build sea correcto
- **API calls fail**: Verifica la URL del backend en las variables de entorno
