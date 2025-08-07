import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { googleCalendarService } from '../../services/googleCalendarService';
import { useAuth } from '../../hooks/useAuth';
import styles from './GoogleCallback.module.css';

const GoogleCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        if (error) {
          setStatus('error');
          setMessage('Error en la autorización: ' + error);
          return;
        }

        if (!code) {
          setStatus('error');
          setMessage('No se recibió código de autorización');
          return;
        }

        if (!user?.email) {
          setStatus('error');
          setMessage('Usuario no autenticado');
          return;
        }

        // Procesar el callback
        const response = await googleCalendarService.handleCallback(code, user.email);
        
        setStatus('success');
        setMessage(response.message || 'Autorización completada exitosamente');

        // Redirigir después de 3 segundos
        setTimeout(() => {
          navigate('/perfil');
        }, 3000);

      } catch (err) {
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'Error desconocido');
      }
    };

    handleCallback();
  }, [searchParams, user, navigate]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.icon}>
          {status === 'loading' && <div className={styles.spinner}></div>}
          {status === 'success' && <div className={styles.successIcon}>✅</div>}
          {status === 'error' && <div className={styles.errorIcon}>❌</div>}
        </div>
        
        <h2 className={styles.title}>
          {status === 'loading' && 'Procesando autorización...'}
          {status === 'success' && 'Autorización completada'}
          {status === 'error' && 'Error en la autorización'}
        </h2>
        
        <p className={styles.message}>{message}</p>
        
        {status === 'success' && (
          <p className={styles.redirect}>
            Redirigiendo al perfil en 3 segundos...
          </p>
        )}
        
        {status === 'error' && (
          <button 
            onClick={() => navigate('/perfil')}
            className={styles.button}
          >
            Volver al perfil
          </button>
        )}
      </div>
    </div>
  );
};

export default GoogleCallback; 