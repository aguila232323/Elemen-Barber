// @ts-check
import { config } from '../config/config';

/**
 * Inicia sesión con email y password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{token: string, [key: string]: any}>}
 */
export async function login(email: string, password: string) {
  const response = await fetch(`${config.API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    if (data.error === 'EMAIL_NOT_VERIFIED') {
      throw new Error('EMAIL_NOT_VERIFIED');
    }
    throw new Error(data.error || 'Credenciales incorrectas');
  }
  
  return data; // Se espera que aquí venga el token o datos del usuario
}

/**
 * Reenvía el código de verificación
 * @param {string} email
 * @returns {Promise<any>}
 */
export async function reenviarCodigoVerificacion(email: string) {
  const response = await fetch(`${config.API_BASE_URL}/api/verificacion/reenviar-codigo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Error al reenviar código');
  }
  return await response.json();
}

/**
 * Reenvía el código de verificación (versión simple)
 * @param {string} email
 * @returns {Promise<any>}
 */
export async function reenviarCodigoSimple(email: string) {
  const response = await fetch(`${config.API_BASE_URL}/api/verificacion/reenviar-simple`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Error al reenviar código');
  }
  return await response.json();
}

/**
 * Verifica el código de verificación
 * @param {string} email
 * @param {string} codigo
 * @returns {Promise<any>}
 */
export async function verificarCodigo(email: string, codigo: string) {
  const response = await fetch(`${config.API_BASE_URL}/api/verificacion/verificar-codigo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, codigo }),
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Error al verificar código');
  }
  return await response.json();
}

/**
 * Registra un nuevo usuario
 * @param {string} nombre
 * @param {string} email
 * @param {string} password
 * @param {string} telefono
 * @returns {Promise<any>}
 */
export async function register(nombre: string, email: string, password: string, telefono: string) {
  const response = await fetch(`${config.API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ nombre, email, password, telefono }),
  });
  if (!response.ok) {
    let msg = 'Error al registrar usuario';
    try {
      const data = await response.json();
      msg = data.message || msg;
    } catch {}
    throw new Error(msg);
  }
  return await response.json();
}


