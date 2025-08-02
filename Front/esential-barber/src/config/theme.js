// ===========================================
// CONFIGURACIÓN DE TEMA - ESENTIAL BARBER
// ===========================================

// Función para obtener variables CSS
const getCSSVariable = (variableName) => {
  return getComputedStyle(document.documentElement).getPropertyValue(variableName);
};

// Función para establecer variables CSS
const setCSSVariable = (variableName, value) => {
  document.documentElement.style.setProperty(variableName, value);
};

// ===========================================
// INFORMACIÓN DEL NEGOCIO
// ===========================================

export const BUSINESS_INFO = {
  // Datos del Barbero
  barberName: "Luis",
  barberFullName: "Luis García",
  barberTitle: "Barbero Profesional",
  
  // Información de Contacto
  businessName: "Esential Barber",
  businessPhone: "+34 600 123 456",
  businessEmail: "info@esentialbarber.com",
  businessAddress: "4 Paseo Dr. Revuelta, Begíjar, Andalucía",
  businessCity: "Begíjar",
  businessRegion: "Andalucía",
  
  // Horarios de Trabajo
  schedule: {
    monday: "Cerrado",
    tuesday: "9:00 - 21:15",
    wednesday: "9:00 - 21:15",
    thursday: "9:00 - 21:15",
    friday: "9:00 - 21:15",
    saturday: "9:00 - 21:15",
    sunday: "Cerrado"
  },
  
  // Redes Sociales
  socialMedia: {
    facebook: "https://facebook.com/esentialbarber",
    instagram: "https://instagram.com/esentialbarber",
    tiktok: "https://tiktok.com/@esentialbarber",
    twitter: "https://twitter.com/esentialbarber"
  }
};

// ===========================================
// PALETA DE COLORES
// ===========================================

export const COLORS = {
  // Colores Principales
  primary: "#2196F3",
  primaryHover: "#1976D2",
  primaryLight: "#BBDEFB",
  primaryDark: "#0D47A1",
  
  // Colores de Fondo
  backgroundPrimary: "#121212",
  backgroundSecondary: "#1a1a1a",
  backgroundTertiary: "#2d2d2d",
  backgroundCard: "#181818",
  
  // Colores de Texto
  textPrimary: "#ffffff",
  textSecondary: "#cccccc",
  textMuted: "#aaaaaa",
  textDark: "#222222",
  
  // Colores de Estado
  success: "#4CAF50",
  error: "#f44336",
  warning: "#ff9800",
  info: "#2196F3"
};

// ===========================================
// TIPOGRAFÍA
// ===========================================

export const TYPOGRAPHY = {
  // Familias de Fuentes
  fontPrimary: "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
  fontSecondary: "'Arial', sans-serif",
  fontDisplay: "'Georgia', serif",
  
  // Tamaños de Fuente
  fontSize: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
    "5xl": "3rem"
  },
  
  // Pesos de Fuente
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900
  }
};

// ===========================================
// ESPACIADO Y LAYOUT
// ===========================================

export const SPACING = {
  xs: "0.25rem",
  sm: "0.5rem",
  md: "1rem",
  lg: "1.5rem",
  xl: "2rem",
  "2xl": "3rem",
  "3xl": "4rem"
};

export const BORDER_RADIUS = {
  sm: "4px",
  md: "8px",
  lg: "12px",
  xl: "16px",
  "2xl": "20px",
  "3xl": "25px",
  full: "50%"
};

export const SHADOWS = {
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
  "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
};

// ===========================================
// ANIMACIONES Y TRANSICIONES
// ===========================================

export const TRANSITIONS = {
  fast: "0.15s",
  normal: "0.3s",
  slow: "0.5s",
  ease: {
    linear: "linear",
    in: "cubic-bezier(0.4, 0, 1, 1)",
    out: "cubic-bezier(0, 0, 0.2, 1)",
    inOut: "cubic-bezier(0.4, 0, 0.2, 1)"
  }
};

// ===========================================
// FUNCIONES UTILITARIAS
// ===========================================

// Función para cambiar el color principal
export const changePrimaryColor = (newColor) => {
  setCSSVariable('--primary-color', newColor);
  setCSSVariable('--primary-color-hover', adjustBrightness(newColor, -20));
  setCSSVariable('--primary-color-light', adjustBrightness(newColor, 30));
  setCSSVariable('--primary-color-dark', adjustBrightness(newColor, -10));
  
  // Actualizar también las sombras y gradientes dinámicamente
  const rgbColor = hexToRgb(newColor);
  if (rgbColor) {
    setCSSVariable('--primary-color-rgb', `${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}`);
    
    // Actualizar sombras dinámicamente
    setCSSVariable('--shadow-primary', `0 8px 32px rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 0.15), 0 4px 16px rgba(0,0,0,0.3)`);
    setCSSVariable('--shadow-primary-hover', `0 12px 40px rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 0.25), 0 8px 24px rgba(0,0,0,0.4)`);
    setCSSVariable('--shadow-primary-text', `0 2px 8px rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 0.3)`);
    setCSSVariable('--shadow-primary-icon', `0 4px 20px rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 0.4)`);
    setCSSVariable('--shadow-primary-pin', `drop-shadow(0 0 12px rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 0.5))`);
    
    // Actualizar gradientes dinámicamente
    setCSSVariable('--gradient-primary-light', `linear-gradient(145deg, rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 0.05) 0%, rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 0.02) 100%)`);
    setCSSVariable('--gradient-primary-hover', `linear-gradient(145deg, rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 0.1) 0%, rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 0.05) 100%)`);
    setCSSVariable('--border-primary-light', `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 0.2)`);
    setCSSVariable('--border-primary-hover', `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 0.4)`);
    
    // Actualizar estados del menú
    setCSSVariable('--menu-active-bg', `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 0.1)`);
    setCSSVariable('--menu-hover-bg', `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 0.05)`);
  }
};

// Función para cambiar el color de fondo
export const changeBackgroundColor = (newColor) => {
  setCSSVariable('--background-primary', newColor);
  setCSSVariable('--background-secondary', adjustBrightness(newColor, 10));
  setCSSVariable('--background-tertiary', adjustBrightness(newColor, 20));
};

// Función para ajustar el brillo de un color
const adjustBrightness = (hex, percent) => {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
};

// Función para convertir hex a RGB
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

// Función para generar filtro CSS para iconos
const generateIconFilter = (hexColor) => {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return 'brightness(0) saturate(100%) invert(87%) sepia(99%) saturate(7499%) hue-rotate(1deg) brightness(104%) contrast(104%)';
  
  // Convertir RGB a HSL para obtener el matiz
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  
  // Generar filtro CSS que convierta el icono al color deseado
  return `brightness(0) saturate(100%) invert(${rgb.r / 255 * 100}%) sepia(${rgb.g / 255 * 100}%) saturate(${rgb.b / 255 * 100}%) hue-rotate(${hsl.h}deg) brightness(${hsl.l * 100}%) contrast(${hsl.s * 100}%)`;
};

// Función auxiliar para convertir RGB a HSL
const rgbToHsl = (r, g, b) => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
};

// Función para obtener el valor actual de una variable CSS
export const getCurrentCSSValue = (variableName) => {
  return getCSSVariable(`--${variableName}`);
};

// Función para establecer un valor de variable CSS
export const setCSSValue = (variableName, value) => {
  setCSSVariable(`--${variableName}`, value);
};

// ===========================================
// EJEMPLOS DE USO
// ===========================================

// Ejemplo: Cambiar el color principal a blanco
// changePrimaryColor('#FFFFFF');

// Ejemplo: Cambiar el color principal a azul
// changePrimaryColor('#2196F3');

// Ejemplo: Cambiar el color principal a rojo
// changePrimaryColor('#f44336');

// Ejemplo: Cambiar el fondo a un gris más claro
// changeBackgroundColor('#2a2a2a');

export default {
  BUSINESS_INFO,
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
  TRANSITIONS,
  changePrimaryColor,
  changeBackgroundColor,
  getCurrentCSSValue,
  setCSSValue
}; 