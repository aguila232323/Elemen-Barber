import React, { useState } from 'react';
import styles from './Login.module.css';
import { login as loginService } from '../../services/authService';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

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
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState('');
  const { setUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await loginService(email, password);
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        setUser('reload');
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotPasswordMessage('');
    setForgotPasswordLoading(true);
    
    try {
      const response = await fetch('http://localhost:8080/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setForgotPasswordMessage('✅ Se ha enviado un enlace de recuperación a tu correo electrónico.');
        setForgotPasswordEmail('');
      } else {
        setForgotPasswordMessage(data.error || '❌ Error al enviar el enlace de recuperación.');
      }
    } catch (err: any) {
      setForgotPasswordMessage('❌ Error de conexión. Intenta de nuevo.');
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setForgotPasswordEmail('');
    setForgotPasswordMessage('');
  };

  if (showForgotPassword) {
    return (
      <form onSubmit={handleForgotPassword} className={styles.loginForm}>
        <h2>Recuperar contraseña</h2>
        <p style={{color: '#666', fontSize: '14px', marginBottom: '20px', textAlign: 'center'}}>
          Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
        </p>
        <div className={styles.loginField}>
          <input 
            type='email' 
            placeholder='Correo electrónico' 
            value={forgotPasswordEmail} 
            onChange={e => setForgotPasswordEmail(e.target.value)} 
            required 
            className={styles.loginInput} 
          />
        </div>
        {forgotPasswordMessage && (
          <div className={styles.loginError} style={{
            backgroundColor: forgotPasswordMessage.includes('✅') ? '#d4edda' : '#f8d7da',
            color: forgotPasswordMessage.includes('✅') ? '#155724' : '#721c24',
            border: `1px solid ${forgotPasswordMessage.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`
          }}>
            {forgotPasswordMessage}
          </div>
        )}
        <button type='submit' className={styles.loginButton} disabled={forgotPasswordLoading}>
          {forgotPasswordLoading ? 'Enviando...' : 'Enviar enlace de recuperación'}
        </button>
        <button 
          type='button' 
          className={styles.loginButton} 
          style={{
            backgroundColor: '#6c757d',
            marginTop: '10px'
          }}
          onClick={handleBackToLogin}
        >
          Volver al inicio de sesión
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.loginForm}>
      <h2>Iniciar sesión</h2>
      <div className={styles.loginField}>
        <input type='email' placeholder='Correo electrónico' value={email} onChange={e=>setEmail(e.target.value)} required className={styles.loginInput} />
      </div>
      <div className={styles.loginField}>
        <input type='password' placeholder='Contraseña' value={password} onChange={e=>setPassword(e.target.value)} required className={styles.loginInput} />
      </div>
      <div style={{textAlign: 'right', marginBottom: '15px'}}>
        <span 
          className={styles.loginRegisterLink} 
          style={{cursor: 'pointer', fontSize: '14px', color: '#667eea'}}
          onClick={() => setShowForgotPassword(true)}
        >
          ¿Has olvidado tu contraseña?
        </span>
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
