import React from 'react';
import styles from './Citas.module.css';

interface Cita {
  id: number;
  servicio: string;
  fecha: string;
  hora: string;
  estado: 'pendiente' | 'completada' | 'cancelada';
}

interface CitasProps {
  onLoginSuccess?: () => void;
}

// Simulación de citas del usuario
const citasEjemplo: Cita[] = [
  { id: 1, servicio: 'Corte', fecha: '2024-06-01', hora: '10:00', estado: 'completada' },
  { id: 2, servicio: 'Barba', fecha: '2024-06-10', hora: '12:00', estado: 'pendiente' },
  { id: 3, servicio: 'Tinte', fecha: '2024-05-15', hora: '16:00', estado: 'completada' },
];

const Citas: React.FC<CitasProps> = () => {
  // En el futuro, aquí se hará fetch de las citas del usuario autenticado
  const citas = citasEjemplo;

  return (
    <div className={styles.citasHistorialBg}>
      <div className={styles.citasHistorialCont}>
        <h2 className={styles.citasHistorialTitle}>Mis citas</h2>
        {citas.length === 0 ? (
          <div className={styles.citasHistorialVacio}>No tienes citas registradas.</div>
        ) : (
          <ul className={styles.citasHistorialLista}>
            {citas.map(cita => (
              <li key={cita.id} className={styles.citasHistorialItem}>
                <div className={styles.citasHistorialServicio}>{cita.servicio}</div>
                <div className={styles.citasHistorialFechaHora}>{cita.fecha} · {cita.hora}</div>
                <div className={styles.citasHistorialEstado + ' ' + styles['estado_' + cita.estado]}>{cita.estado}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Citas;
