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
    toolbar.onNavigate('PREV');
  };
  const goToNext = () => {
    toolbar.onNavigate('NEXT');
  };
  const goToToday = () => {
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
  return (
    <div className="citas-admin-toolbar" style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18,background:'#181b22',borderRadius:12,padding:'1rem 1.2rem'}}>
      <div style={{display:'flex',alignItems:'center',gap:8}}>
        <button onClick={goToBack} className="citas-admin-nav-btn">&#8592;</button>
        <button onClick={goToToday} className="citas-admin-nav-btn">Hoy</button>
        <button onClick={goToNext} className="citas-admin-nav-btn">&#8594;</button>
      </div>
      <div>{label()}</div>
      <div style={{display:'flex',alignItems:'center',gap:8}}>
        <button onClick={()=>toolbar.onView('month')} className="citas-admin-nav-btn">Mes</button>
        <button onClick={()=>toolbar.onView('week')} className="citas-admin-nav-btn">Semana</button>
        <button onClick={()=>toolbar.onView('day')} className="citas-admin-nav-btn">Día</button>
        <button onClick={()=>toolbar.onView('agenda')} className="citas-admin-nav-btn">Agenda</button>
      </div>
    </div>
  );
};

const CitasAdmin: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<any|null>(null);

  useEffect(() => {
    const fetchCitas = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch('http://localhost:8080/api/citas/todas', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (!res.ok) throw new Error('No se pudieron cargar las citas');
        const citas: Cita[] = await res.json();
        const eventos = citas.map(cita => ({
          id: cita.id,
          title: cita.servicio?.nombre + (cita.usuario ? ` - ${cita.usuario.nombre}` : ''),
          start: new Date(cita.fechaHora),
          end: new Date(moment(cita.fechaHora).add(cita.servicio?.duracionMinutos || 45, 'minutes').toISOString()),
          servicio: cita.servicio,
          usuario: cita.usuario,
          comentario: cita.comentario,
          confirmada: cita.confirmada,
          fija: cita.fija,
          periodicidadDias: cita.periodicidadDias
        }));
        setEvents(eventos);
      } catch (err: any) {
        setError(err.message || 'Error al cargar las citas');
      } finally {
        setLoading(false);
      }
    };
    fetchCitas();
  }, []);

  return (
    <div className="citas-admin-container">
      <h2 className="citas-admin-title">Calendario de Citas</h2>
      {error && <div style={{color:'#e74c3c',textAlign:'center',marginBottom:16}}>{error}</div>}
      {loading ? (
        <div style={{textAlign:'center',color:'#1976d2',fontWeight:600}}>Cargando citas...</div>
      ) : (
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '70vh', background: '#fff', borderRadius: 16, padding: 12, boxShadow: '0 4px 24px rgba(25,118,210,0.10)' }}
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
          onSelectEvent={event => setSelectedEvent(event)}
          components={{
            toolbar: CustomToolbar,
            event: ({ event }) => (
              <div style={{
                background: event.confirmada ? '#43b94a' : '#e74c3c',
                color: '#fff',
                borderRadius: 8,
                padding: '2px 10px',
                fontWeight: 700,
                fontSize: '1.05rem',
                boxShadow: '0 2px 8px rgba(25,118,210,0.08)',
                display: 'flex',
                flexDirection: 'column',
                minWidth: 0,
                maxWidth: '100%',
                overflow: 'hidden',
              }}>
                <span style={{whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                  {event.title}
                </span>
                <span style={{fontWeight:400,fontSize:'0.95em',opacity:0.85}}>
                  {event.servicio?.precio?.toFixed(2)} € · {event.servicio?.duracionMinutos} min
                </span>
                <span style={{fontWeight:400,fontSize:'0.93em',opacity:0.8}}>
                  {event.usuario?.nombre}
                </span>
                <span style={{fontWeight:400,fontSize:'0.93em',opacity:0.8}}>
                  {moment(event.start).format('HH:mm')}
                </span>
              </div>
            )
          }}
        />
      )}
      {/* Modal de detalles de cita */}
      {selectedEvent && (
        <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.45)',zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setSelectedEvent(null)}>
          <div style={{background:'#fff',borderRadius:16,padding:'2.2rem 2.5rem',minWidth:320,maxWidth:420,boxShadow:'0 8px 32px rgba(25,118,210,0.18)',color:'#222',position:'relative'}} onClick={e=>e.stopPropagation()}>
            <button onClick={()=>setSelectedEvent(null)} style={{position:'absolute',top:18,right:18,background:'none',border:'none',fontSize:22,color:'#1976d2',cursor:'pointer',fontWeight:700}}>×</button>
            <h3 style={{color:'#1976d2',fontWeight:800,marginTop:0,marginBottom:18,fontSize:'1.4rem'}}>Detalles de la cita</h3>
            <div style={{marginBottom:10}}><b>Servicio:</b> <span style={{color:'#1976d2',fontWeight:600}}>{selectedEvent.servicio?.nombre}</span></div>
            <div style={{marginBottom:10}}><b>Descripción:</b> <span style={{color:'#444'}}>{selectedEvent.servicio?.descripcion}</span></div>
            <div style={{marginBottom:10}}><b>Precio:</b> <span style={{color:'#43b94a',fontWeight:700}}>{selectedEvent.servicio?.precio?.toFixed(2)} €</span></div>
            <div style={{marginBottom:10}}><b>Duración:</b> <span>{selectedEvent.servicio?.duracionMinutos} min</span></div>
            <div style={{marginBottom:10}}><b>Cliente:</b> <span style={{color:'#1976d2'}}>{selectedEvent.usuario?.nombre} ({selectedEvent.usuario?.email})</span></div>
            <div style={{marginBottom:10}}><b>Fecha:</b> <span>{moment(selectedEvent.start).format('DD/MM/YYYY')}</span></div>
            <div style={{marginBottom:10}}><b>Hora:</b> <span>{moment(selectedEvent.start).format('HH:mm')}</span></div>
            {selectedEvent.comentario && <div style={{marginBottom:10}}><b>Comentario:</b> <span style={{color:'#444'}}>{selectedEvent.comentario}</span></div>}
            <div style={{marginBottom:10}}><b>Confirmada:</b> <span style={{color:selectedEvent.confirmada?'#43b94a':'#e74c3c',fontWeight:700}}>{selectedEvent.confirmada ? 'Sí' : 'No'}</span></div>
            {selectedEvent.fija && <div style={{marginBottom:10}}><b>Fija:</b> <span style={{color:'#1976d2'}}>Sí</span></div>}
            {selectedEvent.periodicidadDias > 0 && <div style={{marginBottom:10}}><b>Periodicidad:</b> <span>{selectedEvent.periodicidadDias} días</span></div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default CitasAdmin; 