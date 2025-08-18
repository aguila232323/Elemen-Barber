import React, { useEffect, useState } from 'react';
import styles from './Citas.module.css';
import fotoLuis from '../../../assets/images/luis.jpg';
import SeleccionarServicioModal from '../../../components/SeleccionarServicioModal';
import CalendarBooking from '../../../components/CalendarBooking';
import ResenaModal from '../../../components/ResenaModal';
import { FaSave, FaTimes, FaUserPlus, FaStar } from 'react-icons/fa';
import { config } from '../../../config/config';

interface Cita {
  id: number;
  servicio: { 
    nombre: string;
    emoji?: string;
  };
  fechaHora: string;
  estado?: 'pendiente' | 'confirmada' | 'completada' | 'cancelada' | 'finalizada';
  comentario?: string;
  reseñada?: boolean;
}

interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  duracionMinutos: number;
  emoji?: string;
  textoDescriptivo?: string;
}

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  telefono?: string;
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

  // Estados para reserva de citas por admin
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminBookingModal, setShowAdminBookingModal] = useState(false);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [bookingForm, setBookingForm] = useState({
    usuarioId: '',
    servicioId: '',
    fechaHora: '',
    comentario: ''
  });

  // Estados para cancelación de citas
  const [cancelandoCita, setCancelandoCita] = useState<number | null>(null);
  const [errorCancelacion, setErrorCancelacion] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [citaACancelar, setCitaACancelar] = useState<Cita | null>(null);
  
  // Estados para el calendario de reserva
  const [showCalendario, setShowCalendario] = useState(false);
  
  // Estados para reseñas
  const [showResenaModal, setShowResenaModal] = useState(false);
  const [citaParaResenar, setCitaParaResenar] = useState<Cita | null>(null);
  const [guardandoResena, setGuardandoResena] = useState(false);

  useEffect(() => {
    const fetchCitas = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`${config.API_BASE_URL}/api/citas/mis-citas`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (!res.ok) throw new Error('No se pudieron cargar tus citas');
        const data = await res.json();
        
        // Ordenar citas: más recientes primero, terminadas al final
        const citasOrdenadas = data.sort((a: Cita, b: Cita) => {
          const fechaA = new Date(a.fechaHora);
          const fechaB = new Date(b.fechaHora);
          
          // Separar citas terminadas de las activas
          const esTerminadaA = a.estado === 'finalizada' || a.estado === 'completada';
          const esTerminadaB = b.estado === 'finalizada' || b.estado === 'completada';
          
          // Si una es terminada y la otra no, la terminada va al final
          if (esTerminadaA && !esTerminadaB) return 1;
          if (!esTerminadaA && esTerminadaB) return -1;
          
          // Si ambas son del mismo tipo (terminadas o activas), ordenar por fecha
          // Para citas activas: más reciente primero
          // Para citas terminadas: más reciente primero
          return fechaB.getTime() - fechaA.getTime();
        });
        
        setCitas(citasOrdenadas);
        
      } catch (err: any) {
        setError(err.message || 'Error al cargar tus citas');
      } finally {
        setLoading(false);
      }
    };
    fetchCitas();
  }, []);

  // Verificar si el usuario es admin
  useEffect(() => {
    const checkAdminStatus = () => {
      const userRole = localStorage.getItem('userRole');
      setIsAdmin(userRole === 'ADMIN');
    };
    checkAdminStatus();
  }, []);

  // Cargar usuarios y servicios para admin
  useEffect(() => {
    if (isAdmin) {
      fetchUsuarios();
      fetchServicios();
    }
  }, [isAdmin]);

  // Función para obtener lista de usuarios
  const fetchUsuarios = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${config.API_BASE_URL}/api/usuarios`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      if (res.ok) {
        const usuariosData = await res.json();
        setUsuarios(usuariosData);
      }
    } catch (error) {
      // Error fetching usuarios
    }
  };

  // Función para obtener lista de servicios
  const fetchServicios = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${config.API_BASE_URL}/api/servicios`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      if (res.ok) {
        const serviciosData = await res.json();
        setServicios(serviciosData);
      }
    } catch (error) {
      // Error fetching servicios
    }
  };

  // Función para manejar cambios en el formulario de reserva
  const handleBookingFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setBookingForm({
      ...bookingForm,
      [e.target.name]: e.target.value
    });
  };

  // Función para crear cita como admin
  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bookingForm.usuarioId || !bookingForm.servicioId || !bookingForm.fechaHora) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${config.API_BASE_URL}/api/citas/crear`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          clienteId: parseInt(bookingForm.usuarioId),
          servicioId: parseInt(bookingForm.servicioId),
          fechaHora: bookingForm.fechaHora,
          comentario: bookingForm.comentario,
          confirmada: true
        })
      });

      if (res.ok) {
        alert('Cita creada exitosamente');
        setShowAdminBookingModal(false);
        setBookingForm({
          usuarioId: '',
          servicioId: '',
          fechaHora: '',
          comentario: ''
        });
        // Recargar citas
        window.location.reload();
      } else {
        const errorData = await res.json();
        alert(`Error al crear la cita: ${errorData.message || 'Error desconocido'}`);
      }
    } catch (error) {
      alert('Error al crear la cita');
    }
  };

  const handleReservarDeNuevo = () => {
    // Abrir el modal de selección de servicios
    setShowServicioModal(true);
  };

  const handleServicioModalClose = () => {
    setShowServicioModal(false);
    setServiciosSeleccionados([]);
  };

  const handleServicioModalContinuar = () => {
    setShowServicioModal(false);
    // Abrir el calendario de reserva con los servicios seleccionados
    setShowCalendario(true);
  };

  const puedeCancelarCita = (fechaHora: string) => {
    const fechaCita = new Date(fechaHora);
    const ahora = new Date();
    const horasAntes = (fechaCita.getTime() - ahora.getTime()) / (1000 * 60 * 60);
    return horasAntes >= 2;
  };

  const handleCancelarCita = async (citaId: number) => {
    // Encontrar la cita
    const cita = citas.find(c => c.id === citaId);
    if (!cita) return;

    // Verificar si la cita es futura
    const fechaCita = new Date(cita.fechaHora);
    const ahora = new Date();
    const horasAntes = (fechaCita.getTime() - ahora.getTime()) / (1000 * 60 * 60);

    if (horasAntes < 2) {
      setErrorCancelacion('No se pueden cancelar citas con menos de 2 horas de antelación');
      return;
    }

    // Mostrar modal de confirmación
    setCitaACancelar(cita);
    setShowCancelModal(true);
  };

  const confirmarCancelacion = async () => {
    if (!citaACancelar) return;

    setCancelandoCita(citaACancelar.id);
    setErrorCancelacion('');
    setShowCancelModal(false);

    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${config.API_BASE_URL}/api/citas/${citaACancelar.id}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al cancelar la cita');
      }

      // Actualizar la lista de citas
      setCitas(citas.filter(cita => cita.id !== citaACancelar.id));
      alert('Cita cancelada correctamente');
    } catch (err: any) {
      setErrorCancelacion(err.message || 'Error al cancelar la cita');
    } finally {
      setCancelandoCita(null);
      setCitaACancelar(null);
    }
  };

  const cancelarConfirmacion = () => {
    setShowCancelModal(false);
    setCitaACancelar(null);
  };

  const handleReservaCompletada = () => {
    setShowCalendario(false);
    // Recargar las citas después de una reserva exitosa
    window.location.reload();
  };



  // Abrir modal de reseña
  const handleAbrirResenaModal = (cita: Cita) => {
    setCitaParaResenar(cita);
    setShowResenaModal(true);
  };

  // Guardar reseña
  const handleGuardarResena = async (calificacion: number, comentario: string) => {
    if (!citaParaResenar) return;
    
    setGuardandoResena(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${config.API_BASE_URL}/api/resenas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          citaId: citaParaResenar.id,
          calificacion: calificacion,
          comentario: comentario
        })
      });

      if (res.ok) {
        // Cerrar modal y actualizar estados sin alert
        setShowResenaModal(false);
        setCitaParaResenar(null);
        // Recargar las citas para actualizar el estado
        window.location.reload();
      } else {
        const errorData = await res.json();
        alert(`Error al guardar la reseña: ${errorData.message || 'Error desconocido'}`);
      }
    } catch (error) {
      alert('Error al guardar la reseña');
    } finally {
      setGuardandoResena(false);
    }
  };

  return (
    <>
      <div className={styles.citasHistorialBg}>
        <div className={styles.citasHistorialCont}>
          <h2 className={styles.citasHistorialTitle}>Mis citas</h2>
          

          
          {/* Botón para admin crear cita */}
          {isAdmin && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <button
                onClick={() => setShowAdminBookingModal(true)}
                style={{
                  background: 'linear-gradient(135deg, #28a745, #20c997)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '0.8rem 1.5rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 12px rgba(40,167,69,0.3)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(40,167,69,0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(40,167,69,0.3)';
                }}
              >
                <FaUserPlus />
                Crear Cita para Cliente
              </button>
            </div>
          )}
          
          {loading ? (
            <div className={styles.citasHistorialVacio}>Cargando tus citas...</div>
          ) : error ? (
            <div className={styles.citasHistorialVacio} style={{color:'#e74c3c'}}>{error}</div>
          ) : citas.length === 0 ? (
            <div className={styles.citasHistorialVacio}>
              <p>No tienes citas registradas.</p>
              <button
                onClick={handleReservarDeNuevo}
                style={{
                  background: 'linear-gradient(135deg, #007bff, #0056b3)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '0.8rem 1.5rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  marginTop: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,123,255,0.3)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                📅 Reservar Cita
              </button>
            </div>
          ) : (
            <>
              {errorCancelacion && (
                <div className={styles.citasHistorialVacio} style={{color:'#e74c3c', marginBottom: '1rem'}}>
                  {errorCancelacion}
                </div>
              )}
            <ul className={styles.citasHistorialLista}>
              {/* Separar citas activas y terminadas */}
              {(() => {
                // Separar citas activas y terminadas
                const citasActivas = citas.filter(cita => 
                  cita.estado !== 'finalizada' && cita.estado !== 'completada'
                );
                const citasTerminadas = citas.filter(cita => 
                  cita.estado === 'finalizada' || cita.estado === 'completada'
                );
                
                return (
                  <>
                    {/* Citas Activas */}
                    {citasActivas.length > 0 && (
                      <>
                        <div style={{ padding: '1rem 0 0.5rem 0', borderBottom: '2px solid #e0e0e0', marginBottom: '1rem' }}>
                          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            📅 Citas Activas ({citasActivas.length})
                          </h3>
                        </div>
                        {citasActivas.map(cita => (
                          <li key={cita.id} className={styles.citasHistorialItem}>
                            <div className={styles.citasHistorialItemHeader}>
                              <div className={styles.citasHistorialItemInfo}>
                                <div className={styles.citasHistorialItemServicio}>
                                  <span className={styles.citasHistorialItemEmoji}>
                                    {cita.servicio?.emoji || '💇'}
                                  </span>
                                  <span className={styles.citasHistorialItemNombre}>
                                    {cita.servicio?.nombre}
                                  </span>
                                </div>
                                <div className={styles.citasHistorialItemFecha}>
                                  {new Date(cita.fechaHora).toLocaleDateString('es-ES', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </div>
                                <div className={styles.citasHistorialItemHora}>
                                  {new Date(cita.fechaHora).toLocaleTimeString('es-ES', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                              </div>
                              <div className={styles.citasHistorialItemEstado}>
                                <span className={`${styles.citasHistorialItemEstadoBadge} ${
                                  cita.estado === 'confirmada' ? styles.confirmada :
                                  cita.estado === 'pendiente' ? styles.pendiente :
                                  cita.estado === 'cancelada' ? styles.cancelada :
                                  styles.completada
                                }`}>
                                  {cita.estado === 'confirmada' ? '✅ Confirmada' :
                                   cita.estado === 'pendiente' ? '⏳ Pendiente' :
                                   cita.estado === 'cancelada' ? '❌ Cancelada' :
                                   '✅ Completada'}
                                </span>
                              </div>
                            </div>
                            
                            {cita.comentario && (
                              <div className={styles.citasHistorialItemComentario}>
                                <strong>Comentario:</strong> {cita.comentario}
                              </div>
                            )}
                            
                            <div className={styles.citasHistorialItemAcciones}>
                              {cita.estado !== 'cancelada' && puedeCancelarCita(cita.fechaHora) && (
                                <button
                                  onClick={() => handleCancelarCita(cita.id)}
                                  className={styles.citasHistorialItemBotonCancelar}
                                  disabled={cancelandoCita === cita.id}
                                >
                                  {cancelandoCita === cita.id ? 'Cancelando...' : 'Cancelar Cita'}
                                </button>
                              )}
                            </div>
                          </li>
                        ))}
                      </>
                    )}
                    
                    {/* Citas Terminadas */}
                    {citasTerminadas.length > 0 && (
                      <>
                        <div style={{ padding: '2rem 0 0.5rem 0', borderBottom: '2px solid #95a5a6', marginBottom: '1rem', marginTop: '2rem' }}>
                          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#7f8c8d', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            ✅ Historial de Citas ({citasTerminadas.length})
                          </h3>
                        </div>
                        {citasTerminadas.map(cita => (
                          <li key={cita.id} className={styles.citasHistorialItem}>
                            <div className={styles.citasHistorialItemHeader}>
                              <div className={styles.citasHistorialItemInfo}>
                                <div className={styles.citasHistorialItemServicio}>
                                  <span className={styles.citasHistorialItemEmoji}>
                                    {cita.servicio?.emoji || '💇'}
                                  </span>
                                  <span className={styles.citasHistorialItemNombre}>
                                    {cita.servicio?.nombre}
                                  </span>
                                </div>
                                <div className={styles.citasHistorialItemFecha}>
                                  {new Date(cita.fechaHora).toLocaleDateString('es-ES', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </div>
                                <div className={styles.citasHistorialItemHora}>
                                  {new Date(cita.fechaHora).toLocaleTimeString('es-ES', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                              </div>
                              <div className={styles.citasHistorialItemEstado}>
                                <span className={`${styles.citasHistorialItemEstadoBadge} ${styles.completada}`}>
                                  ✅ Completada
                                </span>
                              </div>
                            </div>
                            
                            {cita.comentario && (
                              <div className={styles.citasHistorialItemComentario}>
                                <strong>Comentario:</strong> {cita.comentario}
                              </div>
                            )}
                            
                            <div className={styles.citasHistorialItemAcciones}>
                              {!cita.reseñada && (
                                <button
                                  onClick={() => handleAbrirResenaModal(cita)}
                                  className={styles.citasHistorialItemBotonResena}
                                >
                                  <FaStar style={{marginRight: '0.5rem'}} />
                                  Dejar Reseña
                                </button>
                              )}
                              {cita.reseñada && (
                                <span className={styles.citasHistorialItemResenaHecha}>
                                  ✅ Reseña enviada
                                </span>
                              )}
                            </div>
                          </li>
                        ))}
                      </>
                    )}
                  </>
                );
              })()}
            </ul>
            </>
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

       {showCalendario && (
         <CalendarBooking
           servicio={serviciosSeleccionados}
           onReservaCompletada={handleReservaCompletada}
           onClose={() => setShowCalendario(false)}
           nombresServicios={serviciosSeleccionados.map(s => s.nombre).join(', ')}
         />
       )}

      {/* Modal de reserva de citas por admin */}
      {showAdminBookingModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.8)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }} onClick={() => setShowAdminBookingModal(false)}>
          <div style={{
            background: '#fff',
            color: '#333',
            borderRadius: 12,
            padding: '2rem',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            position: 'relative'
          }} onClick={e => e.stopPropagation()}>
            
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1.5rem',
              borderBottom: '2px solid #e0e0e0',
              paddingBottom: '1rem'
            }}>
              <FaUserPlus style={{fontSize: '1.5rem', color: '#28a745'}} />
              <div>
                <h3 style={{
                  margin: 0,
                  fontSize: '1.3rem',
                  fontWeight: 700,
                  color: '#28a745'
                }}>Crear Cita para Cliente</h3>
                <p style={{
                  margin: '0.2rem 0 0 0',
                  fontSize: '0.9rem',
                  color: '#666'
                }}>Reserva una nueva cita para cualquier cliente</p>
              </div>
            </div>

            <form onSubmit={handleCreateBooking} style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              
              {/* Campo de usuario */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#333'
                }}>
                  👤 Cliente *
                </label>
                <select
                  name="usuarioId"
                  value={bookingForm.usuarioId}
                  onChange={handleBookingFormChange}
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    borderRadius: 8,
                    border: '2px solid #e0e0e0',
                    background: '#fff',
                    color: '#333',
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  required
                >
                  <option value="">Seleccionar Cliente</option>
                  {usuarios.map(usuario => (
                    <option key={usuario.id} value={usuario.id}>
                      {usuario.nombre} ({usuario.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Campo de servicio */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#333'
                }}>
                  💇 Servicio *
                </label>
                <select
                  name="servicioId"
                  value={bookingForm.servicioId}
                  onChange={handleBookingFormChange}
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    borderRadius: 8,
                    border: '2px solid #e0e0e0',
                    background: '#fff',
                    color: '#333',
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  required
                >
                  <option value="">Seleccionar Servicio</option>
                  {servicios.map(servicio => (
                    <option key={servicio.id} value={servicio.id}>
                      {servicio.nombre} - {servicio.precio?.toFixed(2)} €
                    </option>
                  ))}
                </select>
              </div>

              {/* Campo de fecha y hora */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#333'
                }}>
                  📅 Fecha y Hora *
                </label>
                <input
                  type="datetime-local"
                  name="fechaHora"
                  value={bookingForm.fechaHora}
                  onChange={handleBookingFormChange}
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    borderRadius: 8,
                    border: '2px solid #e0e0e0',
                    background: '#fff',
                    color: '#333',
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  required
                />
              </div>

              {/* Campo de comentario */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#333'
                }}>
                  ✏️ Comentario (opcional)
                </label>
                <textarea
                  name="comentario"
                  value={bookingForm.comentario}
                  onChange={handleBookingFormChange}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    borderRadius: 8,
                    border: '2px solid #e0e0e0',
                    background: '#fff',
                    color: '#333',
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Botones */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'flex-end',
                marginTop: '1rem',
                paddingTop: '1rem',
                borderTop: '1px solid #e0e0e0'
              }}>
                <button
                  type="button"
                  onClick={() => setShowAdminBookingModal(false)}
                  style={{
                    background: '#6c757d',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '0.8rem 1.5rem',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <FaTimes style={{marginRight: '0.5rem'}} />
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    background: '#28a745',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '0.8rem 1.5rem',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <FaSave style={{marginRight: '0.5rem'}} />
                  Crear Cita
                </button>
              </div>
            </form>
          </div>
                 </div>
       )}

               {/* Modal de confirmación de cancelación */}
        {showCancelModal && citaACancelar && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.85)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(5px)'
          }} onClick={cancelarConfirmacion}>
                         <div style={{
               background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
               color: '#fff',
               borderRadius: '16px',
               padding: '2.5rem',
               width: '90%',
               maxWidth: '450px',
               boxShadow: '0 25px 80px rgba(0,0,0,0.8), 0 10px 30px rgba(220, 53, 69, 0.4)',
               position: 'relative',
               border: '1px solid rgba(220, 53, 69, 0.3)'
             }} onClick={e => e.stopPropagation()}>
              
              {/* Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.2rem',
                marginBottom: '2rem',
                borderBottom: '2px solid rgba(220, 53, 69, 0.2)',
                paddingBottom: '1.2rem'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #dc3545, #c82333)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem',
                  color: '#fff',
                  boxShadow: '0 4px 15px rgba(220, 53, 69, 0.4)'
                }}>
                  ⚠️
                </div>
                <div>
                  <h3 style={{
                    margin: 0,
                    fontSize: '1.4rem',
                    fontWeight: 700,
                    color: '#dc3545',
                    textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                  }}>Confirmar Cancelación</h3>
                                     <p style={{
                     margin: '0.3rem 0 0 0',
                     fontSize: '0.95rem',
                     color: '#bdc3c7',
                     lineHeight: '1.4'
                   }}>¿Estás seguro de que quieres cancelar esta cita?</p>
                </div>
              </div>

                                          {/* Información de la cita */}
               <div style={{
                 background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #0f0f0f 100%)',
                 borderRadius: '12px',
                 padding: '1.5rem',
                 marginBottom: '2rem',
                 border: '1px solid rgba(220, 53, 69, 0.4)',
                 boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.4)'
               }}>
                                   <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.8rem',
                    marginBottom: '0.8rem',
                    padding: '0.5rem',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.05)'
                  }}>
                    <span style={{ fontWeight: 600, color: '#e74c3c', fontSize: '0.9rem' }}>💇 Servicio:</span>
                    <span style={{ color: '#ecf0f1', fontSize: '0.95rem' }}>{citaACancelar.servicio?.nombre}</span>
                  </div>
                                   <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.8rem',
                    marginBottom: '0.8rem',
                    padding: '0.5rem',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.05)'
                  }}>
                    <span style={{ fontWeight: 600, color: '#e74c3c', fontSize: '0.9rem' }}>📅 Fecha:</span>
                    <span style={{ color: '#ecf0f1', fontSize: '0.95rem' }}>{new Date(citaACancelar.fechaHora).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</span>
                  </div>
                                   <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.8rem',
                    padding: '0.5rem',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.05)'
                  }}>
                    <span style={{ fontWeight: 600, color: '#e74c3c', fontSize: '0.9rem' }}>🕐 Hora:</span>
                    <span style={{ color: '#ecf0f1', fontSize: '0.95rem' }}>{new Date(citaACancelar.fechaHora).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                  </div>
               </div>

                                          {/* Mensaje de advertencia */}
               <div style={{
                 background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
                 border: '1px solid rgba(220, 53, 69, 0.3)',
                 borderRadius: '12px',
                 padding: '1.2rem',
                 marginBottom: '2rem',
                 boxShadow: '0 2px 8px rgba(243, 156, 18, 0.3)'
               }}>
                 <div style={{
                   display: 'flex',
                   alignItems: 'center',
                   gap: '0.8rem',
                   color: '#fff',
                   fontSize: '0.95rem',
                   lineHeight: '1.4'
                 }}>
                   <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                   <span>Esta acción no se puede deshacer. La cita será cancelada permanentemente.</span>
                 </div>
               </div>

                           {/* Botones */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'flex-end'
              }}>
                <button
                  type="button"
                  onClick={cancelarConfirmacion}
                  style={{
                    background: 'linear-gradient(135deg, #6c757d, #5a6268)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '0.9rem 1.8rem',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 3px 10px rgba(108, 117, 125, 0.3)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 5px 15px rgba(108, 117, 125, 0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 3px 10px rgba(108, 117, 125, 0.3)';
                  }}
                >
                  <FaTimes style={{marginRight: '0.5rem'}} />
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmarCancelacion}
                  disabled={cancelandoCita === citaACancelar.id}
                  style={{
                    background: 'linear-gradient(135deg, #dc3545, #c82333)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '0.9rem 1.8rem',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    cursor: cancelandoCita === citaACancelar.id ? 'not-allowed' : 'pointer',
                    opacity: cancelandoCita === citaACancelar.id ? 0.7 : 1,
                    transition: 'all 0.3s ease',
                    boxShadow: '0 3px 10px rgba(220, 53, 69, 0.3)'
                  }}
                  onMouseOver={(e) => {
                    if (cancelandoCita !== citaACancelar.id) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 5px 15px rgba(220, 53, 69, 0.4)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (cancelandoCita !== citaACancelar.id) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 3px 10px rgba(220, 53, 69, 0.3)';
                    }
                  }}
                >
                  {cancelandoCita === citaACancelar.id ? (
                    <>
                      <span style={{marginRight: '0.5rem'}}>⏳</span>
                      Cancelando...
                    </>
                  ) : (
                    <>
                      <FaTimes style={{marginRight: '0.5rem'}} />
                      Sí, Cancelar Cita
                    </>
                  )}
                </button>
              </div>
           </div>
         </div>
       )}

       {/* Modal de reseña */}
       {showResenaModal && citaParaResenar && (
         <ResenaModal
           isOpen={showResenaModal}
           onClose={() => {
             setShowResenaModal(false);
             setCitaParaResenar(null);
           }}
           onSubmit={handleGuardarResena}
           citaId={citaParaResenar.id}
           servicioNombre={citaParaResenar.servicio?.nombre || ''}
           loading={guardandoResena}
         />
       )}
     </>
   );
 };

export default Citas;
