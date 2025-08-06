import React, { useEffect, useState } from 'react';
import styles from './SeleccionarServicioModal.module.css';
import { FaCut, FaPaintBrush, FaMagic, FaUserTie, FaQuestion, FaTimes, FaExclamationTriangle } from 'react-icons/fa';

interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  duracionMinutos: number;
  emoji?: string;
  textoDescriptivo?: string;
}

interface Props {
  serviciosSeleccionados: Servicio[];
  setServiciosSeleccionados: React.Dispatch<React.SetStateAction<Servicio[]>>;
  onClose: () => void;
  onContinuar: () => void;
}

const iconForService = (nombre: string) => {
  const lower = nombre.toLowerCase();
  if (lower.includes('corte')) return <FaCut style={{color:'#64b5f6', fontSize:'1.4rem'}} />;
  if (lower.includes('tinte')) return <FaPaintBrush style={{color:'#64b5f6', fontSize:'1.4rem'}} />;
  if (lower.includes('mecha')) return <FaMagic style={{color:'#4caf50', fontSize:'1.4rem'}} />;
  if (lower.includes('barba') || lower.includes('bigote')) return <FaUserTie style={{color:'#ff9800', fontSize:'1.4rem'}} />;
  return <FaQuestion style={{color:'#888', fontSize:'1.4rem'}} />;
};

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
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Selecciona un servicio</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        <div className={styles.modalBody}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <div className={styles.loadingText}>Cargando servicios...</div>
            </div>
          ) : error ? (
            <div className={styles.errorContainer}>
              <FaExclamationTriangle className={styles.errorIcon} />
              <div className={styles.errorText}>{error}</div>
            </div>
          ) : (
            <>
              <div className={styles.servicesContainer}>
                {servicios.map((serv) => {
                  const seleccionado = serviciosSeleccionados.some(s => s.nombre === serv.nombre);
                  return (
                    <div 
                      key={serv.id} 
                      className={`${styles.serviceCard} ${seleccionado ? styles.selected : ''}`}
                      onClick={() => {
                        // Solo permite seleccionar un servicio a la vez
                        if (seleccionado) {
                          setServiciosSeleccionados([]); // Deseleccionar
                        } else {
                          setServiciosSeleccionados([serv]); // Seleccionar solo este servicio
                        }
                      }}
                    >
                      <div className={styles.serviceContent}>
                        <div className={styles.serviceIcon}>
                          {serv.emoji ? (
                            <span style={{fontSize:'1.4rem'}} role="img" aria-label={serv.nombre}>
                              {serv.emoji}
                            </span>
                          ) : (
                            iconForService(serv.nombre)
                          )}
                        </div>
                        
                        <div className={styles.serviceInfo}>
                          <h3 className={styles.serviceName}>{serv.nombre}</h3>
                          <p className={styles.serviceDescription}>
                            {serv.descripcion || `Duración: ${serv.duracionMinutos} minutos`}
                          </p>
                          <div className={styles.serviceDetails}>
                            <span className={styles.servicePrice}>{serv.precio}€</span>
                            {serv.duracionMinutos > 0 && (
                              <span className={styles.serviceDuration}>{serv.duracionMinutos} min</span>
                            )}
                          </div>
                        </div>
                        
                        <button
                          className={`${styles.addButton} ${seleccionado ? styles.selected : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (seleccionado) {
                              setServiciosSeleccionados([]);
                            } else {
                              setServiciosSeleccionados([serv]);
                            }
                          }}
                        >
                          {seleccionado ? 'Añadido' : 'Añadir'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <button
                className={styles.continueButton}
                disabled={!serviciosSeleccionados.length}
                onClick={onContinuar}
              >
                Continuar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeleccionarServicioModal; 