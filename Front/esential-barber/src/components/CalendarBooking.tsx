import React, { useState } from 'react';

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

interface Props {
  servicio: string[];
  onClose: () => void;
  onReservaCompletada: () => void;
}

const CalendarBooking: React.FC<Props> = ({ servicio, onClose, onReservaCompletada }) => {
  const today = new Date();
  const [mes, setMes] = useState(today.getMonth());
  const [anio, setAnio] = useState(today.getFullYear());
  const [diaSeleccionado, setDiaSeleccionado] = useState<number|null>(null);
  const [horaSeleccionada, setHoraSeleccionada] = useState<string|null>(null);

  // Días del mes
  const diasEnMes = new Date(anio, mes + 1, 0).getDate();
  const primerDiaSemana = new Date(anio, mes, 1).getDay(); // 0=domingo

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
  }

  return (
    <div style={{width:'100vw',height:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f5f5f5'}}>
      <div style={{background:'#fff',padding:32,borderRadius:16,boxShadow:'0 4px 32px rgba(0,0,0,0.18)',minWidth:360, maxWidth:420}}>
        <h2 style={{color:'#1976d2',marginTop:0,marginBottom:8}}>Selecciona día y hora</h2>
        <div style={{fontWeight:500,marginBottom:16}}>Servicios: <span style={{color:'#1976d2'}}>{servicio.join(', ')}</span></div>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
          <button onClick={()=>cambiarMes(-1)} style={{background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#1976d2'}}>&lt;</button>
          <span style={{fontWeight:600,fontSize:'1.1rem'}}>{new Date(anio, mes).toLocaleString('es-ES',{month:'long',year:'numeric'})}</span>
          <button onClick={()=>cambiarMes(1)} style={{background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#1976d2'}}>&gt;</button>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:4,marginBottom:8}}>
          {['L','M','X','J','V','S','D'].map(dia=>(<div key={dia} style={{textAlign:'center',fontWeight:600,color:'#1976d2'}}>{dia}</div>))}
          {Array(primerDiaSemana===0?6:primerDiaSemana-1).fill(null).map((_,i)=>(<div key={'empty'+i}></div>))}
          {Array.from({length:diasEnMes},(_,i)=>{
            const dia = i+1;
            const disp = getDisponibilidad(dia);
            let colorBarra = disp>70?'#43b94a':disp>30?'#ffe066':'#e74c3c';
            return (
              <div key={dia} style={{display:'flex',flexDirection:'column',alignItems:'center',cursor:'pointer'}} onClick={()=>{setDiaSeleccionado(dia);setHoraSeleccionada(null);}}>
                <div style={{
                  width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',
                  background: diaSeleccionado===dia?'#1976d2':'#f5f5f5',
                  color: diaSeleccionado===dia?'#fff':'#222',
                  border: diaSeleccionado===dia?'2px solid #1976d2':'1px solid #ddd',
                  fontWeight:600,marginBottom:2
                }}>{dia}</div>
                <div style={{width:24,height:5,borderRadius:3,background:colorBarra,marginBottom:2}}></div>
              </div>
            )
          })}
        </div>
        {diaSeleccionado && (
          <div style={{margin:'18px 0'}}>
            <div style={{fontWeight:500,marginBottom:8}}>Horas disponibles para el {diaSeleccionado}:</div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              {getHorasDisponibles(diaSeleccionado).map(hora=>(
                <button key={hora} onClick={()=>setHoraSeleccionada(hora)}
                  style={{
                    background:horaSeleccionada===hora?'#1976d2':'#fff',
                    color:horaSeleccionada===hora?'#fff':'#1976d2',
                    border:'2px solid #1976d2',
                    borderRadius:7,padding:'0.4rem 1.1rem',fontWeight:600,cursor:'pointer',transition:'all 0.2s'
                  }}
                >{hora}</button>
              ))}
            </div>
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
              alert(`Cita reservada para el ${diaSeleccionado}/${mes+1}/${anio} a las ${horaSeleccionada}`);
              onReservaCompletada();
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