import React, { useState } from 'react';
import styles from './Login.module.css';
import { FaEnvelope, FaLock, FaUser, FaPhone } from 'react-icons/fa';
import { register as registerService } from '../../services/authService';
import { 
  validateSpanishPhone, 
  normalizePhoneForStorage, 
  getPhoneErrorMessage,
  handlePhoneChange,
  handlePhoneBlur,
  formatPhoneForDisplay
} from '../../utils/phoneUtils';
import EmailVerification from './EmailVerification';

interface RegisterProps {
  onClose?: () => void;
  onSwitchToLogin?: () => void;
  onVerificationModeChange?: (isInVerification: boolean) => void;
}

const Register: React.FC<RegisterProps> = ({ onClose, onSwitchToLogin, onVerificationModeChange }) => {
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
  const [registeredEmail, setRegisteredEmail] = useState('');

  // Notificar cuando cambia el modo de verificación
  React.useEffect(() => {
    if (onVerificationModeChange) {
      onVerificationModeChange(showVerification);
    }
  }, [showVerification, onVerificationModeChange]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validar contraseñas
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    // Validar teléfono
    const phoneError = getPhoneErrorMessage(telefono);
    if (phoneError) {
      setError(phoneError);
      return;
    }

    setLoading(true);
    try {
      const data = await registerService(nombre, email, password, telefono);
      setSuccess('Usuario registrado correctamente. Se ha enviado un código de verificación a tu email.');
      setRegisteredEmail(email);
      setShowVerification(true);
    } catch (err: any) {
      setError(err.message || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSuccess = () => {
    setShowVerification(false);
    setRegisteredEmail('');
    if (onClose) onClose();
  };

  const handleBackToRegister = () => {
    setShowVerification(false);
    setRegisteredEmail('');
    setError('');
    setSuccess('');
  };

  // Mostrar componente de verificación unificado
  if (showVerification) {
    return (
      <EmailVerification
        email={registeredEmail}
        onVerificationSuccess={handleVerificationSuccess}
        onBackToLogin={handleBackToRegister}
        isFromRegister={true}
      />
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
        <input 
          type='tel' 
          placeholder='Ej: 612 345 678' 
          value={telefono} 
          onChange={(e) => handlePhoneChange(e.target.value, setTelefono)}
          onBlur={() => handlePhoneBlur(telefono, setTelefono)}
          required 
          className={styles.loginInput} 
        />
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