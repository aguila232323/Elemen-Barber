# Solución para Botón "Reenviar Código" No Funciona

## 🔍 Problema Identificado

**Síntoma:** El botón "Reenviar código" da error de conexión, pero el envío inicial funciona.

**Causa posible:** Problema de CORS, endpoint no accesible, o error en el frontend.

## 🛠️ Diagnóstico Paso a Paso

### **Paso 1: Verificar que el Backend esté ejecutándose**
```bash
# Verificar puerto 8080
netstat -an | findstr :8080

# Si no está corriendo, ejecutar:
mvn spring-boot:run
```

### **Paso 2: Probar endpoint manualmente**
```bash
# Usar el script de prueba
test-curl-simple.bat
```

### **Paso 3: Probar desde el navegador**
1. Abrir `test-frontend-verificacion.html` en el navegador
2. Hacer clic en "Probar Reenviar Código"
3. Verificar la consola del navegador (F12)

### **Paso 4: Verificar CORS**
El archivo `WebConfig.java` debe tener:
```java
registry.addMapping("/**")
    .allowedOrigins("http://localhost:5173")
    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
    .allowedHeaders("*");
```

## 🔧 Soluciones

### **Solución 1: Verificar CORS**
Si el problema es CORS, actualizar `WebConfig.java`:

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            .allowedOrigins("http://localhost:5173", "http://127.0.0.1:5173")
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true);
    }
}
```

### **Solución 2: Verificar endpoint en el controlador**
Asegúrate de que el endpoint existe en `VerificacionController.java`:

```java
@PostMapping("/reenviar-codigo")
public ResponseEntity<?> reenviarCodigoVerificacion(@RequestBody Map<String, String> request) {
    // ... código del endpoint
}
```

### **Solución 3: Verificar función en authService.ts**
Asegúrate de que la función esté correctamente exportada:

```typescript
export async function reenviarCodigoVerificacion(email) {
  const response = await fetch('http://localhost:8080/api/verificacion/reenviar-codigo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Error al reenviar código');
  }
  return await response.json();
}
```

## 🧪 Tests de Verificación

### **Test 1: Backend directo**
```bash
# En PowerShell
Invoke-RestMethod -Uri 'http://localhost:8080/api/verificacion/reenviar-codigo' -Method POST -Headers @{'Content-Type'='application/json'} -Body '{"email":"test@example.com"}'
```

### **Test 2: Frontend desde navegador**
1. Abrir `test-frontend-verificacion.html`
2. Verificar consola del navegador
3. Verificar respuesta del servidor

### **Test 3: Verificar logs del backend**
Revisar los logs del backend cuando se hace clic en "Reenviar código":
```bash
# En la consola donde está corriendo el backend
# Deberías ver logs de la petición
```

## 🚨 Errores Comunes y Soluciones

### **Error: "Failed to fetch"**
- **Causa:** Backend no está ejecutándose
- **Solución:** Ejecutar `mvn spring-boot:run`

### **Error: "CORS policy"**
- **Causa:** Configuración de CORS incorrecta
- **Solución:** Actualizar `WebConfig.java`

### **Error: "User not found"**
- **Causa:** El email no existe en la base de datos
- **Solución:** Usar un email que exista en la base de datos

### **Error: "User already verified"**
- **Causa:** El usuario ya está verificado
- **Solución:** Usar un usuario no verificado

## 📋 Checklist de Verificación

- [ ] Backend ejecutándose en puerto 8080
- [ ] Endpoint `/api/verificacion/reenviar-codigo` existe
- [ ] Configuración de CORS correcta
- [ ] Función `reenviarCodigoVerificacion` exportada
- [ ] Usuario existe en la base de datos
- [ ] Usuario no está verificado
- [ ] No hay errores en la consola del navegador
- [ ] No hay errores en los logs del backend

## 🎯 Resultado Esperado

Después de aplicar la solución:

- ✅ Botón "Reenviar código" funciona
- ✅ Email se envía correctamente
- ✅ No hay errores de CORS
- ✅ Respuesta exitosa del servidor

## 🔄 Comandos de Emergencia

```bash
# Reiniciar backend
mvn spring-boot:run

# Limpiar cache del navegador
Ctrl+Shift+R (hard refresh)

# Verificar puerto
netstat -an | findstr :8080
```

## 📝 Notas Importantes

- **Usar email válido** que exista en la base de datos
- **Verificar que el usuario no esté verificado**
- **Revisar logs del backend** para errores específicos
- **Probar con diferentes navegadores** si es necesario 