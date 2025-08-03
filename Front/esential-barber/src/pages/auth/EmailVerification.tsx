import React, { useState } from 'react';
import styles from './Login.module.css';
import { reenviarCodigoSimple, verificarCodigo } from '../../services/authService';
import { FaEnvelope, FaKey, FaArrowLeft } from 'react-icons/fa';

interface EmailVerificationProps {
  email: string;
  onVerificationSuccess: () => void;
  onBackToLogin: () => void;
  isFromRegister?: boolean;
}

const EmailVerification: React.FC<EmailVerificationProps> = ({ 
  email, 
  onVerificationSuccess, 
  onBackToLogin,
  isFromRegister = false
}) => {
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const handleVerificarCodigo = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await verificarCodigo(email, codigo);
      setSuccess('¡Email verificado correctamente!');
      setTimeout(() => {
        onVerificationSuccess();
      }, 1500);
    } catch (err: any) {
      console.error('Error al verificar código:', err);
      if (err.message.includes('fetch')) {
        setError('Error de conexión. Verifica que el servidor esté ejecutándose.');
      } else {
        setError(err.message || 'Error al verificar código');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReenviarCodigo = async () => {
    setError('');
    setSuccess('');
    setResendLoading(true);

    try {
      console.log('Intentando reenviar código a:', email);
      // Usar la función más simple que no tiene validaciones estrictas
      await reenviarCodigoSimple(email);
      setSuccess('Código de verificación reenviado correctamente');
    } catch (err: any) {
      console.error('Error al reenviar código:', err);
      if (err.message.includes('fetch')) {
        setError('Error de conexión. Verifica que el servidor esté ejecutándose en http://localhost:8080');
      } else {
        setError(err.message || 'Error al reenviar código');
      }
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className={styles.loginForm}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <FaEnvelope style={{ fontSize: '48px', color: '#667eea', marginBottom: '10px' }} />
        <h2>Verificar tu email</h2>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
          Hemos enviado un código de verificación a <strong>{email}</strong>
        </p>
      </div>

      <form onSubmit={handleVerificarCodigo}>
        <div className={styles.loginField}>
          <div style={{ position: 'relative' }}>
            <FaKey style={{ 
              position: 'absolute', 
              left: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: '#999' 
            }} />
            <input
              type="text"
              placeholder="Código de verificación"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              required
              className={styles.loginInput}
              style={{ paddingLeft: '40px' }}
              maxLength={6}
            />
          </div>
        </div>

        {error && <div className={styles.loginError}>{error}</div>}
        {success && (
          <div className={styles.loginError} style={{
            backgroundColor: '#d4edda',
            color: '#155724',
            border: '1px solid #c3e6cb'
          }}>
            {success}
          </div>
        )}

        <button type="submit" className={styles.loginButton} disabled={loading}>
          {loading ? 'Verificando...' : 'Verificar código'}
        </button>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>
            ¿No recibiste el código?
          </p>
          <button
            type="button"
            className={styles.loginButton}
            style={{
              backgroundColor: '#6c757d',
              marginBottom: '10px'
            }}
            onClick={handleReenviarCodigo}
            disabled={resendLoading}
          >
            {resendLoading ? 'Enviando...' : 'Reenviar código'}
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '15px' }}>
          <button
            type="button"
            className={styles.loginRegisterLink}
            style={{
              background: 'none',
              border: 'none',
              color: '#667eea',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto'
            }}
            onClick={onBackToLogin}
          >
            <FaArrowLeft style={{ marginRight: '5px' }} />
            {isFromRegister ? 'Volver al registro' : 'Volver al inicio de sesión'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmailVerification; 