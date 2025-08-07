# Cambio de Horario - Sábados

## Resumen de Cambios

Se ha modificado el horario de los sábados para permitir una cita adicional desde las **14:15 hasta las 15:00**.

## Cambios Realizados

### 1. Modificación en `CitaController.java`

#### Endpoint `/disponibilidad`
- **Antes**: Los sábados cerraban a las 14:15 para usuarios normales
- **Ahora**: Los sábados permiten citas hasta las 15:00 para usuarios normales

#### Endpoint `/disponibilidad-mes`
- **Antes**: Los sábados cerraban a las 14:15 para usuarios normales
- **Ahora**: Los sábados permiten citas hasta las 15:00 para usuarios normales

### 2. Horarios Actualizados

#### Tramos de Trabajo
- **Primer tramo**: 9:00 - 15:00 (antes era 9:00 - 14:15)
- **Segundo tramo**: 16:00 - 21:15 (sin cambios)

#### Slots Disponibles los Sábados
- **Usuarios normales**: 9:00, 9:45, 10:30, 11:15, 12:00, 12:45, 13:30, 14:15
- **Administradores**: Todos los slots normales + 8:15 y 21:15

### 3. Lógica de Restricciones

```java
// Antes
if (diaSemana == DayOfWeek.SATURDAY && slotInicio.isAfter(LocalTime.of(14, 15))) {
    continue; // Saltar este slot si es sábado por la tarde
}

// Ahora
if (diaSemana == DayOfWeek.SATURDAY && slotInicio.isAfter(LocalTime.of(15, 0))) {
    continue; // Saltar este slot si es sábado después de las 15:00
}
```

## Beneficios

1. **Más disponibilidad**: Una cita adicional los sábados
2. **Horario extendido**: Los sábados ahora tienen 6 horas de trabajo (9:00-15:00)
3. **Consistencia**: Los cambios se aplican tanto a usuarios normales como administradores
4. **Flexibilidad**: Los administradores mantienen acceso a horarios especiales

## Verificación

Para verificar que los cambios funcionan correctamente:

1. **Reiniciar el backend**
2. **Probar reserva de cita** para un sábado a las 14:15
3. **Verificar que no se pueden reservar** citas después de las 15:00 los sábados
4. **Ejecutar el script SQL** `VERIFICAR_HORARIOS_SABADO.sql` para ver el estado actual

## Archivos Modificados

- `Backend/springboot.app/src/main/java/com/pomelo/app/springboot/app/controller/CitaController.java`
- `Backend/springboot.app/VERIFICAR_HORARIOS_SABADO.sql` (nuevo)
- `Backend/springboot.app/CAMBIO_HORARIO_SABADO.md` (nuevo)

## Notas Importantes

- Los cambios solo afectan a usuarios normales
- Los administradores mantienen acceso completo a todos los horarios
- No se afectan las citas existentes
- El cambio es inmediato y no requiere migración de datos 