# EsentialBarber Backend

## Ejecutar el backend

```bash
# En PowerShell
cmd /c "mvnw.cmd spring-boot:run"
```

## Endpoints principales

- `GET /api/usuarios/perfil` - Obtener perfil
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/servicios` - Listar servicios
- `GET /api/citas` - Listar citas
- `POST /api/citas` - Crear cita

## Base de datos

MySQL en puerto 3306, base de datos `EsentialBarber` 