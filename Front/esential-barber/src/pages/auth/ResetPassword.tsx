import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import { config } from '../../config/config';

const ResetPassword: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [tokenValid, setTokenValid] = useState(false);
  const [validating, setValidating] = useState(true);

  useEffect(() => {
    validateToken();
  }, [token]);

  const validateToken = async () => {
    if (!token) {
      setMessage('❌ Token de recuperación no válido');
      setValidating(false);
      return;
    }

    try {
      const response = await fetch(`${config.API_BASE_URL}/api/auth/validate-reset-token/${token}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (response.ok && data.valid) {
        setTokenValid(true);
        setMessage('✅ Token válido. Puedes restablecer tu contraseña.');
      } else {
        setTokenValid(false);
        setMessage('❌ Token inválido o expirado. Solicita un nuevo enlace de recuperación.');
      }
    } catch (error) {
      setTokenValid(false);
      setMessage('❌ Error al validar el token. Intenta de nuevo.');
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setMessage('❌ Las contraseñas no coinciden');
      return;
    }

    if (newPassword.length < 6) {
      setMessage('❌ La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${config.API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          newPassword: newPassword
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage('✅ Contraseña restablecida exitosamente. Redirigiendo al login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setMessage(data.error || '❌ Error al restablecer la contraseña');
      }
    } catch (error) {
      setMessage('❌ Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className={styles.loginForm}>
        <h2>Validando token...</h2>
        <div style={{textAlign: 'center', padding: '20px'}}>
          <div style={{fontSize: '24px', marginBottom: '10px'}}>⏳</div>
          <p>Verificando el enlace de recuperación...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className={styles.loginForm}>
        <h2>Enlace Inválido</h2>
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '8px',
          padding: '20px',
          margin: '20px 0',
          textAlign: 'center'
        }}>
          {message}
        </div>
        <button 
          type='button' 
          className={styles.loginButton}
          onClick={() => navigate('/login')}
        >
          Volver al inicio de sesión
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.loginForm}>
      <h2>Restablecer Contraseña</h2>
      
      <div style={{
        backgroundColor: '#d4edda',
        color: '#155724',
        border: '1px solid #c3e6cb',
        borderRadius: '8px',
        padding: '15px',
        margin: '20px 0',
        textAlign: 'center'
      }}>
        {message}
      </div>

      <div className={styles.loginField}>
        <input 
          type='password' 
          placeholder='Nueva contraseña' 
          value={newPassword} 
          onChange={e => setNewPassword(e.target.value)} 
          required 
          className={styles.loginInput}
          minLength={6}
        />
      </div>

      <div className={styles.loginField}>
        <input 
          type='password' 
          placeholder='Confirmar nueva contraseña' 
          value={confirmPassword} 
          onChange={e => setConfirmPassword(e.target.value)} 
          required 
          className={styles.loginInput}
          minLength={6}
        />
      </div>

      {message && (
        <div className={styles.loginError} style={{
          backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da',
          color: message.includes('✅') ? '#155724' : '#721c24',
          border: `1px solid ${message.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          {message}
        </div>
      )}

      <button type='submit' className={styles.loginButton} disabled={loading}>
        {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
      </button>

      <button 
        type='button' 
        className={styles.loginButton} 
        style={{
          backgroundColor: '#6c757d',
          marginTop: '10px'
        }}
        onClick={() => navigate('/login')}
      >
        Volver al inicio de sesión
      </button>
    </form>
  );
};

export default ResetPassword; 