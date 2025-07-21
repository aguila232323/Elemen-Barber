import React, { useState } from 'react';
import styles from './Login.module.css';
import { login as loginService } from '../../services/authService';
import { FaEnvelope, FaLock } from 'react-icons/fa';

interface LoginProps {
  onLoginSuccess?: () => void;
  onSwitchToRegister?: () => void;
  onClose?: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, onSwitchToRegister, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await loginService(email, password);
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        if (onLoginSuccess) onLoginSuccess();
        if (onClose) onClose();
      } else {
        setError('Respuesta inesperada del servidor.');
      }
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.loginForm}>
      <h2>Iniciar sesión</h2>
      <div className={styles.loginField}>
        <input type='email' placeholder='Correo electrónico' value={email} onChange={e=>setEmail(e.target.value)} required className={styles.loginInput} />
      </div>
      <div className={styles.loginField}>
        <input type='password' placeholder='Contraseña' value={password} onChange={e=>setPassword(e.target.value)} required className={styles.loginInput} />
      </div>
      {error && <div className={styles.loginError}>{error}</div>}
      <button type='submit' className={styles.loginButton} disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
      <div className={styles.loginDivider}>o</div>
      <button type='button' className={styles.loginGoogle} disabled={loading}>
        <svg width='22' height='22' viewBox='0 0 48 48' style={{marginRight:8}}><g><path fill='#4285F4' d='M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.85-6.85C35.64 2.36 30.18 0 24 0 14.82 0 6.73 5.82 2.69 14.09l7.98 6.2C12.36 13.09 17.73 9.5 24 9.5z'/><path fill='#34A853' d='M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.64 7.01l7.19 5.6C43.98 37.36 46.1 31.45 46.1 24.55z'/><path fill='#FBBC05' d='M9.67 28.29c-1.09-3.25-1.09-6.74 0-9.99l-7.98-6.2C-1.06 17.18-1.06 30.82 1.69 39.91l7.98-6.2z'/><path fill='#EA4335' d='M24 46c6.18 0 11.64-2.36 15.99-6.45l-7.19-5.6c-2.01 1.35-4.6 2.15-7.8 2.15-6.27 0-11.64-3.59-13.33-8.59l-7.98 6.2C6.73 42.18 14.82 48 24 48z'/></g></svg>
        Ingresar con Google
      </button>
      <div className={styles.loginRegister}>
        ¿No tienes cuenta?{' '}
        <span className={styles.loginRegisterLink} style={{cursor:'pointer'}} onClick={onSwitchToRegister}>Regístrate aquí</span>
      </div>
    </form>
  );
};

export default Login;
