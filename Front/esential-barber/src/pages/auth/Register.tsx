import React, { useState } from 'react';
import styles from './Login.module.css';
import { FaEnvelope, FaLock, FaUser } from 'react-icons/fa';
import { register as registerService } from '../../services/authService';

interface RegisterProps {
  onClose?: () => void;
  onSwitchToLogin?: () => void;
}

const Register: React.FC<RegisterProps> = ({ onClose, onSwitchToLogin }) => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

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
      await registerService(nombre, email, password);
      setSuccess('¡Registro exitoso! Ahora puedes iniciar sesión.');
      setTimeout(() => {
        if (onClose) onClose();
        if (onSwitchToLogin) onSwitchToLogin();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Error al registrar');
    } finally {
      setLoading(false);
    }
  };

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