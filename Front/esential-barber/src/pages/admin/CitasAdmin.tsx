import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { FaCalendarAlt, FaPlus, FaTimes, FaSave } from 'react-icons/fa';
import './CitasAdminCustom.css';

const localizer = momentLocalizer(moment);
moment.locale('es');

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

interface Cita {
  id: number;
  fechaHora: string;
  comentario?: string;
  confirmada?: boolean;
  fija?: boolean;
  periodicidadDias?: number;
  estado?: string;
  servicio: Servicio;
  usuario: Usuario;
}

// Toolbar profesional personalizado
const CustomToolbar = (toolbar: any) => {
  const goToBack = () => {
    console.log('Going back from:', toolbar.date);
    toolbar.onNavigate('PREV');
  };
  const goToNext = () => {
    console.log('Going next from:', toolbar.date);
    toolbar.onNavigate('NEXT');
  };
  const goToToday = () => {
    console.log('Going to today from:', toolbar.date);
    toolbar.onNavigate('TODAY');
  };
  
  // Función para obtener el nombre del mes en español
  const getMonthName = (date: Date) => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[date.getMonth()];
  };
  
  const label = () => {
    const date = toolbar.date;
    const monthName = getMonthName(date);
    const year = date.getFullYear();
    return (
      <span style={{fontWeight:800, fontSize:'1.2rem', color:'#ffffff'}}>
        {monthName} {year}
      </span>
    );
  };
  
  const handleViewChange = (view: string) => {
    console.log('Changing view to:', view);
    toolbar.onView(view);
  };

  return (
    <div className="citas-admin-toolbar" style={{
      display:'flex',
      alignItems:'center',
      justifyContent:'space-between',
      marginBottom:18,
      background:'linear-gradient(135deg, #1976d2, #1565c0)',
      borderRadius:12,
      padding:'1rem 1.2rem',
      boxShadow:'0 4px 16px rgba(25,118,210,0.15)'
    }}>
      <div style={{display:'flex',alignItems:'center',gap:8}}>
        <button onClick={goToBack} className="citas-admin-nav-btn" style={{
          background:'rgba(255,255,255,0.2)',
          border:'none',
          borderRadius:8,
          padding:'0.5rem 1rem',
          color:'#fff',
          cursor:'pointer',
          fontWeight:600,
          transition:'all 0.3s ease'
        }}>&#8592;</button>
        
        <button onClick={goToNext} className="citas-admin-nav-btn" style={{
          background:'rgba(255,255,255,0.2)',
          border:'none',
          borderRadius:8,
          padding:'0.5rem 1rem',
          color:'#fff',
          cursor:'pointer',
          fontWeight:600,
          transition:'all 0.3s ease'
        }}>&#8594;</button>
        
        <button onClick={goToToday} className="citas-admin-nav-btn" style={{
          background:'rgba(255,255,255,0.2)',
          border:'none',
          borderRadius:8,
          padding:'0.5rem 1rem',
          color:'#fff',
          cursor:'pointer',
          fontWeight:600,
          transition:'all 0.3s ease'
        }}>Hoy</button>
      </div>
      
      <div style={{fontWeight:800, fontSize:'1.2rem', color:'#ffffff'}}>
        {label()}
      </div>
      
      <div style={{display:'flex',alignItems:'center',gap:8}}>
        <button onClick={() => handleViewChange('month')} className="citas-admin-nav-btn" style={{
          background:'rgba(255,255,255,0.2)',
          border:'none',
          borderRadius:8,
          padding:'0.5rem 1rem',
          color:'#fff',
          cursor:'pointer',
          fontWeight:600,
          transition:'all 0.3s ease'
        }}>Mes</button>
      </div>
    </div>
  );
};

const CitasAdmin: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<any|null>(null);
  const [selectedDate, setSelectedDate] = useState<Date|null>(null);
  const [showDayEvents, setShowDayEvents] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showOccupancyModal, setShowOccupancyModal] = useState(false);
  const [selectedDayOccupancy, setSelectedDayOccupancy] = useState<any>(null);
  
  // Estados para modal de periodicidad
  const [showPeriodicModal, setShowPeriodicModal] = useState(false);
  const [selectedCitaForPeriodic, setSelectedCitaForPeriodic] = useState<any>(null);
  const [periodicForm, setPeriodicForm] = useState({
    periodicidadDias: 7,
    fechaInicio: ''
  });
  const [periodicLoading, setPeriodicLoading] = useState(false);
  const [periodicMsg, setPeriodicMsg] = useState<string | null>(null);

  // Función para determinar el estado dinámico de una cita
  const getCitaStatus = (fechaHora: Date, duracionMinutos: number = 45, estadoOriginal?: string) => {
    // Si la cita ya está cancelada en la base de datos, mantener ese estado
    if (estadoOriginal === 'cancelada') {
      return {
        status: 'cancelada',
        label: 'Cancelada',
        color: '#e74c3c',
        bgColor: '#fdf2f2',
        borderColor: '#e74c3c'
      };
    }

    const ahora = moment();
    const inicioCita = moment(fechaHora);
    const finCita = moment(fechaHora).add(duracionMinutos, 'minutes');
    
    if (ahora.isBefore(inicioCita)) {
      return {
        status: 'pendiente',
        label: 'Pendiente',
        color: '#1976d2',
        bgColor: '#e3f2fd',
        borderColor: '#1976d2'
      };
    } else if (ahora.isBetween(inicioCita, finCita)) {
      return {
        status: 'en_curso',
        label: 'En Curso',
        color: '#ff9800',
        bgColor: '#fff3e0',
        borderColor: '#ff9800'
      };
    } else {
      return {
        status: 'completada',
        label: 'Completada',
        color: '#4caf50',
        bgColor: '#e8f5e8',
        borderColor: '#4caf50'
      };
    }
  };

    const fetchCitas = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('authToken');
      console.log('Fetching citas with token:', token ? 'Present' : 'Missing');
      
        const res = await fetch('http://localhost:8080/api/citas/todas', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
      
      console.log('Response status:', res.status);
      console.log('Response ok:', res.ok);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Error response:', errorText);
        throw new Error(`Error ${res.status}: ${errorText}`);
      }
      
        const citas: Cita[] = await res.json();
      
      const eventos = citas.map(cita => {
        const fechaHora = new Date(cita.fechaHora);
        const duracionMinutos = cita.servicio?.duracionMinutos || 45;
        const statusInfo = getCitaStatus(fechaHora, duracionMinutos, cita.estado);
        
        return {
          id: cita.id,
          title: `${cita.servicio?.nombre || 'Sin servicio'} - ${cita.usuario?.nombre || 'Sin usuario'}`,
          start: fechaHora,
          end: new Date(moment(fechaHora).add(duracionMinutos, 'minutes').toISOString()),
          servicio: cita.servicio,
          usuario: cita.usuario,
          comentario: cita.comentario,
          confirmada: cita.confirmada,
          fija: cita.fija,
          periodicidadDias: cita.periodicidadDias,
          status: statusInfo.status,
          statusLabel: statusInfo.label,
          statusColor: statusInfo.color,
          statusBgColor: statusInfo.bgColor,
          statusBorderColor: statusInfo.borderColor,
          estado: cita.estado // Agregar el estado original a los eventos
        };
      });
      
      console.log('Events created:', eventos);
        setEvents(eventos);
      } catch (err: any) {
      console.error('Error fetching citas:', err);
      if (err.message.includes('Failed to fetch')) {
        setError('No se puede conectar con el servidor. Verifica que el backend esté ejecutándose en http://localhost:8080');
      } else {
        setError(err.message || 'Error al cargar las citas');
      }
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchCitas();
  }, []);

  // Componente personalizado para mostrar eventos con estado dinámico
  const EventComponent = ({ event }: { event: any }) => {
    const isCancelled = event.status === 'cancelada';
    
    return (
      <div
        data-status={event.status}
        data-status-label={event.statusLabel}
        style={{
          background: event.statusBgColor || '#1976d2',
          color: '#fff',
          padding: '4px 8px',
          borderRadius: '6px',
          fontSize: '0.85rem',
          fontWeight: 600,
          borderLeft: `3px solid ${event.statusBorderColor || '#1976d2'}`,
          position: 'relative',
          overflow: 'hidden',
          opacity: isCancelled ? 0.7 : 1,
          textDecoration: isCancelled ? 'line-through' : 'none'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ flex: 1, fontSize: '0.8rem' }}>
            {event.servicio?.nombre || 'Sin servicio'}
          </span>
          <span style={{
            fontSize: '0.7rem',
            background: 'rgba(255,255,255,0.2)',
            padding: '1px 4px',
            borderRadius: '3px',
            fontWeight: 600
          }}>
            {event.statusLabel || 'Pendiente'}
          </span>
        </div>
        <div style={{ fontSize: '0.75rem', opacity: 0.9, marginTop: '2px' }}>
          {event.usuario?.nombre || 'Sin cliente'}
        </div>
      </div>
    );
  };

  // Función para actualizar estados en tiempo real
  const updateEventStatuses = () => {
    setEvents(prevEvents => 
      prevEvents.map(event => {
        const fechaHora = new Date(event.start);
        const duracionMinutos = event.servicio?.duracionMinutos || 45;
        const statusInfo = getCitaStatus(fechaHora, duracionMinutos, event.estado);
        
        return {
          ...event,
          status: statusInfo.status,
          statusLabel: statusInfo.label,
          statusColor: statusInfo.color,
          statusBgColor: statusInfo.bgColor,
          statusBorderColor: statusInfo.borderColor
        };
      })
    );
  };

  // Actualizar estados cada 30 segundos
  useEffect(() => {
    const interval = setInterval(updateEventStatuses, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectSlot = (slotInfo: any) => {
    console.log('Slot selected:', slotInfo);
    setSelectedDate(slotInfo.start);
    setShowDayEvents(true);
    
    // Mostrar información de ocupación del día seleccionado
    const occupancy = getDayOccupancy(slotInfo.start);
    console.log('Ocupación del día:', occupancy);
  };

  const handleNavigate = (newDate: Date, view: string, action: string) => {
    console.log('Navigation:', { newDate, view, action });
    setCurrentDate(newDate);
  };

  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event);
  };

  const handleDoubleClickSlot = (slotInfo: any) => {
    console.log('Double click on slot:', slotInfo);
    // Navegar al mes del día seleccionado
    setCurrentDate(slotInfo.start);
  };

  const getDayEvents = (date: Date) => {
    return events.filter(event => 
      moment(event.start).isSame(date, 'day')
    ).sort((a, b) => {
      // Ordenar por hora de inicio (más temprano primero)
      return moment(a.start).diff(moment(b.start));
    });
  };

  // Calcular ocupación del día
  const getDayOccupancy = (date: Date) => {
    const dayEvents = getDayEvents(date);
    const totalSlots = 10; // Slots disponibles por día (ajustar según horario)
    
    // Calcular slots ocupados basándose en la duración real de cada cita
    let occupiedSlots = 0;
    dayEvents.forEach(event => {
      // Cada slot es de 45 minutos, calcular cuántos slots ocupa cada cita
      const duracionMinutos = event.servicio?.duracionMinutos || 45;
      const slotsOcupados = Math.ceil(duracionMinutos / 45);
      occupiedSlots += slotsOcupados;
    });
    
    const percentage = Math.round((occupiedSlots / totalSlots) * 100);
    
    return {
      occupied: occupiedSlots,
      total: totalSlots,
      percentage: percentage,
      events: dayEvents
    };
  };

  // Funciones para manejar periodicidad
  const handleMakePeriodic = (event: any) => {
    console.log('handleMakePeriodic llamado con evento:', event);
    
    if (!event || !event.start) {
      console.error('Evento inválido para periodicidad:', event);
      return;
    }
    
    console.log('Usuario del evento:', event.usuario);
    console.log('Servicio del evento:', event.servicio);
    console.log('ID del usuario:', event.usuario?.id);
    console.log('ID del servicio:', event.servicio?.id);
    
    setSelectedCitaForPeriodic(event);
    setPeriodicForm({
      periodicidadDias: 7,
      fechaInicio: moment(event.start).format('YYYY-MM-DD')
    });
    setShowPeriodicModal(true);
  };

  const handlePeriodicFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setPeriodicForm({
      ...periodicForm,
      [e.target.name]: e.target.value
    });
  };

  const handlePeriodicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCitaForPeriodic) {
      setPeriodicMsg('Error: No hay cita seleccionada');
      return;
    }
    
    if (!selectedCitaForPeriodic.usuario || !selectedCitaForPeriodic.servicio) {
      setPeriodicMsg('Error: Datos de cita incompletos');
      return;
    }
    
    console.log('selectedCitaForPeriodic:', selectedCitaForPeriodic);
    console.log('Usuario:', selectedCitaForPeriodic.usuario);
    console.log('Servicio:', selectedCitaForPeriodic.servicio);
    
    if (!selectedCitaForPeriodic.usuario.id || !selectedCitaForPeriodic.servicio.id) {
      console.error('IDs no válidos - Usuario ID:', selectedCitaForPeriodic.usuario?.id);
      console.error('IDs no válidos - Servicio ID:', selectedCitaForPeriodic.servicio?.id);
      console.error('Usuario completo:', selectedCitaForPeriodic.usuario);
      console.error('Servicio completo:', selectedCitaForPeriodic.servicio);
      setPeriodicMsg(`Error: IDs no válidos - Usuario ID: ${selectedCitaForPeriodic.usuario?.id}, Servicio ID: ${selectedCitaForPeriodic.servicio?.id}`);
      return;
    }
    
    setPeriodicLoading(true);
    setPeriodicMsg(null);
    
    try {
      const token = localStorage.getItem('authToken');
      
      // Obtener la hora original de la cita
      const horaOriginal = moment(selectedCitaForPeriodic.start);
      const fechaInicio = moment(periodicForm.fechaInicio);
      
      // Combinar fecha de inicio con hora original
      const fechaHoraCompleta = fechaInicio
        .hour(horaOriginal.hour())
        .minute(horaOriginal.minute())
        .second(0);
      
      const requestBody = {
        clienteId: selectedCitaForPeriodic.usuario.id,
        servicioId: selectedCitaForPeriodic.servicio.id,
        fechaHora: fechaHoraCompleta.format('YYYY-MM-DDTHH:mm:ss'),
        comentario: selectedCitaForPeriodic.comentario || '',
        confirmada: selectedCitaForPeriodic.confirmada
      };
      
      console.log('Enviando datos al backend:', requestBody);
      console.log('URL:', `http://localhost:8080/api/citas/fija?periodicidadDias=${periodicForm.periodicidadDias}`);
      
      const res = await fetch(`http://localhost:8080/api/citas/fija?periodicidadDias=${periodicForm.periodicidadDias}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!res.ok) {
        let errorMessage = 'Error al crear cita periódica';
        try {
          const errorData = await res.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          // Si no se puede parsear el JSON, usar el mensaje por defecto
        }
        throw new Error(errorMessage);
      }
      
      setPeriodicMsg('¡Cita periódica creada correctamente!');
      setTimeout(() => {
        setShowPeriodicModal(false);
        setPeriodicMsg(null);
        setSelectedCitaForPeriodic(null);
        // Recargar las citas
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      console.error('Error en handlePeriodicSubmit:', err);
      setPeriodicMsg(err.message || 'Error al crear cita periódica');
    } finally {
      setPeriodicLoading(false);
    }
  };

  return (
    <div className="citas-admin-container" style={{padding: '2rem', background: '#f8f9fa', minHeight: '100vh'}}>
      <h2 className="citas-admin-title" style={{
        color: '#1976d2',
        fontSize: '2rem',
        fontWeight: 800,
        marginBottom: '2rem',
        textAlign: 'center',
        textShadow: '0 2px 4px rgba(25,118,210,0.1)'
      }}>Calendario de Citas</h2>
      

      

      
      {error && (
        <div style={{
          color: '#e74c3c',
          textAlign: 'center',
          marginBottom: 16,
          padding: '1rem',
          background: '#fdf2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          fontWeight: '600'
        }}>
          Error: {error}
        </div>
      )}
      
      {loading ? (
        <div style={{
          textAlign: 'center',
          color: '#1976d2',
          fontWeight: 600,
          padding: '2rem',
          fontSize: '1.1rem'
        }}>
          Cargando citas...
        </div>
      ) : (
        <div style={{display: 'flex', gap: '1.5rem', height: '80vh', maxHeight: '80vh', overflow: 'hidden'}}>
          {/* Panel lateral izquierdo */}
          <div style={{
            background: '#fff',
            borderRadius: 16,
            padding: '1.5rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            width: '400px',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '100%',
            overflow: 'hidden'
          }}>
            {/* Sección de ocupación del día seleccionado */}
            <div style={{
              background: '#f8f9fa',
              borderRadius: 12,
              padding: '1rem',
              marginBottom: '1rem',
              border: '1px solid #e9ecef',
              flexShrink: 0
            }}>
              <div style={{
                fontWeight: 600,
                marginBottom: '0.8rem',
                color: '#1976d2',
                fontSize: '1rem',
                textAlign: 'center'
              }}>
                📊 Ocupación del Día
              </div>
              
              {selectedDate ? (
                <div style={{textAlign: 'center'}}>
                  <div style={{
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: '#2c3e50',
                    marginBottom: '0.8rem'
                  }}>
                    {selectedDate.toLocaleDateString('es-ES', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                  
                  {(() => {
                    const occupancy = getDayOccupancy(selectedDate);
                    return (
                      <>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          gap: '0.8rem',
                          marginBottom: '0.8rem'
                        }}>
                          <div style={{
                            background: occupancy.percentage > 80 ? '#e74c3c' : 
                                       occupancy.percentage > 50 ? '#f39c12' : 
                                       occupancy.percentage > 0 ? '#27ae60' : '#95a5a6',
                            color: '#fff',
                            padding: '0.6rem 1.2rem',
                            borderRadius: '6px',
                            fontSize: '1.3rem',
                            fontWeight: 700,
                            minWidth: '70px'
                          }}>
                            {occupancy.percentage}%
                          </div>
                          
                          <div style={{
                            background: '#fff',
                            padding: '0.6rem',
                            borderRadius: '6px',
                            border: '2px solid #e9ecef'
                          }}>
                            <div style={{fontSize: '1rem', fontWeight: 700, color: '#1976d2'}}>
                              {occupancy.occupied}/{occupancy.total}
                            </div>
                            <div style={{fontSize: '0.7rem', color: '#666'}}>
                              Citas ocupadas
                            </div>
                          </div>
                        </div>
                        
                        <div style={{
                          background: '#fff',
                          padding: '0.6rem',
                          borderRadius: '6px',
                          marginBottom: '0.8rem',
                          border: '1px solid #e9ecef'
                        }}>
                          <div style={{fontSize: '0.8rem', fontWeight: 600, color: '#2c3e50', marginBottom: '0.2rem'}}>
                            Estado de Ocupación
                          </div>
                          <div style={{
                            fontSize: '0.8rem',
                            color: occupancy.percentage > 80 ? '#e74c3c' : 
                                   occupancy.percentage > 50 ? '#f39c12' : 
                                   occupancy.percentage > 0 ? '#27ae60' : '#95a5a6',
                            fontWeight: 600
                          }}>
                            {occupancy.percentage > 80 ? '🔴 Alta ocupación' : 
                             occupancy.percentage > 50 ? '🟡 Ocupación media' : 
                             occupancy.percentage > 0 ? '🟢 Ocupación baja' : '⚪ Sin citas'}
                          </div>
                        </div>
                        
                        {/* Barra de progreso */}
                        <div style={{
                          width: '100%',
                          height: '6px',
                          background: '#ecf0f1',
                          borderRadius: '3px',
                          overflow: 'hidden',
                          marginBottom: '0.5rem'
                        }}>
                          <div style={{
                            width: `${occupancy.percentage}%`,
                            height: '100%',
                            background: occupancy.percentage > 80 ? '#e74c3c' : 
                                       occupancy.percentage > 50 ? '#f39c12' : '#27ae60',
                            transition: 'width 0.3s ease',
                            borderRadius: '3px'
                          }} />
                        </div>
                      </>
                    );
                  })()}
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  color: '#666',
                  fontSize: '0.9rem',
                  padding: '1rem'
                }}>
                  Haz clic en un día del calendario para ver su ocupación
                </div>
              )}
            </div>
            
            {/* Sección de citas del día */}
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              overflow: 'hidden'
            }}>
              <div style={{
                fontWeight: 600,
                marginBottom: '1rem',
                color: '#1976d2',
                fontSize: '1.1rem',
                flexShrink: 0
              }}>
                📅 Citas del Día
              </div>
              
              <div style={{
                flex: 1,
                overflowY: 'auto',
                background: '#f8f9fa',
                borderRadius: 8,
                padding: '0.5rem',
                minHeight: 0,
                maxHeight: '100%'
              }}>
                {selectedDate ? (
                  getDayEvents(selectedDate).length === 0 ? (
                    <div style={{
                      textAlign: 'center',
                      padding: '2rem',
                      color: '#666',
                      fontSize: '0.9rem'
                    }}>
                      No hay citas para este día
                    </div>
                  ) : (
                    <div style={{display: 'flex', flexDirection: 'column', gap: '0.8rem'}}>
                      {getDayEvents(selectedDate).map((event, index) => (
                        <div key={index} style={{
                          background: '#fff',
                          borderRadius: 8,
                          padding: '0.8rem',
                          border: '1px solid #e9ecef',
                          transition: 'all 0.3s ease',
                          flexShrink: 0
                        }} onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#e3f2fd';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }} onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#fff';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '0.5rem'
                          }}>
                            <div style={{fontWeight: 600, color: '#1976d2', fontSize: '0.9rem'}}>
                              {event.title}
                            </div>
                            <div style={{
                              background: event.statusColor || '#43b94a',
                              color: '#fff',
                              padding: '0.2rem 0.4rem',
                              borderRadius: 6,
                              fontSize: '0.7rem',
                              fontWeight: 600
                            }}>
                              {event.status === 'pendiente' ? '⏳' : 
                               event.status === 'en_curso' ? '🔄' : 
                               event.status === 'completada' ? '✅' : 
                               event.status === 'cancelada' ? '❌' : '⏳'}
                            </div>
                          </div>
                          
                          <div style={{color: '#666', fontSize: '0.8rem', marginBottom: '0.3rem'}}>
                            <strong>Servicio:</strong> {event.servicio?.nombre || 'Sin servicio'}
                          </div>
                          
                          <div style={{color: '#666', fontSize: '0.8rem', marginBottom: '0.3rem'}}>
                            <strong>Cliente:</strong> {event.usuario?.nombre || 'Sin cliente'}
                          </div>
                          
                          <div style={{color: '#666', fontSize: '0.8rem', marginBottom: '0.3rem'}}>
                            <strong>Teléfono:</strong> {event.usuario?.telefono || 'Sin teléfono'}
                          </div>
                          
                          <div style={{color: '#666', fontSize: '0.8rem', marginBottom: '0.3rem'}}>
                            <strong>Hora:</strong> {moment(event.start).format('HH:mm')} - {moment(event.end).format('HH:mm')}
                          </div>
                          
                          <div style={{color: '#666', fontSize: '0.8rem', marginBottom: '0.5rem'}}>
                            <strong>Precio:</strong> {event.servicio?.precio?.toFixed(2) || '0.00'} €
                          </div>
                          
                          {/* Botón para hacer periódica - solo si no es periódica */}
                          {!(event.fija && event.periodicidadDias > 0) && (
                            <div style={{
                              display: 'flex',
                              justifyContent: 'center',
                              marginTop: '0.5rem'
                            }}>
                              <button
                                onClick={() => handleMakePeriodic(event)}
                                style={{
                                  background: 'linear-gradient(135deg, #9c27b0, #7b1fa2)',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '6px',
                                  padding: '0.4rem 0.8rem',
                                  fontSize: '0.75rem',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  transition: 'all 0.3s ease',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.3rem'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.transform = 'translateY(-1px)';
                                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(156,39,176,0.3)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = 'translateY(0)';
                                  e.currentTarget.style.boxShadow = 'none';
                                }}
                              >
                                <FaCalendarAlt style={{fontSize: '0.7rem'}} />
                                Hacer Periódica
                              </button>
                            </div>
                          )}
                          
                          {/* Indicador de cita periódica */}
                          {event.fija && event.periodicidadDias > 0 && (
                            <div style={{
                              display: 'flex',
                              justifyContent: 'center',
                              marginTop: '0.5rem'
                            }}>
                              <div style={{
                                background: 'linear-gradient(135deg, #ff9800, #f57c00)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '0.4rem 0.8rem',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.3rem'
                              }}>
                                <FaCalendarAlt style={{fontSize: '0.7rem'}} />
                                Periódica ({event.periodicidadDias} días)
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  <div style={{
                    textAlign: 'center',
                    padding: '2rem',
                    color: '#666',
                    fontSize: '0.9rem'
                  }}>
                    Selecciona un día para ver las citas
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Calendario principal */}
          <div style={{
            background: '#fff',
            borderRadius: 16,
            padding: '1.5rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            flex: 1,
            position: 'relative'
          }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
              date={currentDate}
              style={{ height: '100%' }}
          messages={{
            next: 'Sig.',
            previous: 'Ant.',
            today: 'Hoy',
            month: 'Mes',
            week: 'Semana',
            day: 'Día',
            agenda: 'Agenda',
            date: 'Fecha',
            time: 'Hora',
            event: 'Cita',
            noEventsInRange: 'No hay citas en este rango',
          }}
          views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
          popup
          selectable
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
              onNavigate={handleNavigate}
              onDoubleClickSlot={handleDoubleClickSlot}
          components={{
            toolbar: (props: any) => <CustomToolbar {...props} />, // Removed setShowBookingModal
            event: EventComponent,
          }}
        />
            

          </div>
        </div>
      )}

      {/* Modal de eventos del día */}
      {showDayEvents && selectedDate && (
        <div style={{
          position:'fixed',
          top:0,
          left:0,
          width:'100vw',
          height:'100vh',
          background:'rgba(0,0,0,0.5)',
          zIndex:2000,
          display:'flex',
          alignItems:'center',
          justifyContent:'center'
        }} onClick={() => setShowDayEvents(false)}>
          <div style={{
            background:'#fff',
            borderRadius:16,
            padding:'2rem',
            minWidth:400,
            maxWidth:600,
            maxHeight:'80vh',
            overflow:'auto',
            boxShadow:'0 8px 32px rgba(25,118,210,0.2)',
            color:'#222',
            position:'relative'
          }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowDayEvents(false)} style={{
              position:'absolute',
              top:18,
              right:18,
              background:'none',
              border:'none',
              fontSize:22,
              color:'#1976d2',
              cursor:'pointer',
              fontWeight:700
            }}>×</button>
            
            <h3 style={{
              color:'#1976d2',
              fontWeight:800,
              marginTop:0,
              marginBottom:20,
              fontSize:'1.5rem'
            }}>
              Eventos del {moment(selectedDate).format('DD [de] MMMM [de] YYYY')}
            </h3>
            
            {getDayEvents(selectedDate).length === 0 ? (
              <div style={{
                textAlign: 'center',
                color: '#666',
                padding: '2rem',
                fontSize: '1.1rem'
              }}>
                No hay citas programadas para este día
              </div>
            ) : (
              <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                {getDayEvents(selectedDate).map((event, index) => (
                  <div key={index} style={{
                    background: event.statusBgColor || '#f0f9ff',
                    border: `2px solid ${event.statusBorderColor || '#43b94a'}`,
                    borderRadius: 12,
                    padding: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    opacity: event.status === 'cancelada' ? 0.7 : 1,
                    textDecoration: event.status === 'cancelada' ? 'line-through' : 'none'
                  }} onClick={() => {
                    setSelectedEvent(event);
                    setShowDayEvents(false);
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.5rem'
                    }}>
                      <span style={{
                        fontWeight: 700,
                        color: event.statusColor || '#43b94a',
                        fontSize: '1.1rem'
                      }}>
                        {event.servicio?.nombre}
                </span>
                      <span style={{
                        background: event.statusColor || '#43b94a',
                        color: '#fff',
                        padding: '0.3rem 0.8rem',
                        borderRadius: 20,
                        fontSize: '0.8rem',
                        fontWeight: 600
                      }}>
                        {event.statusLabel || 'Pendiente'}
                </span>
                    </div>
                    
                    <div style={{marginBottom: '0.5rem'}}>
                      <span style={{fontWeight: 600, color: '#666'}}>Cliente: </span>
                      <span style={{color: '#1976d2'}}>{event.usuario?.nombre}</span>
                    </div>
                    
                    <div style={{marginBottom: '0.5rem'}}>
                      <span style={{fontWeight: 600, color: '#666'}}>Hora: </span>
                      <span>{moment(event.start).format('HH:mm')} - {moment(event.end).format('HH:mm')}</span>
                    </div>
                    
                    <div style={{marginBottom: '0.5rem'}}>
                      <span style={{fontWeight: 600, color: '#666'}}>Precio: </span>
                      <span style={{color: '#43b94a', fontWeight: 700}}>{event.servicio?.precio?.toFixed(2)} €</span>
                    </div>
                    
                    {event.comentario && (
                      <div style={{
                        background: '#f8f9fa',
                        padding: '0.5rem',
                        borderRadius: 6,
                        fontSize: '0.9rem',
                        color: '#666',
                        fontStyle: 'italic'
                      }}>
                        "{event.comentario}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de detalles de cita */}
      {selectedEvent && (
        <div style={{
          position:'fixed',
          top:0,
          left:0,
          width:'100vw',
          height:'100vh',
          background:'rgba(0,0,0,0.5)',
          zIndex:2000,
          display:'flex',
          alignItems:'center',
          justifyContent:'center'
        }} onClick={() => setSelectedEvent(null)}>
          <div style={{
            background:'#fff',
            borderRadius:16,
            padding:'2.2rem 2.5rem',
            minWidth:320,
            maxWidth:420,
            boxShadow:'0 8px 32px rgba(25,118,210,0.2)',
            color:'#222',
            position:'relative'
          }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedEvent(null)} style={{
              position:'absolute',
              top:18,
              right:18,
              background:'none',
              border:'none',
              fontSize:22,
              color:'#1976d2',
              cursor:'pointer',
              fontWeight:700
            }}>×</button>
            
            <h3 style={{
              color:'#1976d2',
              fontWeight:800,
              marginTop:0,
              marginBottom:18,
              fontSize:'1.4rem'
            }}>Detalles de la cita</h3>
            
            <div style={{marginBottom:10}}>
              <b>Servicio:</b> <span style={{color:'#1976d2',fontWeight:600}}>{selectedEvent.servicio?.nombre}</span>
            </div>
            <div style={{marginBottom:10}}>
              <b>Descripción:</b> <span style={{color:'#444'}}>{selectedEvent.servicio?.descripcion}</span>
            </div>
            <div style={{marginBottom:10}}>
              <b>Precio:</b> <span style={{color:'#43b94a',fontWeight:700}}>{selectedEvent.servicio?.precio?.toFixed(2)} €</span>
            </div>
            <div style={{marginBottom:10}}>
              <b>Duración:</b> <span>{selectedEvent.servicio?.duracionMinutos} min</span>
            </div>
            <div style={{marginBottom:10}}>
              <b>Cliente:</b> <span style={{color:'#1976d2'}}>{selectedEvent.usuario?.nombre} ({selectedEvent.usuario?.email})</span>
            </div>
            <div style={{marginBottom:10}}>
              <b>Fecha:</b> <span>{moment(selectedEvent.start).format('DD/MM/YYYY')}</span>
            </div>
            <div style={{marginBottom:10}}>
              <b>Hora:</b> <span>{moment(selectedEvent.start).format('HH:mm')} - {moment(selectedEvent.end).format('HH:mm')}</span>
            </div>
            {selectedEvent.comentario && (
              <div style={{marginBottom:10}}>
                <b>Comentario:</b> <span style={{color:'#444'}}>{selectedEvent.comentario}</span>
              </div>
            )}
            <div style={{marginBottom:10}}>
              <b>Confirmada:</b> <span style={{
                color:selectedEvent.confirmada?'#43b94a':'#e74c3c',
                fontWeight:700
              }}>{selectedEvent.confirmada ? 'Sí' : 'No'}</span>
            </div>
            {selectedEvent.fija && selectedEvent.periodicidadDias > 0 && (
              <div style={{
                marginBottom: 10,
                padding: '8px 12px',
                background: 'linear-gradient(135deg, #ff9800, #f57c00)',
                borderRadius: '6px',
                color: '#fff'
              }}>
                <div style={{fontWeight: 700, marginBottom: '4px'}}>
                  <FaCalendarAlt style={{marginRight: '6px', fontSize: '0.9rem'}} />
                  Cita Periódica
                </div>
                <div style={{fontSize: '0.9rem'}}>
                  Se repite cada <strong>{selectedEvent.periodicidadDias} días</strong>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de periodicidad */}
      {showPeriodicModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.7)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(4px)'
        }} onClick={() => setShowPeriodicModal(false)}>
          <div style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            color: '#fff',
            borderRadius: 20,
            padding: '1.5rem',
            width: '95%',
            maxWidth: '480px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.1)',
            position: 'relative',
            animation: 'modalSlideIn 0.3s ease-out'
          }} onClick={e => e.stopPropagation()}>
            
            {/* Header del modal con diseño mejorado */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.8rem',
              marginBottom: '1.2rem',
              paddingBottom: '0.8rem',
              borderBottom: '2px solid rgba(25,118,210,0.3)',
              position: 'relative'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #1976d2, #1565c0)',
                borderRadius: '50%',
                width: '45px',
                height: '45px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(25,118,210,0.4)'
              }}>
                <FaCalendarAlt style={{fontSize: '1.3rem', color: '#fff'}} />
              </div>
              <div>
                <h3 style={{
                  margin: 0,
                  fontSize: '1.3rem',
                  fontWeight: 700,
                  color: '#fff',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}>Crear Cita Periódica</h3>
                <p style={{
                  margin: '0.1rem 0 0 0',
                  fontSize: '0.85rem',
                  color: '#b0b0b0',
                  fontWeight: 400
                }}>Configura la periodicidad de la cita</p>
              </div>
            </div>

            <form onSubmit={handlePeriodicSubmit} style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.2rem'
            }}>
              
              {/* Información de la cita original con diseño mejorado */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(25,118,210,0.1) 0%, rgba(25,118,210,0.05) 100%)',
                padding: '1rem',
                borderRadius: 12,
                border: '1px solid rgba(25,118,210,0.2)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '4px',
                  height: '100%',
                  background: 'linear-gradient(135deg, #1976d2, #1565c0)'
                }}></div>
                <div style={{
                  fontSize: '0.85rem', 
                  color: '#1976d2', 
                  fontWeight: 700, 
                  marginBottom: '0.6rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  📅 Cita Original
                </div>
                <div style={{
                  display: 'grid',
                  gap: '0.4rem',
                  fontSize: '0.85rem',
                  color: '#e0e0e0'
                }}>
                  <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <span style={{fontWeight: 600, color: '#b0b0b0'}}>Cliente:</span>
                    <span style={{color: '#fff', fontWeight: 500}}>{selectedCitaForPeriodic?.usuario?.nombre}</span>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <span style={{fontWeight: 600, color: '#b0b0b0'}}>Servicio:</span>
                    <span style={{color: '#fff', fontWeight: 500}}>{selectedCitaForPeriodic?.servicio?.nombre}</span>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <span style={{fontWeight: 600, color: '#b0b0b0'}}>Hora:</span>
                    <span style={{color: '#fff', fontWeight: 500}}>{moment(selectedCitaForPeriodic?.start).format('HH:mm')}</span>
                  </div>
                </div>
              </div>

              {/* Periodicidad con diseño mejorado */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#fff',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                }}>
                  🔄 Periodicidad (días)
                </label>
                <input
                  type="number"
                  name="periodicidadDias"
                  value={periodicForm.periodicidadDias}
                  onChange={handlePeriodicFormChange}
                  min="1"
                  max="365"
                  style={{
                    width: 'calc(100% - 2px)',
                    padding: '0.6rem 0.8rem',
                    borderRadius: 12,
                    border: '2px solid rgba(25,118,210,0.3)',
                    background: 'rgba(255,255,255,0.05)',
                    color: '#fff',
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#1976d2';
                    e.target.style.boxShadow = '0 0 0 3px rgba(25,118,210,0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(25,118,210,0.3)';
                    e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                  }}
                  required
                />
                <div style={{
                  fontSize: '0.75rem',
                  color: '#b0b0b0',
                  marginTop: '0.3rem',
                  fontStyle: 'italic'
                }}>
                  Ejemplo: 7 días = cada semana, 30 días = cada mes
                </div>
              </div>

              {/* Fecha de inicio con diseño mejorado */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#fff',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                }}>
                  📅 Fecha de inicio
                </label>
                <input
                  type="date"
                  name="fechaInicio"
                  value={periodicForm.fechaInicio}
                  onChange={handlePeriodicFormChange}
                  style={{
                    width: 'calc(100% - 2px)',
                    padding: '0.6rem 0.8rem',
                    borderRadius: 12,
                    border: '2px solid rgba(25,118,210,0.3)',
                    background: 'rgba(255,255,255,0.05)',
                    color: '#fff',
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#1976d2';
                    e.target.style.boxShadow = '0 0 0 3px rgba(25,118,210,0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(25,118,210,0.3)';
                    e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                  }}
                  required
                />
                <div style={{
                  fontSize: '0.75rem',
                  color: '#b0b0b0',
                  marginTop: '0.3rem',
                  fontStyle: 'italic'
                }}>
                  La primera cita se creará a partir de esta fecha
                </div>
              </div>

              {/* Botones con diseño mejorado */}
              <div style={{
                display: 'flex',
                gap: '0.8rem',
                justifyContent: 'flex-end',
                marginTop: '0.8rem',
                paddingTop: '0.8rem',
                borderTop: '1px solid rgba(255,255,255,0.1)'
              }}>
                <button
                  type="button"
                  onClick={() => setShowPeriodicModal(false)}
                  disabled={periodicLoading}
                  style={{
                    background: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 12,
                    padding: '0.7rem 1.3rem',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    boxShadow: '0 4px 12px rgba(108,117,125,0.3)',
                    minWidth: '110px',
                    justifyContent: 'center'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(108,117,125,0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(108,117,125,0.3)';
                  }}
                >
                  <FaTimes />
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={periodicLoading}
                  style={{
                    background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 12,
                    padding: '0.7rem 1.3rem',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    boxShadow: '0 4px 12px rgba(25,118,210,0.3)',
                    minWidth: '150px',
                    justifyContent: 'center'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(25,118,210,0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(25,118,210,0.3)';
                  }}
                >
                  <FaSave />
                  {periodicLoading ? 'Creando...' : 'Crear Periódica'}
                </button>
              </div>

              {/* Mensaje de estado con diseño mejorado */}
              {periodicMsg && (
                <div style={{
                  marginTop: '0.8rem',
                  padding: '0.8rem',
                  borderRadius: 12,
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  textAlign: 'center',
                  background: periodicMsg.startsWith('¡') 
                    ? 'linear-gradient(135deg, rgba(76,175,80,0.15) 0%, rgba(46,125,50,0.15) 100%)'
                    : 'linear-gradient(135deg, rgba(244,67,54,0.15) 0%, rgba(198,40,40,0.15) 100%)',
                  color: periodicMsg.startsWith('¡') ? '#4caf50' : '#f44336',
                  border: `2px solid ${periodicMsg.startsWith('¡') ? 'rgba(76,175,80,0.3)' : 'rgba(244,67,54,0.3)'}`,
                  boxShadow: `0 4px 12px ${periodicMsg.startsWith('¡') ? 'rgba(76,175,80,0.2)' : 'rgba(244,67,54,0.2)'}`,
                  animation: 'messageSlideIn 0.3s ease-out'
                }}>
                  {periodicMsg}
                </div>
              )}
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default CitasAdmin; 