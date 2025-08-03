import React, { useEffect, useState } from 'react';
import styles from './Citas.module.css';
import logoBarberia from '../../../assets/images/logoElemental.png';
import SeleccionarServicioModal from '../../../components/SeleccionarServicioModal';
import { FaPlus, FaSave, FaTimes, FaUserPlus } from 'react-icons/fa';

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
      const res = await fetch('http://localhost:8080/api/usuarios', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      if (res.ok) {
        const usuariosData = await res.json();
        setUsuarios(usuariosData);
      }
    } catch (error) {
      console.error('Error fetching usuarios:', error);
    }
  };

  // Función para obtener lista de servicios
  const fetchServicios = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('http://localhost:8080/api/servicios', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      if (res.ok) {
        const serviciosData = await res.json();
        setServicios(serviciosData);
      }
    } catch (error) {
      console.error('Error fetching servicios:', error);
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
      const res = await fetch('http://localhost:8080/api/citas/crear', {
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
      console.error('Error creating booking:', error);
      alert('Error al crear la cita');
    }
  };

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
                  <li key={cita.id} className={
                    styles.citasHistorialItem + ' ' +
                    (cita.estado === 'finalizada' || cita.estado === 'completada' ? styles.estadoFinalizadaBorde : 
                     cita.estado === 'cancelada' ? styles.estadoCanceladaBorde : styles.estadoPendienteBorde)
                  }>
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
                      {(cita.estado === 'completada' || cita.estado === 'finalizada' || cita.estado === 'cancelada') && (
                        <button className={styles.citaReservarBtn} onClick={handleReservarDeNuevo}>
                          Reservar de nuevo
                        </button>
                      )}
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
    </>
  );
};

export default Citas;
