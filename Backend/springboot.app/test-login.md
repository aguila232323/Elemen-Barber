# Instrucciones para probar el login

## 1. Iniciar la aplicación
```bash
mvn spring-boot:run
```

## 2. Verificar que la aplicación está funcionando
- Abrir: http://localhost:8080/test
- Deberías ver: "¡La aplicación está funcionando correctamente!"

## 3. Registrar un usuario
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Usuario Test",
    "email": "test@example.com",
    "password": "password123"
  }'
```

## 4. Hacer login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## 5. Verificar la base de datos H2
- Abrir: http://localhost:8080/h2-console
- JDBC URL: jdbc:h2:mem:testdb
- Username: sa
- Password: password

## Problemas comunes y soluciones:

### Si el login falla:
1. Verificar que el usuario existe en la base de datos
2. Verificar que la contraseña está encriptada correctamente
3. Revisar los logs de la aplicación para errores

### Si la aplicación no inicia:
1. Verificar que el puerto 8080 está libre
2. Verificar que todas las dependencias están instaladas
3. Revisar los logs de Maven para errores de compilación 