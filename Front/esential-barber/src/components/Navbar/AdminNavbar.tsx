import React from 'react';
import styles from './AdminNavbar.module.css';
import iconCitas from '../../assets/images/calendario.png';
import iconPerfil from '../../assets/images/usuario.png';
import iconInicio from '../../assets/images/hogar.png';
import { FaCog } from 'react-icons/fa';

interface AdminNavbarProps {
  onCitas: () => void;
  onPerfil: () => void;
  onInicio: () => void;
  onConfig: () => void;
  activeTab: 'inicio' | 'citas' | 'perfil' | 'config';
}

const AdminNavbar: React.FC<AdminNavbarProps> = ({onCitas, onPerfil, onInicio, onConfig, activeTab}) => (
  <nav className={styles.bottomNavbar}>
    <button className={styles.bottomBtn} onClick={onInicio}>
      <img src={iconInicio} alt="Inicio" className={activeTab === 'inicio' ? styles.bottomIconActive : styles.bottomIconInactive} />
      <span className={styles.bottomBtnLabel}>Inicio</span>
    </button>
    <button className={styles.bottomBtn} onClick={onCitas}>
      <img src={iconCitas} alt="Citas" className={activeTab === 'citas' ? styles.bottomIconActive : styles.bottomIconInactive} />
      <span className={styles.bottomBtnLabel}>Citas</span>
    </button>
    <button className={styles.bottomBtn} onClick={onConfig}>
      <FaCog className={activeTab === 'config' ? styles.bottomIconActive : styles.bottomIconInactive} size={28} />
      <span className={styles.bottomBtnLabel}>Configuración</span>
    </button>
    <button className={styles.bottomBtn} onClick={onPerfil}>
      <img src={iconPerfil} alt="Perfil" className={activeTab === 'perfil' ? styles.bottomIconActive : styles.bottomIconInactive} />
      <span className={styles.bottomBtnLabel}>Perfil</span>
    </button>
  </nav>
);

export default AdminNavbar;
