import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './CitasAdminCustom.css';
import { FaCalendarAlt, FaTimes, FaSave, FaBars, FaChevronLeft, FaChevronRight, FaChevronDown, FaList } from 'react-icons/fa';
import { useServicios } from '../../hooks/useServicios';

// Configurar moment para español
moment.locale('es', {
  weekdays: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  weekdaysShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  weekdaysMin: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'],
  months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  monthsShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
});

const localizer = momentLocalizer(moment);

interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  duracionMinutos: number;
  emoji?: string;
  textoDescriptivo?: string;
  colorGoogleCalendar?: string;
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

// (Vista móvil personalizada eliminada; se usa RBC también en móvil)

// (getEventColor) no se usa tras simplificar estilos

// Datos de ejemplo para demostración
// getExampleEvents: no usado, se eliminó para limpiar warnings

// Nueva barra de herramientas móvil personalizada
    const MobileCalendarToolbar = ({ currentView, onViewChange, onNavigate, date, view, onView, onNavigate: calendarNavigate, selectedDate, onDateSelect }: any) => {
    const [showViewSelector, setShowViewSelector] = useState(false);
    const [currentWeek, setCurrentWeek] = useState<Date[]>([]);

    useEffect(() => {
      if (selectedDate) {
        generateWeekDays();
      }
    }, [selectedDate]);

    const generateWeekDays = () => {
      if (!selectedDate) return;
      const startOfWeek = moment(selectedDate).startOf('week');
      const days = [];
      
      for (let i = 0; i < 7; i++) {
        days.push(moment(startOfWeek).add(i, 'days').toDate());
      }
      
      setCurrentWeek(days);
    };

    const goToPreviousWeek = () => {
      if (onDateSelect && selectedDate) {
        const newDate = moment(selectedDate).subtract(1, 'week').toDate();
        onDateSelect(newDate);
      }
    };

    const goToNextWeek = () => {
      if (onDateSelect && selectedDate) {
        const newDate = moment(selectedDate).add(1, 'week').toDate();
        onDateSelect(newDate);
      }
    };

    const goToTodayWeek = () => {
      if (onDateSelect) {
        onDateSelect(new Date());
      }
    };

    const getDayName = (date: Date) => {
      const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      return days[date.getDay()];
    };

    const getDayNumber = (date: Date) => {
      return date.getDate();
    };

    const isToday = (date: Date) => {
      return moment(date).isSame(moment(), 'day');
    };

    const isSelected = (date: Date) => {
      return selectedDate && moment(date).isSame(moment(selectedDate), 'day');
    };

    const canGoPrevious = () => {
      return currentWeek.length > 0 && moment(currentWeek[0]).isAfter(moment().subtract(1, 'year'), 'day');
    };

    const canGoNext = () => {
      return currentWeek.length > 0 && moment(currentWeek[0]).isBefore(moment().add(1, 'year'), 'day');
    };

  const viewOptions = [
    { value: Views.DAY, label: 'Día', icon: '📅' },
    { value: Views.WEEK, label: 'Semana', icon: '📆' },
    { value: Views.MONTH, label: 'Mes', icon: '🗓️' },
    { value: Views.AGENDA, label: 'Agenda', icon: '📋' }
  ];

  const currentViewLabel = viewOptions.find(option => option.value === currentView)?.label || 'Semana';

  const handleViewChange = (newView: string) => {
    if (onViewChange) {
      onViewChange(newView);
    } else if (onView) {
      onView(newView);
    }
    setShowViewSelector(false);
  };

  const goToToday = () => {
    if (onNavigate) {
      onNavigate(new Date(), currentView, 'TODAY');
    } else if (calendarNavigate) {
      calendarNavigate('TODAY');
    }
  };

  const goToBack = () => {
    if (onNavigate) {
      onNavigate(date, currentView, 'PREV');
    } else if (calendarNavigate) {
      calendarNavigate('PREV');
    }
  };

  const goToNext = () => {
    if (onNavigate) {
      onNavigate(date, currentView, 'NEXT');
    } else if (calendarNavigate) {
      calendarNavigate('NEXT');
    }
  };
  
  // Función para obtener el nombre del mes en español
  const getMonthName = (date: Date) => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[date.getMonth()];
  };
  
  const formatDate = (date: Date) => {
    const monthName = getMonthName(date);
    const year = date.getFullYear();
    return `${monthName} ${year}`;
  };

  return (
          <div className="mobile-calendar-toolbar" style={{ paddingBottom: '0px', paddingLeft: '0px', paddingRight: '0px', paddingTop: '0px' }}>


      {/* Calendario horizontal integrado */}
      <div className="mobile-horizontal-calendar">
        <div className="mobile-horizontal-header">
          <div className="mobile-horizontal-nav">
            <button
              className="mobile-horizontal-nav-button"
              onClick={goToPreviousWeek}
              disabled={!canGoPrevious()}
            >
              <FaChevronLeft size={14} />
            </button>
            <span className="mobile-horizontal-nav-text">
              {currentWeek.length > 0 && (
                <>
                  {moment(currentWeek[0]).locale('es').format('MMM D')} - {moment(currentWeek[6]).locale('es').format('MMM D, YYYY')}
                </>
              )}
            </span>
            <button
              className="mobile-horizontal-nav-button"
              onClick={goToNextWeek}
              disabled={!canGoNext()}
            >
              <FaChevronRight size={14} />
            </button>
          </div>
          
          {/* Selector de vista */}
          <div className="mobile-horizontal-view-selector">
            <button 
              className="mobile-view-selector-button"
              onClick={() => setShowViewSelector(!showViewSelector)}
            >
              <span className="view-icon">{viewOptions.find(option => option.value === currentView)?.icon || '📅'}</span>
              <FaChevronDown size={12} className={`chevron ${showViewSelector ? 'rotated' : ''}`} />
            </button>
            
            {showViewSelector && (
                              <div 
                  className="mobile-view-dropdown"
                  style={{
                    position: 'fixed',
                    top: 'auto',
                    left: 'auto',
                    zIndex: 99999,
                    transform: 'translateY(130px)'
                  }}
                >
                {viewOptions.map((option) => (
                  <button
                    key={option.value}
                    className={`mobile-view-option ${currentView === option.value ? 'active' : ''}`}
                    onClick={() => handleViewChange(option.value)}
                  >
                    <span className="view-icon">{option.icon}</span>
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="mobile-horizontal-hours">
          <div className="mobile-horizontal-days">
            {currentWeek.map((day, index) => (
              <button
                key={index}
                className={`mobile-horizontal-day ${isToday(day) ? 'today' : ''} ${isSelected(day) ? 'selected' : ''}`}
                onClick={() => onDateSelect && onDateSelect(day)}
              >
                <div className="mobile-horizontal-day-name">{getDayName(day)}</div>
                <div className="mobile-horizontal-day-number">{getDayNumber(day)}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente de calendario horizontal móvil
const MobileHorizontalCalendar = ({ selectedDate, onDateSelect }: { selectedDate: Date, onDateSelect: (date: Date) => void }) => {
  const [currentWeek, setCurrentWeek] = useState<Date[]>([]);

  useEffect(() => {
    generateWeekDays();
  }, [selectedDate]);

  const generateWeekDays = () => {
    const startOfWeek = moment(selectedDate).startOf('week');
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      days.push(moment(startOfWeek).add(i, 'days').toDate());
    }
    
    setCurrentWeek(days);
  };

  const goToPreviousWeek = () => {
    const newDate = moment(selectedDate).subtract(1, 'week').toDate();
    onDateSelect(newDate);
  };

  const goToNextWeek = () => {
    const newDate = moment(selectedDate).add(1, 'week').toDate();
    onDateSelect(newDate);
  };

  const goToToday = () => {
    onDateSelect(new Date());
  };

  const getDayName = (date: Date) => {
    return moment(date).format('ddd').toUpperCase();
  };

  const getDayNumber = (date: Date) => {
    return moment(date).format('D');
  };

  const isToday = (date: Date) => {
    return moment(date).isSame(moment(), 'day');
  };

  const isSelected = (date: Date) => {
    return moment(date).isSame(selectedDate, 'day');
  };

  const canGoPrevious = () => {
    return moment(selectedDate).isAfter(moment().subtract(1, 'month'), 'day');
  };

  const canGoNext = () => {
    return moment(selectedDate).isBefore(moment().add(3, 'months'), 'day');
  };

  return (
    <div className="mobile-horizontal-calendar">
      <div className="mobile-horizontal-header">
        <p className="mobile-horizontal-hours">Horario: 9:00 - 19:00</p>
      </div>
      <div className="mobile-horizontal-nav">
        <button 
          className="mobile-horizontal-nav-button"
          onClick={goToPreviousWeek}
          disabled={!canGoPrevious()}
          title="Semana anterior"
        >
          ←
        </button>
        <span className="mobile-horizontal-nav-text">
          {moment(currentWeek[0]).format('MMM D')} - {moment(currentWeek[6]).format('MMM D, YYYY')}
        </span>
        <button 
          className="mobile-horizontal-nav-button"
          onClick={goToNextWeek}
          disabled={!canGoNext()}
          title="Semana siguiente"
        >
          →
        </button>
      </div>
      <div className="mobile-horizontal-days">
        {currentWeek.map((date, index) => (
          <div
            key={index}
            className={`mobile-horizontal-day ${isSelected(date) ? 'selected' : ''} ${isToday(date) ? 'today' : ''}`}
            onClick={() => onDateSelect(date)}
            title={moment(date).format('dddd, D [de] MMMM [de] YYYY')}
          >
            <span className="mobile-horizontal-day-name">{getDayName(date)}</span>
            <span className="mobile-horizontal-day-number">{getDayNumber(date)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const CitasAdmin: React.FC = () => {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileView, setShowMobileView] = useState(false);
  const [currentView, setCurrentView] = useState<any>(Views.MONTH);
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showDayEvents, setShowDayEvents] = useState(false);
  const [showPeriodicModal, setShowPeriodicModal] = useState(false);
  const [selectedCitaForPeriodic, setSelectedCitaForPeriodic] = useState<any>(null);
  
  // Estados para modal de periodicidad
  const [periodicForm, setPeriodicForm] = useState({
    periodicidadDias: 7,
    fechaInicio: ''
  });
  const [periodicLoading, setPeriodicLoading] = useState(false);
  const [periodicMsg, setPeriodicMsg] = useState<string | null>(null);

  // Verificar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setShowMobileView(mobile);
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

  // Cargar citas
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
        const data = await res.json();
        setCitas(data);
      } catch (err: any) {
        setError(err.message || 'Error al cargar las citas');
      } finally {
        setLoading(false);
      }
    };
    fetchCitas();
  }, []);

  // Convertir citas al formato del calendario
  // Las citas canceladas ya están filtradas en el backend, pero mantenemos el filtro aquí como seguridad adicional
  const { servicios } = useServicios();
  const servicioIdToColor = useMemo(() => {
    const map = new Map<number, string | undefined>();
    (servicios || []).forEach((s: any) => map.set(s.id, s.colorGoogleCalendar));
    return map;
  }, [servicios]);

  const events = citas
    .filter(cita => cita.estado !== 'cancelada')
    .map(cita => {
    const status = getCitaStatus(new Date(cita.fechaHora), cita.servicio?.duracionMinutos || 45, cita.estado);

      const rawColor = (cita.servicio?.colorGoogleCalendar || servicioIdToColor.get(cita.servicio?.id) || '').trim();

      const colorIdHexMap: Record<string, string> = {
        '1': '#a4bdfc', // lavender
        '2': '#7ae7bf', // sage
        '3': '#dbadff', // grape
        '4': '#ff887c', // flamingo
        '5': '#fbd75b', // banana
        '6': '#ffb878', // tangerine
        '7': '#46d6db', // peacock
        '8': '#e1e1e1', // graphite
        '9': '#5484ed', // blueberry
        '10': '#51b749', // basil
        '11': '#dc2127', // tomato
      };

      const rgbToHex = (r: number, g: number, b: number) => {
        const to2 = (v: number) => v.toString(16).padStart(2, '0');
        return `#${to2(r)}${to2(g)}${to2(b)}`;
      };

      const normalizeHex = (val: string | undefined): string | undefined => {
        if (!val) return undefined;
        if (/^#?[0-9a-fA-F]{6}$/.test(val)) return val.startsWith('#') ? val : `#${val}`;
        const mRgb = val.match(/^rgb\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i);
        if (mRgb) {
          const r = Math.min(255, parseInt(mRgb[1], 10));
          const g = Math.min(255, parseInt(mRgb[2], 10));
          const b = Math.min(255, parseInt(mRgb[3], 10));
          return rgbToHex(r, g, b);
        }
        const mRgba = val.match(/^rgba\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(0|0?\.\d+|1)\s*\)$/i);
        if (mRgba) {
          const r = Math.min(255, parseInt(mRgba[1], 10));
          const g = Math.min(255, parseInt(mRgba[2], 10));
          const b = Math.min(255, parseInt(mRgba[3], 10));
          return rgbToHex(r, g, b);
        }
        if (/^\d{1,2}$/.test(val) && colorIdHexMap[val]) return colorIdHexMap[val];
        return undefined;
      };

      const toRgba = (hexColor: string, alpha: number) => {
        if (!hexColor || !/^#?[0-9a-fA-F]{6}$/.test(hexColor)) return null;
        const clean = hexColor.startsWith('#') ? hexColor.slice(1) : hexColor;
        const r = parseInt(clean.slice(0, 2), 16);
        const g = parseInt(clean.slice(2, 4), 16);
        const b = parseInt(clean.slice(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      };

      const serviceBorderColor = normalizeHex(rawColor);
      const serviceBgColor = toRgba(serviceBorderColor || '', 0.6) || undefined; // fondo más sólido
      const computeTextColor = (hexColor?: string) => {
        if (!hexColor) return undefined;
        const clean = hexColor.startsWith('#') ? hexColor.slice(1) : hexColor;
        const r = parseInt(clean.slice(0,2),16);
        const g = parseInt(clean.slice(2,4),16);
        const b = parseInt(clean.slice(4,6),16);
        const luminance = 0.2126*r + 0.7152*g + 0.0722*b;
        return luminance < 140 ? '#ffffff' : '#0f172a';
      };
      const serviceTextColor = computeTextColor(serviceBorderColor);

    return {
      id: cita.id,
        title: `${cita.servicio?.nombre || 'Servicio'} - ${cita.usuario?.nombre || 'Cliente'}`,
      start: new Date(cita.fechaHora),
      end: moment(cita.fechaHora).add(cita.servicio?.duracionMinutos || 45, 'minutes').toDate(),
      resource: cita,
      status: status.status,
      statusLabel: status.label,
      statusColor: status.color,
      statusBgColor: status.bgColor,
      statusBorderColor: status.borderColor,
        serviceColor: serviceBgColor,
        serviceBorderColor,
        serviceTextColor,
      servicio: cita.servicio,
      usuario: cita.usuario,
      comentario: cita.comentario,
      confirmada: cita.confirmada,
      fija: cita.fija,
      periodicidadDias: cita.periodicidadDias
    };
  });

  // Componente de evento personalizado
  const EventComponent = ({ event }: { event: any }) => {
    return (
      <div 
        className="custom-event-component"
        data-status={event.status}
        style={{
          backgroundColor: event.serviceColor || event.statusBgColor, // color del servicio como fondo
          border: 'none',
          borderLeft: event.serviceBorderColor ? `6px solid ${event.serviceBorderColor}` : undefined, // franja más intensa
          color: event.serviceTextColor || '#0f172a'
        }}
      >
        <div className="event-header">
          <div className="event-service">
            {event.servicio?.emoji ? `${event.servicio.emoji} ` : ''}
            {event.servicio?.nombre}
          </div>
          <div 
            className="event-status"
            style={{ backgroundColor: event.statusColor, color: '#fff' }}
          >
            {event.statusLabel}
          </div>
        </div>
        <div className="event-client">{event.usuario?.nombre}</div>
        <div className="event-time-inside">
          {moment(event.start).format('HH:mm')} - {moment(event.end).format('HH:mm')}
        </div>
      </div>
    );
  };

  // Estilo de contenedor del evento (por si el tema sobreescribe estilos internos)
  const eventPropGetter = (_event: any) => {
    const style: React.CSSProperties = {
      backgroundColor: 'transparent',
      border: 'none',
      boxShadow: 'none'
    };
    return { style } as any;
  };

  // Actualizar estados de eventos
  const updateEventStatuses = () => {
    // Se recalcularían estados si se guardaran en estado local
  };

  // Textos y formatos del calendario en español
  const calendarMessagesEs = {
    date: 'Fecha',
    time: 'Hora',
    event: 'Cita',
    allDay: 'Todo el día',
    week: 'Semana',
    work_week: 'Semana laboral',
    day: 'Día',
    month: 'Mes',
    previous: 'Anterior',
    next: 'Siguiente',
    yesterday: 'Ayer',
    tomorrow: 'Mañana',
    today: 'Hoy',
    agenda: 'Agenda',
    noEventsInRange: 'No hay eventos en este rango',
    showMore: (total: number) => `+${total} más`,
  } as const;

  const calendarFormatsEs = {
    dayFormat: (date: Date, culture: any, loc: any) => loc.format(date, 'dddd D', culture),
    weekdayFormat: (date: Date, culture: any, loc: any) => {
      // Traducir explícitamente los días de la semana a español
      const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      return diasSemana[date.getDay()];
    },
    dayHeaderFormat: (date: Date, culture: any, loc: any) => loc.format(date, 'dddd D [de] MMMM', culture),
    dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }, culture: any, loc: any) =>
      `${loc.format(start, 'D MMM', culture)} — ${loc.format(end, 'D MMM', culture)}`,
    agendaHeaderFormat: ({ start, end }: { start: Date; end: Date }, culture: any, loc: any) =>
      `${loc.format(start, 'D [de] MMM', culture)} — ${loc.format(end, 'D [de] MMM', culture)}`,
    agendaDateFormat: (date: Date, culture: any, loc: any) => {
      // Traducir explícitamente los días de la semana a español
      const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      const diaSemana = diasSemana[date.getDay()];
      const dia = date.getDate().toString().padStart(2, '0');
      const mes = (date.getMonth() + 1).toString().padStart(2, '0');
      return `${diaSemana} ${dia}/${mes}`;
    },
    agendaTimeRangeFormat: ({ start, end }: { start: Date; end: Date }, culture: any, loc: any) =>
      `${loc.format(start, 'HH:mm', culture)} – ${loc.format(end, 'HH:mm', culture)}`,
    timeGutterFormat: (date: Date, culture: any, loc: any) => loc.format(date, 'HH:mm', culture),
  } as const;

  // Actualizar estados cada minuto
  useEffect(() => {
    const interval = setInterval(updateEventStatuses, 60000);
    return () => clearInterval(interval);
  }, [events]);

  // Obtener eventos del día seleccionado
  const getDayEvents = (date: Date) => {
    return events.filter(event => 
      moment(event.start).isSame(date, 'day')
    ).sort((a, b) => {
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

  const handleSelectSlot = (slotInfo: any) => {
    console.log('Slot seleccionado:', slotInfo);
    setSelectedDate(slotInfo.start);
    // En desktop, cambiar a vista de día directamente; en móvil ya estamos en RBC con view controlado
    setCurrentView(Views.DAY);
    setShowDayEvents(false);
    // Log opcional
    const occupancy = getDayOccupancy(slotInfo.start);
    console.log('Ocupación del día:', occupancy);
  };

  const handleNavigate = (newDate: Date, view: string, action: string) => {
    console.log('Navegación:', { newDate, view, action });
    setSelectedDate(newDate);
  };

  const handleSelectEvent = (event: any) => {
    console.log('Evento seleccionado:', event);
    setSelectedEvent(event);
  };

  const handleAddEvent = () => { /* reservado para futura creación rápida */ };

  // Función para manejar la creación de cita periódica
  const handleCreatePeriodicAppointment = (cita: any) => {
    setSelectedCitaForPeriodic(cita);
    setShowPeriodicModal(true);
  };

  // Función para cerrar el modal de cita periódica
  const handleClosePeriodicModal = () => { setShowPeriodicModal(false); setSelectedCitaForPeriodic(null); };

  // Funciones para manejar el formulario de periodicidad
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

  if (loading) {
    return <div className="loading-message">Cargando citas...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  // Vista móvil: usar react-big-calendar directamente para evitar solapados
  if (showMobileView) {
    return (
      <div className="mobile-admin-container" style={{ height: '200vh' }}>
        {/* Calendario principal */}
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          messages={calendarMessagesEs}
          formats={calendarFormatsEs}
          components={{ 
            toolbar: (props: any) => (
              <MobileCalendarToolbar
                {...props}
                selectedDate={selectedDate}
                onDateSelect={(date: Date) => setSelectedDate(date)}
              />
            ), 
            event: EventComponent 
          }}
            eventPropGetter={eventPropGetter}
          popup
          selectable
          views={['day', 'week', 'month', 'agenda']}
          defaultView={Views.DAY}
          view={currentView}
          onView={(v) => setCurrentView(v)}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          onNavigate={(date) => setSelectedDate(date)}
          date={selectedDate}
          step={15}
          timeslots={4}
          min={moment().hour(9).minute(0).toDate()}
          max={moment().hour(21).minute(15).toDate()}
          style={{ height: 'calc(100% - 120px)' }}
        />
      </div>
    );
  }

  // Vista desktop
  return (
    <div className="citas-admin-container">
      <div className="citas-admin-header">
        <h1 className="citas-admin-title">Gestión de Citas</h1>
        <button 
          className="mobile-menu-toggle"
          onClick={() => setShowMobileView(!showMobileView)}
        >
          <FaBars />
        </button>
      </div>

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
                        
                        {/* Botón de cita periódica solo si no es ya periódica */}
                        {!(event.fija && (event.periodicidadDias || 0) > 0) && (
                          <div className="event-actions">
                            <button 
                              className="periodic-btn-inline"
                              onClick={() => handleCreatePeriodicAppointment(event)}
                            >
                              <FaCalendarAlt />
                              Cita Periódica
                            </button>
                          </div>
                        )}
                        
                        {/* Indicador de cita periódica */}
                        {event.fija && (event.periodicidadDias || 0) > 0 && (
                          <div className="periodic-indicator">
                            <FaCalendarAlt />
                            Periódica ({event.periodicidadDias || 0} días)
                          </div>
                        )}
                        
                        {/* Separador de citas */}
                        {index < getDayEvents(selectedDate).length - 1 && (
                          <div className="event-separator"></div>
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
            messages={calendarMessagesEs}
            formats={calendarFormatsEs}
            style={{ height: '100%' }}
            components={{
              toolbar: (toolbarProps: any) => (
                <MobileCalendarToolbar
                  currentView={currentView}
                  onViewChange={setCurrentView}
                  onNavigate={handleNavigate}
                  date={selectedDate}
                />
              ),
              event: EventComponent
            }}
            eventPropGetter={eventPropGetter}
            onSelectSlot={handleSelectSlot}
            onNavigate={handleNavigate}
            onSelectEvent={handleSelectEvent}
            selectable
            popup
            defaultView={Views.MONTH}
            views={['month', 'week', 'day', 'agenda']}
            view={currentView}
            onView={(v) => setCurrentView(v)}
            step={15}
            timeslots={4}
            min={moment().hour(9).minute(0).toDate()}
            max={moment().hour(21).minute(15).toDate()}
            date={selectedDate}
            onDrillDown={(date) => { setSelectedDate(date); setCurrentView(Views.DAY); }}
          />
        </div>
      </div>

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