import React, { useEffect, useState } from 'react';
import styles from '../pages/user/Citas/Citas.module.css';

// Eliminar el array de servicios inventados
// const servicios = [...]

interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  duracionMinutos: number;
}

interface Props {
  serviciosSeleccionados: string[];
  setServiciosSeleccionados: React.Dispatch<React.SetStateAction<string[]>>;
  onClose: () => void;
  onContinuar: () => void;
}

const SeleccionarServicioModal: React.FC<Props> = ({ serviciosSeleccionados, setServiciosSeleccionados, onClose, onContinuar }) => {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:8080/api/servicios')
      .then(res => {
        if (!res.ok) throw new Error('Error al obtener servicios');
        return res.json();
      })
      .then(data => {
        setServicios(data);
        setLoading(false);
      })
      .catch(err => {
        setError('No se pudieron cargar los servicios');
        setLoading(false);
      });
  }, []);

  return (
    <div className={styles.citasModalBg}>
      <div className={styles.citasModal}>
        <button onClick={onClose} className={styles.citasCloseBtn}>×</button>
        <h2 style={{marginTop:0, marginBottom:'1.5rem', textAlign:'center', color:'#1976d2'}}>Selecciona tus servicios</h2>
        {loading ? (
          <div style={{textAlign:'center', color:'#1976d2'}}>Cargando servicios...</div>
        ) : error ? (
          <div style={{textAlign:'center', color:'#e74c3c'}}>{error}</div>
        ) : (
        <div className={styles.citasServicios}>
          {servicios.map((serv) => {
            const seleccionado = serviciosSeleccionados.includes(serv.nombre);
            return (
              <div key={serv.id} className={styles.citasServicio}>
                <div style={{display:'flex', flexDirection:'column', gap:2}}>
                  <div className={styles.citasServicioNombre} style={{fontWeight:700, fontSize:'1.13rem', color:'#222'}}>{serv.nombre}</div>
                  <div style={{display:'flex', alignItems:'center', gap:8}}>
                    <span style={{fontWeight:900, color:'#1976d2', fontSize:'1.15rem', background:'#fff', borderRadius:4, padding:'0 6px'}}>{serv.precio}€</span>
                    {serv.duracionMinutos > 0 && (
                      <span style={{color:'#888', fontSize:'0.98rem', background:'#fff', borderRadius:4, padding:'0 6px'}}>{serv.duracionMinutos} min</span>
                    )}
                  </div>
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
        )}
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