import React, { useState } from 'react';
import styles from './GooglePhoneModal.module.css';

interface GooglePhoneModalProps {
  email: string;
  onComplete: (telefono: string) => void;
  onCancel: () => void;
}

const GooglePhoneModal: React.FC<GooglePhoneModalProps> = ({ email, onComplete, onCancel }) => {
  const [telefono, setTelefono] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!telefono.trim()) {
      setError('Por favor, introduce tu número de teléfono');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8080/api/auth/google/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          telefono: telefono.trim()
        }),
      });

      const data = await response.json();

      console.log('Complete registration response:', data);

      if (response.ok && data.token) {
        // Guardar el token y completar el registro
        localStorage.setItem('authToken', data.token);
        onComplete(telefono.trim());
      } else {
        setError(data.error || 'Error al completar el registro');
      }
    } catch (err: any) {
      console.error('Complete registration error:', err);
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Completar registro</h2>
          <button className={styles.closeButton} onClick={onCancel}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className={styles.modalBody}>
          <div className={styles.iconContainer}>
            <div className={styles.phoneIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
            </div>
          </div>
          
          <p className={styles.modalDescription}>
            Para completar tu registro y poder contactarte, necesitamos tu número de teléfono.
          </p>
          
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Número de teléfono</label>
              <input 
                type='tel' 
                placeholder='Ej: +34 600 123 456' 
                value={telefono} 
                onChange={e => setTelefono(e.target.value)} 
                required 
                className={styles.input}
                pattern="[0-9+\-\s\(\)]+"
                title="Introduce un número de teléfono válido"
              />
            </div>
            
            {error && <div className={styles.error}>{error}</div>}
            
            <div className={styles.buttonGroup}>
              <button type='submit' className={styles.primaryButton} disabled={loading}>
                {loading ? (
                  <div className={styles.loadingSpinner}>
                    <div className={styles.spinner}></div>
                    <span>Completando...</span>
                  </div>
                ) : (
                  'Completar registro'
                )}
              </button>
              
              <button 
                type='button' 
                className={styles.secondaryButton}
                onClick={onCancel}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GooglePhoneModal; 