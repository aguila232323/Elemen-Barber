# Configuración de Google OAuth para Essential Barber

## ✅ Configuración completada

Las credenciales de Google OAuth han sido configuradas correctamente:

### Backend (application.properties)
```properties
google.client.id=127461189204-p16ctc72mp90hmedchmon1fbb8qjk905.apps.googleusercontent.com
google.client.secret=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
```

### Frontend (config/google.ts)
```typescript
export const GOOGLE_CLIENT_ID = '127461189204-p16ctc72mp90hmedchmon1fbb8qjk905.apps.googleusercontent.com';
```

## 🚀 Para probar la funcionalidad

1. **Inicia el backend:**
```bash
cd Backend/springboot.app
mvn spring-boot:run
```

2. **Inicia el frontend:**
```bash
cd Front/esential-barber
npm run dev
```

3. **Ve a la página de login** y haz clic en "Ingresar con Google"

## Funcionalidades implementadas

### ✅ Backend
- [x] Dependencias de Google OAuth agregadas
- [x] DTO para solicitudes de Google Auth
- [x] Servicio de autenticación con Google
- [x] Endpoint `/api/auth/google`
- [x] Verificación de tokens de Google
- [x] Creación automática de usuarios
- [x] Generación de JWT para usuarios de Google

### ✅ Frontend
- [x] Dependencia `@react-oauth/google` instalada
- [x] GoogleOAuthProvider configurado
- [x] Hook `useGoogleLogin` implementado
- [x] Botón de Google funcional
- [x] Manejo de errores
- [x] Integración con el contexto de autenticación

## Flujo de autenticación

1. **Usuario hace clic en "Ingresar con Google"**
2. **Google abre ventana de autenticación**
3. **Usuario autoriza la aplicación**
4. **Frontend recibe el token de acceso**
5. **Frontend obtiene información del usuario de Google**
6. **Frontend envía datos al backend**
7. **Backend verifica el token con Google**
8. **Backend busca o crea el usuario**
9. **Backend genera JWT**
10. **Frontend almacena el token y redirige**

## Notas importantes

- Los usuarios de Google se crean automáticamente con `isEmailVerified = true`
- La contraseña se establece como "GOOGLE_AUTH" para usuarios de Google
- El rol por defecto es "CLIENTE"
- La foto de perfil se obtiene de Google si está disponible

## Troubleshooting

### Error: "Token de Google inválido"
- Verifica que el Client ID esté correcto
- Asegúrate de que el dominio esté autorizado

### Error: "Error al iniciar sesión con Google"
- Verifica que el backend esté ejecutándose
- Revisa los logs del backend para más detalles

### Error: "GoogleOAuthProvider clientId is required"
- Asegúrate de que la variable de entorno esté configurada
- Verifica que el archivo `.env` esté en el directorio correcto 