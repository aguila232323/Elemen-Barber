import React, { useState } from 'react';
import styles from './Login.module.css';
import { login as loginService } from '../../services/authService';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import EmailVerification from './EmailVerification';
import { useGoogleLogin } from '@react-oauth/google';
import GooglePhoneModal from './GooglePhoneModal';

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
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [googleUserEmail, setGoogleUserEmail] = useState('');
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
      if (err.message === 'EMAIL_NOT_VERIFIED') {
        setUnverifiedEmail(email);
        setShowEmailVerification(true);
      } else {
        setError(err.message || 'Error al iniciar sesión');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSuccess = () => {
    setShowEmailVerification(false);
    setUnverifiedEmail('');
    // Intentar login nuevamente después de la verificación
    handleSubmit(new Event('submit') as any);
  };

  const handleBackToLogin = () => {
    setShowEmailVerification(false);
    setUnverifiedEmail('');
    setError('');
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

  const handleBackToLoginFromForgot = () => {
    setShowForgotPassword(false);
    setForgotPasswordEmail('');
    setForgotPasswordMessage('');
  };

  const handleGoogleLogin = useGoogleLogin({
    scope: 'openid email profile https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events',
    onSuccess: async (response) => {
      try {
        setLoading(true);
        setError('');
        
        console.log('Google login response:', response);
        
        // Obtener información del usuario de Google usando el access token
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${response.access_token}` },
        }).then(res => res.json());

        console.log('Google user info:', userInfo);
        
        // Verificar si el usuario tiene teléfono en Google
        const telefono = userInfo.phone_number || null;
        
        // Enviar datos al backend
        const backendResponse = await fetch('http://localhost:8080/api/auth/google', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            idToken: response.access_token,
            email: userInfo.email,
            name: userInfo.name,
            picture: userInfo.picture,
            telefono: telefono
          }),
        });

        console.log('Backend response status:', backendResponse.status);
        
        const data = await backendResponse.json();
        console.log('Backend response data:', data);
        
        if (backendResponse.ok) {
          // Verificar si el backend indica que necesita teléfono
          if (data.requiresPhone) {
            setGoogleUserEmail(userInfo.email);
            setShowPhoneModal(true);
            setLoading(false);
            return;
          }
          
          // Si hay token, proceder con el login
          if (data.token) {
            localStorage.setItem('authToken', data.token);
            
            // Verificar acceso a Google Calendar para usuarios de Google
            if (userInfo.email) {
              console.log('🔍 Verificando acceso a Google Calendar...');
              console.log('   - Email:', userInfo.email);
              console.log('   - Access Token:', response.access_token ? 'SÍ' : 'NO');
              try {
                const calendarResponse = await fetch('http://localhost:8080/api/auth/google/check-calendar-access', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${data.token}`
                  },
                  body: JSON.stringify({
                    email: userInfo.email,
                    accessToken: response.access_token
                  }),
                });
                
                console.log('📡 Respuesta del servidor Calendar:', calendarResponse.status);
                
                if (calendarResponse.ok) {
                  const calendarData = await calendarResponse.json();
                  console.log('✅ Verificación de Calendar completada:', calendarData);
                  console.log('   - Status:', calendarData.status);
                  console.log('   - Message:', calendarData.message);
                  console.log('   - Has Calendar Access:', calendarData.hasCalendarAccess);
                } else {
                  const errorData = await calendarResponse.json();
                  console.log('⚠️ Error al verificar acceso a Calendar:', errorData);
                }
              } catch (calendarErr) {
                console.log('⚠️ Error al verificar acceso a Calendar:', calendarErr);
              }
            }
            
            setUser('reload');
            if (onLoginSuccess) onLoginSuccess();
            if (onClose) onClose();
          } else {
            setError('Error en la autenticación con Google: No se recibió token');
          }
        } else {
          setError(data.error || 'Error en la autenticación con Google');
        }
      } catch (err: any) {
        console.error('Google login error:', err);
        setError('Error al iniciar sesión con Google: ' + (err.message || 'Error desconocido'));
      } finally {
        setLoading(false);
      }
    },
    onError: (error) => {
      console.error('Google OAuth error:', error);
      setError('Error al iniciar sesión con Google: ' + (error.error_description || error.error || 'Error desconocido'));
      setLoading(false);
    }
  });

  const handlePhoneComplete = (telefono: string) => {
    setShowPhoneModal(false);
    setGoogleUserEmail('');
    
    // El token ya se guardó en el modal, ahora actualizar el contexto de autenticación
    setUser('reload');
    if (onLoginSuccess) onLoginSuccess();
    if (onClose) onClose();
  };

  const handlePhoneCancel = () => {
    setShowPhoneModal(false);
    setGoogleUserEmail('');
  };

  // Mostrar componente de verificación de email
  if (showEmailVerification) {
    return (
      <EmailVerification
        email={unverifiedEmail}
        onVerificationSuccess={handleVerificationSuccess}
        onBackToLogin={handleBackToLogin}
      />
    );
  }

  // Mostrar modal de teléfono para Google
  if (showPhoneModal) {
    return (
      <GooglePhoneModal
        email={googleUserEmail}
        onComplete={handlePhoneComplete}
        onCancel={handlePhoneCancel}
      />
    );
  }

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
          onClick={handleBackToLoginFromForgot}
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
      <button 
        type='button' 
        className={styles.loginGoogle} 
        disabled={loading}
        onClick={() => handleGoogleLogin()}
      >
        <svg width='22' height='22' viewBox='0 0 48 48' style={{marginRight:8}}><g><path fill='#4285F4' d='M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.85-6.85C35.64 2.36 30.18 0 24 0 14.82 0 6.73 5.82 2.69 14.09l7.98 6.2C12.36 13.09 17.73 9.5 24 9.5z'/><path fill='#34A853' d='M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.64 7.01l7.19 5.6C43.98 37.36 46.1 31.45 46.1 24.55z'/><path fill='#FBBC05' d='M9.67 28.29c-1.09-3.25-1.09-6.74 0-9.99l-7.98-6.2C-1.06 17.18-1.06 30.82 1.69 39.91l7.98-6.2z'/><path fill='#EA4335' d='M24 46c6.18 0 11.64-2.36 15.99-6.45l-7.19-5.6c-2.01 1.35-4.6 2.15-7.8 2.15-6.27 0-11.64-3.59-13.33-8.59l-7.98 6.2C6.73 42.18 14.82 48 24 48z'/></g></svg>
        {loading ? 'Conectando...' : 'Ingresar con Google'}
      </button>
      <div className={styles.loginRegister}>
        ¿No tienes cuenta?{' '}
        <span className={styles.loginRegisterLink} style={{cursor:'pointer'}} onClick={onSwitchToRegister}>Regístrate aquí</span>
      </div>
    </form>
  );
};

export default Login;
