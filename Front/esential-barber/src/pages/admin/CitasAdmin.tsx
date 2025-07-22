import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './CitasAdminCustom.css'; // Crea este archivo para estilos personalizados

const localizer = momentLocalizer(moment);
moment.locale('es');

const CitasAdmin: React.FC = () => {
  // Eventos de ejemplo, reemplaza con fetch a tu backend
  const [events, setEvents] = useState([
    {
      title: 'Cita con Juan',
      start: new Date(),
      end: new Date(new Date().getTime() + 60 * 60 * 1000),
    },
    {
      title: 'Cita con Ana',
      start: new Date(new Date().getTime() + 2 * 60 * 60 * 1000),
      end: new Date(new Date().getTime() + 3 * 60 * 60 * 1000),
    },
  ]);

  // Aquí puedes hacer fetch de las citas reales del backend
  useEffect(() => {
    // fetchCitas();
  }, []);

  return (
    <div className="citas-admin-container">
      <h2 className="citas-admin-title">Calendario de Citas</h2>
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
        onSelectEvent={event => alert(`Cita: ${event.title}`)}
      />
    </div>
  );
};

export default CitasAdmin; 