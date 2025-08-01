import React, { useState } from 'react';
import styles from './Login.module.css';
import { FaEnvelope, FaLock, FaUser, FaPhone, FaKey } from 'react-icons/fa';
import { register as registerService } from '../../services/authService';

interface RegisterProps {
  onClose?: () => void;
  onSwitchToLogin?: () => void;
}

const Register: React.FC<RegisterProps> = ({ onClose, onSwitchToLogin }) => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Estados para verificación
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [verifying, setVerifying] = useState(false);
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutMinutes, setLockoutMinutes] = useState(0);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newCode = [...verificationCode];
      newCode[index] = value;
      setVerificationCode(newCode);
      
      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`code-${index + 1}`) as HTMLInputElement;
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      const newCode = [...verificationCode];
      newCode[index - 1] = '';
      setVerificationCode(newCode);
      const prevInput = document.getElementById(`code-${index - 1}`) as HTMLInputElement;
      if (prevInput) prevInput.focus();
    }
  };

  const getVerificationCodeString = () => {
    return verificationCode.join('');
  };

  const obtenerEstadoVerificacion = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/verificacion/status/${email}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setVerificationAttempts(data.attempts || 0);
        setIsLocked(data.isLocked || false);
        setLockoutMinutes(data.lockoutMinutesRemaining || 0);
      }
    } catch (error) {
      console.error('Error al obtener estado de verificación:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setLoading(true);
    try {
      const response = await registerService(nombre, email, password, telefono);
      if (response.requiresVerification) {
        setShowVerification(true);
        setSuccess('Se ha enviado un código de verificación a tu email.');
        await obtenerEstadoVerificacion(); // Obtener estado inicial
      } else {
        setSuccess('¡Registro exitoso! Ahora puedes iniciar sesión.');
        setTimeout(() => {
          if (onClose) onClose();
          if (onSwitchToLogin) onSwitchToLogin();
        }, 1200);
      }
    } catch (err: any) {
      setError(err.message || 'Error al registrar');
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setVerifying(true);
    try {
      const response = await fetch('http://localhost:8080/api/auth/completar-registro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          codigo: getVerificationCodeString()
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setSuccess('¡Email verificado correctamente! Ahora puedes iniciar sesión.');
        setTimeout(() => {
          if (onClose) onClose();
          if (onSwitchToLogin) onSwitchToLogin();
        }, 1200);
      } else {
        setError(data.error || 'Error al verificar el código');
        // Actualizar estado de verificación después de un intento fallido
        await obtenerEstadoVerificacion();
      }
    } catch (err: any) {
      setError('Error al verificar el código');
      await obtenerEstadoVerificacion();
    } finally {
      setVerifying(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    try {
      const response = await fetch('http://localhost:8080/api/verificacion/enviar-codigo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setSuccess('Código de verificación reenviado correctamente.');
        setVerificationCode(['', '', '', '', '', '']); // Limpiar código anterior
        setVerificationAttempts(0); // Resetear intentos
        setIsLocked(false); // Resetear bloqueo
      } else {
        setError(data.error || 'Error al reenviar el código');
        await obtenerEstadoVerificacion();
      }
    } catch (err: any) {
      setError('Error al reenviar el código');
      await obtenerEstadoVerificacion();
    }
  };

  if (showVerification) {
    return (
      <form onSubmit={handleVerification} className={styles.loginForm} style={{maxWidth: 400}}>
        <h2>Verificar Email</h2>
        <p style={{textAlign: 'center', marginBottom: 20, color: '#666'}}>
          Se ha enviado un código de verificación a <strong>{email}</strong>
        </p>
        
        {/* Información de intentos y bloqueo */}
        <div style={{
          background: isLocked ? '#fff3cd' : '#e3f2fd',
          border: isLocked ? '1px solid #ffeaa7' : '1px solid #bbdefb',
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          {isLocked ? (
            <div style={{color: '#856404'}}>
              <strong>🔒 Cuenta bloqueada temporalmente</strong><br/>
              Demasiados intentos fallidos. Intenta de nuevo en {lockoutMinutes} minutos.
            </div>
          ) : (
            <div style={{color: '#1565c0'}}>
              <strong>🔐 Intentos restantes: {5 - verificationAttempts}/5</strong><br/>
              Después de 5 intentos fallidos, tu cuenta será bloqueada por 15 minutos.
            </div>
          )}
        </div>
        
        <div style={{marginBottom: 20}}>
          <label style={{display: 'block', marginBottom: 10, color: '#333', fontWeight: '500'}}>
            Código de verificación:
          </label>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: 20
          }}>
            {verificationCode.map((digit, index) => (
              <input
                key={index}
                id={`code-${index}`}
                type="text"
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleCodeKeyDown(index, e)}
                className={styles.loginInput}
                style={{
                  width: '45px',
                  height: '50px',
                  textAlign: 'center',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  border: digit ? '2px solid #667eea' : '2px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: digit ? '#f8f9ff' : 'white',
                  color: '#333',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  opacity: isLocked ? 0.5 : 1,
                  pointerEvents: isLocked ? 'none' : 'auto'
                }}
                maxLength={1}
                autoComplete="off"
                required
                disabled={isLocked}
              />
            ))}
          </div>
        </div>
        
        {error && <div className={styles.loginError}>{error}</div>}
        {success && <div className={styles.loginMsg}>{success}</div>}
        <button 
          type='submit' 
          className={styles.loginButton} 
          disabled={verifying || isLocked}
        >
          {verifying ? 'Verificando...' : 'Verificar Código'}
        </button>
        <button 
          type='button' 
          onClick={handleResendCode} 
          className={styles.loginButton} 
          style={{marginTop: 10, backgroundColor: '#6c757d'}}
          disabled={isLocked}
        >
          Reenviar Código
        </button>
        <div className={styles.loginRegister} style={{marginTop:16}}>
          ¿Ya tienes cuenta?{' '}
          <span className={styles.loginRegisterLink} style={{cursor:'pointer'}} onClick={onSwitchToLogin}>Inicia sesión</span>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.loginForm} style={{maxWidth: 400}}>
      <h2>Crear cuenta</h2>
      <div style={{position:'relative'}}>
        <FaUser className={styles.inputIcon} />
        <input type='text' placeholder='Nombre completo' value={nombre} onChange={e=>setNombre(e.target.value)} required className={styles.loginInput} />
      </div>
      <div style={{position:'relative'}}>
        <FaEnvelope className={styles.inputIcon} />
        <input type='email' placeholder='Correo electrónico' value={email} onChange={e=>setEmail(e.target.value)} required className={styles.loginInput} />
      </div>
      <div style={{position:'relative'}}>
        <FaPhone className={styles.inputIcon} />
        <input type='tel' placeholder='Número de teléfono' value={telefono} onChange={e=>setTelefono(e.target.value)} required className={styles.loginInput} />
      </div>
      <div style={{position:'relative'}}>
        <FaLock className={styles.inputIcon} />
        <input type='password' placeholder='Contraseña' value={password} onChange={e=>setPassword(e.target.value)} required className={styles.loginInput} />
      </div>
      <div style={{position:'relative'}}>
        <FaLock className={styles.inputIcon} />
        <input type='password' placeholder='Repetir contraseña' value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} required className={styles.loginInput} />
      </div>
      {error && <div className={styles.loginError}>{error}</div>}
      {success && <div className={styles.loginMsg}>{success}</div>}
      <button type='submit' className={styles.loginButton} disabled={loading}>{loading ? 'Registrando...' : 'Registrarse'}</button>
      <div className={styles.loginRegister} style={{marginTop:16}}>
        ¿Ya tienes cuenta?{' '}
        <span className={styles.loginRegisterLink} style={{cursor:'pointer'}} onClick={onSwitchToLogin}>Inicia sesión</span>
      </div>
    </form>
  );
};

export default Register; 