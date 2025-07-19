import React from 'react';
import styles from '../pages/user/Citas/Citas.module.css';

const servicios = [
  { nombre: 'Corte', precio: '12€', tiempo: '30 min' },
  { nombre: 'Tinte', precio: '18€', tiempo: '45 min' },
  { nombre: 'Barba', precio: '8€', tiempo: '20 min' },
];

interface Props {
  serviciosSeleccionados: string[];
  setServiciosSeleccionados: React.Dispatch<React.SetStateAction<string[]>>;
  onClose: () => void;
  onContinuar: () => void;
}

const SeleccionarServicioModal: React.FC<Props> = ({ serviciosSeleccionados, setServiciosSeleccionados, onClose, onContinuar }) => {
  return (
    <div className={styles.citasModalBg}>
      <div className={styles.citasModal}>
        <button onClick={onClose} className={styles.citasCloseBtn}>×</button>
        <h2 style={{marginTop:0, marginBottom:'1.5rem', textAlign:'center', color:'#1976d2'}}>Selecciona tus servicios</h2>
        <div className={styles.citasServicios}>
          {servicios.map((serv) => {
            const seleccionado = serviciosSeleccionados.includes(serv.nombre);
            return (
              <div key={serv.nombre} className={styles.citasServicio}>
                <div>
                  <div className={styles.citasServicioNombre}>{serv.nombre}</div>
                  <div className={styles.citasServicioDetalle}>{serv.precio} · {serv.tiempo}</div>
                </div>
                <button
                  className={
                    seleccionado
                      ? `${styles.citasServicioBtn} ${styles.selected}`
                      : styles.citasServicioBtn
                  }
                  onClick={() => {
                    setServiciosSeleccionados(sel => seleccionado ? sel.filter(s=>s!==serv.nombre) : [...sel, serv.nombre]);
                  }}
                >
                  {seleccionado ? 'Añadido' : 'Añadir'}
                </button>
              </div>
            );
          })}
        </div>
        <button
          className={styles.citasContinuarBtn}
          disabled={!serviciosSeleccionados.length}
          onClick={onContinuar}
        >
          Continuar
        </button>
      </div>
    </div>
  );
};

export default SeleccionarServicioModal; 