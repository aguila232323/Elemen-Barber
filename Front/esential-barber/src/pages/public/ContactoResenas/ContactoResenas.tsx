import React from 'react'
import styles from './ContactoResenas.module.css'
import { FaMapMarkerAlt, FaWhatsapp, FaEnvelope, FaFacebookF, FaInstagram, FaTiktok, FaTwitter } from 'react-icons/fa';

const ContactoResenas: React.FC = () => (
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
              +34 600 123 456<br/>
              <span className={styles.contactoSubtitulo}>Atención al cliente</span>
            </span>
          </div>
          
          <div className={styles.contactoItem}>
            <span className={`${styles.contactoIconContainer} ${styles.iconEmail}`}>
              <FaEnvelope />
            </span>
            <span className={styles.contactoTexto}>
              info@esentialbarber.com<br/>
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
                <td className={styles.horarioHora}>Cerrado</td>
              </tr>
              <tr>
                <td className={styles.horarioDia}>Mar:</td>
                <td className={styles.horarioHora}>9:00 - 21:15</td>
              </tr>
              <tr>
                <td className={styles.horarioDia}>Mié:</td>
                <td className={styles.horarioHora}>9:00 - 21:15</td>
              </tr>
              <tr>
                <td className={styles.horarioDia}>Jue:</td>
                <td className={styles.horarioHora}>9:00 - 21:15</td>
              </tr>
              <tr>
                <td className={styles.horarioDia}>Vie:</td>
                <td className={styles.horarioHora}>9:00 - 21:15</td>
              </tr>
              <tr>
                <td className={styles.horarioDia}>Sáb:</td>
                <td className={styles.horarioHora}>9:00 - 21:15</td>
              </tr>
              <tr>
                <td className={styles.horarioDia}>Dom:</td>
                <td className={styles.horarioHora}>Cerrado</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className={styles.mapaContainer}>
          <a 
            href="https://www.google.com/maps?q=4+Paseo+Dr.+Revuelta,+Begíjar,+Andalucía" 
            target="_blank" 
            rel="noopener noreferrer" 
            className={styles.mapaLink}
            style={{
              backgroundImage: `url('/mapa.png?v=${Date.now()}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            {/* Pin posicionado en la ubicación real del mapa */}
            <FaMapMarkerAlt className={styles.mapaIcon} />
          </a>
        </div>
      </div>
    </div>
  </div>
)

export default ContactoResenas 