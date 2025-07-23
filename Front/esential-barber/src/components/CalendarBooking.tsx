import React, { useState, useEffect } from 'react';

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
}

interface Props {
  servicio: Servicio[];
  onClose: () => void;
  onReservaCompletada: () => void;
  nombresServicios: string;
}

const CalendarBooking: React.FC<Props> = ({ servicio, onClose, onReservaCompletada, nombresServicios }) => {
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

  // Obtener la mayor duración de los servicios seleccionados (por si se seleccionan varios)
  const duracion = servicio.length > 0 ? Math.max(...servicio.map(s => s.duracionMinutos)) : 45;

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
      fetch(`http://localhost:8080/api/citas/disponibilidad?fecha=${fecha}&duracion=${duracion}`)
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
  }, [diaSeleccionado, mes, anio, duracion]);

  // Consultar disponibilidad de todo el mes al cambiar mes/año
  useEffect(() => {
    const fetchDisponibilidadMes = async () => {
      const diasEnEsteMes = new Date(anio, mes + 1, 0).getDate();
      const promises = Array.from({length: diasEnEsteMes}, (_, i) => {
        const fecha = `${anio}-${String(mes+1).padStart(2,'0')}-${String(i+1).padStart(2,'0')}`;
        return fetch(`http://localhost:8080/api/citas/disponibilidad?fecha=${fecha}&duracion=${duracion}`)
          .then(res => res.json())
          .then(data => {
            const libres = data.horasLibres ? data.horasLibres.length : 0;
            return { dia: i+1, libres };
          })
          .catch(() => ({ dia: i+1, libres: 0 }));
      });
      const resultados = await Promise.all(promises);
      const map: {[dia: number]: number} = {};
      resultados.forEach(({dia, libres}) => { map[dia] = libres; });
      setDisponibilidadMes(map);
    };
    fetchDisponibilidadMes();
  }, [mes, anio, duracion]);

  // --- UI principal ---
  if (confirmStep) {
    // Datos de la cita
    const fechaStr = diaSeleccionado && horaSeleccionada ? `${String(diaSeleccionado).padStart(2,'0')}/${String(mes+1).padStart(2,'0')}/${anio}` : '';
    const servicioPrincipal = servicio[0];
    return (
      <div style={{width:'100vw',height:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f5f5f5'}}>
        <div style={{background:'#fff',padding:36,borderRadius:18,boxShadow:'0 4px 32px rgba(0,0,0,0.18)',minWidth:360, maxWidth:420, color:'#222', display:'flex', flexDirection:'column', alignItems:'center'}}>
          <h2 style={{color:'#1976d2',marginTop:0,marginBottom:8, fontWeight:800, fontSize:'2rem', letterSpacing:1}}>Confirmar cita</h2>
          <div style={{width:'100%',margin:'1.5rem 0',background:'#f8f8f8',borderRadius:12,padding:'1.2rem 1.5rem',boxShadow:'0 2px 12px rgba(25,118,210,0.07)',fontSize:'1.08rem',color:'#222'}}>
            <div style={{marginBottom:10}}><b>Servicio:</b> <span style={{color:'#1976d2',fontWeight:600}}>{servicioPrincipal?.nombre}</span></div>
            <div style={{marginBottom:10}}><b>Descripción:</b> <span style={{color:'#444'}}>{servicioPrincipal?.descripcion}</span></div>
            <div style={{marginBottom:10}}><b>Precio:</b> <span style={{color:'#43b94a',fontWeight:700}}>{servicioPrincipal?.precio?.toFixed(2)} €</span></div>
            <div style={{marginBottom:10}}><b>Duración:</b> <span>{servicioPrincipal?.duracionMinutos} min</span></div>
            <div style={{marginBottom:10}}><b>Fecha:</b> <span>{fechaStr}</span></div>
            <div style={{marginBottom:10}}><b>Hora:</b> <span>{horaSeleccionada}</span></div>
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
                    comentario: comentario.trim() || undefined
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
    <div style={{width:'100vw',height:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f5f5f5'}}>
      <div style={{background:'#fff',padding:32,borderRadius:16,boxShadow:'0 4px 32px rgba(0,0,0,0.18)',minWidth:360, maxWidth:420, color:'#222'}}>
        <h2 style={{color:'#1976d2',marginTop:0,marginBottom:8}}>Selecciona día y hora</h2>
        <div style={{fontWeight:500,marginBottom:16, color:'#222'}}>Servicios: <span style={{color:'#1976d2'}}>{nombresServicios}</span></div>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
          <button 
            onClick={()=>cambiarMes(-1)} 
            style={{background:'none',border:'none',fontSize:22,cursor: (anio > today.getFullYear() || (anio === today.getFullYear() && mes > today.getMonth())) ? 'pointer' : 'not-allowed',color:'#1976d2', opacity: (anio > today.getFullYear() || (anio === today.getFullYear() && mes > today.getMonth())) ? 1 : 0.4}}
            disabled={anio < today.getFullYear() || (anio === today.getFullYear() && mes <= today.getMonth())}
          >&lt;</button>
          <span style={{flex:1, textAlign:'center', fontWeight:800, fontSize:'1.25rem', textTransform:'capitalize', color:'#1976d2', letterSpacing:1, margin:'0 1.5rem', display:'block'}}>{new Date(anio, mes).toLocaleString('es-ES',{month:'long',year:'numeric'})}</span>
          <button onClick={()=>cambiarMes(1)} style={{background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#1976d2'}}>&gt;</button>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:4,marginBottom:8}}>
          {['L','M','X','J','V','S','D'].map(dia=>(<div key={dia} style={{textAlign:'center',fontWeight:700,color:'#1976d2',fontSize:'1.08rem'}}>{dia}</div>))}
          {Array(primerDiaSemana===0?6:primerDiaSemana-1).fill(null).map((_,i)=>(<div key={'empty'+i}></div>))}
          {Array.from({length:diasEnMes},(_,i)=>{
            const dia = i+1;
            const libres = disponibilidadMes[dia] ?? 0;
            const total = 10; // total de slots estándar
            const porcentaje = Math.round((libres/total)*100);
            let colorBarra = porcentaje>70?'#43b94a':porcentaje>30?'#ffe066':'#e74c3c';
            // Deshabilitar días en el pasado
            const esPasado = (anio < anioActual) || (anio === anioActual && mes < mesActual) || (anio === anioActual && mes === mesActual && dia < hoy);
            return (
              <div key={dia} style={{display:'flex',flexDirection:'column',alignItems:'center',cursor: esPasado?'not-allowed':'pointer',opacity:esPasado?0.45:1}} onClick={()=>{if(!esPasado){setDiaSeleccionado(dia);setHoraSeleccionada(null);}}}>
                <div style={{
                  width:34,height:34,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',
                  background: diaSeleccionado===dia?'#1976d2':'#fff',
                  color: diaSeleccionado===dia?'#fff':'#1976d2',
                  border: diaSeleccionado===dia?'2px solid #1976d2':'1.5px solid #1976d2',
                  fontWeight:800,marginBottom:2,
                  fontSize:'1.13rem',
                  boxShadow: diaSeleccionado===dia?'0 2px 8px rgba(25,118,210,0.10)':'none',
                  transition:'all 0.18s',
                  letterSpacing:0.5
                }}>{dia}</div>
                <div style={{width:24,height:5,borderRadius:3,background:colorBarra,marginBottom:2}}></div>
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
              <div style={{color:'#e74c3c'}}>No hay horas libres para este día.</div>
            ) : (
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
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
                      borderRadius:7,padding:'0.4rem 1.1rem',fontWeight:600,cursor:esHoraPasada?'not-allowed':'pointer',transition:'all 0.2s',opacity:esHoraPasada?0.45:1
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
            marginTop: '1.2rem',
            width: '100%',
            background: diaSeleccionado && horaSeleccionada ? '#1976d2' : '#b0b0b0',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '0.8rem 0',
            fontSize: '1.1rem',
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
        <button onClick={onClose} style={{marginTop:12,background:'none',color:'#1976d2',border:'none',borderRadius:8,padding:'0.7rem 1.5rem',fontWeight:600,cursor:'pointer',display:'block',width:'100%'}}>Cancelar</button>
      </div>
    </div>
  );
};

export default CalendarBooking; 