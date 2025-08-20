import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaPlus, FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
import { config } from '../../config/config';
import styles from './PeriodosLaborables.module.css';

interface PeriodoLaborable {
  id: number;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  diasLaborables: string[];
  descripcion?: string;
  activo: boolean;
}

const PeriodosLaborables: React.FC = () => {
  const [periodos, setPeriodos] = useState<PeriodoLaborable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Formulario para nuevo período
  const [nombre, setNombre] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [diasSeleccionados, setDiasSeleccionados] = useState<string[]>([]);

  const diasSemana = [
    { value: 'MONDAY', label: 'Lunes' },
    { value: 'TUESDAY', label: 'Martes' },
    { value: 'WEDNESDAY', label: 'Miércoles' },
    { value: 'THURSDAY', label: 'Jueves' },
    { value: 'FRIDAY', label: 'Viernes' },
    { value: 'SATURDAY', label: 'Sábado' },
    { value: 'SUNDAY', label: 'Domingo' }
  ];

  // Cargar períodos existentes
  useEffect(() => {
    cargarPeriodos();
  }, []);

  const cargarPeriodos = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${config.API_BASE_URL}/api/periodos-laborables/admin`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPeriodos(data);
      } else {
        setError('Error al cargar los períodos');
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

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
        cargarPeriodos();
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
        cargarPeriodos();
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
      <div className={styles.container}>
        <div className={styles.loading}>
          <div>⏳ Cargando períodos laborables...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1>📅 Períodos Laborables</h1>
        <p>Gestiona los horarios de trabajo por períodos específicos</p>
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

      {/* Períodos existentes */}
      <div className={styles.periodosSection}>
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
      <div className={styles.nuevoPeriodoSection}>
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
    </div>
  );
};

export default PeriodosLaborables;
