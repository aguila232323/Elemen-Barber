import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

// Simulación de disponibilidad por día (0-100%)
function getDisponibilidad(dia: number) {
  // Ejemplo: días pares muy libres, impares medio, múltiplos de 5 casi llenos
  if (dia % 5 === 0) return 10;
  if (dia % 2 === 0) return 90;
  return 50;
}

// Simulación de horas disponibles por día
function getHorasDisponibles(dia: number) {
  if (getDisponibilidad(dia) < 20) return ['18:00'];
  if (getDisponibilidad(dia) < 60) return ['10:00', '12:00', '16:00'];
  return ['09:00', '10:00', '11:00', '12:00', '16:00', '18:00'];
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

interface Props {
  servicio: Servicio[];
  onClose: () => void;
  onReservaCompletada: () => void;
  nombresServicios: string;
}

const CalendarBooking: React.FC<Props> = ({ servicio, onClose, onReservaCompletada, nombresServicios }) => {
  const { user } = useAuth();
  const today = new Date();
  const [mes, setMes] = useState(today.getMonth());
  const [anio, setAnio] = useState(today.getFullYear());
  const [diaSeleccionado, setDiaSeleccionado] = useState<number|null>(null);
  const [horaSeleccionada, setHoraSeleccionada] = useState<string|null>(null);
  const [horasLibres, setHorasLibres] = useState<string[]>([]);
  const [loadingHoras, setLoadingHoras] = useState(false);
  const [disponibilidadMes, setDisponibilidadMes] = useState<{[dia: number]: number}>({}); // porcentaje de libre por día
  const [confirmStep, setConfirmStep] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmError, setConfirmError] = useState('');
  const [confirmSuccess, setConfirmSuccess] = useState(false);
  const [comentario, setComentario] = useState('');
  const [tiempoMinimo, setTiempoMinimo] = useState<number>(24); // valor por defecto

  // Estados para selección de usuario por admin
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<string>('');
  const [busquedaUsuario, setBusquedaUsuario] = useState<string>('');
  const [mostrarDropdown, setMostrarDropdown] = useState(false);

  // Obtener la duración del servicio seleccionado (ahora solo se puede seleccionar uno)
  const duracion = servicio.length > 0 ? servicio[0].duracionMinutos : 45;

  // Días del mes
  const diasEnMes = new Date(anio, mes + 1, 0).getDate();
  const primerDiaSemana = new Date(anio, mes, 1).getDay(); // 0=domingo

  // Calcular fecha y hora actual para restricciones
  const now = new Date();
  const hoy = now.getDate();
  const mesActual = now.getMonth();
  const anioActual = now.getFullYear();
  const horaActual = now.getHours();
  const minutosActual = now.getMinutes();

  // Obtener tiempo mínimo de reserva
  useEffect(() => {
    const fetchTiempoMinimo = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/configuracion/tiempo-minimo');
        const data = await res.json();
        if (data.horasMinimas) {
          setTiempoMinimo(data.horasMinimas);
          console.log('Tiempo mínimo configurado:', data.horasMinimas, 'horas');
        }
      } catch (error) {
        console.log('Error al obtener tiempo mínimo, usando valor por defecto (24 horas)');
      }
    };
    fetchTiempoMinimo();
  }, []);

  // Cargar usuarios si es admin
  useEffect(() => {
    if (user?.rol === 'ADMIN') {
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
      fetchUsuarios();
    }
  }, [user?.rol]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-dropdown')) {
        setMostrarDropdown(false);
      }
    };

    if (mostrarDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mostrarDropdown]);

  // Navegación de mes
  function cambiarMes(delta: number) {
    let nuevoMes = mes + delta;
    let nuevoAnio = anio;
    if (nuevoMes < 0) { nuevoMes = 11; nuevoAnio--; }
    if (nuevoMes > 11) { nuevoMes = 0; nuevoAnio++; }
    setMes(nuevoMes);
    setAnio(nuevoAnio);
    setDiaSeleccionado(null);
    setHoraSeleccionada(null);
    setHorasLibres([]);
  }

  // Consultar horas libres al seleccionar un día
  useEffect(() => {
    if (diaSeleccionado) {
      setLoadingHoras(true);
      const fecha = `${anio}-${String(mes+1).padStart(2,'0')}-${String(diaSeleccionado).padStart(2,'0')}`;
      const userRole = user?.rol || 'USER';
      fetch(`http://localhost:8080/api/citas/disponibilidad?fecha=${fecha}&duracion=${duracion}&userRole=${userRole}`)
        .then(res => res.json())
        .then(data => {
          setHorasLibres(data.horasLibres || []);
          setLoadingHoras(false);
        })
        .catch(() => {
          setHorasLibres([]);
          setLoadingHoras(false);
        });
    } else {
      setHorasLibres([]);
    }
  }, [diaSeleccionado, mes, anio, duracion, user?.rol]);

  // Consultar disponibilidad de todo el mes al cambiar mes/año
  useEffect(() => {
    const fetchDisponibilidadMes = async () => {
      try {
        const userRole = user?.rol || 'USER';
        const res = await fetch(`http://localhost:8080/api/citas/disponibilidad-mes?anio=${anio}&mes=${mes+1}&duracion=${duracion}&userRole=${userRole}`);
        const data = await res.json();
        const map: {[dia: number]: number} = {};
        if (data.dias && Array.isArray(data.dias)) {
          data.dias.forEach((d: any) => {
            const diaNum = d.dia;
            map[diaNum] = d.slotsLibres;
          });
        }
        setDisponibilidadMes(map);
      } catch {
        setDisponibilidadMes({});
      }
    };
    fetchDisponibilidadMes();
  }, [mes, anio, duracion, user?.rol]);

  // --- UI principal ---
  if (confirmStep) {
    // Datos de la cita
    const fechaStr = diaSeleccionado && horaSeleccionada ? `${String(diaSeleccionado).padStart(2,'0')}/${String(mes+1).padStart(2,'0')}/${anio}` : '';
    const servicioPrincipal = servicio[0];
    return (
            <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.5)',zIndex:9999}}>
        <div style={{background:'#fff',padding:'1.5rem',borderRadius:18,boxShadow:'0 4px 32px rgba(0,0,0,0.18)',width:'90%',maxWidth:420,minWidth:320,color:'#222',display:'flex',flexDirection:'column',alignItems:'center',position:'relative',maxHeight:'90vh',overflowY:'auto'}}>
          <button onClick={onClose} style={{position:'absolute',top:8,right:8,background:'none',border:'none',fontSize:'1.5rem',cursor:'pointer',color:'#999',width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
          <h2 style={{color:'#1976d2',marginTop:0,marginBottom:8, fontWeight:800, fontSize:'1.5rem', letterSpacing:1}}>Confirmar cita</h2>
          <div style={{width:'100%',margin:'1.5rem 0',background:'#f8f8f8',borderRadius:12,padding:'1.2rem 1.5rem',boxShadow:'0 2px 12px rgba(25,118,210,0.07)',fontSize:'1.08rem',color:'#222'}}>
            <div style={{marginBottom:10}}><b>Servicio:</b> <span style={{color:'#1976d2',fontWeight:600}}>{servicioPrincipal?.nombre}</span></div>
            <div style={{marginBottom:10}}><b>Descripción:</b> <span style={{color:'#444'}}>{servicioPrincipal?.descripcion}</span></div>
            <div style={{marginBottom:10}}><b>Precio:</b> <span style={{color:'#43b94a',fontWeight:700}}>{servicioPrincipal?.precio?.toFixed(2)} €</span></div>
            <div style={{marginBottom:10}}><b>Duración:</b> <span>{servicioPrincipal?.duracionMinutos} min</span></div>
            <div style={{marginBottom:10}}><b>Fecha:</b> <span>{fechaStr}</span></div>
            <div style={{marginBottom:10}}><b>Hora:</b> <span>{horaSeleccionada}</span></div>
            
            {/* Selección de usuario para admin */}
            {user?.rol === 'ADMIN' && (
              <div style={{marginBottom:10}}>
                <b>Cliente:</b>
                <div style={{position: 'relative', marginTop: 6}} className="user-dropdown">
                  <input
                    type="text"
                    value={busquedaUsuario}
                    onChange={(e) => {
                      setBusquedaUsuario(e.target.value);
                      setMostrarDropdown(true);
                    }}
                    onFocus={() => setMostrarDropdown(true)}
                    placeholder="Buscar cliente..."
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 6,
                      border: '1px solid #ccc',
                      fontSize: '1rem',
                      outline: 'none'
                    }}
                  />
                  {mostrarDropdown && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      background: '#fff',
                      border: '1px solid #ccc',
                      borderRadius: 6,
                      maxHeight: 200,
                      overflowY: 'auto',
                      zIndex: 1000,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}>
                      {usuarios
                        .filter(usuario => 
                          usuario.nombre.toLowerCase().includes(busquedaUsuario.toLowerCase()) ||
                          usuario.email.toLowerCase().includes(busquedaUsuario.toLowerCase())
                        )
                        .map(usuario => (
                          <div
                            key={usuario.id}
                            onClick={() => {
                              setUsuarioSeleccionado(usuario.id);
                              setBusquedaUsuario(`${usuario.nombre} (${usuario.email})`);
                              setMostrarDropdown(false);
                            }}
                            style={{
                              padding: '8px 12px',
                              cursor: 'pointer',
                              borderBottom: '1px solid #eee',
                              fontSize: '0.9rem'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.background = '#f5f5f5';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.background = '#fff';
                            }}
                          >
                            <div style={{fontWeight: 600}}>{usuario.nombre}</div>
                            <div style={{color: '#666', fontSize: '0.8rem'}}>{usuario.email}</div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div style={{marginBottom:10}}>
              <b>Comentario:</b>
              <textarea
                value={comentario}
                onChange={e => setComentario(e.target.value)}
                placeholder="¿Quieres añadir algún comentario para el barbero? (opcional)"
                style={{width:'100%',minHeight:48,marginTop:6,borderRadius:6,border:'1px solid #ccc',padding:'0.5rem',fontSize:'1rem',resize:'vertical'}}
              />
            </div>
          </div>
          {confirmError && <div style={{color:'#e74c3c',marginBottom:10}}>{confirmError}</div>}
          {confirmSuccess ? (
            <div style={{color:'#43b94a',fontWeight:700,fontSize:'1.1rem',marginBottom:16}}>¡Cita confirmada correctamente!</div>
          ) : (
            <button
              style={{
                width: '100%',
                background: '#1976d2',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '0.9rem 0',
                fontSize: '1.15rem',
                fontWeight: 800,
                cursor: confirmLoading ? 'not-allowed' : 'pointer',
                marginBottom: 12,
                boxShadow: '0 2px 8px rgba(25,118,210,0.08)',
                letterSpacing: 1
              }}
              disabled={confirmLoading}
              onClick={async () => {
                // Validar que admin haya seleccionado un cliente
                if (user?.rol === 'ADMIN' && !usuarioSeleccionado) {
                  setConfirmError('Por favor selecciona un cliente');
                  return;
                }
                
                setConfirmLoading(true);
                setConfirmError('');
                try {
                  // Construir datos de la cita
                  const token = localStorage.getItem('authToken');
                  // Guardar la fecha en hora local (sin .toISOString())
                  const fechaLocal = `${anio}-${String(mes+1).padStart(2,'0')}-${String(diaSeleccionado).padStart(2,'0')}T${horaSeleccionada}:00`;
                  const body = {
                    servicioId: servicioPrincipal?.id,
                    fecha: fechaLocal,
                    comentario: comentario.trim() || undefined,
                    // Incluir clienteId si es admin y se ha seleccionado un usuario
                    ...(user?.rol === 'ADMIN' && usuarioSeleccionado && { clienteId: parseInt(usuarioSeleccionado) })
                  };
                  const res = await fetch('http://localhost:8080/api/citas', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    },
                    body: JSON.stringify(body)
                  });
                  if (!res.ok) throw new Error('No se pudo crear la cita.');
                  setConfirmSuccess(true);
                  setTimeout(()=>{
                    setConfirmSuccess(false);
                    setConfirmStep(false);
                    onReservaCompletada();
                  }, 1800);
                } catch (err: any) {
                  setConfirmError(err.message || 'Error al crear la cita');
                } finally {
                  setConfirmLoading(false);
                }
              }}
            >{confirmLoading ? 'Confirmando...' : 'Confirmar cita'}</button>
          )}
          <button onClick={()=>setConfirmStep(false)} style={{background:'none',color:'#1976d2',border:'none',borderRadius:8,padding:'0.7rem 1.5rem',fontWeight:600,cursor:'pointer',display:'block',width:'100%'}}>Volver</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.5)',zIndex:9999}}>
      <div style={{background:'#fff',padding:'1.5rem',borderRadius:16,boxShadow:'0 4px 32px rgba(0,0,0,0.18)',width:'90%',maxWidth:420,minWidth:320,color:'#222',position:'relative',maxHeight:'90vh',overflowY:'auto'}}>
        <button onClick={onClose} style={{position:'absolute',top:8,right:8,background:'none',border:'none',fontSize:'1.5rem',cursor:'pointer',color:'#999',width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
        <h2 style={{color:'#1976d2',marginTop:0,marginBottom:8,fontSize:'1.5rem'}}>Selecciona día y hora</h2>
                  <div style={{fontWeight:500,marginBottom:16, color:'#222'}}>Servicio: <span style={{color:'#1976d2'}}>{nombresServicios}</span></div>
        {user?.rol !== 'ADMIN' && (
          <div style={{
            background: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '8px',
            padding: '0.75rem',
            marginBottom: '16px',
            fontSize: '0.85rem',
            color: '#856404'
          }}>
            <strong>Recordatorio:</strong> Debes reservar con al menos {tiempoMinimo} {tiempoMinimo === 1 ? 'hora' : 'horas'} de antelación.
          </div>
        )}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
          <button 
            onClick={()=>cambiarMes(-1)} 
            style={{background:'none',border:'none',fontSize:18,cursor: (anio > today.getFullYear() || (anio === today.getFullYear() && mes > today.getMonth())) ? 'pointer' : 'not-allowed',color:'#1976d2', opacity: (anio > today.getFullYear() || (anio === today.getFullYear() && mes > today.getMonth())) ? 1 : 0.4}}
            disabled={anio < today.getFullYear() || (anio === today.getFullYear() && mes <= today.getMonth())}
          >&lt;</button>
          <span style={{flex:1, textAlign:'center', fontWeight:800, fontSize:'1.1rem', textTransform:'capitalize', color:'#1976d2', letterSpacing:1, margin:'0 1rem', display:'block'}}>{new Date(anio, mes).toLocaleString('es-ES',{month:'long',year:'numeric'})}</span>
          <button onClick={()=>cambiarMes(1)} style={{background:'none',border:'none',fontSize:18,cursor:'pointer',color:'#1976d2'}}>&gt;</button>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'0.25rem',marginBottom:8}}>
          {['L','M','X','J','V','S','D'].map(dia=>(<div key={dia} style={{textAlign:'center',fontWeight:700,color:'#1976d2',fontSize:'0.9rem'}}>{dia}</div>))}
          {Array(primerDiaSemana===0?6:primerDiaSemana-1).fill(null).map((_,i)=>(<div key={'empty'+i}></div>))}
          {Array.from({length:diasEnMes},(_,i)=>{
            const dia = i+1;
            const libres = disponibilidadMes[dia] ?? 0;
            const total: number = 10; // Debe coincidir con el backend
            const porcentaje = total === 0 ? 0 : Math.round((libres/total)*100);
            let colorBarra = porcentaje > 70 ? '#43b94a' : porcentaje > 30 ? '#ffe066' : '#e74c3c';
            // Deshabilitar días en el pasado
            const esPasado = (anio < anioActual) || (anio === anioActual && mes < mesActual) || (anio === anioActual && mes === mesActual && dia < hoy);
            // Deshabilitar días sin slots disponibles (para usuarios no-admin)
            const sinSlotsDisponibles = user?.rol !== 'ADMIN' && libres === 0 && !esPasado;
            const esSeleccionable = !esPasado && !sinSlotsDisponibles;
            
            return (
              <div key={dia} style={{display:'flex',flexDirection:'column',alignItems:'center',cursor: esSeleccionable?'pointer':'not-allowed',opacity:esSeleccionable?1:0.45}} onClick={()=>{if(esSeleccionable){setDiaSeleccionado(dia);setHoraSeleccionada(null);}}}>
                <div style={{
                  width:'2rem',height:'2rem',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',
                  background: diaSeleccionado===dia?'#1976d2':(esPasado || sinSlotsDisponibles)?'#f5f5f5':'#fff',
                  color: diaSeleccionado===dia?'#fff':(esPasado || sinSlotsDisponibles)?'#999':'#1976d2',
                  border: diaSeleccionado===dia?'2px solid #1976d2':(esPasado || sinSlotsDisponibles)?'1.5px solid #ddd':'1.5px solid #1976d2',
                  fontWeight:800,marginBottom:2,
                  fontSize:'0.9rem',
                  boxShadow: diaSeleccionado===dia?'0 2px 8px rgba(25,118,210,0.10)':'none',
                  transition:'all 0.18s',
                  letterSpacing:0.5
                }}>{dia}</div>
                <div style={{width:'1.2rem',height:'0.25rem',borderRadius:3,background:(esPasado || sinSlotsDisponibles)?'#ddd':colorBarra,marginBottom:2}}></div>
              </div>
            )
          })}
        </div>
        {diaSeleccionado && (
          <div style={{margin:'18px 0'}}>
            <div style={{fontWeight:500,marginBottom:8}}>Horas disponibles para el {diaSeleccionado}:</div>
            {loadingHoras ? (
              <div style={{color:'#1976d2'}}>Cargando horas...</div>
            ) : horasLibres.length === 0 ? (
              <div style={{color:'#e74c3c'}}>
                {user?.rol === 'ADMIN' ? 
                  'No hay horas libres para este día.' : 
                  `No hay horas disponibles para este día. Recuerda que debes reservar con al menos ${tiempoMinimo} ${tiempoMinimo === 1 ? 'hora' : 'horas'} de antelación.`
                }
              </div>
            ) : (
            <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap'}}>
              {horasLibres.map(hora=>{
                // Deshabilitar horas en el pasado si es hoy
                let esHoraPasada = false;
                if (anio === anioActual && mes === mesActual && diaSeleccionado === hoy) {
                  const [h, m] = hora.split(':').map(Number);
                  if (h < horaActual || (h === horaActual && m <= minutosActual)) esHoraPasada = true;
                }
                return (
                  <button key={hora} onClick={()=>!esHoraPasada && setHoraSeleccionada(hora)}
                    style={{
                      background:horaSeleccionada===hora?'#1976d2':'#fff',
                      color:horaSeleccionada===hora?'#fff':'#1976d2',
                      border:'2px solid #1976d2',
                      borderRadius:7,padding:'0.3rem 0.8rem',fontWeight:600,cursor:esHoraPasada?'not-allowed':'pointer',transition:'all 0.2s',opacity:esHoraPasada?0.45:1,fontSize:'0.9rem'
                    }}
                    disabled={esHoraPasada}
                  >{hora}</button>
                );
              })}
            </div>
            )}
          </div>
        )}
        <button
          style={{
            marginTop: '1rem',
            width: '100%',
            background: diaSeleccionado && horaSeleccionada ? '#1976d2' : '#b0b0b0',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '0.7rem 0',
            fontSize: '1rem',
            fontWeight: 700,
            cursor: diaSeleccionado && horaSeleccionada ? 'pointer' : 'not-allowed',
            transition: 'background 0.2s',
          }}
          disabled={!(diaSeleccionado && horaSeleccionada)}
          onClick={() => {
            if (diaSeleccionado && horaSeleccionada) {
              setConfirmStep(true);
            }
          }}
        >
          Continuar
        </button>
        <button onClick={onClose} style={{marginTop:8,background:'none',color:'#1976d2',border:'none',borderRadius:8,padding:'0.6rem 1rem',fontWeight:600,cursor:'pointer',display:'block',width:'100%',fontSize:'0.9rem'}}>Cancelar</button>
      </div>
    </div>
  );
};

export default CalendarBooking; 