import React, { useState, useEffect } from 'react';
import { config } from '../../config/config';
import { FaCalendarAlt, FaClock, FaPlus, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import styles from './DiasLaborables.module.css';

interface DiaLaborable {
  id: number;
  diaSemana: string;
  esLaborable: boolean;
  descripcion?: string;
}

const DiasLaborables: React.FC = () => {
  const [diasLaborables, setDiasLaborables] = useState<DiaLaborable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

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
          esLaborable: dia.esLaborable
        })
      });

      if (response.ok) {
        await cargarDatos();
        setHasChanges(false);
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Error al actualizar');
      }
    } catch (error) {
      alert('Error al actualizar el día');
      console.error('Error:', error);
    }
  };

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
        alert(`✅ Todos los cambios guardados correctamente (${successCount} días actualizados)`);
        setHasChanges(false);
      } else {
        alert(`⚠️ Se guardaron ${successCount} días, pero hubo ${errorCount} errores`);
      }
    } catch (error) {
      alert('Error al guardar los cambios');
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
        <h2 className={styles.sectionTitle}>📅 Días Laborables</h2>
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


    </div>
  );
};

export default DiasLaborables;
