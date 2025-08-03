# Pruebas de Verificación de Email

## Escenario de Prueba

### 1. Registrar un usuario nuevo
```bash
POST http://localhost:8080/api/auth/register
Content-Type: application/json

{
  "nombre": "Usuario Test",
  "email": "test@example.com",
  "password": "password123",
  "telefono": "123456789"
}
```

**Respuesta esperada:**
```json
{
  "message": "Usuario registrado correctamente. Se ha enviado un código de verificación a tu email.",
  "requiresVerification": true,
  "usuario": { ... }
}
```

### 2. Intentar login sin verificar (DEBE FALLAR)
```bash
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

**Respuesta esperada:**
```json
{
  "error": "EMAIL_NOT_VERIFIED",
  "message": "Tu cuenta no está verificada. Por favor, verifica tu correo electrónico antes de iniciar sesión."
}
```

### 3. Reenviar código de verificación
```bash
POST http://localhost:8080/api/verificacion/reenviar-codigo
Content-Type: application/json

{
  "email": "test@example.com"
}
```

**Respuesta esperada:**
```json
{
  "message": "Código de verificación reenviado correctamente"
}
```

### 4. Verificar código (usar código recibido por email)
```bash
POST http://localhost:8080/api/verificacion/verificar-codigo
Content-Type: application/json

{
  "email": "test@example.com",
  "codigo": "123456"
}
```

**Respuesta esperada:**
```json
{
  "message": "Email verificado correctamente"
}
```

### 5. Intentar login después de verificar (DEBE FUNCIONAR)
```bash
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

**Respuesta esperada:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Pruebas en Frontend

### 1. Abrir la aplicación en el navegador
```bash
cd Front/esential-barber
npm run dev
```

### 2. Flujo de prueba:
1. **Registrar usuario** con email válido
2. **Cerrar pestaña** de verificación
3. **Intentar login** con el usuario registrado
4. **Verificar que aparezca** el componente de verificación
5. **Reenviar código** y verificar que llegue al email
6. **Ingresar código** y verificar login automático

## Verificación de Errores

### Error de credenciales incorrectas
```bash
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "passwordincorrecta"
}
```

**Respuesta esperada:**
```json
{
  "error": "Credenciales incorrectas"
}
```

### Error de usuario no encontrado
```bash
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "email": "noexiste@example.com",
  "password": "password123"
}
```

**Respuesta esperada:**
```json
{
  "error": "Usuario no encontrado"
}
```

## Comandos para Ejecutar Pruebas

### Backend
```bash
cd Backend/springboot.app
mvn spring-boot:run
```

### Frontend
```bash
cd Front/esential-barber
npm run dev
```

## Resultados Esperados

✅ **Usuario no verificado** → Error específico `EMAIL_NOT_VERIFIED`
✅ **Usuario verificado** → Login exitoso con token
✅ **Credenciales incorrectas** → Error genérico
✅ **Frontend muestra** componente de verificación cuando corresponde
✅ **Reenvío de código** funciona correctamente
✅ **Verificación exitosa** → Login automático 