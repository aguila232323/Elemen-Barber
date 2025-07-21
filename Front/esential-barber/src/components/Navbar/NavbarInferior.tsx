import React from 'react';
import styles from './NavbarInferior.module.css';
import iconCitas from '../../assets/images/calendario.png';
import iconPerfil from '../../assets/images/usuario.png';
import iconInicio from '../../assets/images/hogar.png';

interface BottomNavbarProps {
  onCitas: () => void;
  onPerfil: () => void;
  onInicio: () => void;
  activeTab: 'inicio' | 'citas' | 'perfil';
}

const BottomNavbar: React.FC<BottomNavbarProps> = ({onCitas, onPerfil, onInicio, activeTab}) => (
  <nav className={styles.bottomNavbar}>
    <button className={styles.bottomBtn} onClick={onInicio}>
      <img src={iconInicio} alt="Inicio" className={activeTab === 'inicio' ? styles.bottomIconActive : styles.bottomIconInactive} />
      <span className={styles.bottomBtnLabel}>{'Inicio'}</span>
    </button>
    <button className={styles.bottomBtn} onClick={onCitas}>
      <img src={iconCitas} alt="Citas" className={activeTab === 'citas' ? styles.bottomIconActive : styles.bottomIconInactive} />
      <span className={styles.bottomBtnLabel}>{'Citas'}</span>
    </button>
    <button className={styles.bottomBtn} onClick={onPerfil}>
      <img src={iconPerfil} alt="Perfil" className={activeTab === 'perfil' ? styles.bottomIconActive : styles.bottomIconInactive} />
      <span className={styles.bottomBtnLabel}>{'Perfil'}</span>
    </button>
  </nav>
);

export default BottomNavbar;



