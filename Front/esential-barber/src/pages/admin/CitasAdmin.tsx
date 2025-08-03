import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { FaCalendarAlt, FaPlus, FaTimes, FaSave, FaBars, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
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

// Toolbar profesional personalizado con responsive
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
      <span className="toolbar-month-year">
        {monthName} {year}
      </span>
    );
  };
  
  const handleViewChange = (view: string) => {
    console.log('Changing view to:', view);
    toolbar.onView(view);
  };

  return (
    <div className="citas-admin-toolbar">
      <div className="toolbar-left">
        <button onClick={goToBack} className="citas-admin-nav-btn">
          <FaChevronLeft />
        </button>
        
        <button onClick={goToNext} className="citas-admin-nav-btn">
          <FaChevronRight />
        </button>
        
        <button onClick={goToToday} className="citas-admin-nav-btn">
          Hoy
        </button>
      </div>
      
      <div className="toolbar-center">
        {label()}
      </div>
      
      <div className="toolbar-right">
        <button onClick={() => handleViewChange('month')} className="citas-admin-nav-btn">
          Mes
        </button>
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
  const [isMobile, setIsMobile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  
  // Estados para modal de periodicidad
  const [showPeriodicModal, setShowPeriodicModal] = useState(false);
  const [selectedCitaForPeriodic, setSelectedCitaForPeriodic] = useState<any>(null);
  const [periodicForm, setPeriodicForm] = useState({
    periodicidadDias: 7,
    fechaInicio: ''
  });
  const [periodicLoading, setPeriodicLoading] = useState(false);
  const [periodicMsg, setPeriodicMsg] = useState<string | null>(null);

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
        className="custom-event-component"
      >
        <div className="event-header">
          <span className="event-service">
            {event.servicio?.nombre || 'Sin servicio'}
          </span>
          <span className="event-status">
            {event.statusLabel || 'Pendiente'}
          </span>
        </div>
        <div className="event-client">
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
    <div className="citas-admin-container">
      <div className="citas-admin-header">
        <h2 className="citas-admin-title">Calendario de Citas</h2>
        
        {/* Botón de menú móvil */}
        {isMobile && (
          <button 
            className="mobile-menu-toggle"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            <FaBars />
          </button>
        )}
      </div>

      {error && (
        <div className="error-message">
          Error: {error}
        </div>
      )}
      
      {loading ? (
        <div className="loading-message">
          Cargando citas...
        </div>
      ) : (
        <div className="citas-admin-content">
          {/* Panel lateral izquierdo */}
          <div className={`sidebar-panel ${isMobile ? 'mobile-sidebar' : ''} ${showSidebar ? 'sidebar-open' : ''}`}>
            {/* Sección de ocupación del día seleccionado */}
            <div className="occupancy-section">
              <div className="section-title">
                📊 Ocupación del Día
              </div>
              
              {selectedDate ? (
                <div className="occupancy-content">
                  <div className="occupancy-date">
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
                        <div className="occupancy-stats">
                          <div className={`occupancy-percentage occupancy-${occupancy.percentage > 80 ? 'high' : occupancy.percentage > 50 ? 'medium' : 'low'}`}>
                            {occupancy.percentage}%
                          </div>
                          
                          <div className="occupancy-slots">
                            <div className="slots-number">
                              {occupancy.occupied}/{occupancy.total}
                            </div>
                            <div className="slots-label">
                              Citas ocupadas
                            </div>
                          </div>
                        </div>
                        
                        <div className="occupancy-status">
                          <div className="status-label">
                            Estado de Ocupación
                          </div>
                          <div className={`status-text status-${occupancy.percentage > 80 ? 'high' : occupancy.percentage > 50 ? 'medium' : 'low'}`}>
                            {occupancy.percentage > 80 ? '🔴 Alta ocupación' : 
                             occupancy.percentage > 50 ? '🟡 Ocupación media' : 
                             occupancy.percentage > 0 ? '🟢 Ocupación baja' : '⚪ Sin citas'}
                          </div>
                        </div>
                        
                        {/* Barra de progreso */}
                        <div className="progress-bar">
                          <div 
                            className={`progress-fill progress-${occupancy.percentage > 80 ? 'high' : occupancy.percentage > 50 ? 'medium' : 'low'}`}
                            style={{width: `${occupancy.percentage}%`}}
                          />
                        </div>
                      </>
                    );
                  })()}
                </div>
              ) : (
                <div className="no-selection-message">
                  Haz clic en un día del calendario para ver su ocupación
                </div>
              )}
            </div>
            
            {/* Sección de citas del día */}
            <div className="day-events-section">
              <div className="section-title">
                📅 Citas del Día
              </div>
              
              <div className="events-list">
                {selectedDate ? (
                  getDayEvents(selectedDate).length === 0 ? (
                    <div className="no-events-message">
                      No hay citas para este día
                    </div>
                  ) : (
                    <div className="events-container">
                      {getDayEvents(selectedDate).map((event, index) => (
                        <div key={index} className="event-card">
                          <div className="event-header">
                            <div className="event-title">
                              {event.title}
                            </div>
                            <div className={`event-status-badge status-${event.status}`}>
                              {event.status === 'pendiente' ? '⏳' : 
                               event.status === 'en_curso' ? '🔄' : 
                               event.status === 'completada' ? '✅' : 
                               event.status === 'cancelada' ? '❌' : '⏳'}
                            </div>
                          </div>
                          
                          <div className="event-details">
                            <div className="event-detail">
                              <strong>Servicio:</strong> {event.servicio?.nombre || 'Sin servicio'}
                            </div>
                            
                            <div className="event-detail">
                              <strong>Cliente:</strong> {event.usuario?.nombre || 'Sin cliente'}
                            </div>
                            
                            <div className="event-detail">
                              <strong>Teléfono:</strong> {event.usuario?.telefono || 'Sin teléfono'}
                            </div>
                            
                            <div className="event-detail">
                              <strong>Hora:</strong> {moment(event.start).format('HH:mm')} - {moment(event.end).format('HH:mm')}
                            </div>
                            
                            <div className="event-detail">
                              <strong>Precio:</strong> {event.servicio?.precio?.toFixed(2) || '0.00'} €
                            </div>
                          </div>
                          
                          {/* Botón para hacer periódica - solo si no es periódica */}
                          {!(event.fija && event.periodicidadDias > 0) && (
                            <div className="periodic-button-container">
                              <button
                                onClick={() => handleMakePeriodic(event)}
                                className="make-periodic-btn"
                              >
                                <FaCalendarAlt />
                                Hacer Periódica
                              </button>
                            </div>
                          )}
                          
                          {/* Indicador de cita periódica */}
                          {event.fija && event.periodicidadDias > 0 && (
                            <div className="periodic-indicator">
                              <FaCalendarAlt />
                              Periódica ({event.periodicidadDias} días)
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  <div className="no-selection-message">
                    Selecciona un día para ver las citas
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Calendario principal */}
          <div className="calendar-container">
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
                toolbar: (props: any) => <CustomToolbar {...props} />,
                event: EventComponent,
              }}
            />
          </div>
        </div>
      )}

      {/* Overlay para móvil */}
      {isMobile && showSidebar && (
        <div 
          className="sidebar-overlay"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Modal de eventos del día */}
      {showDayEvents && selectedDate && (
        <div className="modal-overlay" onClick={() => setShowDayEvents(false)}>
          <div className="modal-content day-events-modal" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowDayEvents(false)} className="modal-close-btn">×</button>
            
            <h3 className="modal-title">
              Eventos del {moment(selectedDate).format('DD [de] MMMM [de] YYYY')}
            </h3>
            
            {getDayEvents(selectedDate).length === 0 ? (
              <div className="no-events-message">
                No hay citas programadas para este día
              </div>
            ) : (
              <div className="modal-events-list">
                {getDayEvents(selectedDate).map((event, index) => (
                  <div key={index} className={`modal-event-card status-${event.status}`}>
                    <div className="modal-event-header">
                      <span className="modal-event-service">
                        {event.servicio?.nombre}
                      </span>
                      <span className="modal-event-status">
                        {event.statusLabel || 'Pendiente'}
                      </span>
                    </div>
                    
                    <div className="modal-event-details">
                      <div className="modal-event-detail">
                        <span className="detail-label">Cliente: </span>
                        <span className="detail-value">{event.usuario?.nombre}</span>
                      </div>
                      
                      <div className="modal-event-detail">
                        <span className="detail-label">Hora: </span>
                        <span>{moment(event.start).format('HH:mm')} - {moment(event.end).format('HH:mm')}</span>
                      </div>
                      
                      <div className="modal-event-detail">
                        <span className="detail-label">Precio: </span>
                        <span className="detail-price">{event.servicio?.precio?.toFixed(2)} €</span>
                      </div>
                    </div>
                    
                    {event.comentario && (
                      <div className="modal-event-comment">
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
        <div className="modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="modal-content event-details-modal" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedEvent(null)} className="modal-close-btn">×</button>
            
            <h3 className="modal-title">Detalles de la cita</h3>
            
            <div className="event-details-list">
              <div className="event-detail-item">
                <b>Servicio:</b> <span className="detail-value">{selectedEvent.servicio?.nombre}</span>
              </div>
              <div className="event-detail-item">
                <b>Descripción:</b> <span className="detail-value">{selectedEvent.servicio?.descripcion}</span>
              </div>
              <div className="event-detail-item">
                <b>Precio:</b> <span className="detail-price">{selectedEvent.servicio?.precio?.toFixed(2)} €</span>
              </div>
              <div className="event-detail-item">
                <b>Duración:</b> <span>{selectedEvent.servicio?.duracionMinutos} min</span>
              </div>
              <div className="event-detail-item">
                <b>Cliente:</b> <span className="detail-value">{selectedEvent.usuario?.nombre} ({selectedEvent.usuario?.email})</span>
              </div>
              <div className="event-detail-item">
                <b>Fecha:</b> <span>{moment(selectedEvent.start).format('DD/MM/YYYY')}</span>
              </div>
              <div className="event-detail-item">
                <b>Hora:</b> <span>{moment(selectedEvent.start).format('HH:mm')} - {moment(selectedEvent.end).format('HH:mm')}</span>
              </div>
              {selectedEvent.comentario && (
                <div className="event-detail-item">
                  <b>Comentario:</b> <span className="detail-value">{selectedEvent.comentario}</span>
                </div>
              )}
              <div className="event-detail-item">
                <b>Confirmada:</b> <span className={`confirmation-status ${selectedEvent.confirmada ? 'confirmed' : 'not-confirmed'}`}>
                  {selectedEvent.confirmada ? 'Sí' : 'No'}
                </span>
              </div>
              {selectedEvent.fija && selectedEvent.periodicidadDias > 0 && (
                <div className="periodic-info">
                  <div className="periodic-header">
                    <FaCalendarAlt />
                    Cita Periódica
                  </div>
                  <div className="periodic-details">
                    Se repite cada <strong>{selectedEvent.periodicidadDias} días</strong>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de periodicidad */}
      {showPeriodicModal && (
        <div className="modal-overlay periodic-modal-overlay" onClick={() => setShowPeriodicModal(false)}>
          <div className="modal-content periodic-modal" onClick={e => e.stopPropagation()}>
            
            {/* Header del modal con diseño mejorado */}
            <div className="periodic-modal-header">
              <div className="periodic-modal-icon">
                <FaCalendarAlt />
              </div>
              <div className="periodic-modal-title">
                <h3>Crear Cita Periódica</h3>
                <p>Configura la periodicidad de la cita</p>
              </div>
            </div>

            <form onSubmit={handlePeriodicSubmit} className="periodic-form">
              
              {/* Información de la cita original con diseño mejorado */}
              <div className="original-cita-info">
                <div className="info-header">
                  📅 Cita Original
                </div>
                <div className="info-details">
                  <div className="info-row">
                    <span className="info-label">Cliente:</span>
                    <span className="info-value">{selectedCitaForPeriodic?.usuario?.nombre}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Servicio:</span>
                    <span className="info-value">{selectedCitaForPeriodic?.servicio?.nombre}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Hora:</span>
                    <span className="info-value">{moment(selectedCitaForPeriodic?.start).format('HH:mm')}</span>
                  </div>
                </div>
              </div>

              {/* Periodicidad con diseño mejorado */}
              <div className="form-group">
                <label className="form-label">
                  🔄 Periodicidad (días)
                </label>
                <input
                  type="number"
                  name="periodicidadDias"
                  value={periodicForm.periodicidadDias}
                  onChange={handlePeriodicFormChange}
                  min="1"
                  max="365"
                  className="form-input"
                  required
                />
                <div className="form-help">
                  Ejemplo: 7 días = cada semana, 30 días = cada mes
                </div>
              </div>

              {/* Fecha de inicio con diseño mejorado */}
              <div className="form-group">
                <label className="form-label">
                  📅 Fecha de inicio
                </label>
                <input
                  type="date"
                  name="fechaInicio"
                  value={periodicForm.fechaInicio}
                  onChange={handlePeriodicFormChange}
                  className="form-input"
                  required
                />
                <div className="form-help">
                  La primera cita se creará a partir de esta fecha
                </div>
              </div>

              {/* Botones con diseño mejorado */}
              <div className="form-buttons">
                <button
                  type="button"
                  onClick={() => setShowPeriodicModal(false)}
                  disabled={periodicLoading}
                  className="btn btn-cancel"
                >
                  <FaTimes />
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={periodicLoading}
                  className="btn btn-submit"
                >
                  <FaSave />
                  {periodicLoading ? 'Creando...' : 'Crear Periódica'}
                </button>
              </div>

              {/* Mensaje de estado con diseño mejorado */}
              {periodicMsg && (
                <div className={`status-message ${periodicMsg.startsWith('¡') ? 'success' : 'error'}`}>
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