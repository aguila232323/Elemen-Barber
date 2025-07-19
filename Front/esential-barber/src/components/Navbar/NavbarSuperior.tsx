import React, { useState, useEffect } from 'react';
import styles from './NavbarSuperior.module.css';
import { FaUserCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import SeleccionarServicioModal from '../SeleccionarServicioModal';
import CalendarBooking from '../CalendarBooking';
import Login from '../../pages/auth/Login';

function getUserName() {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    const payload = JSON.parse(jsonPayload);
    return payload.nombre || payload.name || payload.email || 'Usuario';
  } catch {
    return null;
  }
}

interface NavbarProps {
  section: string;
  setSection: (id: string) => void;
  onLoginSuccess: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ section, setSection, onLoginSuccess }) => {
  const [showLogin, setShowLogin] = useState(false);
  const [showCita, setShowCita] = useState(false);
  const [showCalendario, setShowCalendario] = useState(false);
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState<string[]>([]);
  const [mensajeCita, setMensajeCita] = useState('');
  const [userName, setUserName] = useState<string | null>(getUserName());
  const navigate = useNavigate();

  // Actualizar el nombre del usuario cuando cambie el token
  useEffect(() => {
    const updateUserName = () => {
      setUserName(getUserName());
    };

    // Escuchar cambios en localStorage
    const handleStorageChange = () => {
      updateUserName();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // También actualizar cuando el componente se monta
    updateUserName();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  function handleReservaCompletada() {
    setShowCalendario(false);
    setMensajeCita('Tu cita ha sido confirmada correctamente. ¡Gracias por confiar en nosotros!');
  }

  function handleCerrarConfirmacion() {
    setMensajeCita('');
    setServiciosSeleccionados([]);
    setShowCita(false);
    setShowCalendario(false);
  }

  const handleLoginSuccess = () => {
    setShowLogin(false);
    setUserName(getUserName()); // Actualizar el nombre inmediatamente
    onLoginSuccess();
  };

  return (
    <>
      <nav className={styles.menuBar}>
        <div className={styles.menuBarContent}>
          {/* Izquierda: Inicio y Contacto y Reseñas */}
          <ul className={styles.menuList}>
            <li>
              <span
                className={section==='inicio' ? `${styles.menuLink} ${styles.menuLinkActive}` : styles.menuLink}
                onClick={()=>setSection('inicio')}
              >
                INICIO
              </span>
            </li>
            <li>
              <span
                className={section==='contactoResenas' ? `${styles.menuLink} ${styles.menuLinkActive}` : styles.menuLink}
                onClick={()=>setSection('contactoResenas')}
              >
                CONTACTO
              </span>
            </li>
          </ul>
          {/* Centro: Logo */}
          <span className={styles.logo}>Esential Barber</span>
          {/* Derecha: Portafolio y Perfil */}
          <div className={styles.menuRightGroup}>
            <ul className={styles.menuListRight}>
              <li>
                <span
                  className={section==='portafolio' ? `${styles.menuLink} ${styles.menuLinkActive}` : styles.menuLink}
                  onClick={()=>setSection('portafolio')}
                >
                  PORTAFOLIO
                </span>
              </li>
            </ul>
            <button className={styles.btnCita} onClick={()=>setShowCita(true)}>Pedir Cita</button>
            {userName ? (
              <span className={styles.bienvenidaMsg}>
                Bienvenido, <b>{userName}</b>
              </span>
            ) : (
              <span className={styles.profileIcon} title="Ir a Login" onClick={()=>setShowLogin(true)}>
                <FaUserCircle size={30} />
              </span>
            )}
          </div>
        </div>
      </nav>
      <div className={styles.spacer}></div> {/* Espaciador para navbar fija */}
      {showLogin && (
        <div className={styles.modalOverlay} onClick={()=>setShowLogin(false)}>
          <div className={styles.modalContent} onClick={e=>e.stopPropagation()}>
            <button className={styles.closeModal} onClick={()=>setShowLogin(false)}>×</button>
            <Login onLoginSuccess={handleLoginSuccess} />
          </div>
        </div>
      )}
      {showCita && (
        <SeleccionarServicioModal
          serviciosSeleccionados={serviciosSeleccionados}
          setServiciosSeleccionados={setServiciosSeleccionados}
          onClose={()=>setShowCita(false)}
          onContinuar={()=>{
            setShowCita(false);
            setShowCalendario(true);
          }}
        />
      )}
      {showCalendario && (
        <div className={styles.modalOverlay} onClick={()=>setShowCalendario(false)}>
          <div className={styles.modalContent} onClick={e=>e.stopPropagation()}>
            <button className={styles.closeModal} onClick={()=>setShowCalendario(false)}>×</button>
            <CalendarBooking
              servicio={serviciosSeleccionados}
              onClose={()=>setShowCalendario(false)}
              onReservaCompletada={handleReservaCompletada}
            />
          </div>
        </div>
      )}
      {mensajeCita && (
        <div className={styles.modalOverlay} onClick={handleCerrarConfirmacion}>
          <div className={styles.modalContent} onClick={e=>e.stopPropagation()}>
            <button className={styles.closeModal} onClick={handleCerrarConfirmacion}>×</button>
            <h2 style={{color:'#1976d2', marginTop:0}}>¡Cita confirmada!</h2>
            <div style={{margin:'1.2rem 0', fontSize:'1.1rem'}}>{mensajeCita}</div>
            <button className={styles.btnCita} onClick={handleCerrarConfirmacion}>Cerrar</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar; 