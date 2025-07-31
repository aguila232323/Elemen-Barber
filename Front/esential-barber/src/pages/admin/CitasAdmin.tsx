import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './CitasAdminCustom.css';

const localizer = momentLocalizer(moment);
moment.locale('es');

interface Servicio {
  nombre: string;
  descripcion: string;
  precio: number;
  duracionMinutos: number;
}

interface Usuario {
  nombre: string;
  email: string;
}

interface Cita {
  id: number;
  fechaHora: string;
  comentario?: string;
  confirmada?: boolean;
  fija?: boolean;
  periodicidadDias?: number;
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
  const label = () => {
    const date = toolbar.date;
    return (
      <span style={{fontWeight:800, fontSize:'1.2rem', color:'#1976d2'}}>
        {toolbar.label}
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
      </div>
      <div>{label()}</div>
      <div style={{display:'flex',alignItems:'center',gap:8}}>
        <button onClick={() => handleViewChange('month')} className="citas-admin-nav-btn" style={{
          background:toolbar.view === 'month' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.2)',
          border:'none',
          borderRadius:8,
          padding:'0.5rem 1rem',
          color:'#fff',
          cursor:'pointer',
          fontWeight:600,
          transition:'all 0.3s ease'
        }}>Mes</button>
        <button onClick={() => handleViewChange('week')} className="citas-admin-nav-btn" style={{
          background:toolbar.view === 'week' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.2)',
          border:'none',
          borderRadius:8,
          padding:'0.5rem 1rem',
          color:'#fff',
          cursor:'pointer',
          fontWeight:600,
          transition:'all 0.3s ease'
        }}>Semana</button>
        <button onClick={() => handleViewChange('day')} className="citas-admin-nav-btn" style={{
          background:toolbar.view === 'day' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.2)',
          border:'none',
          borderRadius:8,
          padding:'0.5rem 1rem',
          color:'#fff',
          cursor:'pointer',
          fontWeight:600,
          transition:'all 0.3s ease'
        }}>Día</button>
        <button onClick={() => handleViewChange('agenda')} className="citas-admin-nav-btn" style={{
          background:toolbar.view === 'agenda' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.2)',
          border:'none',
          borderRadius:8,
          padding:'0.5rem 1rem',
          color:'#fff',
          cursor:'pointer',
          fontWeight:600,
          transition:'all 0.3s ease'
        }}>Agenda</button>
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

  useEffect(() => {
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
        console.log('Citas received:', citas);
        
        const eventos = citas.map(cita => {
          console.log('Processing cita:', cita);
          return {
            id: cita.id,
            title: `${cita.servicio?.nombre || 'Sin servicio'} - ${cita.usuario?.nombre || 'Sin usuario'}`,
            start: new Date(cita.fechaHora),
            end: new Date(moment(cita.fechaHora).add(cita.servicio?.duracionMinutos || 45, 'minutes').toISOString()),
            servicio: cita.servicio,
            usuario: cita.usuario,
            comentario: cita.comentario,
            confirmada: cita.confirmada,
            fija: cita.fija,
            periodicidadDias: cita.periodicidadDias
          };
        });
        
        console.log('Events created:', eventos);
        setEvents(eventos);
      } catch (err: any) {
        console.error('Error fetching citas:', err);
        setError(err.message || 'Error al cargar las citas');
      } finally {
        setLoading(false);
      }
    };
    fetchCitas();
  }, []);

  const handleSelectSlot = (slotInfo: any) => {
    console.log('Slot selected:', slotInfo);
    setSelectedDate(slotInfo.start);
    setShowDayEvents(true);
    
    // Mostrar información de ocupación del día seleccionado
    const occupancy = getDayOccupancy(slotInfo.start);
    console.log('Ocupación del día:', occupancy);
    
    setSelectedDayOccupancy({
      date: slotInfo.start,
      occupancy: occupancy
    });
    setShowOccupancyModal(true);
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
    );
  };

  // Calcular ocupación del día
  const getDayOccupancy = (date: Date) => {
    const dayEvents = getDayEvents(date);
    const totalSlots = 10; // Slots disponibles por día (ajustar según horario)
    const occupiedSlots = dayEvents.length;
    const percentage = Math.round((occupiedSlots / totalSlots) * 100);
    
    return {
      occupied: occupiedSlots,
      total: totalSlots,
      percentage: percentage,
      events: dayEvents
    };
  };

  // Función para obtener estadísticas de ocupación del mes
  const getMonthOccupancyStats = () => {
    const currentMonth = moment(currentDate).month();
    const currentYear = moment(currentDate).year();
    const daysInMonth = moment(currentDate).daysInMonth();
    
    let totalOccupancy = 0;
    let daysWithEvents = 0;
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = moment([currentYear, currentMonth, day]);
      const dayEvents = getDayEvents(date.toDate());
      const occupancy = getDayOccupancy(date.toDate());
      
      if (occupancy.occupied > 0) {
        daysWithEvents++;
        totalOccupancy += occupancy.percentage;
      }
    }
    
    return {
      totalDays: daysInMonth,
      daysWithEvents,
      averageOccupancy: daysWithEvents > 0 ? Math.round(totalOccupancy / daysWithEvents) : 0,
      totalEvents: events.length
    };
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
      
      {/* Debug info */}
      <div style={{
        background: '#fff',
        padding: '1rem',
        borderRadius: 8,
        marginBottom: '1rem',
        border: '1px solid #e0e0e0',
        fontSize: '0.9rem',
        color: '#666'
      }}>
        <strong>Debug:</strong> Fecha actual del calendario: {currentDate.toLocaleDateString('es-ES')} - 
        Eventos cargados: {events.length}
      </div>
      
      {/* Leyenda de ocupación */}
      <div style={{
        background: '#fff',
        padding: '1rem',
        borderRadius: 8,
        marginBottom: '1rem',
        border: '1px solid #e0e0e0',
        fontSize: '0.9rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{fontWeight: 600, marginBottom: '0.5rem', color: '#1976d2', fontSize: '1rem'}}>📊 Leyenda de Ocupación:</div>
        <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            <div style={{width: '16px', height: '16px', background: '#27ae60', borderRadius: '3px', border: '1px solid #1e8449'}}></div>
            <span style={{fontWeight: 600, color: '#2c3e50'}}>Baja (0-50%)</span>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            <div style={{width: '16px', height: '16px', background: '#f39c12', borderRadius: '3px', border: '1px solid #d68910'}}></div>
            <span style={{fontWeight: 600, color: '#2c3e50'}}>Media (51-80%)</span>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            <div style={{width: '16px', height: '16px', background: '#e74c3c', borderRadius: '3px', border: '1px solid #c0392b'}}></div>
            <span style={{fontWeight: 600, color: '#2c3e50'}}>Alta (81-100%)</span>
          </div>
        </div>
        <div style={{marginTop: '0.5rem', fontSize: '0.8rem', color: '#7f8c8d', fontWeight: 500}}>
          📋 Formato: Citas ocupadas / Total de slots disponibles (Porcentaje)
        </div>
      </div>
      
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
        <div style={{background: '#fff', borderRadius: 16, padding: '1.5rem', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', position: 'relative'}}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            date={currentDate}
            style={{ height: '70vh' }}
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
              toolbar: CustomToolbar,
              event: ({ event }) => (
                <div style={{
                  background: event.confirmada ? '#43b94a' : '#e74c3c',
                  color: '#fff',
                  borderRadius: 8,
                  padding: '4px 8px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  boxShadow: '0 2px 8px rgba(25,118,210,0.15)',
                  display: 'flex',
                  flexDirection: 'column',
                  minWidth: 0,
                  maxWidth: '100%',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}>
                  <span style={{whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis', fontWeight: 600}}>
                    {event.title}
                  </span>
                  <span style={{fontWeight:400,fontSize:'0.8em',opacity:0.9}}>
                    {event.servicio?.precio?.toFixed(2)} € · {event.servicio?.duracionMinutos} min
                  </span>
                  <span style={{fontWeight:400,fontSize:'0.8em',opacity:0.9}}>
                    {moment(event.start).format('HH:mm')}
                  </span>
                </div>
              )
            }}

          />
          
          {/* Overlay de información de ocupación */}
          <div style={{
            position: 'absolute',
            top: '1.5rem',
            right: '1.5rem',
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '1rem',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            border: '1px solid #e0e0e0',
            zIndex: 1000,
            minWidth: '220px'
          }}>
            <div style={{fontWeight: 600, marginBottom: '0.5rem', color: '#1976d2', fontSize: '0.9rem'}}>
              📊 Estadísticas del Mes
            </div>
            {(() => {
              const stats = getMonthOccupancyStats();
              return (
                <div style={{fontSize: '0.8rem', color: '#666'}}>
                  <div style={{marginBottom: '0.3rem'}}>
                    <strong>Total de citas:</strong> {stats.totalEvents}
                  </div>
                  <div style={{marginBottom: '0.3rem'}}>
                    <strong>Días con citas:</strong> {stats.daysWithEvents}/{stats.totalDays}
                  </div>
                  <div style={{marginBottom: '0.3rem'}}>
                    <strong>Ocupación promedio:</strong> {stats.averageOccupancy}%
                  </div>
                  <div style={{marginBottom: '0.3rem'}}>
                    <strong>Promedio diario:</strong> {Math.round(stats.totalEvents / stats.totalDays)} citas
                  </div>
                </div>
              );
            })()}
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
                    background: event.confirmada ? '#f0f9ff' : '#fef2f2',
                    border: `2px solid ${event.confirmada ? '#43b94a' : '#e74c3c'}`,
                    borderRadius: 12,
                    padding: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
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
                        color: event.confirmada ? '#43b94a' : '#e74c3c',
                        fontSize: '1.1rem'
                      }}>
                        {event.servicio?.nombre}
                      </span>
                      <span style={{
                        background: event.confirmada ? '#43b94a' : '#e74c3c',
                        color: '#fff',
                        padding: '0.3rem 0.8rem',
                        borderRadius: 20,
                        fontSize: '0.8rem',
                        fontWeight: 600
                      }}>
                        {event.confirmada ? 'Confirmada' : 'Pendiente'}
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
            {selectedEvent.fija && (
              <div style={{marginBottom:10}}>
                <b>Fija:</b> <span style={{color:'#1976d2'}}>Sí</span>
              </div>
            )}
            {selectedEvent.periodicidadDias > 0 && (
              <div style={{marginBottom:10}}>
                <b>Periodicidad:</b> <span>{selectedEvent.periodicidadDias} días</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de ocupación del día */}
      {showOccupancyModal && selectedDayOccupancy && (
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
        }} onClick={() => setShowOccupancyModal(false)}>
          <div style={{
            background:'#fff',
            borderRadius:16,
            padding:'2rem',
            maxWidth:'400px',
            width:'90%',
            boxShadow:'0 20px 60px rgba(0,0,0,0.3)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              display:'flex',
              justifyContent:'space-between',
              alignItems:'center',
              marginBottom:'1.5rem',
              borderBottom:'2px solid #e0e0e0',
              paddingBottom:'1rem'
            }}>
              <h2 style={{margin:0, color:'#1976d2', fontSize:'1.5rem'}}>
                📊 Ocupación del Día
              </h2>
              <button onClick={() => setShowOccupancyModal(false)} style={{
                background:'none',
                border:'none',
                fontSize:'1.5rem',
                cursor:'pointer',
                color:'#666',
                padding:'0.5rem'
              }}>✕</button>
            </div>
            
            <div style={{textAlign: 'center', marginBottom: '1.5rem'}}>
              <div style={{
                fontSize: '1.2rem',
                fontWeight: 600,
                color: '#2c3e50',
                marginBottom: '1rem'
              }}>
                {selectedDayOccupancy.date.toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{
                  background: selectedDayOccupancy.occupancy.percentage > 80 ? '#e74c3c' : 
                             selectedDayOccupancy.occupancy.percentage > 50 ? '#f39c12' : 
                             selectedDayOccupancy.occupancy.percentage > 0 ? '#27ae60' : '#95a5a6',
                  color: '#fff',
                  padding: '1rem 2rem',
                  borderRadius: '12px',
                  fontSize: '2rem',
                  fontWeight: 700,
                  minWidth: '120px'
                }}>
                  {selectedDayOccupancy.occupancy.percentage}%
                </div>
                
                <div style={{
                  background: '#f8f9fa',
                  padding: '1rem',
                  borderRadius: '12px',
                  border: '2px solid #e9ecef'
                }}>
                  <div style={{fontSize: '1.5rem', fontWeight: 700, color: '#1976d2'}}>
                    {selectedDayOccupancy.occupancy.occupied}/{selectedDayOccupancy.occupancy.total}
                  </div>
                  <div style={{fontSize: '0.9rem', color: '#666'}}>
                    Citas ocupadas
                  </div>
                </div>
              </div>
              
              <div style={{
                background: '#f8f9fa',
                padding: '1rem',
                borderRadius: '12px',
                marginBottom: '1rem'
              }}>
                <div style={{fontSize: '1.1rem', fontWeight: 600, color: '#2c3e50', marginBottom: '0.5rem'}}>
                  Estado de Ocupación
                </div>
                <div style={{
                  fontSize: '1rem',
                  color: selectedDayOccupancy.occupancy.percentage > 80 ? '#e74c3c' : 
                         selectedDayOccupancy.occupancy.percentage > 50 ? '#f39c12' : 
                         selectedDayOccupancy.occupancy.percentage > 0 ? '#27ae60' : '#95a5a6',
                  fontWeight: 600
                }}>
                  {selectedDayOccupancy.occupancy.percentage > 80 ? '🔴 Alta ocupación' : 
                   selectedDayOccupancy.occupancy.percentage > 50 ? '🟡 Ocupación media' : 
                   selectedDayOccupancy.occupancy.percentage > 0 ? '🟢 Ocupación baja' : '⚪ Sin citas'}
                </div>
              </div>
              
              {/* Barra de progreso */}
              <div style={{
                width: '100%',
                height: '8px',
                background: '#ecf0f1',
                borderRadius: '4px',
                overflow: 'hidden',
                marginBottom: '1rem'
              }}>
                <div style={{
                  width: `${selectedDayOccupancy.occupancy.percentage}%`,
                  height: '100%',
                  background: selectedDayOccupancy.occupancy.percentage > 80 ? '#e74c3c' : 
                             selectedDayOccupancy.occupancy.percentage > 50 ? '#f39c12' : '#27ae60',
                  transition: 'width 0.3s ease',
                  borderRadius: '4px'
                }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CitasAdmin; 