import React, { useEffect, useState } from 'react';
import styles from './Citas.module.css';
import logoBarberia from '../../../assets/images/logoElemental.png';
import SeleccionarServicioModal from '../../../components/SeleccionarServicioModal';

interface Cita {
  id: number;
  servicio: { nombre: string };
  fechaHora: string;
  estado?: 'pendiente' | 'completada' | 'cancelada' | 'finalizada';
  comentario?: string;
}

interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  duracionMinutos: number;
}

interface CitasProps {
  onLoginSuccess?: () => void;
}

const Citas: React.FC<CitasProps> = () => {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showServicioModal, setShowServicioModal] = useState(false);
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState<Servicio[]>([]);

  useEffect(() => {
    const fetchCitas = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch('http://localhost:8080/api/citas/mis-citas', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (!res.ok) throw new Error('No se pudieron cargar tus citas');
        const data = await res.json();
        setCitas(data);
      } catch (err: any) {
        setError(err.message || 'Error al cargar tus citas');
      } finally {
        setLoading(false);
      }
    };
    fetchCitas();
  }, []);

  const handleReservarDeNuevo = () => {
    setShowServicioModal(true);
  };

  const handleServicioModalClose = () => {
    setShowServicioModal(false);
    setServiciosSeleccionados([]);
  };

  const handleServicioModalContinuar = () => {
    setShowServicioModal(false);
    // Aquí podrías redirigir al calendario o manejar la continuidad
    console.log('Servicios seleccionados:', serviciosSeleccionados);
  };

  return (
    <>
      <div className={styles.citasHistorialBg}>
        <div className={styles.citasHistorialCont}>
          <h2 className={styles.citasHistorialTitle}>Mis citas</h2>
          {loading ? (
            <div className={styles.citasHistorialVacio}>Cargando tus citas...</div>
          ) : error ? (
            <div className={styles.citasHistorialVacio} style={{color:'#e74c3c'}}>{error}</div>
          ) : citas.length === 0 ? (
            <div className={styles.citasHistorialVacio}>No tienes citas registradas.</div>
          ) : (
            <ul className={styles.citasHistorialLista}>
              {citas.map(cita => {
                const fecha = cita.fechaHora ? cita.fechaHora.split('T')[0] : '';
                const hora = cita.fechaHora ? cita.fechaHora.split('T')[1]?.substring(0,5) : '';
                // Formato bonito de fecha
                const dateObj = cita.fechaHora ? new Date(cita.fechaHora) : null;
                const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
                const diaNum = dateObj ? dateObj.getDate() : '';
                const mesNombre = dateObj ? meses[dateObj.getMonth()] : '';
                const horaStr = dateObj ? dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '';
                // Datos fijos de barbería y peluquero
                const nombreBarberia = 'Elemen Barber';
                const nombrePeluquero = 'Luis';
                // Emoji según el tipo de servicio
                let emojiServicio = '💈';
                const nombreServicio = cita.servicio?.nombre?.toLowerCase() || '';
                if (nombreServicio.includes('corte')) emojiServicio = '✂️';
                else if (nombreServicio.includes('tinte')) emojiServicio = '🧴';
                else if (nombreServicio.includes('mecha')) emojiServicio = '✨';
                return (
                  <li key={cita.id} className={styles.citasHistorialItem}>
                    <div className={styles.citaColInfo}>
                      {cita.estado && (
                        <span className={
                          styles.citasHistorialEstado + ' ' +
                          (cita.estado === 'finalizada' || cita.estado === 'completada' ? styles.estadoFinalizada : 
                           cita.estado === 'cancelada' ? styles.estadoCancelada : styles.estadoPendiente)
                        }>
                          {cita.estado === 'finalizada' || cita.estado === 'completada' ? 'TERMINADO' : 
                           cita.estado === 'cancelada' ? 'CANCELADO' : 'PENDIENTE'}
                        </span>
                      )}
                      <div className={styles.citasHistorialServicio}>{cita.servicio?.nombre}</div>
                      <div className={styles.citaInfoBarberia}>
                        <img src={logoBarberia} alt="Logo Elemen Barber" className={styles.citaLogoBarberia} />
                        <div className={styles.citaInfoText}>
                          <span className={styles.citaNombreBarberia}>{nombreBarberia}</span>
                          <span className={styles.citaNombrePeluquero}>con {nombrePeluquero}</span>
                        </div>
                      </div>
                      {cita.comentario && <div className={styles.citasHistorialComentario}>{cita.comentario}</div>}
                      <button className={styles.citaReservarBtn} onClick={handleReservarDeNuevo}>
                        Reservar de nuevo
                      </button>
                    </div>
                    <div className={styles.citaColFecha}>
                      <div className={styles.citasHistorialFechaMes}>{mesNombre}</div>
                      <div className={styles.citasHistorialFechaDia}>{diaNum}</div>
                      <div className={styles.citasHistorialFechaHora}>{horaStr}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
      
      {showServicioModal && (
        <SeleccionarServicioModal
          serviciosSeleccionados={serviciosSeleccionados}
          setServiciosSeleccionados={setServiciosSeleccionados}
          onClose={handleServicioModalClose}
          onContinuar={handleServicioModalContinuar}
        />
      )}
    </>
  );
};

export default Citas;
