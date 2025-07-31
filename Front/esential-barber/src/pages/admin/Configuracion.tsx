import React, { useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaCog, FaSave, FaTimes, FaCalendarAlt, FaUserPlus, FaCalendarCheck, FaUmbrellaBeach } from 'react-icons/fa';
import styles from './Configuracion.module.css';

interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  duracionMinutos: number;
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
  servicio: Servicio;
  usuario: Usuario;
}

const Configuracion: React.FC = () => {
  const [modal, setModal] = useState<'add' | 'edit' | 'delete' | null>(null);
  const [addForm, setAddForm] = useState({ nombre: '', descripcion: '', precio: '', duracion: '' });
  const [addLoading, setAddLoading] = useState(false);
  const [addMsg, setAddMsg] = useState<string | null>(null);

  // Servicios para modificar/eliminar
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [serviciosLoading, setServiciosLoading] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ nombre: '', descripcion: '', precio: '', duracion: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [editMsg, setEditMsg] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState<string | null>(null);

  // Estados para gestión de citas
  const [citasModal, setCitasModal] = useState<'eliminar' | 'modificar' | 'añadir' | null>(null);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [citasLoading, setCitasLoading] = useState(false);
  
  // Estados para eliminar cita periódica
  const [deleteCitaId, setDeleteCitaId] = useState<number | null>(null);
  const [deleteCitaLoading, setDeleteCitaLoading] = useState(false);
  const [deleteCitaMsg, setDeleteCitaMsg] = useState<string | null>(null);
  
  // Estados para modificar cita periódica
  const [editCitaId, setEditCitaId] = useState<number | null>(null);
  const [editCitaForm, setEditCitaForm] = useState({ periodicidadDias: '', fechaInicio: '' });
  const [editCitaLoading, setEditCitaLoading] = useState(false);
  const [editCitaMsg, setEditCitaMsg] = useState<string | null>(null);
  
  // Estados para añadir cita periódica
  const [addCitaForm, setAddCitaForm] = useState({ 
    usuarioId: '', 
    servicioId: '', 
    periodicidadDias: '7', 
    fechaInicio: '', 
    hora: '09:00' 
  });
  const [addCitaLoading, setAddCitaLoading] = useState(false);
  const [addCitaMsg, setAddCitaMsg] = useState<string | null>(null);

  // Estados para configuración de tiempo mínimo de reserva
  const [tiempoMinimoModal, setTiempoMinimoModal] = useState(false);
  const [tiempoMinimo, setTiempoMinimo] = useState(24);
  const [tiempoMinimoForm, setTiempoMinimoForm] = useState({ horas: '24' });
  const [tiempoMinimoLoading, setTiempoMinimoLoading] = useState(false);
  const [tiempoMinimoMsg, setTiempoMinimoMsg] = useState<string | null>(null);
  
  // Estados para gestión de vacaciones
  const [vacacionesModal, setVacacionesModal] = useState(false);
  const [cancelarVacacionesModal, setCancelarVacacionesModal] = useState(false);
  const [vacacionesList, setVacacionesList] = useState<any[]>([]);
  const [vacacionesForm, setVacacionesForm] = useState({
    fechaInicio: '',
    fechaFin: '',
    descripcion: ''
  });

  // Estado para modal de advertencia profesional
  const [warningModal, setWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [warningAction, setWarningAction] = useState<(() => void) | null>(null);

  // Fetch servicios al abrir modales de editar/eliminar
  const fetchServicios = async () => {
    setServiciosLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/servicios');
      const data = await res.json();
      setServicios(data);
    } catch {
      setServicios([]);
    } finally {
      setServiciosLoading(false);
    }
  };

  // Fetch citas periódicas - solo una por usuario
  const fetchCitasPeriodicas = async () => {
    setCitasLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('http://localhost:8080/api/citas/todas', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await res.json();
      // Filtrar solo citas periódicas y agrupar por usuario
      const citasPeriodicas = data.filter((cita: Cita) => cita.fija && (cita.periodicidadDias || 0) > 0);
      
      // Agrupar por usuario y tomar solo la primera cita de cada usuario
      const citasUnicas = citasPeriodicas.reduce((acc: Cita[], cita: Cita) => {
        const existeUsuario = acc.find(c => c.usuario.id === cita.usuario.id);
        if (!existeUsuario) {
          acc.push(cita);
        }
        return acc;
      }, []);
      
      setCitas(citasUnicas);
    } catch {
      setCitas([]);
    } finally {
      setCitasLoading(false);
    }
  };

  // Fetch usuarios
  const fetchUsuarios = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('http://localhost:8080/api/usuarios', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await res.json();
      setUsuarios(data);
    } catch {
      setUsuarios([]);
    }
  };

  // Abrir modal y cargar servicios si es necesario
  const openModal = (type: 'add' | 'edit' | 'delete') => {
    // Cerrar otros modales antes de abrir uno nuevo
    setCitasModal(null);
    setTiempoMinimoModal(false);
    
    setModal(type);
    if (type === 'edit' || type === 'delete') fetchServicios();
    if (type === 'edit') {
      setEditId(null);
      setEditForm({ nombre: '', descripcion: '', precio: '', duracion: '' });
      setEditMsg(null);
    }
    if (type === 'delete') {
      setDeleteId(null);
      setDeleteMsg(null);
    }
  };

  // Abrir modal de citas y cargar datos si es necesario
  const openCitasModal = (type: 'eliminar' | 'modificar' | 'añadir') => {
    // Cerrar otros modales antes de abrir uno nuevo
    setModal(null);
    setTiempoMinimoModal(false);
    
    setCitasModal(type);
    if (type === 'eliminar' || type === 'modificar') {
      fetchCitasPeriodicas();
    }
    if (type === 'añadir') {
      fetchUsuarios();
      fetchServicios();
    }
    if (type === 'eliminar') {
      setDeleteCitaId(null);
      setDeleteCitaMsg(null);
    }
    if (type === 'modificar') {
      setEditCitaId(null);
      setEditCitaForm({ periodicidadDias: '', fechaInicio: '' });
      setEditCitaMsg(null);
    }
    if (type === 'añadir') {
      setAddCitaForm({ 
        usuarioId: '', 
        servicioId: '', 
        periodicidadDias: '7', 
        fechaInicio: '', 
        hora: '09:00' 
      });
      setAddCitaMsg(null);
    }
  };

  // Función para abrir modal de tiempo mínimo
  const openTiempoMinimoModal = () => {
    // Cerrar otros modales antes de abrir uno nuevo
    setModal(null);
    setCitasModal(null);
    
    setTiempoMinimoModal(true);
  };

  const openVacacionesModal = () => {
    setModal(null);
    setCitasModal(null);
    setTiempoMinimoModal(false);
    setCancelarVacacionesModal(false);
    setVacacionesModal(true);
    fetchVacaciones();
  };

  const openCancelarVacacionesModal = () => {
    setModal(null);
    setCitasModal(null);
    setTiempoMinimoModal(false);
    setVacacionesModal(false);
    setCancelarVacacionesModal(true);
    fetchVacaciones();
  };

  const fetchVacaciones = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/vacaciones');
      const data = await res.json();
      setVacacionesList(data);
    } catch (error) {
      console.error('Error al obtener vacaciones:', error);
    }
  };

  const handleVacacionesSubmit = async () => {
    // Mostrar modal de advertencia profesional
    setWarningMessage(
      '¿Estás seguro de que quieres crear este período de vacaciones?\n\n' +
      '⚠️ ADVERTENCIA: Todas las citas existentes que coincidan con este período serán canceladas automáticamente.'
    );
    setWarningAction(() => async () => {
      try {
        const res = await fetch('http://localhost:8080/api/vacaciones', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify(vacacionesForm)
        });

        if (res.ok) {
          const responseData = await res.json();
          setVacacionesForm({ fechaInicio: '', fechaFin: '', descripcion: '' });
          fetchVacaciones();
          setVacacionesModal(false);
          
          // Mostrar mensaje de éxito con información sobre citas canceladas
          alert(responseData.mensaje || 'Vacaciones creadas correctamente');
        } else {
          const errorData = await res.json();
          alert('Error: ' + (errorData.error || 'Error al crear vacaciones'));
        }
      } catch (error) {
        alert('Error al crear vacaciones');
      }
      setWarningModal(false);
    });
    setWarningModal(true);
  };

  const handleEliminarVacaciones = async (id: number) => {
    setWarningMessage('¿Estás seguro de que quieres eliminar este período de vacaciones?');
    setWarningAction(() => async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/vacaciones/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });

        if (res.ok) {
          fetchVacaciones();
        } else {
          alert('Error al eliminar vacaciones');
        }
      } catch (error) {
        alert('Error al eliminar vacaciones');
      }
      setWarningModal(false);
    });
    setWarningModal(true);
  };

  // Al seleccionar servicio en modificar, rellenar campos
  const handleEditSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value);
    setEditId(id);
    const serv = servicios.find(s => s.id === id);
    if (serv) {
      setEditForm({
        nombre: serv.nombre,
        descripcion: serv.descripcion,
        precio: serv.precio.toString(),
        duracion: serv.duracionMinutos.toString(),
      });
    }
  };

  // Handlers para editar campos
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  // Handler para seleccionar servicio a eliminar
  const handleDeleteSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDeleteId(Number(e.target.value));
  };

  const handleAddChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setAddForm({ ...addForm, [e.target.name]: e.target.value });
  };

  // Handlers para formularios de citas
  const handleAddCitaChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setAddCitaForm({ ...addCitaForm, [e.target.name]: e.target.value });
  };

  const handleEditCitaChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditCitaForm({ ...editCitaForm, [e.target.name]: e.target.value });
  };

  const handleDeleteCitaSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDeleteCitaId(Number(e.target.value));
  };

  const handleEditCitaSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value);
    setEditCitaId(id);
    const cita = citas.find(c => c.id === id);
    if (cita) {
      setEditCitaForm({
        periodicidadDias: cita.periodicidadDias?.toString() || '',
        fechaInicio: new Date(cita.fechaHora).toISOString().split('T')[0]
      });
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    setAddMsg(null);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('http://localhost:8080/api/servicios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          nombre: addForm.nombre,
          descripcion: addForm.descripcion,
          precio: parseFloat(addForm.precio),
          duracionMinutos: parseInt(addForm.duracion)
        })
      });
      if (!res.ok) throw new Error('Error al añadir servicio');
      setAddMsg('¡Servicio añadido correctamente!');
      setAddForm({ nombre: '', descripcion: '', precio: '', duracion: '' });
      setTimeout(() => {
        setModal(null);
        setAddMsg(null);
      }, 1200);
    } catch (err: any) {
      setAddMsg(err.message || 'Error al añadir servicio');
    } finally {
      setAddLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    
    setEditLoading(true);
    setEditMsg(null);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`http://localhost:8080/api/servicios/${editId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          nombre: editForm.nombre,
          descripcion: editForm.descripcion,
          precio: parseFloat(editForm.precio),
          duracionMinutos: parseInt(editForm.duracion)
        })
      });
      if (!res.ok) throw new Error('Error al modificar servicio');
      setEditMsg('¡Servicio modificado correctamente!');
      setTimeout(() => {
        setModal(null);
        setEditMsg(null);
        setEditId(null);
        setEditForm({ nombre: '', descripcion: '', precio: '', duracion: '' });
      }, 1200);
    } catch (err: any) {
      setEditMsg(err.message || 'Error al modificar servicio');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteId) return;
    
    setDeleteLoading(true);
    setDeleteMsg(null);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`http://localhost:8080/api/servicios/${deleteId}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (!res.ok) throw new Error('Error al eliminar servicio');
      setDeleteMsg('¡Servicio eliminado correctamente!');
      setTimeout(() => {
        setModal(null);
        setDeleteMsg(null);
        setDeleteId(null);
      }, 1200);
    } catch (err: any) {
      setDeleteMsg(err.message || 'Error al eliminar servicio');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Funciones de submit para citas
  const handleDeleteCitaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteCitaId) return;
    
    setDeleteCitaLoading(true);
    setDeleteCitaMsg(null);
    try {
      const token = localStorage.getItem('authToken');
      
      // Obtener la cita seleccionada para identificar al usuario
      const citaSeleccionada = citas.find(c => c.id === deleteCitaId);
      if (!citaSeleccionada) {
        throw new Error('Cita no encontrada');
      }
      
      // Obtener todas las citas periódicas del usuario
      const res = await fetch('http://localhost:8080/api/citas/todas', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const todasLasCitas = await res.json();
      const citasDelUsuario = todasLasCitas.filter((cita: Cita) => 
        cita.usuario.id === citaSeleccionada.usuario.id && 
        cita.fija && 
        (cita.periodicidadDias || 0) > 0
      );
      
      // Eliminar todas las citas periódicas del usuario
      const deletePromises = citasDelUsuario.map((cita: Cita) =>
        fetch(`http://localhost:8080/api/citas/${cita.id}`, {
          method: 'DELETE',
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        })
      );
      
      const results = await Promise.all(deletePromises);
      const hasError = results.some(res => !res.ok);
      
      if (hasError) throw new Error('Error al eliminar citas periódicas');
      
      setDeleteCitaMsg(`¡Todas las citas periódicas de ${citaSeleccionada.usuario.nombre} han sido eliminadas!`);
      setTimeout(() => {
        setCitasModal(null);
        setDeleteCitaMsg(null);
        setDeleteCitaId(null);
      }, 1200);
    } catch (err: any) {
      setDeleteCitaMsg(err.message || 'Error al eliminar citas periódicas');
    } finally {
      setDeleteCitaLoading(false);
    }
  };

  const handleEditCitaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCitaId) return;
    
    setEditCitaLoading(true);
    setEditCitaMsg(null);
    try {
      const token = localStorage.getItem('authToken');
      
      // Obtener la cita seleccionada para identificar al usuario
      const citaSeleccionada = citas.find(c => c.id === editCitaId);
      if (!citaSeleccionada) {
        throw new Error('Cita no encontrada');
      }
      
      // Obtener todas las citas periódicas del usuario
      const res = await fetch('http://localhost:8080/api/citas/todas', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const todasLasCitas = await res.json();
      const citasDelUsuario = todasLasCitas.filter((cita: Cita) => 
        cita.usuario.id === citaSeleccionada.usuario.id && 
        cita.fija && 
        (cita.periodicidadDias || 0) > 0
      );
      
      // Modificar todas las citas periódicas del usuario
      const updatePromises = citasDelUsuario.map((cita: Cita) =>
        fetch(`http://localhost:8080/api/citas/${cita.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            periodicidadDias: parseInt(editCitaForm.periodicidadDias),
            fechaHora: editCitaForm.fechaInicio
          })
        })
      );
      
      const results = await Promise.all(updatePromises);
      const hasError = results.some(res => !res.ok);
      
      if (hasError) throw new Error('Error al modificar citas periódicas');
      
      setEditCitaMsg(`¡Todas las citas periódicas de ${citaSeleccionada.usuario.nombre} han sido modificadas!`);
      setTimeout(() => {
        setCitasModal(null);
        setEditCitaMsg(null);
        setEditCitaId(null);
        setEditCitaForm({ periodicidadDias: '', fechaInicio: '' });
      }, 1200);
    } catch (err: any) {
      setEditCitaMsg(err.message || 'Error al modificar citas periódicas');
    } finally {
      setEditCitaLoading(false);
    }
  };

  const handleAddCitaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setAddCitaLoading(true);
    setAddCitaMsg(null);
    try {
      const token = localStorage.getItem('authToken');
      
      // Combinar fecha y hora
      const fechaHora = `${addCitaForm.fechaInicio}T${addCitaForm.hora}:00`;
      
      const requestBody = {
        clienteId: parseInt(addCitaForm.usuarioId),
        servicioId: parseInt(addCitaForm.servicioId),
        fechaHora: fechaHora,
        comentario: '',
        confirmada: false
      };
      
      const res = await fetch(`http://localhost:8080/api/citas/fija?periodicidadDias=${addCitaForm.periodicidadDias}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!res.ok) throw new Error('Error al crear cita periódica');
      setAddCitaMsg('¡Cita periódica creada correctamente!');
      setTimeout(() => {
        setCitasModal(null);
        setAddCitaMsg(null);
        setAddCitaForm({ 
          usuarioId: '', 
          servicioId: '', 
          periodicidadDias: '7', 
          fechaInicio: '', 
          hora: '09:00' 
        });
      }, 1200);
    } catch (err: any) {
      setAddCitaMsg(err.message || 'Error al crear cita periódica');
    } finally {
      setAddCitaLoading(false);
    }
  };

  // Funciones para configuración de tiempo mínimo
  const handleTiempoMinimoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTiempoMinimoForm({ ...tiempoMinimoForm, [e.target.name]: e.target.value });
  };

  const handleTiempoMinimoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setTiempoMinimoLoading(true);
    setTiempoMinimoMsg(null);
    try {
      const token = localStorage.getItem('authToken');
      
      const res = await fetch('http://localhost:8080/api/configuracion/tiempo-minimo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          horasMinimas: parseInt(tiempoMinimoForm.horas)
        })
      });
      
      if (!res.ok) throw new Error('Error al configurar tiempo mínimo');
      setTiempoMinimoMsg('¡Tiempo mínimo configurado correctamente!');
      setTimeout(() => {
        setTiempoMinimoModal(false);
        setTiempoMinimoMsg(null);
        setTiempoMinimoForm({ horas: '24' });
      }, 1200);
    } catch (err: any) {
      setTiempoMinimoMsg(err.message || 'Error al configurar tiempo mínimo');
    } finally {
      setTiempoMinimoLoading(false);
    }
  };

  return (
    <div className={styles.configContainer}>
      {/* Sección de Gestión de Servicios */}
      <div className={styles.serviciosSection}>
        <div className={styles.header}>
          <FaCog className={styles.gearIcon} />
          <h2>Gestión de Servicios</h2>
        </div>
        
        <div className={styles.buttonGroup}>
          <button className={`${styles.configBtn} ${styles.addBtn}`} onClick={() => openModal('add')}>
            <FaPlus className={styles.btnIcon} />
            <span>Añadir Servicio</span>
          </button>
          <button className={`${styles.configBtn} ${styles.editBtn}`} onClick={() => openModal('edit')}>
            <FaEdit className={styles.btnIcon} />
            <span>Modificar Servicio</span>
          </button>
          <button className={`${styles.configBtn} ${styles.deleteBtn}`} onClick={() => openModal('delete')}>
            <FaTrash className={styles.btnIcon} />
            <span>Eliminar Servicio</span>
          </button>
        </div>
      </div>
      
      {modal === 'add' && (
        <div className={styles.modal}>
          <div className={styles.modalHeader}>
            <FaPlus className={styles.modalIcon} />
            <h3>Añadir Nuevo Servicio</h3>
          </div>
          <form className={styles.formModal} onSubmit={handleAddSubmit}>
            <input className={styles.input} name="nombre" type="text" placeholder="Nombre del servicio" value={addForm.nombre} onChange={handleAddChange} required />
            <textarea className={styles.input} name="descripcion" placeholder="Descripción del servicio" value={addForm.descripcion} onChange={handleAddChange} required />
            <input className={styles.input} name="precio" type="number" placeholder="Precio (€)" min="0" step="0.01" value={addForm.precio} onChange={handleAddChange} required />
            <input className={styles.input} name="duracion" type="number" placeholder="Duración (minutos)" min="1" value={addForm.duracion} onChange={handleAddChange} required />
            <div className={styles.modalBtnGroup}>
              <button className={styles.saveBtn} type="submit" disabled={addLoading}>
                <FaSave className={styles.btnIcon} />
                {addLoading ? 'Guardando...' : 'Guardar Servicio'}
              </button>
              <button className={styles.cancelBtn} type="button" onClick={() => setModal(null)} disabled={addLoading}>
                <FaTimes className={styles.btnIcon} />
                Cancelar
              </button>
            </div>
            {addMsg && <div className={`${styles.message} ${addMsg.startsWith('¡') ? styles.success : styles.error}`}>{addMsg}</div>}
          </form>
        </div>
      )}
      
      {modal === 'edit' && (
        <div className={styles.modal}>
          <div className={styles.modalHeader}>
            <FaEdit className={styles.modalIcon} />
            <h3>Modificar Servicio</h3>
          </div>
          <form className={styles.formModal} onSubmit={handleEditSubmit}>
            <select className={styles.input} value={editId ?? ''} onChange={handleEditSelect} required>
              <option value="">Selecciona un servicio</option>
              {servicios.map(s => (
                <option key={s.id} value={s.id}>{s.nombre}</option>
              ))}
            </select>
            <input className={styles.input} name="nombre" type="text" placeholder="Nuevo nombre" value={editForm.nombre} onChange={handleEditChange} required />
            <textarea className={styles.input} name="descripcion" placeholder="Nueva descripción" value={editForm.descripcion} onChange={handleEditChange} required />
            <input className={styles.input} name="precio" type="number" placeholder="Nuevo precio (€)" min="0" step="0.01" value={editForm.precio} onChange={handleEditChange} required />
            <input className={styles.input} name="duracion" type="number" placeholder="Nueva duración (minutos)" min="1" value={editForm.duracion} onChange={handleEditChange} required />
            <div className={styles.modalBtnGroup}>
              <button className={styles.saveBtn} type="submit" disabled={editLoading}>
                <FaSave className={styles.btnIcon} />
                {editLoading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
              <button className={styles.cancelBtn} type="button" onClick={() => setModal(null)} disabled={editLoading}>
                <FaTimes className={styles.btnIcon} />
                Cancelar
              </button>
            </div>
            {editMsg && <div className={`${styles.message} ${editMsg.startsWith('¡') ? styles.success : styles.error}`}>{editMsg}</div>}
          </form>
        </div>
      )}
      
      {modal === 'delete' && (
        <div className={styles.modal}>
          <div className={styles.modalHeader}>
            <FaTrash className={styles.modalIcon} />
            <h3>Eliminar Servicio</h3>
          </div>
          <form className={styles.formModal} onSubmit={handleDeleteSubmit}>
            <select className={styles.input} value={deleteId ?? ''} onChange={handleDeleteSelect} required>
              <option value="">Selecciona un servicio</option>
              {servicios.map(s => (
                <option key={s.id} value={s.id}>{s.nombre}</option>
              ))}
            </select>
            <div className={styles.modalBtnGroup}>
              <button className={styles.deleteBtn} type="submit" disabled={deleteLoading}>
                <FaTrash className={styles.btnIcon} />
                {deleteLoading ? 'Eliminando...' : 'Eliminar Servicio'}
              </button>
              <button className={styles.cancelBtn} type="button" onClick={() => setModal(null)} disabled={deleteLoading}>
                <FaTimes className={styles.btnIcon} />
                Cancelar
              </button>
            </div>
            {deleteMsg && <div className={`${styles.message} ${deleteMsg.startsWith('¡') ? styles.success : styles.error}`}>{deleteMsg}</div>}
          </form>
        </div>
      )}

      {/* Sección de Gestión de Citas */}
      <div className={styles.citasSection}>
        <div className={styles.header}>
          <FaCalendarAlt className={styles.calendarIcon} />
          <h2>Gestión de Citas Periódicas</h2>
        </div>
        <div className={styles.buttonGroup}>
          <button className={`${styles.configBtn} ${styles.addBtn}`} onClick={() => openCitasModal('añadir')}>
            <FaPlus className={styles.btnIcon} />
            <span>Añadir Cita Periódica</span>
          </button>
          <button className={`${styles.configBtn} ${styles.editBtn}`} onClick={() => openCitasModal('modificar')}>
            <FaEdit className={styles.btnIcon} />
            <span>Modificar Cita Periódica</span>
          </button>
          <button className={`${styles.configBtn} ${styles.deleteBtn}`} onClick={() => openCitasModal('eliminar')}>
            <FaTrash className={styles.btnIcon} />
            <span>Eliminar Cita Periódica</span>
          </button>
          <button className={`${styles.configBtn} ${styles.editBtn} ${styles.tiempoMinimoBtn}`} onClick={openTiempoMinimoModal}>
            <FaCog className={styles.btnIcon} />
            <span>Configurar Tiempo Mínimo</span>
          </button>
        </div>
      </div>

      {/* Modal para eliminar cita periódica */}
      {citasModal === 'eliminar' && (
        <div className={styles.modal}>
          <div className={styles.modalHeader}>
            <FaTrash className={styles.modalIcon} />
                         <h3>Eliminar Citas Periódicas del Usuario</h3>
          </div>
          <form className={styles.formModal} onSubmit={handleDeleteCitaSubmit}>
                         <select className={styles.input} value={deleteCitaId ?? ''} onChange={handleDeleteCitaSelect} required>
               <option value="">Selecciona un usuario para eliminar sus citas periódicas</option>
               {citas.map(cita => (
                 <option key={cita.id} value={cita.id}>
                   {cita.usuario.nombre} - {cita.servicio.nombre} ({cita.periodicidadDias || 0} días)
                 </option>
               ))}
             </select>
            <div className={styles.modalBtnGroup}>
                             <button className={styles.deleteBtn} type="submit" disabled={deleteCitaLoading}>
                 <FaTrash className={styles.btnIcon} />
                 {deleteCitaLoading ? 'Eliminando...' : 'Eliminar Citas Periódicas'}
               </button>
              <button className={styles.cancelBtn} type="button" onClick={() => setCitasModal(null)} disabled={deleteCitaLoading}>
                <FaTimes className={styles.btnIcon} />
                Cancelar
              </button>
            </div>
            {deleteCitaMsg && <div className={`${styles.message} ${deleteCitaMsg.startsWith('¡') ? styles.success : styles.error}`}>{deleteCitaMsg}</div>}
          </form>
        </div>
      )}

      {/* Modal para modificar cita periódica */}
      {citasModal === 'modificar' && (
        <div className={styles.modal}>
          <div className={styles.modalHeader}>
            <FaEdit className={styles.modalIcon} />
                         <h3>Modificar Citas Periódicas del Usuario</h3>
          </div>
          <form className={styles.formModal} onSubmit={handleEditCitaSubmit}>
                         <select className={styles.input} value={editCitaId ?? ''} onChange={handleEditCitaSelect} required>
               <option value="">Selecciona un usuario para modificar sus citas periódicas</option>
               {citas.map(cita => (
                 <option key={cita.id} value={cita.id}>
                   {cita.usuario.nombre} - {cita.servicio.nombre} ({cita.periodicidadDias || 0} días)
                 </option>
               ))}
             </select>
            <input className={styles.input} name="periodicidadDias" type="number" placeholder="Nueva periodicidad (días)" min="1" max="365" value={editCitaForm.periodicidadDias} onChange={handleEditCitaChange} required />
            <input className={styles.input} name="fechaInicio" type="date" placeholder="Nueva fecha de inicio" value={editCitaForm.fechaInicio} onChange={handleEditCitaChange} required />
            <div className={styles.modalBtnGroup}>
                             <button className={styles.saveBtn} type="submit" disabled={editCitaLoading}>
                 <FaSave className={styles.btnIcon} />
                 {editCitaLoading ? 'Guardando...' : 'Guardar Cambios en Todas las Citas'}
               </button>
              <button className={styles.cancelBtn} type="button" onClick={() => setCitasModal(null)} disabled={editCitaLoading}>
                <FaTimes className={styles.btnIcon} />
                Cancelar
              </button>
            </div>
            {editCitaMsg && <div className={`${styles.message} ${editCitaMsg.startsWith('¡') ? styles.success : styles.error}`}>{editCitaMsg}</div>}
          </form>
        </div>
      )}

      {/* Modal para añadir cita periódica */}
      {citasModal === 'añadir' && (
        <div className={styles.modal}>
          <div className={styles.modalHeader}>
            <FaUserPlus className={styles.modalIcon} />
            <h3>Añadir Cita Periódica</h3>
          </div>
          <form className={styles.formModal} onSubmit={handleAddCitaSubmit}>
            <select className={styles.input} name="usuarioId" value={addCitaForm.usuarioId} onChange={handleAddCitaChange} required>
              <option value="">Selecciona un usuario</option>
              {usuarios.map(usuario => (
                <option key={usuario.id} value={usuario.id}>{usuario.nombre} ({usuario.email})</option>
              ))}
            </select>
            <select className={styles.input} name="servicioId" value={addCitaForm.servicioId} onChange={handleAddCitaChange} required>
              <option value="">Selecciona un servicio</option>
              {servicios.map(servicio => (
                <option key={servicio.id} value={servicio.id}>{servicio.nombre} - {servicio.precio}€</option>
              ))}
            </select>
            <input className={styles.input} name="periodicidadDias" type="number" placeholder="Periodicidad (días)" min="1" max="365" value={addCitaForm.periodicidadDias} onChange={handleAddCitaChange} required />
            <input className={styles.input} name="fechaInicio" type="date" placeholder="Fecha de inicio" value={addCitaForm.fechaInicio} onChange={handleAddCitaChange} required />
            <input className={styles.input} name="hora" type="time" placeholder="Hora" value={addCitaForm.hora} onChange={handleAddCitaChange} required />
            <div className={styles.modalBtnGroup}>
              <button className={styles.saveBtn} type="submit" disabled={addCitaLoading}>
                <FaSave className={styles.btnIcon} />
                {addCitaLoading ? 'Creando...' : 'Crear Cita Periódica'}
              </button>
              <button className={styles.cancelBtn} type="button" onClick={() => setCitasModal(null)} disabled={addCitaLoading}>
                <FaTimes className={styles.btnIcon} />
                Cancelar
              </button>
            </div>
                         {addCitaMsg && <div className={`${styles.message} ${addCitaMsg.startsWith('¡') ? styles.success : styles.error}`}>{addCitaMsg}</div>}
           </form>
         </div>
       )}

       {/* Modal de Tiempo Mínimo */}
       {tiempoMinimoModal && (
         <div className={styles.modal}>
           <div className={styles.modalHeader}>
             <FaCog className={styles.modalIcon} />
             <h3>Configurar Tiempo Mínimo de Reserva</h3>
           </div>
           <div className={styles.formModal}>
             <div style={{ textAlign: 'left', marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'rgba(255,193,7,0.1)', borderRadius: '8px', border: '1px solid rgba(255,193,7,0.3)' }}>
               <h4 style={{ margin: '0 0 0.5rem 0', color: '#ffc107', fontSize: '1rem' }}>¿Qué hace esta función?</h4>
               <ul style={{ margin: '0', paddingLeft: '1.2rem', fontSize: '0.9rem', color: '#ccc', lineHeight: '1.4' }}>
                 <li>Establece cuántas horas antes debe reservar un usuario normal una cita</li>
                 <li>Si un usuario intenta reservar con menos tiempo, recibirá un error</li>
                 <li>Los administradores pueden reservar en cualquier momento (sin restricción)</li>
                 <li>Ejemplo: Si configuras 24 horas, los usuarios solo podrán reservar citas para mañana o después</li>
               </ul>
             </div>
             <div className={styles.formGroup}>
               <label>Horas mínimas de antelación:</label>
               <input
                 type="number"
                 value={tiempoMinimoForm.horas}
                 onChange={(e) => setTiempoMinimoForm({ horas: e.target.value })}
                 min="1"
                 max="168"
                 className={styles.input}
               />
             </div>
             {tiempoMinimoMsg && (
               <div className={tiempoMinimoMsg.includes('Error') ? styles.errorMsg : styles.successMsg}>
                 {tiempoMinimoMsg}
               </div>
             )}
             <div className={styles.modalBtnGroup}>
               <button
                 className={styles.saveBtn}
                 onClick={handleTiempoMinimoSubmit}
                 disabled={tiempoMinimoLoading}
               >
                 <FaSave className={styles.btnIcon} />
                 {tiempoMinimoLoading ? 'Guardando...' : 'Guardar'}
               </button>
               <button className={styles.cancelBtn} onClick={() => setTiempoMinimoModal(false)}>
                 <FaTimes className={styles.btnIcon} />
                 Cancelar
               </button>
             </div>
           </div>
         </div>
       )}

       {/* Sección de Gestión de Vacaciones */}
       <div className={styles.serviciosSection} style={{ marginTop: '2rem' }}>
         <div className={styles.header}>
           <FaUmbrellaBeach className={styles.calendarIcon} />
           <h2>Gestionar Vacaciones</h2>
         </div>
         
         <div className={styles.buttonGroup}>
           <button className={`${styles.configBtn} ${styles.addBtn}`} onClick={openVacacionesModal}>
             <FaPlus className={styles.btnIcon} />
             <span>Añadir Vacaciones</span>
           </button>
           <button className={`${styles.configBtn} ${styles.deleteBtn}`} onClick={openCancelarVacacionesModal}>
             <FaTrash className={styles.btnIcon} />
             <span>Cancelar Vacaciones</span>
           </button>
         </div>
       </div>

        {/* Modal de Vacaciones */}
        {vacacionesModal && (
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <FaPlus className={styles.modalIcon} />
              <h3>Añadir Vacaciones</h3>
            </div>
            <div className={styles.formModal}>
              {/* Formulario para crear vacaciones */}
              <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: 'rgba(25,118,210,0.05)', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 1rem 0', color: '#1976d2' }}>Crear Nuevo Período de Vacaciones</h4>
                <div className={styles.formGroup}>
                  <label>Fecha de inicio:</label>
                  <input
                    type="date"
                    value={vacacionesForm.fechaInicio}
                    onChange={(e) => setVacacionesForm({...vacacionesForm, fechaInicio: e.target.value})}
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Fecha de fin:</label>
                  <input
                    type="date"
                    value={vacacionesForm.fechaFin}
                    onChange={(e) => setVacacionesForm({...vacacionesForm, fechaFin: e.target.value})}
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Descripción (opcional):</label>
                  <input
                    type="text"
                    value={vacacionesForm.descripcion}
                    onChange={(e) => setVacacionesForm({...vacacionesForm, descripcion: e.target.value})}
                    placeholder="Ej: Vacaciones de verano"
                    className={styles.input}
                  />
                </div>
              </div>
              <div className={styles.modalBtnGroup}>
                <button
                  className={styles.saveBtn}
                  onClick={handleVacacionesSubmit}
                  disabled={!vacacionesForm.fechaInicio || !vacacionesForm.fechaFin}
                >
                  <FaSave className={styles.btnIcon} />
                  Crear Vacaciones
                </button>
                <button className={styles.cancelBtn} onClick={() => setVacacionesModal(false)}>
                  <FaTimes className={styles.btnIcon} />
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Cancelar Vacaciones */}
        {cancelarVacacionesModal && (
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <FaTrash className={styles.modalIcon} />
              <h3>Cancelar Vacaciones</h3>
            </div>
            <div className={styles.formModal}>
              {/* Lista de vacaciones existentes */}
              <div>
                <h4 style={{ margin: '0 0 1rem 0', color: '#1976d2' }}>Períodos de Vacaciones Activos</h4>
                {vacacionesList.length === 0 ? (
                  <p style={{ color: '#666', fontStyle: 'italic' }}>No hay períodos de vacaciones configurados</p>
                ) : (
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {vacacionesList.map((vacacion) => (
                      <div key={vacacion.id} style={{
                        padding: '1rem',
                        border: '1px solid rgba(25,118,210,0.2)',
                        borderRadius: '8px',
                        marginBottom: '0.5rem',
                        background: 'linear-gradient(135deg, rgba(25,118,210,0.05) 0%, rgba(25,118,210,0.1) 100%)',
                        boxShadow: '0 2px 8px rgba(25,118,210,0.1)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <strong style={{ color: '#1976d2', fontSize: '1.1rem' }}>
                              {new Date(vacacion.fechaInicio).toLocaleDateString('es-ES')} - {new Date(vacacion.fechaFin).toLocaleDateString('es-ES')}
                            </strong>
                            {vacacion.descripcion && <p style={{ margin: '0.5rem 0 0 0', color: '#666', fontStyle: 'italic' }}>{vacacion.descripcion}</p>}
                          </div>
                          <button
                            onClick={() => handleEliminarVacaciones(vacacion.id)}
                            style={{
                              background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '0.5rem 1rem',
                              cursor: 'pointer',
                              fontSize: '0.9rem',
                              fontWeight: '600',
                              boxShadow: '0 2px 4px rgba(231,76,60,0.3)',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.transform = 'translateY(-1px)';
                              e.currentTarget.style.boxShadow = '0 4px 8px rgba(231,76,60,0.4)';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 2px 4px rgba(231,76,60,0.3)';
                            }}
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className={styles.modalBtnGroup}>
                <button className={styles.cancelBtn} onClick={() => setCancelarVacacionesModal(false)}>
                  <FaTimes className={styles.btnIcon} />
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Advertencia Profesional */}
        {warningModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal} style={{ maxWidth: '500px', width: '90%' }}>
              <div className={styles.modalHeader}>
                <FaCog className={styles.modalIcon} style={{ color: '#ffc107' }} />
                <h3 style={{ color: '#ffc107' }}>Confirmar Acción</h3>
              </div>
              <div className={styles.formModal}>
                <div style={{ 
                  textAlign: 'left', 
                  marginBottom: '1.5rem', 
                  padding: '1rem', 
                  backgroundColor: 'rgba(255,193,7,0.1)', 
                  borderRadius: '8px', 
                  border: '1px solid rgba(255,193,7,0.3)',
                  color: '#fff'
                }}>
                  <p style={{ margin: '0', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                    {warningMessage}
                  </p>
                </div>
                <div className={styles.modalBtnGroup}>
                  <button
                    className={styles.saveBtn}
                    onClick={() => {
                      if (warningAction) {
                        warningAction();
                      }
                    }}
                  >
                    <FaSave className={styles.btnIcon} />
                    Confirmar
                  </button>
                  <button 
                    className={styles.cancelBtn} 
                    onClick={() => setWarningModal(false)}
                  >
                    <FaTimes className={styles.btnIcon} />
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default Configuracion; 