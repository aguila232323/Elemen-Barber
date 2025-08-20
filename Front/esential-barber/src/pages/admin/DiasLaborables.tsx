import React, { useState, useEffect } from 'react';
import { config } from '../../config/config';
import { FaCalendarAlt, FaClock, FaPlus, FaTrash, FaSave, FaTimes, FaCheck, FaEdit } from 'react-icons/fa';
import styles from './DiasLaborables.module.css';

interface DiaLaborable {
  id: number;
  diaSemana: string;
  esLaborable: boolean;
  descripcion?: string;
}

interface PeriodoLaborable {
  id: number;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  diasLaborables: string[];
  descripcion?: string;
  activo: boolean;
}

const DiasLaborables: React.FC = () => {
  // Estados para días laborables semanales
  const [diasLaborables, setDiasLaborables] = useState<DiaLaborable[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Estados para períodos laborables
  const [periodos, setPeriodos] = useState<PeriodoLaborable[]>([]);
  const [nombre, setNombre] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [diasSeleccionados, setDiasSeleccionados] = useState<string[]>([]);
  
  // Estados generales
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'semanal' | 'periodos'>('semanal');

  const diasSemana = [
    { value: 'MONDAY', label: 'Lunes' },
    { value: 'TUESDAY', label: 'Martes' },
    { value: 'WEDNESDAY', label: 'Miércoles' },
    { value: 'THURSDAY', label: 'Jueves' },
    { value: 'FRIDAY', label: 'Viernes' },
    { value: 'SATURDAY', label: 'Sábado' },
    { value: 'SUNDAY', label: 'Domingo' }
  ];

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      // Cargar días laborables semanales
      const responseLaborables = await fetch(`${config.API_BASE_URL}/api/dias-laborables/horario`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (responseLaborables.ok) {
        const laborables = await responseLaborables.json();
        setDiasLaborables(laborables);
      }
      
      // Cargar períodos laborables
      const responsePeriodos = await fetch(`${config.API_BASE_URL}/api/periodos-laborables/admin`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (responsePeriodos.ok) {
        const data = await responsePeriodos.json();
        setPeriodos(data);
      }
      
    } catch (error) {
      setError('Error al cargar los datos');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Funciones para días laborables semanales
  const guardarTodosLosCambios = async () => {
    try {
      const token = localStorage.getItem('authToken');
      let successCount = 0;
      let errorCount = 0;

      for (const dia of diasLaborables) {
        const response = await fetch(`${config.API_BASE_URL}/api/dias-laborables/admin/dia-semana`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            diaSemana: dia.diaSemana,
            esLaborable: dia.esLaborable
          })
        });

        if (response.ok) {
          successCount++;
        } else {
          errorCount++;
        }
      }

      if (errorCount === 0) {
        setSuccess(`✅ Todos los cambios guardados correctamente (${successCount} días actualizados)`);
        setHasChanges(false);
      } else {
        setError(`⚠️ Se guardaron ${successCount} días, pero hubo ${errorCount} errores`);
      }
    } catch (error) {
      setError('Error al guardar los cambios');
      console.error('Error:', error);
    }
  };

  // Funciones para períodos laborables
  const crearPeriodo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nombre || !fechaInicio || !fechaFin || diasSeleccionados.length === 0) {
      setError('Por favor, completa todos los campos obligatorios');
      return;
    }

    if (new Date(fechaInicio) >= new Date(fechaFin)) {
      setError('La fecha de fin debe ser posterior a la fecha de inicio');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${config.API_BASE_URL}/api/periodos-laborables/admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nombre,
          fechaInicio,
          fechaFin,
          diasLaborables: diasSeleccionados,
          descripcion
        })
      });

      if (response.ok) {
        setSuccess('Período creado exitosamente');
        limpiarFormulario();
        cargarDatos();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al crear el período');
      }
    } catch (error) {
      setError('Error de conexión');
    }
  };

  const eliminarPeriodo = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este período?')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${config.API_BASE_URL}/api/periodos-laborables/admin/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setSuccess('Período eliminado exitosamente');
        cargarDatos();
      } else {
        setError('Error al eliminar el período');
      }
    } catch (error) {
      setError('Error de conexión');
    }
  };

  const toggleDia = (dia: string) => {
    setDiasSeleccionados(prev => 
      prev.includes(dia) 
        ? prev.filter(d => d !== dia)
        : [...prev, dia]
    );
  };

  const limpiarFormulario = () => {
    setNombre('');
    setFechaInicio('');
    setFechaFin('');
    setDescripcion('');
    setDiasSeleccionados([]);
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        Cargando configuración...
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1><FaCalendarAlt className={styles.icon} /> Gestión de Días Laborables</h1>
        <p>Configura los días y horarios en los que el negocio estará abierto para recibir citas</p>
      </div>

      {/* Mensajes de estado */}
      {error && (
        <div className={styles.error}>
          <FaTimes /> {error}
        </div>
      )}
      {success && (
        <div className={styles.success}>
          <FaCheck /> {success}
        </div>
      )}

      {/* Pestañas */}
      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'semanal' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('semanal')}
        >
          <FaClock /> Configuración Semanal
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'periodos' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('periodos')}
        >
          <FaCalendarAlt /> Períodos Específicos
        </button>
      </div>

      {/* Contenido de la pestaña semanal */}
      {activeTab === 'semanal' && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>📅 Días Laborables Semanales</h2>
          <p className={styles.sectionDescription}>
            Activa o desactiva los días en los que el negocio estará abierto para recibir citas
          </p>
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
                      setHasChanges(true);
                    }}
                  />
                </div>
                
                <div className={styles.dayStatus}>
                  {dia.esLaborable ? (
                    <span className={styles.statusOpen}>✅ Abierto</span>
                  ) : (
                    <span className={styles.statusClosed}>❌ Cerrado</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Botón universal de guardar */}
          <div className={styles.universalSaveSection}>
            <button
              onClick={guardarTodosLosCambios}
              className={`${styles.universalSaveButton} ${!hasChanges ? styles.disabled : ''}`}
              disabled={!hasChanges}
            >
              <FaSave /> Guardar Todos los Cambios
            </button>
            {hasChanges && (
              <p className={styles.changesIndicator}>
                ⚠️ Tienes cambios sin guardar
              </p>
            )}
          </div>
        </div>
      )}

      {/* Contenido de la pestaña períodos */}
      {activeTab === 'periodos' && (
        <>
          {/* Períodos existentes */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <FaCalendarAlt /> Períodos Configurados
            </h2>
            
            {periodos.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
                No hay períodos configurados. Crea el primero abajo.
              </p>
            ) : (
              <div className={styles.periodosList}>
                {periodos.map((periodo) => (
                  <div 
                    key={periodo.id} 
                    className={`${styles.periodoCard} ${!periodo.activo ? styles.inactivo : ''}`}
                  >
                    <div className={styles.periodoHeader}>
                      <div className={styles.periodoNombre}>{periodo.nombre}</div>
                      <div className={`${styles.periodoEstado} ${periodo.activo ? styles.estadoActivo : styles.estadoInactivo}`}>
                        {periodo.activo ? <FaCheck /> : <FaTimes />}
                        {periodo.activo ? 'Activo' : 'Inactivo'}
                      </div>
                    </div>

                    <div className={styles.periodoFechas}>
                      <div className={styles.fechaItem}>
                        <strong>Desde:</strong> {formatearFecha(periodo.fechaInicio)}
                      </div>
                      <div className={styles.fechaItem}>
                        <strong>Hasta:</strong> {formatearFecha(periodo.fechaFin)}
                      </div>
                    </div>

                    <div className={styles.periodoDias}>
                      {periodo.diasLaborables.map((dia) => {
                        const diaInfo = diasSemana.find(d => d.value === dia);
                        return (
                          <span key={dia} className={styles.diaTag}>
                            {diaInfo?.label}
                          </span>
                        );
                      })}
                    </div>

                    {periodo.descripcion && (
                      <div className={styles.periodoDescripcion}>
                        {periodo.descripcion}
                      </div>
                    )}

                    <div className={styles.periodoActions}>
                      <button 
                        className={`${styles.btn} ${styles.btnEliminar}`}
                        onClick={() => eliminarPeriodo(periodo.id)}
                      >
                        <FaTrash /> Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Crear nuevo período */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <FaPlus /> Crear Nuevo Período
            </h2>

            <form onSubmit={crearPeriodo} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Nombre del Período *</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className={styles.formInput}
                  placeholder="Ej: Horario de Verano, Horario de Invierno..."
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Fecha de Inicio *</label>
                  <input
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    className={styles.formInput}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Fecha de Fin *</label>
                  <input
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    className={styles.formInput}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Días Laborables *</label>
                <div className={styles.diasSelector}>
                  {diasSemana.map((dia) => (
                    <label
                      key={dia.value}
                      className={`${styles.diaCheckbox} ${diasSeleccionados.includes(dia.value) ? styles.selected : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={diasSeleccionados.includes(dia.value)}
                        onChange={() => toggleDia(dia.value)}
                      />
                      {dia.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Descripción (opcional)</label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className={styles.formTextarea}
                  placeholder="Descripción adicional del período..."
                />
              </div>

              <button 
                type="submit" 
                className={styles.btnCrear}
                disabled={!nombre || !fechaInicio || !fechaFin || diasSeleccionados.length === 0}
              >
                <FaPlus /> Crear Período
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default DiasLaborables;
