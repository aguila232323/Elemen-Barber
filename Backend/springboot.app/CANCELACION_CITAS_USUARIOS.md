# Funcionalidad de Cancelación de Citas para Usuarios Normales

## Descripción
Se ha implementado la funcionalidad para que los usuarios normales puedan cancelar sus propias citas, con la restricción de que la cancelación debe realizarse al menos 2 horas antes de la hora de la cita.

## Cambios Realizados

### Backend (Spring Boot)

#### 1. Modificación en `CitaService.java`
- **Archivo**: `src/main/java/com/pomelo/app/springboot/app/service/CitaService.java`
- **Método**: `cancelarCita(Long citaId)`
- **Cambios**:
  - Se agregó validación de tiempo mínimo de 2 horas antes de la cita
  - Se calcula la diferencia de tiempo entre la fecha actual y la fecha de la cita
  - Si la diferencia es menor a 2 horas, se lanza una excepción con mensaje descriptivo

```java
// Validar que la cancelación sea al menos 2 horas antes de la cita
LocalDateTime ahora = LocalDateTime.now();
LocalDateTime fechaCita = cita.getFechaHora();
long horasAntes = java.time.temporal.ChronoUnit.HOURS.between(ahora, fechaCita);

if (horasAntes < 2) {
    throw new RuntimeException("No se pueden cancelar citas con menos de 2 horas de antelación");
}
```

#### 2. Endpoint Existente
- **Endpoint**: `DELETE /api/citas/{id}`
- **Funcionalidad**: Ya existía y permite cancelar citas
- **Autenticación**: Requiere token JWT válido
- **Autorización**: Cualquier usuario autenticado puede cancelar sus propias citas

### Frontend (React + TypeScript)

#### 1. Modificaciones en `Citas.tsx`
- **Archivo**: `Front/esential-barber/src/pages/user/Citas/Citas.tsx`

#### Estados Agregados:
```typescript
const [cancelandoCita, setCancelandoCita] = useState<number | null>(null);
const [errorCancelacion, setErrorCancelacion] = useState('');
const [showCancelModal, setShowCancelModal] = useState(false);
const [citaACancelar, setCitaACancelar] = useState<Cita | null>(null);
```

#### Funciones Agregadas:

**`puedeCancelarCita(fechaHora: string)`**
- Verifica si una cita se puede cancelar (mínimo 2 horas de antelación)
- Retorna `true` si se puede cancelar, `false` en caso contrario

**`handleCancelarCita(citaId: number)`**
- Maneja la lógica de cancelación de citas
- Incluye validación de tiempo en el frontend
- Muestra modal de confirmación personalizado
- Maneja estados de carga y errores
- Actualiza la lista de citas después de cancelar exitosamente

**`confirmarCancelacion()`**
- Ejecuta la cancelación real de la cita
- Maneja la comunicación con el backend
- Actualiza la interfaz según el resultado

**`cancelarConfirmacion()`**
- Cierra el modal de confirmación sin realizar la cancelación
- Limpia los estados relacionados

#### Interfaz de Usuario:

**Botón de Cancelar:**
- Solo aparece para citas con estado "pendiente"
- Solo se muestra si la cita se puede cancelar (mínimo 2 horas de antelación)
- Estilo rojo para indicar acción destructiva
- Estado de carga durante la cancelación

**Modal de Confirmación:**
- Diseño elegante y profesional
- Muestra información detallada de la cita a cancelar
- Incluye advertencia sobre la irreversibilidad de la acción
- Botones claros: "Cancelar" (cerrar modal) y "Sí, Cancelar Cita" (confirmar)
- Estados de carga durante la cancelación
- Cierre al hacer clic fuera del modal

**Mensaje Informativo:**
- Para citas que no se pueden cancelar (menos de 2 horas)
- Muestra mensaje explicativo en color rojo

**Manejo de Errores:**
- Muestra errores de cancelación en la parte superior
- Incluye validación tanto en frontend como backend

## Validaciones Implementadas

### Backend:
1. **Cita existe**: Verifica que la cita exista en la base de datos
2. **Cita futura**: No permite cancelar citas pasadas
3. **Tiempo mínimo**: Requiere al menos 2 horas de antelación
4. **Autorización**: Solo el propietario de la cita puede cancelarla

### Frontend:
1. **Validación de tiempo**: Previene intentos de cancelación prematura
2. **Confirmación**: Pide confirmación antes de cancelar
3. **Estados de carga**: Muestra feedback visual durante la operación
4. **Manejo de errores**: Muestra mensajes de error descriptivos

## Flujo de Usuario

1. **Usuario accede a "Mis Citas"**
2. **Ve sus citas pendientes**
3. **Para cada cita pendiente:**
   - Si faltan 2+ horas: ve botón "Cancelar Cita"
   - Si faltan menos de 2 horas: ve mensaje informativo
4. **Al hacer clic en "Cancelar Cita":**
   - Se valida el tiempo en frontend
   - Se abre modal de confirmación con detalles de la cita
   - Al confirmar, se envía petición al backend
   - Se valida nuevamente en backend
   - Se actualiza la interfaz según el resultado

## Seguridad

- **Autenticación**: Requiere token JWT válido
- **Validación doble**: Tanto en frontend como backend
- **Confirmación**: Modal elegante que previene cancelaciones accidentales
- **Manejo de errores**: Mensajes descriptivos sin exponer detalles técnicos

## Compatibilidad

- **Responsive**: Funciona en dispositivos móviles y desktop
- **Accesibilidad**: Botones con estados claros y mensajes descriptivos
- **UX**: Feedback visual inmediato para todas las acciones

## Pruebas Recomendadas

1. **Cancelación exitosa**: Cita con más de 2 horas de antelación
2. **Cancelación bloqueada**: Cita con menos de 2 horas de antelación
3. **Cita pasada**: Intentar cancelar cita ya realizada
4. **Confirmación**: Verificar que el modal de confirmación funciona correctamente
5. **Estados de carga**: Verificar feedback visual durante cancelación
6. **Errores de red**: Probar con conexión interrumpida
7. **Dispositivos móviles**: Verificar funcionamiento en móviles 