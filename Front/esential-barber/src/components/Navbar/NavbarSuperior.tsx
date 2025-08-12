import React, { useState, useEffect } from 'react';
import { FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './NavbarSuperior.module.css';
import logoElemental from '../../assets/images/logoElemental.png';
import Login from '../../pages/auth/Login';
import Register from '../../pages/auth/Register';
import SeleccionarServicioModal from '../SeleccionarServicioModal';
import CalendarBooking from '../CalendarBooking';

interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  duracionMinutos: number;
  emoji?: string;
  textoDescriptivo?: string;
}

function getUserName() {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.name || payload.sub || 'Usuario';
    }
  } catch (error) {
    // Error parsing token
  }
  return null;
}

interface NavbarProps {
  section: string;
  setSection: (id: string) => void;
  onLoginSuccess: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ section, setSection, onLoginSuccess }) => {
  const [userName, setUserName] = useState<string | null>(getUserName());
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showCita, setShowCita] = useState(false);
  const [showCalendario, setShowCalendario] = useState(false);
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState<Servicio[]>([]);
  const [serviciosDisponibles, setServiciosDisponibles] = useState<Servicio[]>([]);
  const [mensajeCita, setMensajeCita] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isInVerificationMode, setIsInVerificationMode] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  // Actualizar nombre de usuario cuando cambie el token o el usuario
  useEffect(() => {
    const updateUserName = () => {
      if (user) {
        setUserName(user.nombre || user.email || 'Usuario');
      } else {
        setUserName(null);
      }
    };
    
    updateUserName();
    window.addEventListener('storage', updateUserName);
    return () => {
      window.removeEventListener('storage', updateUserName);
    };
  }, [user]);

  // Cargar servicios disponibles al montar
  useEffect(() => {
    fetch('http://localhost:8080/api/servicios')
      .then(res => res.json())
      .then(data => setServiciosDisponibles(data))
      .catch(() => setServiciosDisponibles([]));
  }, []);

  // Cerrar menú móvil al cambiar de sección
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [section]);

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
    setShowRegister(false);
    setUserName(user?.nombre || user?.email || 'Usuario');
    onLoginSuccess();
  };

  // Cambiar entre login y registro
  const handleSwitchToRegister = () => {
    setShowLogin(false);
    setShowRegister(true);
  };
  const handleSwitchToLogin = () => {
    setShowRegister(false);
    setShowLogin(true);
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  const handlePedirCita = () => {
    setServiciosSeleccionados([] as Servicio[]);
    if (!user) {
      setShowLogin(true);
    } else {
      setShowCita(true);
    }
  };

  // Verificar si estamos en la página de inicio
  const isInicioPage = location.pathname === '/';

  return (
    <>
      <nav className={styles.menuBar}>
        <div className={styles.menuBarContent}>
          {/* Menú hamburguesa para móvil/tablet */}
          <button 
            className={styles.mobileMenuBtn}
            onClick={handleMobileMenuToggle}
            aria-label="Abrir menú"
          >
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>

          {/* Menú móvil desplegable */}
          <div className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.mobileMenuOpen : ''}`}>
            <div className={styles.mobileMenuContent}>
              {/* Botón de cerrar */}
              <button 
                className={styles.mobileMenuClose}
                onClick={handleMobileMenuClose}
                aria-label="Cerrar menú"
              >
                <FaTimes />
              </button>
              
              <ul className={styles.mobileMenuList}>
                <li>
                  <button
                    className={`${styles.mobileMenuLink} ${section === 'inicio' ? styles.mobileMenuLinkActive : ''}`}
                    onClick={() => {
                      setSection('inicio');
                      handleMobileMenuClose();
                    }}
                  >
                    INICIO
                  </button>
                </li>
                <li>
                  <button
                    className={`${styles.mobileMenuLink} ${section === 'contactoResenas' ? styles.mobileMenuLinkActive : ''}`}
                    onClick={() => {
                      setSection('contactoResenas');
                      handleMobileMenuClose();
                    }}
                  >
                    CONTACTO
                  </button>
                </li>
                <li>
                  <button
                    className={`${styles.mobileMenuLink} ${section === 'portafolio' ? styles.mobileMenuLinkActive : ''}`}
                    onClick={() => {
                      setSection('portafolio');
                      handleMobileMenuClose();
                    }}
                  >
                    PORTAFOLIO
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Menú desktop - Izquierda: Inicio y Contacto */}
          <ul className={styles.menuList}>
            <li>
              <span
                className={section === 'inicio' ? `${styles.menuLink} ${styles.menuLinkActive}` : styles.menuLink}
                onClick={() => setSection('inicio')}
              >
                INICIO
              </span>
            </li>
            <li>
              <span
                className={section === 'contactoResenas' ? `${styles.menuLink} ${styles.menuLinkActive}` : styles.menuLink}
                onClick={() => setSection('contactoResenas')}
              >
                CONTACTO
              </span>
            </li>
          </ul>

          {/* Logo centrado */}
          <div className={styles.logoContainer}>
            <img src={logoElemental} alt="Logo Elemental Barber" className={styles.logoImg} />
          </div>

          {/* Menú desktop - Derecha: Portfolio, Cita y Perfil */}
          <div className={styles.menuRightGroup}>
            <ul className={styles.menuListRight}>
              <li>
                <span
                  className={section === 'portafolio' ? `${styles.menuLink} ${styles.menuLinkActive}` : styles.menuLink}
                  onClick={() => setSection('portafolio')}
                >
                  PORTAFOLIO
                </span>
              </li>
            </ul>
            <button 
              className={styles.btnCita} 
              onClick={handlePedirCita}
            >
              Pedir Cita
            </button>
            {user ? (
              <div className={styles.bienvenidaMsg}>
                <div>Bienvenido</div>
                <div><b>{user.nombre || user.email || 'Usuario'}</b></div>
              </div>
            ) : (
              <span 
                className={styles.profileIcon} 
                title="Ir a Login" 
                onClick={() => setShowLogin(true)}
              >
                <FaUserCircle size={30} />
              </span>
            )}
          </div>

          {/* Acciones móviles (solo perfil) */}
          <div className={styles.mobileActions}>
            {user ? (
              <div className={styles.bienvenidaMsg}>
                <div>Bienvenido</div>
                <div><b>{user.nombre || user.email || 'Usuario'}</b></div>
              </div>
            ) : (
              <span 
                className={styles.profileIcon} 
                title="Ir a Login" 
                onClick={() => setShowLogin(true)}
              >
                <FaUserCircle size={30} />
              </span>
            )}
          </div>
        </div>
      </nav>
      
      <div className={styles.spacer}></div>

      {/* Botón flotante para "Pedir Cita" en móvil - solo en inicio */}
      {isInicioPage && (
        <button
          className={styles.floatingCitaBtn}
          onClick={handlePedirCita}
          aria-label="Pedir Cita"
        >
          <span>Pedir Cita</span>
        </button>
      )}

      {/* Modales existentes */}
      {showLogin && (
        <div className={styles.modalOverlay} onClick={() => setShowLogin(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeModal} onClick={() => setShowLogin(false)}>×</button>
            <Login onLoginSuccess={handleLoginSuccess} onSwitchToRegister={handleSwitchToRegister} onClose={() => setShowLogin(false)} />
          </div>
        </div>
      )}
      
      {showRegister && (
        <div className={styles.modalOverlay} onClick={(e) => {
          if (!isInVerificationMode) {
            const target = e.target as HTMLElement;
            if (target.classList.contains(styles.modalOverlay)) {
              setShowRegister(false);
            }
          }
        }}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button 
              className={styles.closeModal} 
              onClick={() => !isInVerificationMode && setShowRegister(false)}
              style={{ opacity: isInVerificationMode ? 0.5 : 1, cursor: isInVerificationMode ? 'not-allowed' : 'pointer' }}
              title={isInVerificationMode ? 'No se puede cerrar durante la verificación' : 'Cerrar'}
            >
              ×
            </button>
            <Register 
              onClose={() => !isInVerificationMode && setShowRegister(false)} 
              onSwitchToLogin={handleSwitchToLogin}
              onVerificationModeChange={setIsInVerificationMode}
            />
          </div>
        </div>
      )}
      
      {showCita && (
        <SeleccionarServicioModal
          serviciosSeleccionados={serviciosSeleccionados}
          setServiciosSeleccionados={setServiciosSeleccionados}
          onClose={() => setShowCita(false)}
          onContinuar={() => {
            setShowCita(false);
            setShowCalendario(true);
          }}
        />
      )}
      
      {showCalendario && (
        <CalendarBooking
          servicio={serviciosSeleccionados}
          onReservaCompletada={handleReservaCompletada}
          onClose={() => setShowCalendario(false)}
          nombresServicios={serviciosSeleccionados.map(s => s.nombre).join(', ')}
        />
      )}
      
      {mensajeCita && (
        <div className={styles.modalOverlay} onClick={handleCerrarConfirmacion}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeModal} onClick={handleCerrarConfirmacion}>×</button>
            <div className={styles.mensajeCita}>
              <h3>¡Cita Confirmada!</h3>
              <p>{mensajeCita}</p>
              <button onClick={handleCerrarConfirmacion} className={styles.btnConfirmar}>
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Demo de colores */}
      {/* <ColorDemo /> */}
    </>
  );
};

export default Navbar; 