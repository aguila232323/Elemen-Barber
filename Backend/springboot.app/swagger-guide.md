# 🚀 Guía de Swagger UI - Documentación de la API

## 📋 ¿Qué es Swagger UI?

Swagger UI es una interfaz web interactiva que te permite:
- **Ver todos los endpoints** de tu API de forma visual
- **Probar los endpoints** directamente desde el navegador
- **Ver la documentación** de cada endpoint
- **Entender los parámetros** requeridos y opcionales
- **Ejecutar requests** sin necesidad de herramientas externas

## 🔧 Configuración realizada

### 1. Dependencias agregadas
- `springdoc-openapi-starter-webmvc-ui` para generar la documentación
- Configuración en `application.properties`
- Configuración de seguridad para permitir acceso a Swagger

### 2. Documentación agregada
- Anotaciones `@Tag` y `@Operation` en todos los controladores
- Configuración personalizada de OpenAPI
- Información de contacto y licencia

## 🌐 URLs de acceso

Una vez que inicies la aplicación con `mvn spring-boot:run`, podrás acceder a:

### 📖 **Swagger UI (Interfaz principal)**
```
http://localhost:8080/swagger-ui.html
```

### 📄 **Documentación JSON de la API**
```
http://localhost:8080/api-docs
```

### 🔍 **Especificación OpenAPI**
```
http://localhost:8080/v3/api-docs
```

## 📱 Cómo usar Swagger UI

### 1. **Navegar por los endpoints**
- Los endpoints están organizados por tags (Autenticación, Usuarios, Citas, etc.)
- Cada tag agrupa endpoints relacionados

### 2. **Probar endpoints de autenticación**
1. Ve a la sección **"Autenticación"**
2. Expande el endpoint `/api/auth/register`
3. Haz clic en **"Try it out"**
4. Completa el JSON con tus datos:
```json
{
  "nombre": "Tu Nombre",
  "email": "tu@email.com",
  "password": "tucontraseña"
}
```
5. Haz clic en **"Execute"**

### 3. **Hacer login**
1. Ve al endpoint `/api/auth/login`
2. Haz clic en **"Try it out"**
3. Completa con tus credenciales:
```json
{
  "email": "tu@email.com",
  "password": "tucontraseña"
}
```
4. Haz clic en **"Execute"**

### 4. **Probar otros endpoints**
- Los endpoints que requieren autenticación mostrarán un candado 🔒
- Para probarlos, necesitarás el token JWT (cuando implementes JWT)

## 🎯 Endpoints disponibles

### 🔐 **Autenticación**
- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión

### 👤 **Usuarios**
- `GET /api/usuarios/perfil` - Obtener perfil del usuario
- `GET /api/usuarios` - Listar todos los usuarios (admin)

### 📅 **Citas**
- `POST /api/citas` - Crear nueva cita
- `GET /api/citas/mis-citas` - Ver mis citas
- `DELETE /api/citas/{id}` - Cancelar cita
- `GET /api/citas/todas` - Ver todas las citas (admin)

### 🧪 **Pruebas**
- `GET /test` - Endpoint de prueba
- `GET /` - Página de inicio

## 🔧 Características de Swagger UI

### ✅ **Funcionalidades disponibles**
- ✅ Interfaz web interactiva
- ✅ Documentación automática de endpoints
- ✅ Ejemplos de requests
- ✅ Respuestas de ejemplo
- ✅ Organización por tags
- ✅ Búsqueda de endpoints
- ✅ Exportar documentación

### 🚀 **Ventajas**
- **Fácil de usar**: No necesitas herramientas externas
- **Documentación automática**: Se actualiza con el código
- **Testing integrado**: Prueba endpoints directamente
- **Colaboración**: Comparte la URL con tu equipo

## 🛠️ Personalización

### Cambiar información de la API
Edita `OpenApiConfig.java` para modificar:
- Título de la API
- Descripción
- Información de contacto
- Licencia
- Servidores

### Agregar más documentación
Usa estas anotaciones en tus controladores:
```java
@Tag(name = "Mi Tag", description = "Descripción del grupo")
@Operation(summary = "Resumen", description = "Descripción detallada")
@Parameter(name = "param", description = "Descripción del parámetro")
```

## 🎉 ¡Listo!

Ahora tienes una documentación completa y interactiva de tu API. Swagger UI te permitirá:
- Explorar todos los endpoints
- Probar la funcionalidad
- Compartir la documentación con tu equipo
- Desarrollar más rápido

¡Disfruta explorando tu API con Swagger UI! 🚀 