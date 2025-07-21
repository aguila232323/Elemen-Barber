// @ts-check

/**
 * Inicia sesión con email y password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{token: string, [key: string]: any}>}
 */
export async function login(email, password) {
  const response = await fetch('http://localhost:8080/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    throw new Error('Credenciales incorrectas');
  }
  return await response.json(); // Se espera que aquí venga el token o datos del usuario
}

/**
 * Registra un nuevo usuario
 * @param {string} nombre
 * @param {string} email
 * @param {string} password
 * @returns {Promise<any>}
 */
export async function register(nombre, email, password) {
  const response = await fetch('http://localhost:8080/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ nombre, email, password }),
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


