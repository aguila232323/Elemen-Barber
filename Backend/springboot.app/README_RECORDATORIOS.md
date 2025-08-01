# 🔔 Sistema de Recordatorios Automáticos

## 📋 Descripción

El sistema de recordatorios automáticos envía emails de recordatorio a los clientes cuando quedan exactamente **1 hora** para su cita programada.

## ⚙️ Funcionalidades

### 🔄 Automático
- **Frecuencia**: Se ejecuta cada 5 minutos
- **Condición**: Busca citas programadas para dentro de 1 hora
- **Filtros**: Solo citas con estado "CONFIRMADA" o "PENDIENTE"
- **Exclusión**: No envía recordatorios para citas canceladas

### 🎯 Manual
- Envío de recordatorio para una cita específica
- Verificación manual del sistema automático
- Pruebas y debugging

## 🏗️ Arquitectura

### Servicios
- **`RecordatorioService`**: Lógica principal de recordatorios
- **`EmailService`**: Envío de emails de recordatorio
- **`CitaRepository`**: Consultas de citas próximas

### Endpoints
- `POST /api/recordatorios/enviar/{citaId}` - Envío manual
- `POST /api/recordatorios/ejecutar-automaticos` - Verificación manual

## 📧 Email de Recordatorio

### Características
- ✅ Diseño profesional con gradiente negro
- ✅ Títulos en negrita
- ✅ Detalles de la cita centrados
- ✅ Información de contacto
- ✅ Mensaje de recordatorio claro

### Contenido
- Saludo personalizado
- Recordatorio de la cita programada
- Detalles completos (servicio, fecha, hora, duración, precio)
- Instrucciones para llegar 10 minutos antes
- Información de contacto

## 🚀 Configuración

### 1. Habilitar Scheduling
```java
@SpringBootApplication
@EnableScheduling  // ← Agregado
public class Application {
    // ...
}
```

### 2. Configurar Frecuencia
```java
@Scheduled(fixedRate = 300000) // 5 minutos
public void enviarRecordatoriosAutomaticos() {
    // ...
}
```

## 🧪 Pruebas

### Script de Prueba
```bash
# Ejecutar el script de pruebas
.\test_recordatorios.bat
```

### Pruebas Manuales
```bash
# Verificar recordatorios automáticos
curl -X POST http://localhost:8080/api/recordatorios/ejecutar-automaticos

# Enviar recordatorio manual
curl -X POST http://localhost:8080/api/recordatorios/enviar/123
```

## 📊 Monitoreo

### Logs del Sistema
```
🔍 Verificando recordatorios automáticos...
📅 Citas encontradas para recordatorio: 2
📧 Enviando recordatorio para cita ID: 123
✅ Email de recordatorio enviado a: cliente@email.com
```

### Estados de Cita
- ✅ **CONFIRMADA**: Recibe recordatorio
- ✅ **PENDIENTE**: Recibe recordatorio  
- ❌ **CANCELADA**: No recibe recordatorio

## 🔧 Personalización

### Cambiar Frecuencia
```java
// Cada 10 minutos
@Scheduled(fixedRate = 600000)

// Cada hora
@Scheduled(fixedRate = 3600000)
```

### Cambiar Tiempo de Anticipación
```java
// 30 minutos antes
LocalDateTime treintaMinutosDespues = ahora.plusMinutes(30);

// 2 horas antes  
LocalDateTime dosHorasDespues = ahora.plusHours(2);
```

## 🛡️ Seguridad

### Prevención de Duplicados
- El sistema verifica el estado de la cita antes de enviar
- Solo envía a citas confirmadas o pendientes
- Logs detallados para auditoría

### Manejo de Errores
- Try-catch en cada envío individual
- Continuación del proceso si falla un email
- Logs de errores detallados

## 📈 Métricas

### Información Registrada
- Número de citas encontradas
- IDs de citas procesadas
- Emails enviados exitosamente
- Errores y excepciones

## 🎯 Casos de Uso

### Escenario 1: Cita Normal
1. Cliente agenda cita para las 15:00
2. Sistema verifica cada 5 minutos
3. A las 14:00 (1 hora antes) se envía recordatorio
4. Cliente recibe email con detalles de la cita

### Escenario 2: Cita Cancelada
1. Cliente cancela cita
2. Sistema no envía recordatorio
3. Cita excluida de verificaciones automáticas

### Escenario 3: Múltiples Citas
1. Varias citas programadas para la misma hora
2. Sistema procesa todas en paralelo
3. Cada cliente recibe su recordatorio personalizado

## 🔄 Flujo Completo

```
1. Sistema se ejecuta cada 5 minutos
2. Busca citas programadas para dentro de 1 hora
3. Filtra por estado (CONFIRMADA/PENDIENTE)
4. Para cada cita válida:
   - Genera email de recordatorio
   - Envía al cliente
   - Registra en logs
5. Continúa con la siguiente cita
```

## 📝 Notas Técnicas

- **Base de datos**: Consulta optimizada con índices
- **Email**: Template HTML responsive
- **Logging**: Información detallada para debugging
- **Performance**: Procesamiento eficiente de múltiples citas
- **Escalabilidad**: Fácil ajuste de frecuencia y parámetros 