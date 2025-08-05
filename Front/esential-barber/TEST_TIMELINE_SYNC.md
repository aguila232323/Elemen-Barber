# Test de Sincronización del Timeline Móvil

## 🧪 Pruebas a Realizar

### 1. **Sincronización de Scroll**
- [ ] Al hacer scroll en el eje de tiempo, los eventos se mueven junto con él
- [ ] Al hacer scroll en los eventos, el eje de tiempo se mueve junto con ellos
- [ ] No hay bucles infinitos de scroll
- [ ] El scroll es suave y fluido

### 2. **Alineación de Horas**
- [ ] Las citas se posicionan exactamente a la altura de su hora correspondiente
- [ ] Una cita a las 10:30 aparece alineada con el slot de 10:30
- [ ] Una cita a las 11:00 aparece alineada con el slot de 11:00
- [ ] Una cita a las 11:15 aparece alineada con el slot de 11:15

### 3. **Visualización de Horas**
- [ ] Se muestran todas las horas cada 15 minutos
- [ ] Las horas completas (10:00, 11:00, etc.) se muestran más prominentes
- [ ] Los cuartos de hora (15, 30, 45) se muestran más pequeños
- [ ] La diferenciación visual es clara

### 4. **Responsive Design**
- [ ] Funciona correctamente en móviles pequeños (≤360px)
- [ ] Funciona correctamente en móviles medianos (≤480px)
- [ ] Funciona correctamente en tablets (≤768px)
- [ ] Funciona correctamente en pantallas grandes (>768px)

## 🔧 Cálculos Verificados

### Cálculo de Posiciones
```typescript
// Para una cita a las 10:30
const startHour = 10;
const startMinute = 30;
const slotIndex = (10 - 10) * 4 + Math.floor(30 / 15); // 0 * 4 + 2 = 2
const topPosition = 2 * slotHeight; // Debe coincidir con el slot de 10:30
```

### Cálculo de Altura
```typescript
// Para una cita de 45 minutos
const durationMinutes = 45;
const height = Math.max((45 / 15) * slotHeight, slotHeight * 0.5);
// height = Math.max(3 * slotHeight, slotHeight * 0.5) = 3 * slotHeight
```

## 📱 Casos de Prueba

### Caso 1: Cita a las 10:30
- **Hora**: 10:30
- **Posición esperada**: Slot 2 (índice 2)
- **Altura**: 3 slots (45 minutos)

### Caso 2: Cita a las 11:00
- **Hora**: 11:00
- **Posición esperada**: Slot 4 (índice 4)
- **Altura**: 3 slots (45 minutos)

### Caso 3: Cita a las 11:15
- **Hora**: 11:15
- **Posición esperada**: Slot 5 (índice 5)
- **Altura**: 3 slots (45 minutos)

## 🎯 Resultados Esperados

1. **Sincronización perfecta**: Las dos barras se mueven como una sola unidad
2. **Alineación precisa**: Las citas coinciden exactamente con sus horas correspondientes
3. **Scroll fluido**: Sin saltos ni comportamientos extraños
4. **Responsive**: Funciona en todos los tamaños de pantalla
5. **Performance**: Sin lag ni problemas de rendimiento

## 🐛 Problemas Conocidos y Soluciones

### Problema: Bucles infinitos de scroll
**Solución**: Implementado flag `isScrolling` y timeout de 50ms

### Problema: Posiciones incorrectas
**Solución**: Uso de `Math.floor()` para calcular índices de slots

### Problema: Scroll no sincronizado
**Solución**: Event listeners con `passive: true` y cleanup adecuado

## ✅ Checklist de Verificación

- [ ] Scroll sincronizado funciona
- [ ] Posiciones de citas son correctas
- [ ] Horas se muestran cada 15 minutos
- [ ] Diferenciación visual de horas
- [ ] Responsive en todos los dispositivos
- [ ] Performance optimizada
- [ ] Sin bucles infinitos
- [ ] Event listeners limpios 