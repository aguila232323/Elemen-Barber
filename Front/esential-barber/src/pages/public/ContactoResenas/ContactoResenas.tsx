import React, { useState, useEffect } from 'react'
import styles from './ContactoResenas.module.css'
import { FaMapMarkerAlt, FaWhatsapp, FaEnvelope, FaFacebookF, FaInstagram, FaTiktok, FaTwitter } from 'react-icons/fa';

const ContactoResenas: React.FC = () => {
  const [mapaLoaded, setMapaLoaded] = useState(false);
  const [mapaError, setMapaError] = useState(false);

  // Obtener los horarios desde las variables CSS
  const getScheduleValue = (variableName: string) => {
    return getComputedStyle(document.documentElement).getPropertyValue(variableName).replace(/"/g, '');
  };

  // Preload de la imagen del mapa
  useEffect(() => {
    const img = new Image();
    img.onload = () => setMapaLoaded(true);
    img.onerror = () => setMapaError(true);
    img.src = '/mapa.png';
  }, []);

  return (
    <div className={styles.contactoContainer}>
      <div className={styles.contactoContent}>
        {/* Columna Izquierda */}
        <div className={styles.contactoColumna}>
          <div className={styles.contactoHeader}>
            <span className={styles.contactoLabel}>
              <FaMapMarkerAlt className={styles.contactoIcon} /> CONTACTO
            </span>
            <h1 className={styles.contactoTitulo}>BEGÍJAR</h1>
          </div>
          
          <div className={styles.contactoInfo}>
            <div className={styles.contactoItem}>
              <span className={`${styles.contactoIconContainer} ${styles.iconLocation}`}>
                <FaMapMarkerAlt />
              </span>
              <span className={styles.contactoTexto}>
                4 Paseo Dr. Revuelta,<br/>Begíjar, Andalucía<br/>
                <span className={styles.contactoSubtitulo}>Barbería</span>
              </span>
            </div>
            
            <div className={styles.contactoItem}>
              <span className={`${styles.contactoIconContainer} ${styles.iconWhatsapp}`}>
                <FaWhatsapp />
              </span>
              <span className={styles.contactoTexto}>
                +34 683 23 55 47<br/>
                <span className={styles.contactoSubtitulo}>Atención al cliente</span>
              </span>
            </div>
            
            <div className={styles.contactoItem}>
              <span className={`${styles.contactoIconContainer} ${styles.iconEmail}`}>
                <FaEnvelope />
              </span>
              <span className={styles.contactoTexto}>
                elemenbarber@gmail.com<br/>
                <span className={styles.contactoSubtitulo}>Reservar cita</span>
              </span>
            </div>
          </div>
          
          <div className={styles.socialButtons}>
            <button className={styles.socialBtn}>
              <FaFacebookF /> Facebook
            </button>
            <button className={styles.socialBtn}>
              <FaInstagram /> Instagram
            </button>
            <button className={styles.socialBtn}>
              <FaTiktok /> Tiktok
            </button>
            <button className={styles.socialBtn}>
              <FaTwitter /> Twitter
            </button>
          </div>
        </div>
        
        {/* Columna Derecha */}
        <div className={styles.horariosColumna}>
          <div className={styles.horariosCard}>
            <table className={styles.horariosTable}>
              <tbody>
                <tr>
                  <td className={styles.horarioDia}>Lun:</td>
                  <td className={styles.horarioHora}>{getScheduleValue('--schedule-monday')}</td>
                </tr>
                <tr>
                  <td className={styles.horarioDia}>Mar:</td>
                  <td className={styles.horarioHora}>{getScheduleValue('--schedule-tuesday')}</td>
                </tr>
                <tr>
                  <td className={styles.horarioDia}>Mié:</td>
                  <td className={styles.horarioHora}>{getScheduleValue('--schedule-wednesday')}</td>
                </tr>
                <tr>
                  <td className={styles.horarioDia}>Jue:</td>
                  <td className={styles.horarioHora}>{getScheduleValue('--schedule-thursday')}</td>
                </tr>
                <tr>
                  <td className={styles.horarioDia}>Vie:</td>
                  <td className={styles.horarioHora}>{getScheduleValue('--schedule-friday')}</td>
                </tr>
                <tr>
                  <td className={styles.horarioDia}>Sáb:</td>
                  <td className={styles.horarioHora}>{getScheduleValue('--schedule-saturday')}</td>
                </tr>
                <tr>
                  <td className={styles.horarioDia}>Dom:</td>
                  <td className={styles.horarioHora}>{getScheduleValue('--schedule-sunday')}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className={styles.mapaContainer}>
            <a 
              href="https://www.google.com/maps?q=4+Paseo+Dr.+Revuelta,+Begíjar,+Andalucía" 
              target="_blank" 
              rel="noopener noreferrer" 
              className={`${styles.mapaLink} ${mapaLoaded ? styles.mapaLoaded : ''} ${mapaError ? styles.mapaError : ''}`}
              style={{
                backgroundImage: mapaLoaded ? `url('/mapa.png')` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              {/* Loading state */}
              {!mapaLoaded && !mapaError && (
                <div className={styles.mapaLoading}>
                  <div className={styles.loadingSpinner}></div>
                  <span>Cargando mapa...</span>
                </div>
              )}
              
              {/* Error state */}
              {mapaError && (
                <div className={styles.mapaErrorState}>
                  <FaMapMarkerAlt />
                  <span>Ver ubicación</span>
                </div>
              )}
              
              {/* Pin posicionado en la ubicación real del mapa */}
              <FaMapMarkerAlt className={styles.mapaIcon} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactoResenas 