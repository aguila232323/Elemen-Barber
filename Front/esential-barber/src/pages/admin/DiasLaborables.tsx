import React, { useState, useEffect } from 'react';
import { config } from '../../config/config';
import { FaCalendarAlt, FaClock, FaPlus, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import styles from './DiasLaborables.module.css';

interface DiaLaborable {
  id: number;
  diaSemana: string;
  esLaborable: boolean;
  horaInicio: string;
  horaFin: string;
  descripcion?: string;
}

interface DiaNoLaborable {
  id: number;
  fecha: string;
  descripcion: string;
  tipo: string;
  activo: boolean;
}

const DiasLaborables: React.FC = () => {
  const [diasLaborables, setDiasLaborables] = useState<DiaLaborable[]>([]);
  const [diasNoLaborables, setDiasNoLaborables] = useState<DiaNoLaborable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingDia, setEditingDia] = useState<DiaLaborable | null>(null);
  const [newDiaNoLaborable, setNewDiaNoLaborable] = useState({
    fecha: '',
    descripcion: '',
    tipo: 'FESTIVO'
  });

  const diasSemana = [
    { value: 'MONDAY', label: 'Lunes' },
    { value: 'TUESDAY', label: 'Martes' },
    { value: 'WEDNESDAY', label: 'Miércoles' },
    { value: 'THURSDAY', label: 'Jueves' },
    { value: 'FRIDAY', label: 'Viernes' },
    { value: 'SATURDAY', label: 'Sábado' },
    { value: 'SUNDAY', label: 'Domingo' }
  ];

  const tiposDiaNoLaborable = [
    { value: 'FESTIVO', label: 'Festivo' },
    { value: 'DIA_ESPECIAL', label: 'Día Especial' },
    { value: 'MANTENIMIENTO', label: 'Mantenimiento' },
    { value: 'VACACIONES', label: 'Vacaciones' }
  ];

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      // Cargar días laborables
      const responseLaborables = await fetch(`${config.API_BASE_URL}/api/dias-laborables/horario`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (responseLaborables.ok) {
        const laborables = await responseLaborables.json();
        setDiasLaborables(laborables);
      }
      
      // Cargar días no laborables
      const responseNoLaborables = await fetch(`${config.API_BASE_URL}/api/dias-laborables/no-laborables`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (responseNoLaborables.ok) {
        const noLaborables = await responseNoLaborables.json();
        setDiasNoLaborables(noLaborables);
      }
      
    } catch (error) {
      setError('Error al cargar los datos');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const actualizarDiaLaborable = async (dia: DiaLaborable) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${config.API_BASE_URL}/api/dias-laborables/admin/dia-semana`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          diaSemana: dia.diaSemana,
          esLaborable: dia.esLaborable,
          horaInicio: dia.horaInicio,
          horaFin: dia.horaFin
        })
      });

      if (response.ok) {
        await cargarDatos();
        setEditingDia(null);
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Error al actualizar');
      }
    } catch (error) {
      alert('Error al actualizar el día');
      console.error('Error:', error);
    }
  };

  const añadirDiaNoLaborable = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${config.API_BASE_URL}/api/dias-laborables/admin/no-laborable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newDiaNoLaborable)
      });

      if (response.ok) {
        await cargarDatos();
        setNewDiaNoLaborable({ fecha: '', descripcion: '', tipo: 'FESTIVO' });
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Error al añadir día no laborable');
      }
    } catch (error) {
      alert('Error al añadir día no laborable');
      console.error('Error:', error);
    }
  };

  const eliminarDiaNoLaborable = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este día no laborable?')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${config.API_BASE_URL}/api/dias-laborables/admin/no-laborable/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await cargarDatos();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Error al eliminar');
      }
    } catch (error) {
      alert('Error al eliminar el día no laborable');
      console.error('Error:', error);
    }
  };

  const inicializarDiasLaborables = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${config.API_BASE_URL}/api/dias-laborables/admin/inicializar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await cargarDatos();
        alert('Días laborables inicializados correctamente');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Error al inicializar');
      }
    } catch (error) {
      alert('Error al inicializar días laborables');
      console.error('Error:', error);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        Cargando configuración...
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.message} ${styles.error}`}>
        {error}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1><FaCalendarAlt className={styles.icon} /> Gestión de Días Laborables</h1>
        <p>Configura los días y horarios en los que el negocio estará abierto para recibir citas</p>
      </div>

      {/* Configuración Semanal */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>📅 Horario Semanal</h2>
        <div className={styles.weekGrid}>
          {diasLaborables.map((dia) => (
            <div key={dia.id} className={`${styles.dayCard} ${!dia.esLaborable ? styles.disabled : ''}`}>
              <div className={styles.dayHeader}>
                <h3 className={styles.dayName}>{diasSemana.find(d => d.value === dia.diaSemana)?.label}</h3>
                <div 
                  className={`${styles.toggleSwitch} ${dia.esLaborable ? styles.active : ''}`}
                  onClick={() => {
                    const updatedDia = { ...dia, esLaborable: !dia.esLaborable };
                    setDiasLaborables(diasLaborables.map(d => d.id === dia.id ? updatedDia : d));
                  }}
                />
              </div>
              
              {dia.esLaborable && (
                <div className={styles.timeFields}>
                  <div className={styles.timeField}>
                    <label>Hora de Inicio:</label>
                    <input
                      type="time"
                      value={dia.horaInicio}
                      onChange={(e) => {
                        const updatedDia = { ...dia, horaInicio: e.target.value };
                        setDiasLaborables(diasLaborables.map(d => d.id === dia.id ? updatedDia : d));
                      }}
                    />
                  </div>
                  <div className={styles.timeField}>
                    <label>Hora de Fin:</label>
                    <input
                      type="time"
                      value={dia.horaFin}
                      onChange={(e) => {
                        const updatedDia = { ...dia, horaFin: e.target.value };
                        setDiasLaborables(diasLaborables.map(d => d.id === dia.id ? updatedDia : d));
                      }}
                    />
                  </div>
                </div>
              )}
              
              <button
                onClick={() => actualizarDiaLaborable(dia)}
                className={styles.saveButton}
                style={{ marginTop: '1rem', width: '100%' }}
              >
                <FaSave /> Guardar Cambios
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Días No Laborables */}
      <div className={styles.section}>
        <div className={styles.specificDaysSection}>
          <h2 className={styles.sectionTitle}>🚫 Días No Laborables</h2>
          
          <div className={styles.addSpecificDayForm}>
            <h3 className={styles.formTitle}>➕ Añadir Nuevo Día No Laborable</h3>
            <div className={styles.formGrid}>
              <div className={styles.formField}>
                <label>Fecha:</label>
                <input
                  type="date"
                  value={newDiaNoLaborable.fecha}
                  onChange={(e) => setNewDiaNoLaborable({...newDiaNoLaborable, fecha: e.target.value})}
                />
              </div>
              
              <div className={styles.formField}>
                <label>Descripción:</label>
                <input
                  type="text"
                  value={newDiaNoLaborable.descripcion}
                  onChange={(e) => setNewDiaNoLaborable({...newDiaNoLaborable, descripcion: e.target.value})}
                  placeholder="Ej: Día de la Constitución"
                />
              </div>
            </div>
            
            <div className={styles.buttonGroup}>
              <button onClick={añadirDiaNoLaborable} className={styles.addButton}>
                <FaPlus /> Añadir Día
              </button>
            </div>
          </div>
          
          <div className={styles.specificDaysList}>
            {diasNoLaborables.map((dia) => (
              <div key={dia.id} className={styles.specificDayCard}>
                <div className={styles.specificDayInfo}>
                  <div className={styles.specificDayDate}>
                    {new Date(dia.fecha).toLocaleDateString('es-ES', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div className={styles.specificDayDescription}>
                    {dia.descripcion} • {tiposDiaNoLaborable.find(t => t.value === dia.tipo)?.label}
                  </div>
                </div>
                <button
                  onClick={() => eliminarDiaNoLaborable(dia.id)}
                  className={styles.deleteButton}
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>


    </div>
  );
};

export default DiasLaborables;
