import React, { useState, useEffect } from 'react';
import { FaGoogle, FaCalendar, FaInfoCircle, FaCheckCircle, FaTimesCircle, FaExternalLinkAlt, FaUnlink } from 'react-icons/fa';
import { googleCalendarService } from '../services/googleCalendarService';
import type { GoogleCalendarStatus } from '../services/googleCalendarService';
import styles from './GoogleCalendarInfo.module.css';

interface GoogleCalendarInfoProps {
  className?: string;
}

const GoogleCalendarInfo: React.FC<GoogleCalendarInfoProps> = ({ className }) => {
  const [status, setStatus] = useState<GoogleCalendarStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [authorizing, setAuthorizing] = useState(false);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const statusData = await googleCalendarService.getStatus();
      setStatus(statusData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthorize = async () => {
    try {
      setAuthorizing(true);
      setError(null);
      
      const authResponse = await googleCalendarService.authorizeCalendar();
      
      if (authResponse.authorizationUrl) {
        // Abrir la URL de autorización en una nueva ventana
        window.open(authResponse.authorizationUrl, '_blank', 'width=600,height=700');
        
        // Mostrar instrucciones al usuario
        alert('Se ha abierto una ventana para autorizar Google Calendar. Por favor, completa la autorización y luego recarga esta página.');
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al autorizar');
    } finally {
      setAuthorizing(false);
    }
  };

  const handleRevoke = async () => {
    if (!confirm('¿Estás seguro de que quieres revocar el acceso a Google Calendar? Esto eliminará la autorización.')) {
      return;
    }

    try {
      setAuthorizing(true);
      setError(null);
      
      await googleCalendarService.revokeAuthorization();
      await loadStatus(); // Recargar estado
      
      alert('Autorización de Google Calendar revocada exitosamente.');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al revocar autorización');
    } finally {
      setAuthorizing(false);
    }
  };

  if (loading) {
    return (
      <div className={`${styles.container} ${className || ''}`}>
        <div className={styles.loading}>
          <FaCalendar className={styles.icon} />
          <span>Cargando información de Google Calendar...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.container} ${className || ''}`}>
        <div className={styles.error}>
          <FaTimesCircle className={styles.icon} />
          <span>Error: {error}</span>
          <button onClick={loadStatus} className={styles.retryButton}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!status) {
    return null;
  }

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.header}>
        <div className={styles.title}>
          <FaGoogle className={styles.googleIcon} />
          <span>Integración con Google Calendar</span>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className={styles.toggleButton}
        >
          {showDetails ? 'Ocultar' : 'Mostrar'} detalles
        </button>
      </div>

      <div className={styles.status}>
        <div className={styles.statusItem}>
          <span>Usuario de Google:</span>
          {status.isGoogleUser ? (
            <FaCheckCircle className={styles.checkIcon} />
          ) : (
            <FaTimesCircle className={styles.errorIcon} />
          )}
        </div>

        {status.isGoogleUser && (
          <>
            <div className={styles.statusItem}>
              <span>Calendario autorizado:</span>
              {status.calendarAuthorized ? (
                <FaCheckCircle className={styles.checkIcon} />
              ) : (
                <FaTimesCircle className={styles.errorIcon} />
              )}
            </div>

            {!status.calendarAuthorized && (
              <div className={styles.authorizeSection}>
                <p className={styles.message}>
                  {status.message}
                </p>
                <button
                  onClick={handleAuthorize}
                  disabled={authorizing}
                  className={styles.authorizeButton}
                >
                  <FaExternalLinkAlt className={styles.icon} />
                  {authorizing ? 'Autorizando...' : 'Autorizar Google Calendar'}
                </button>
              </div>
            )}

            {status.calendarAuthorized && (
              <div className={styles.authorizedSection}>
                <p className={styles.message}>
                  {status.message}
                </p>
                <button
                  onClick={handleRevoke}
                  disabled={authorizing}
                  className={styles.revokeButton}
                >
                  <FaUnlink className={styles.icon} />
                  {authorizing ? 'Revocando...' : 'Revocar autorización'}
                </button>
              </div>
            )}
          </>
        )}

        {!status.isGoogleUser && (
          <div className={styles.notGoogleUser}>
            <FaInfoCircle className={styles.infoIcon} />
            <p>Esta funcionalidad solo está disponible para usuarios autenticados con Google.</p>
          </div>
        )}
      </div>

      {showDetails && status.isGoogleUser && (
        <div className={styles.details}>
          <h4>Detalles de la integración:</h4>
          <ul>
            <li>
              <strong>Email:</strong> {status.userEmail}
            </li>
            <li>
              <strong>Estado:</strong> {status.calendarAuthorized ? 'Autorizado' : 'No autorizado'}
            </li>
            <li>
              <strong>Funcionalidad:</strong> Las citas se añadirán automáticamente a tu Google Calendar
            </li>
            <li>
              <strong>Seguridad:</strong> Solo tienes acceso a tu propio calendario
            </li>
            <li>
              <strong>Cancelación:</strong> Los eventos se eliminan automáticamente al cancelar citas
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default GoogleCalendarInfo; 