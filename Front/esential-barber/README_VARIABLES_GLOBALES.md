# 🎨 Sistema de Variables Globales - Esential Barber

## 📋 Descripción General

Este sistema centraliza todas las variables de diseño y información del negocio en un solo lugar, permitiendo cambios masivos con una sola modificación.

## 🗂️ Estructura de Archivos

```
Front/esential-barber/src/
├── styles/
│   └── variables.css          # Variables CSS globales
├── config/
│   └── theme.js              # Configuración JavaScript
├── components/
│   └── ThemeDemo/
│       └── ThemeDemo.jsx     # Componente de demostración
└── README_VARIABLES_GLOBALES.md
```

## 🎯 Beneficios

### ✅ **Mantenimiento Fácil**
- Cambiar colores en toda la web con una sola línea
- Actualizar información del negocio centralizada
- Consistencia visual garantizada

### ✅ **Flexibilidad Total**
- Cambios dinámicos en tiempo real
- Múltiples temas de color
- Adaptación rápida a nuevas necesidades

### ✅ **Eficiencia de Desarrollo**
- No más búsqueda de colores en múltiples archivos
- Variables semánticas y descriptivas
- Reutilización de valores

## 🎨 Variables de Color

### Colores Principales
```css
--primary-color: #FFD600;        /* Dorado principal */
--primary-color-hover: #FFA500;  /* Dorado hover */
--primary-color-light: #FFF4B3;  /* Dorado claro */
--primary-color-dark: #E6C200;   /* Dorado oscuro */
```

### Colores de Fondo
```css
--background-primary: #121212;    /* Fondo principal */
--background-secondary: #1a1a1a; /* Fondo secundario */
--background-tertiary: #2d2d2d;  /* Fondo terciario */
--background-card: #181818;       /* Fondo de tarjetas */
```

### Colores de Texto
```css
--text-primary: #ffffff;         /* Texto principal */
--text-secondary: #cccccc;       /* Texto secundario */
--text-muted: #aaaaaa;           /* Texto atenuado */
--text-dark: #222222;            /* Texto oscuro */
```

## 🏢 Información del Negocio

### Datos del Barbero
```javascript
barberName: "Luis",
barberFullName: "Luis Garcia Mudarra",
barberTitle: "Barbero Profesional"
```

### Información de Contacto
```javascript
businessName: "Esential Barber",
businessPhone: "+34 600 123 456",
  businessEmail: "elemenbarber@gmail.com",
businessAddress: "4 Paseo Dr. Revuelta, Begíjar, Andalucía"
```

### Horarios de Trabajo
```javascript
schedule: {
  monday: "Cerrado",
  tuesday: "9:00 - 21:15",
  wednesday: "9:00 - 21:15",
  thursday: "9:00 - 21:15",
  friday: "9:00 - 21:15",
  saturday: "9:00 - 21:15",
  sunday: "Cerrado"
}
```

## 🛠️ Cómo Usar

### 1. Cambiar Color Principal Dinámicamente

```javascript
import { changePrimaryColor } from './config/theme';

// Cambiar a blanco
changePrimaryColor('#FFFFFF');

// Cambiar a azul
changePrimaryColor('#2196F3');

// Cambiar a rojo
changePrimaryColor('#f44336');
```

### 2. Cambiar Color de Fondo

```javascript
import { changeBackgroundColor } from './config/theme';

// Cambiar a negro puro
changeBackgroundColor('#000000');

// Cambiar a gris más claro
changeBackgroundColor('#2a2a2a');
```

### 3. Usar en CSS

```css
.mi-clase {
  color: var(--primary-color);
  background: var(--background-primary);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
}
```

### 4. Usar en React (Inline Styles)

```jsx
<div style={{
  color: 'var(--primary-color)',
  background: 'var(--background-card)',
  borderRadius: 'var(--border-radius-md)',
  padding: 'var(--spacing-lg)'
}}>
  Contenido
</div>
```

### 5. Usar Información del Negocio

```jsx
import { BUSINESS_INFO } from './config/theme';

function ContactInfo() {
  return (
    <div>
      <p>Barbero: {BUSINESS_INFO.barberFullName}</p>
      <p>Teléfono: {BUSINESS_INFO.businessPhone}</p>
      <p>Horario: {BUSINESS_INFO.schedule.tuesday}</p>
    </div>
  );
}
```

## 🎨 Ejemplos de Cambios Rápidos

### Cambiar Todo el Tema a Blanco
```javascript
changePrimaryColor('#FFFFFF');
changeBackgroundColor('#f5f5f5');
```

### Cambiar Todo el Tema a Azul
```javascript
changePrimaryColor('#2196F3');
changeBackgroundColor('#0d47a1');
```

### Cambiar Todo el Tema a Verde
```javascript
changePrimaryColor('#4CAF50');
changeBackgroundColor('#1b5e20');
```

## 📱 Variables Responsive

### Breakpoints
```css
--breakpoint-xs: 0;
--breakpoint-sm: 576px;
--breakpoint-md: 768px;
--breakpoint-lg: 992px;
--breakpoint-xl: 1200px;
--breakpoint-2xl: 1400px;
```

### Tamaños de Fuente
```css
--font-size-xs: 0.75rem;    /* 12px */
--font-size-sm: 0.875rem;   /* 14px */
--font-size-base: 1rem;     /* 16px */
--font-size-lg: 1.125rem;   /* 18px */
--font-size-xl: 1.25rem;    /* 20px */
--font-size-2xl: 1.5rem;    /* 24px */
--font-size-3xl: 1.875rem;  /* 30px */
--font-size-4xl: 2.25rem;   /* 36px */
--font-size-5xl: 3rem;      /* 48px */
```

## 🎭 Animaciones y Transiciones

### Duración
```css
--transition-fast: 0.15s;
--transition-normal: 0.3s;
--transition-slow: 0.5s;
```

### Curvas
```css
--ease-linear: linear;
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

## 🔧 Funciones Utilitarias

### Obtener Valor Actual
```javascript
import { getCurrentCSSValue } from './config/theme';

const currentColor = getCurrentCSSValue('primary-color');
console.log(currentColor); // #FFD600
```

### Establecer Valor Personalizado
```javascript
import { setCSSValue } from './config/theme';

setCSSValue('primary-color', '#FF0000');
```

## 🎨 Clases Utilitarias CSS

### Colores de Texto
```css
.text-primary    /* Color principal */
.text-secondary  /* Color secundario */
.text-muted      /* Color atenuado */
.text-white      /* Color blanco */
```

### Fondos
```css
.bg-primary      /* Fondo principal */
.bg-secondary    /* Fondo secundario */
.bg-card         /* Fondo de tarjetas */
```

### Bordes
```css
.border-primary  /* Borde principal */
.border-radius-sm
.border-radius-md
.border-radius-lg
.border-radius-xl
```

### Sombras
```css
.shadow-sm
.shadow-md
.shadow-lg
.shadow-xl
```

### Transiciones
```css
.transition-fast
.transition-normal
.transition-slow
```

## 🚀 Implementación en Proyecto Existente

### 1. Reemplazar Colores Hardcodeados

**Antes:**
```jsx
<div style={{ color: '#FFD600', background: '#121212' }}>
```

**Después:**
```jsx
<div style={{ color: 'var(--primary-color)', background: 'var(--background-primary)' }}>
```

### 2. Migrar Información del Negocio

**Antes:**
```jsx
<p>Barbero: Luis Garcia Mudarra</p>
<p>Teléfono: +34 600 123 456</p>
```

**Después:**
```jsx
import { BUSINESS_INFO } from './config/theme';

<p>Barbero: {BUSINESS_INFO.barberFullName}</p>
<p>Teléfono: {BUSINESS_INFO.businessPhone}</p>
```

## 📊 Ventajas del Sistema

### ✅ **Escalabilidad**
- Fácil agregar nuevas variables
- Estructura organizada y clara
- Documentación completa

### ✅ **Mantenibilidad**
- Cambios centralizados
- Menos errores de consistencia
- Debugging más fácil

### ✅ **Flexibilidad**
- Cambios dinámicos en tiempo real
- Múltiples temas posibles
- Adaptación rápida

### ✅ **Eficiencia**
- Menos tiempo de desarrollo
- Código más limpio
- Reutilización máxima

## 🎯 Casos de Uso Comunes

### 1. Cambio de Marca
```javascript
// Cambiar de dorado a azul
changePrimaryColor('#2196F3');
```

### 2. Modo Oscuro/Claro
```javascript
// Modo claro
changeBackgroundColor('#f5f5f5');
changePrimaryColor('#333333');

// Modo oscuro
changeBackgroundColor('#121212');
changePrimaryColor('#FFD600');
```

### 3. Actualización de Información
```javascript
// En config/theme.js
export const BUSINESS_INFO = {
  businessPhone: "+34 600 123 456", // Nuevo número
  businessAddress: "Nueva dirección",
  schedule: {
    tuesday: "10:00 - 22:00" // Nuevo horario
  }
};
```

## 🔍 Troubleshooting

### Problema: Los cambios no se aplican
**Solución:** Verificar que el archivo `variables.css` esté importado en `index.css`

### Problema: Variables no reconocidas
**Solución:** Verificar la sintaxis CSS: `var(--nombre-variable)`

### Problema: Cambios dinámicos no funcionan
**Solución:** Verificar que las funciones estén importadas correctamente

## 📝 Notas Importantes

1. **Siempre usar variables CSS** en lugar de valores hardcodeados
2. **Mantener consistencia** en el nombramiento de variables
3. **Documentar cambios** importantes en el sistema
4. **Probar cambios** en diferentes componentes
5. **Backup antes de cambios masivos**

---

## 🎉 ¡Sistema Listo!

Ahora tienes un sistema completo de variables globales que te permitirá:

- ✅ Cambiar colores en toda la web con una línea
- ✅ Actualizar información del negocio centralizada
- ✅ Mantener consistencia visual
- ✅ Desarrollar más rápido y eficientemente
- ✅ Escalar fácilmente el proyecto

¡El sistema está listo para usar! 🚀 