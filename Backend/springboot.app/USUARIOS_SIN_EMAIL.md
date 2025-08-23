# Funcionalidad para Usuarios Sin Email

## Descripción

Esta funcionalidad permite al administrador crear usuarios con solo nombre y campos opcionales, especialmente diseñada para personas mayores que no tienen email ni móvil.

## Características

### 1. Creación de Usuarios por Admin

**Endpoint:** `POST /api/auth/create-user`

**Permisos:** Solo administradores

**Campos requeridos:**
- `nombre` (obligatorio)

**Campos opcionales:**
- `email` (opcional)
- `password` (opcional - se genera automáticamente si no se proporciona)
- `telefono` (opcional)
- `rol` (opcional - por defecto "CLIENTE")

**Ejemplo de uso:**
```json
{
  "nombre": "Juan Pérez",
  "email": null,
  "password": null,
  "telefono": "612345678",
  "rol": "CLIENTE"
}
```

**Respuesta exitosa:**
```json
{
  "message": "Usuario creado exitosamente",
  "usuario": {
    "id": 123,
    "nombre": "Juan Pérez",
    "email": null,
    "telefono": "612345678",
    "rol": "CLIENTE",
    "emailVerificado": true
  }
}
```

### 2. Gestión de Recordatorios

#### Usuarios con Email
- Los recordatorios se envían automáticamente por email
- Confirmaciones de cita se envían por email

#### Usuarios sin Email
- Los recordatorios NO se envían automáticamente
- Se registra en los logs que el usuario no tiene email
- El administrador debe gestionar los recordatorios manualmente

### 3. Endpoints de Gestión

#### Obtener Usuarios Sin Email
**Endpoint:** `GET /api/usuarios/sin-email`

**Permisos:** Solo administradores

**Respuesta:**
```json
{
  "usuarios": [
    {
      "id": 123,
      "nombre": "Juan Pérez",
      "telefono": "612345678",
      "rol": "CLIENTE"
    }
  ],
  "total": 1,
  "message": "Usuarios sin email obtenidos correctamente"
}
```

#### Obtener Citas de Usuarios Sin Email
**Endpoint:** `GET /api/citas/sin-email`

**Permisos:** Solo administradores

**Respuesta:**
```json
{
  "citas": [
    {
      "id": 456,
      "clienteNombre": "Juan Pérez",
      "clienteId": 123,
      "clienteTelefono": "612345678",
      "servicioNombre": "Corte de pelo",
      "fechaHora": "2024-01-15T10:00:00",
      "estado": "confirmada",
      "comentario": "Cliente mayor",
      "recordatorioEnviado": false
    }
  ],
  "total": 1,
  "message": "Citas de usuarios sin email obtenidas correctamente"
}
```

## Consideraciones Importantes

### 1. Autenticación
- Los usuarios sin email NO pueden iniciar sesión a través del sistema normal
- Se requiere un sistema de autenticación alternativo (por ejemplo, por teléfono o gestión manual)

### 2. Recordatorios
- Los recordatorios automáticos NO funcionan para usuarios sin email
- El administrador debe revisar regularmente las citas de usuarios sin email
- Se recomienda establecer un proceso manual de recordatorios (llamadas telefónicas)

### 3. Base de Datos
- Se ha creado una migración (`V21__make_email_nullable.sql`) para hacer el campo email nullable
- Los usuarios sin email tienen `emailVerificado = true` por defecto

### 4. Logs
El sistema registra en los logs cuando un usuario sin email tiene una cita:
```
⚠️ Cliente sin email - No se puede enviar recordatorio por email
👤 Cliente: Juan Pérez (ID: 123)
📅 Cita programada para: 2024-01-15T10:00:00
📋 Servicio: Corte de pelo
ℹ️ El recordatorio deberá ser gestionado manualmente por el administrador
```

## Recomendaciones de Uso

1. **Crear usuarios sin email solo cuando sea necesario** (personas mayores sin tecnología)
2. **Anotar el teléfono** cuando esté disponible para contactos manuales
3. **Revisar diariamente** las citas de usuarios sin email
4. **Establecer un proceso manual** de recordatorios (llamadas telefónicas)
5. **Considerar agregar un campo de contacto alternativo** en el futuro

## Migración de Base de Datos

La migración `V21__make_email_nullable.sql` debe ejecutarse para habilitar esta funcionalidad:

```sql
-- Modificar la columna email para permitir valores NULL
ALTER TABLE usuario MODIFY COLUMN email VARCHAR(100) NULL;
```

Esta migración es segura y no afecta a los usuarios existentes con email.
