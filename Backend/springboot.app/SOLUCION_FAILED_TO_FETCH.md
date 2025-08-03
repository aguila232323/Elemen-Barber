# Solución para Error "Failed to Fetch"

## 🔍 Diagnóstico del Problema

El error "Failed to fetch" indica que el frontend no puede conectarse al backend. Esto puede deberse a varios factores:

### 1. **Backend no está ejecutándose**
```bash
# Verificar si el backend está corriendo
netstat -an | findstr :8080

# Si no está corriendo, ejecutar:
mvn spring-boot:run
```

### 2. **Puerto incorrecto**
- Backend debe estar en puerto 8080
- Frontend debe estar en puerto 5173 (Vite por defecto)

### 3. **Problemas de CORS**
- Verificar que WebConfig.java esté configurado correctamente
- El backend debe permitir requests desde `http://localhost:5173`

## 🛠️ Solución Paso a Paso

### **Paso 1: Verificar que el Backend esté ejecutándose**

```bash
# En la carpeta Backend/springboot.app
mvn spring-boot:run
```

**Deberías ver algo como:**
```
Started PeluqueriaApplication in X.XXX seconds
```

### **Paso 2: Probar endpoints manualmente**

```bash
# Probar si el servidor responde
curl -X GET http://localhost:8080/api-docs

# Probar endpoint de reenvío
curl -X POST http://localhost:8080/api/verificacion/reenviar-codigo \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### **Paso 3: Verificar configuración de CORS**

El archivo `WebConfig.java` debe tener:

```java
registry.addMapping("/**")
    .allowedOrigins("http://localhost:5173")
    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
    .allowedHeaders("*");
```

### **Paso 4: Verificar URLs en el Frontend**

En `authService.ts`, todas las URLs deben apuntar a `http://localhost:8080`:

```typescript
const response = await fetch('http://localhost:8080/api/verificacion/reenviar-codigo', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ email }),
});
```

## 🧪 Scripts de Prueba

### **1. Diagnóstico completo:**
```bash
# Ejecutar el script de diagnóstico
diagnostico-backend.bat
```

### **2. Prueba específica de reenvío:**
```bash
# Ejecutar el script de prueba
test-verificacion.bat
```

## 🔧 Soluciones Comunes

### **Problema 1: Backend no inicia**
```bash
# Verificar que Java esté instalado
java -version

# Limpiar y recompilar
mvn clean compile
mvn spring-boot:run
```

### **Problema 2: Puerto ocupado**
```bash
# Verificar qué está usando el puerto 8080
netstat -ano | findstr :8080

# Matar el proceso si es necesario
taskkill /PID [PID_NUMBER] /F
```

### **Problema 3: CORS errors**
- Verificar que el frontend esté en `http://localhost:5173`
- Verificar que WebConfig.java esté configurado correctamente
- Reiniciar tanto frontend como backend

### **Problema 4: Database connection**
- Verificar que MySQL esté ejecutándose
- Verificar credenciales en `application.properties`

## 📋 Checklist de Verificación

- [ ] Backend ejecutándose en puerto 8080
- [ ] Frontend ejecutándose en puerto 5173
- [ ] MySQL ejecutándose
- [ ] Configuración de CORS correcta
- [ ] URLs en authService.ts correctas
- [ ] No hay errores en la consola del navegador
- [ ] No hay errores en los logs del backend

## 🚨 Errores Comunes y Soluciones

### **Error: "Connection refused"**
- Backend no está ejecutándose
- Puerto 8080 está ocupado

### **Error: "CORS policy"**
- Configuración de CORS incorrecta
- Frontend en puerto diferente

### **Error: "Database connection"**
- MySQL no está ejecutándose
- Credenciales incorrectas

### **Error: "Email not sent"**
- Configuración SMTP incorrecta
- App password de Gmail incorrecto

## 🎯 Verificación Final

1. **Ejecutar backend:** `mvn spring-boot:run`
2. **Ejecutar frontend:** `npm run dev`
3. **Abrir navegador:** `http://localhost:5173`
4. **Probar registro:** Crear cuenta nueva
5. **Probar reenvío:** Hacer clic en "Reenviar código"

Si todo funciona, deberías ver:
- ✅ Email enviado correctamente
- ✅ Código de verificación recibido
- ✅ Verificación exitosa
- ✅ Login automático después de verificar 