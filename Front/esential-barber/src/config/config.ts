// ========================================
// CONFIGURACIÓN CENTRALIZADA DEL FRONTEND
// ========================================

interface Config {
  API_BASE_URL: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_REDIRECT_URI: string;
  FRONTEND_URL: string;
}

// Configuración para desarrollo local
const devConfig: Config = {
  API_BASE_URL: 'http://localhost:8080',
  GOOGLE_CLIENT_ID: '861425306153-5odf703ho7dt8at2r5jqpu2t9ei0iakg.apps.googleusercontent.com',
  GOOGLE_REDIRECT_URI: 'http://localhost:3000/auth/google/callback',
  FRONTEND_URL: 'http://localhost:3000'
};

// Configuración para producción (Netlify)
const prodConfig: Config = {
  API_BASE_URL: process.env.REACT_APP_API_URL || 'https://api.elemenbarber.com',
  GOOGLE_CLIENT_ID: '861425306153-5odf703ho7dt8at2r5jqpu2t9ei0iakg.apps.googleusercontent.com',
  GOOGLE_REDIRECT_URI: process.env.REACT_APP_GOOGLE_REDIRECT_URI || 'https://elemenbarber.com/auth/google/callback',
  FRONTEND_URL: process.env.REACT_APP_FRONTEND_URL || 'https://elemenbarber.com'
};

// Determinar qué configuración usar basado en el entorno
const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';

export const config: Config = isDevelopment ? devConfig : prodConfig;

// URLs específicas de la API
export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${config.API_BASE_URL}/api/auth/login`,
  REGISTER: `${config.API_BASE_URL}/api/auth/register`,
  GOOGLE_AUTH: `${config.API_BASE_URL}/api/auth/google`,
  GOOGLE_COMPLETE: `${config.API_BASE_URL}/api/auth/google/complete`,
  FORGOT_PASSWORD: `${config.API_BASE_URL}/api/auth/forgot-password`,
  RESET_PASSWORD: `${config.API_BASE_URL}/api/auth/reset-password`,
  VALIDATE_RESET_TOKEN: `${config.API_BASE_URL}/api/auth/validate-reset-token`,
  CHECK_CALENDAR_ACCESS: `${config.API_BASE_URL}/api/auth/google/check-calendar-access`,
  
  // Usuarios
  USUARIOS: `${config.API_BASE_URL}/api/usuarios`,
  USUARIO_PERFIL: `${config.API_BASE_URL}/api/usuarios/perfil`,
  USUARIO_ESTADO: `${config.API_BASE_URL}/api/usuarios/estado`,
  USUARIO_AVATAR: `${config.API_BASE_URL}/api/usuarios/avatar`,
  CAMBIAR_PASSWORD: `${config.API_BASE_URL}/api/usuarios/cambiar-password`,
  ELIMINAR_CUENTA: `${config.API_BASE_URL}/api/usuarios/eliminar-cuenta`,
  
  // Citas
  CITAS: `${config.API_BASE_URL}/api/citas`,
  CITAS_TODAS: `${config.API_BASE_URL}/api/citas/todas`,
  CITAS_MIS_CITAS: `${config.API_BASE_URL}/api/citas/mis-citas`,
  CITAS_DISPONIBILIDAD: `${config.API_BASE_URL}/api/citas/disponibilidad`,
  CITAS_DISPONIBILIDAD_MES: `${config.API_BASE_URL}/api/citas/disponibilidad-mes`,
  CITAS_FIJA: `${config.API_BASE_URL}/api/citas/fija`,
  
  // Servicios
  SERVICIOS: `${config.API_BASE_URL}/api/servicios`,
  
  // Configuración
  CONFIG_TIEMPO_MINIMO: `${config.API_BASE_URL}/api/configuracion/tiempo-minimo`,
  
  // Portfolio
  PORTFOLIO_FOTOS: `${config.API_BASE_URL}/api/portfolio/fotos`,
  PORTFOLIO_ADMIN_ANADIR: `${config.API_BASE_URL}/api/portfolio/admin/añadir`,
  PORTFOLIO_ADMIN_ELIMINAR: `${config.API_BASE_URL}/api/portfolio/admin/eliminar`,
  
  // Reseñas
  RESENAS_PUBLICAS: `${config.API_BASE_URL}/api/resenas/publicas`,
  RESENAS_TODAS: `${config.API_BASE_URL}/api/resenas/todas`,
  
  // Vacaciones
  VACACIONES: `${config.API_BASE_URL}/api/vacaciones`,
};

export default config;
