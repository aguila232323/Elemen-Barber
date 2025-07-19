import React from 'react';
import styles from './NavbarInferior.module.css';
import iconCitas from '../../assets/images/calendario.png';
import iconPerfil from '../../assets/images/usuario.png';
import iconInicio from '../../assets/images/hogar.png';

interface BottomNavbarProps {
  onCitas: () => void;
  onPerfil: () => void;
  onInicio: () => void;
}

const BottomNavbar: React.FC<BottomNavbarProps> = ({onCitas, onPerfil, onInicio}) => (
  <nav className={styles.bottomNavbar}>
    <button className={styles.bottomBtn} onClick={onInicio}>
      <img src={iconInicio} alt="Inicio" className={styles.bottomIcon} />
      <span className={styles.bottomBtnLabel}>Inicio</span>
    </button>
    <button className={styles.bottomBtn} onClick={onCitas}>
      <img src={iconCitas} alt="Citas" className={styles.bottomIcon} />
      <span className={styles.bottomBtnLabel}>Citas</span>
    </button>
    <button className={styles.bottomBtn} onClick={onPerfil}>
      <img src={iconPerfil} alt="Perfil" className={styles.bottomIcon} />
      <span className={styles.bottomBtnLabel}>Perfil</span>
    </button>
  </nav>
);

export default BottomNavbar;



