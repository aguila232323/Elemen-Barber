import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaCog, FaSave, FaTimes, FaCalendarAlt, FaUserPlus, FaCalendarCheck, FaUmbrellaBeach } from 'react-icons/fa';
import styles from './Configuracion.module.css';

interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  duracionMinutos: number;
  emoji?: string;
  textoDescriptivo?: string;
}

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  telefono?: string;
  baneado?: boolean;
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
  const [addForm, setAddForm] = useState({ nombre: '', descripcion: '', precio: '', duracion: '', emoji: '', textoDescriptivo: '' });
  const [addLoading, setAddLoading] = useState(false);
  const [addMsg, setAddMsg] = useState<string | null>(null);

  // Servicios para modificar/eliminar
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [serviciosLoading, setServiciosLoading] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ nombre: '', descripcion: '', precio: '', duracion: '', emoji: '', textoDescriptivo: '' });
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

  // Estados para búsqueda de usuarios en añadir cita periódica
  const [busquedaUsuarioAdd, setBusquedaUsuarioAdd] = useState<string>('');
  const [mostrarDropdownAdd, setMostrarDropdownAdd] = useState(false);

  // Estados para horas disponibles en añadir cita periódica
  const [horasDisponibles, setHorasDisponibles] = useState<string[]>([]);
  const [cargandoHoras, setCargandoHoras] = useState(false);

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

  // Estados para reserva de citas por admin
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [serviciosDisponibles, setServiciosDisponibles] = useState<Servicio[]>([]);
  const [bookingForm, setBookingForm] = useState({
    usuarioId: '',
    servicioId: '',
    fechaHora: '',
    comentario: ''
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingMsg, setBookingMsg] = useState<string | null>(null);

  // Estados para gestión de usuarios
  const [usuariosModal, setUsuariosModal] = useState<'banear' | 'desbanear' | null>(null);
  const [usuariosList, setUsuariosList] = useState<Usuario[]>([]);
  const [usuariosLoading, setUsuariosLoading] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<number | null>(null);
  const [usuarioActionLoading, setUsuarioActionLoading] = useState(false);
  const [usuarioActionMsg, setUsuarioActionMsg] = useState<string | null>(null);

  // Estados para búsqueda de usuarios en gestión de usuarios
  const [busquedaUsuarioBan, setBusquedaUsuarioBan] = useState<string>('');
  const [mostrarDropdownBan, setMostrarDropdownBan] = useState(false);

  // Estados para gestión de reseñas
  const [resenasModal, setResenasModal] = useState(false);
  const [resenasList, setResenasList] = useState<any[]>([]);
  const [resenasLoading, setResenasLoading] = useState(false);
  const [resenaSeleccionada, setResenaSeleccionada] = useState<number | null>(null);
  const [eliminarResenaLoading, setEliminarResenaLoading] = useState(false);
  const [resenasMsg, setResenasMsg] = useState<string | null>(null);
  const [busquedaResena, setBusquedaResena] = useState<string>('');
  const [mostrarDropdownResena, setMostrarDropdownResena] = useState(false);

  // Fetch servicios al abrir modales de editar/eliminar
  const fetchServicios = async () => {
    setServiciosLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('http://localhost:8080/api/servicios', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setServicios(data);
      }
    } catch (error) {
      console.error('Error fetching servicios:', error);
    } finally {
      setServiciosLoading(false);
    }
  };

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-dropdown-add')) {
        setMostrarDropdownAdd(false);
      }
      if (!target.closest('.user-dropdown-ban')) {
        setMostrarDropdownBan(false);
      }
      if (!target.closest('.user-dropdown-resena')) {
        setMostrarDropdownResena(false);
      }
    };

    if (mostrarDropdownAdd || mostrarDropdownBan || mostrarDropdownResena) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mostrarDropdownAdd, mostrarDropdownBan, mostrarDropdownResena]);

  // Cargar tiempo mínimo actual al montar el componente
  useEffect(() => {
    fetchTiempoMinimoActual();
  }, []);

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
      setEditForm({ nombre: '', descripcion: '', precio: '', duracion: '', emoji: '', textoDescriptivo: '' });
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
    fetchTiempoMinimoActual();
  };

  // Función para obtener el tiempo mínimo actual
  const fetchTiempoMinimoActual = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('http://localhost:8080/api/configuracion/tiempo-minimo', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.horasMinimas) {
          setTiempoMinimo(data.horasMinimas);
          setTiempoMinimoForm({ horas: data.horasMinimas.toString() });
        }
      }
    } catch (error) {
      console.error('Error al obtener tiempo mínimo actual:', error);
      // Mantener valores por defecto si hay error
      setTiempoMinimo(24);
      setTiempoMinimoForm({ horas: '24' });
    }
  };

  // Función para abrir modal de gestión de usuarios
  const openUsuariosModal = (type: 'banear' | 'desbanear') => {
    // Cerrar otros modales antes de abrir uno nuevo
    setModal(null);
    setCitasModal(null);
    setTiempoMinimoModal(false);
    setVacacionesModal(false);
    setCancelarVacacionesModal(false);
    
    setUsuariosModal(type);
    fetchUsuariosList();
    setUsuarioSeleccionado(null);
    setUsuarioActionMsg(null);
    setBusquedaUsuarioBan(''); // Limpiar campo de búsqueda
    setMostrarDropdownBan(false); // Cerrar dropdown
  };

  // Función para obtener lista de usuarios
  const fetchUsuariosList = async () => {
    setUsuariosLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('http://localhost:8080/api/usuarios', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await res.json();
      setUsuariosList(data);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      setUsuariosList([]);
    } finally {
      setUsuariosLoading(false);
    }
  };

  // Función para manejar la acción de banear/desbanear
  const handleUsuarioAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioSeleccionado) return;
    
    setUsuarioActionLoading(true);
    setUsuarioActionMsg(null);
    try {
      const token = localStorage.getItem('authToken');
      const action = usuariosModal === 'banear' ? 'banear' : 'desbanear';
      
      const res = await fetch(`http://localhost:8080/api/usuarios/${usuarioSeleccionado}/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) throw new Error('Error al procesar la acción');
      
      const data = await res.json();
      setUsuarioActionMsg(data.message || `Usuario ${action === 'banear' ? 'baneado' : 'desbaneado'} correctamente`);
      
      // Recargar lista de usuarios
      fetchUsuariosList();
      
      setTimeout(() => {
        setUsuariosModal(null);
        setUsuarioActionMsg(null);
        setUsuarioSeleccionado(null);
      }, 1200);
    } catch (err: any) {
      setUsuarioActionMsg(err.message || 'Error al procesar la acción');
    } finally {
      setUsuarioActionLoading(false);
    }
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

  const openResenasModal = () => {
    setModal(null);
    setCitasModal(null);
    setTiempoMinimoModal(false);
    setVacacionesModal(false);
    setCancelarVacacionesModal(false);
    setResenasModal(true);
    setBusquedaResena('');
    setMostrarDropdownResena(false);
    setResenaSeleccionada(null);
    setResenasMsg(null);
    fetchResenas();
  };

  const fetchVacaciones = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('http://localhost:8080/api/vacaciones', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await res.json();
      setVacacionesList(data);
    } catch {
      setVacacionesList([]);
    }
  };

  const fetchResenas = async () => {
    setResenasLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('http://localhost:8080/api/resenas/todas', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setResenasList(data);
      } else {
        setResenasList([]);
      }
    } catch (error) {
      console.error('Error fetching reseñas:', error);
      setResenasList([]);
    } finally {
      setResenasLoading(false);
    }
  };

  // Función para obtener horas disponibles para una fecha específica
  const fetchHorasDisponibles = async (fecha: string, servicioId: string) => {
    if (!fecha || !servicioId) {
      setHorasDisponibles([]);
      return;
    }

    try {
      setCargandoHoras(true);
      const token = localStorage.getItem('authToken');
      
      // Obtener la duración del servicio seleccionado
      const servicio = servicios.find(s => s.id.toString() === servicioId);
      if (!servicio) {
        setHorasDisponibles([]);
        return;
      }

      const res = await fetch(`http://localhost:8080/api/citas/disponibilidad?fecha=${fecha}&duracion=${servicio.duracionMinutos}&userRole=ADMIN`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });

      if (res.ok) {
        const data = await res.json();
        setHorasDisponibles(data.horasLibres || []);
      } else {
        setHorasDisponibles([]);
      }
    } catch (error) {
      console.error('Error al obtener horas disponibles:', error);
      setHorasDisponibles([]);
    } finally {
      setCargandoHoras(false);
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

  const handleEliminarResena = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resenaSeleccionada) {
      setResenasMsg('Por favor selecciona una reseña');
      return;
    }

    setEliminarResenaLoading(true);
    setResenasMsg(null);

    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`http://localhost:8080/api/resenas/${resenaSeleccionada}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        setResenasMsg('Reseña eliminada correctamente');
        setResenaSeleccionada(null);
        setBusquedaResena('');
        setMostrarDropdownResena(false);
        fetchResenas();
        setTimeout(() => {
          setResenasModal(false);
          setResenasMsg(null);
        }, 1500);
      } else {
        const errorData = await res.json();
        setResenasMsg(errorData.message || 'Error al eliminar la reseña');
      }
    } catch (error) {
      setResenasMsg('Error al eliminar la reseña');
    } finally {
      setEliminarResenaLoading(false);
    }
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
        emoji: serv.emoji || '',
        textoDescriptivo: serv.textoDescriptivo || '',
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
    const newForm = { ...addCitaForm, [e.target.name]: e.target.value };
    setAddCitaForm(newForm);
    
    // Si cambió la fecha o el servicio, actualizar horas disponibles
    if (e.target.name === 'fechaInicio' || e.target.name === 'servicioId') {
      fetchHorasDisponibles(newForm.fechaInicio, newForm.servicioId);
    }
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
          duracionMinutos: parseInt(addForm.duracion),
          emoji: addForm.emoji,
          textoDescriptivo: addForm.textoDescriptivo
        })
      });
      if (!res.ok) throw new Error('Error al añadir servicio');
      setAddMsg('¡Servicio añadido correctamente!');
              setAddForm({ nombre: '', descripcion: '', precio: '', duracion: '', emoji: '', textoDescriptivo: '' });
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
          duracionMinutos: parseInt(editForm.duracion),
          emoji: editForm.emoji,
          textoDescriptivo: editForm.textoDescriptivo
        })
      });
      if (!res.ok) throw new Error('Error al modificar servicio');
      setEditMsg('¡Servicio modificado correctamente!');
      setTimeout(() => {
        setModal(null);
        setEditMsg(null);
        setEditId(null);
        setEditForm({ nombre: '', descripcion: '', precio: '', duracion: '', emoji: '', textoDescriptivo: '' });
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
        setBusquedaUsuarioAdd(''); // Limpiar campo de búsqueda
        setHorasDisponibles([]); // Limpiar horas disponibles
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
            <input className={styles.input} name="emoji" type="text" placeholder="Emoji (ej: ✂️, 💈, 🎨)" value={addForm.emoji} onChange={handleAddChange} maxLength={10} />
            <textarea className={styles.input} name="textoDescriptivo" placeholder="Texto descriptivo para pantalla de inicio" value={addForm.textoDescriptivo} onChange={handleAddChange} maxLength={200} />
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
            <input className={styles.input} name="emoji" type="text" placeholder="Emoji (ej: ✂️, 💈, 🎨)" value={editForm.emoji} onChange={handleEditChange} maxLength={10} />
            <textarea className={styles.input} name="textoDescriptivo" placeholder="Texto descriptivo para pantalla de inicio" value={editForm.textoDescriptivo} onChange={handleEditChange} maxLength={200} />
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
            <span>Configurar Tiempo Mínimo ({tiempoMinimo} horas)</span>
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
            {/* Campo de usuario con búsqueda */}
            <div style={{ position: 'relative' }} className="user-dropdown-add">
              <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center'
              }}>
                <div style={{
                  position: 'absolute',
                  left: '12px',
                  zIndex: 1,
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: '1rem'
                }}>
                  👤
                </div>
                <input
                  type="text"
                  value={busquedaUsuarioAdd}
                  onChange={(e) => {
                    setBusquedaUsuarioAdd(e.target.value);
                    setMostrarDropdownAdd(true);
                  }}
                  onFocus={(e) => {
                    setMostrarDropdownAdd(true);
                    (e.target as HTMLInputElement).style.border = '1px solid rgba(100, 181, 246, 0.5)';
                    (e.target as HTMLInputElement).style.boxShadow = '0 0 0 2px rgba(100, 181, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    (e.target as HTMLInputElement).style.border = '1px solid rgba(100, 181, 246, 0.2)';
                    (e.target as HTMLInputElement).style.boxShadow = 'none';
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLInputElement).style.border = '1px solid rgba(100, 181, 246, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    if (document.activeElement !== e.target) {
                      (e.target as HTMLInputElement).style.border = '1px solid rgba(100, 181, 246, 0.2)';
                    }
                  }}
                  placeholder="Buscar usuario por nombre o email..."
                  className={styles.input}
                  style={{
                    paddingLeft: '40px',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                    border: '1px solid rgba(100, 181, 246, 0.2)',
                    borderRadius: '8px',
                    transition: 'all 0.3s ease'
                  }}
                  required
                />
              </div>
              {mostrarDropdownAdd && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                  border: '1px solid rgba(100, 181, 246, 0.3)',
                  borderRadius: '12px',
                  maxHeight: '300px',
                  overflowY: 'auto',
                  zIndex: 9999,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3), 0 4px 16px rgba(100, 181, 246, 0.1)',
                  backdropFilter: 'blur(10px)',
                  marginTop: '4px',
                  borderTop: 'none',
                  borderTopLeftRadius: '0',
                  borderTopRightRadius: '0'
                }}>
                  {usuarios
                    .filter(usuario => 
                      usuario.nombre.toLowerCase().includes(busquedaUsuarioAdd.toLowerCase()) ||
                      usuario.email.toLowerCase().includes(busquedaUsuarioAdd.toLowerCase())
                    )
                    .map(usuario => (
                      <div
                        key={usuario.id}
                        onClick={() => {
                          setAddCitaForm({ ...addCitaForm, usuarioId: usuario.id.toString() });
                          setBusquedaUsuarioAdd(`${usuario.nombre} (${usuario.email})`);
                          setMostrarDropdownAdd(false);
                        }}
                        style={{
                          padding: '12px 16px',
                          cursor: 'pointer',
                          borderBottom: '1px solid rgba(255,255,255,0.05)',
                          fontSize: '0.9rem',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(100, 181, 246, 0.2) 0%, rgba(100, 181, 246, 0.1) 100%)';
                          e.currentTarget.style.transform = 'translateX(4px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(100, 181, 246, 0.2)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.transform = 'translateX(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        {/* Avatar/Icono del usuario */}
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #64b5f6 0%, #1976d2 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontSize: '0.9rem',
                          fontWeight: 'bold',
                          flexShrink: 0,
                          boxShadow: '0 2px 8px rgba(100, 181, 246, 0.3)',
                          border: '2px solid rgba(255,255,255,0.1)'
                        }}>
                          {usuario.nombre.charAt(0).toUpperCase()}
                        </div>
                        
                        {/* Información del usuario */}
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontWeight: '600',
                            color: '#fff',
                            marginBottom: '4px',
                            fontSize: '1rem',
                            textAlign: 'left',
                            letterSpacing: '0.5px'
                          }}>
                            {usuario.nombre}
                          </div>
                          <div style={{
                            color: 'rgba(255,255,255,0.8)',
                            fontSize: '0.85rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            textAlign: 'left'
                          }}>
                            <span style={{ fontSize: '0.75rem', opacity: '0.8' }}>📧</span>
                            {usuario.email}
                          </div>
                        </div>
                        
                        {/* Indicador de selección */}
                        <div style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          border: '2px solid rgba(100, 181, 246, 0.4)',
                          transition: 'all 0.2s ease',
                          background: 'rgba(100, 181, 246, 0.1)'
                        }} />
                      </div>
                    ))}
                  
                  {/* Mensaje si no hay resultados */}
                  {usuarios.filter(usuario => 
                    usuario.nombre.toLowerCase().includes(busquedaUsuarioAdd.toLowerCase()) ||
                    usuario.email.toLowerCase().includes(busquedaUsuarioAdd.toLowerCase())
                  ).length === 0 && (
                    <div style={{
                      padding: '20px 16px',
                      textAlign: 'center',
                      color: 'rgba(255,255,255,0.6)',
                      fontSize: '0.9rem',
                      fontStyle: 'italic',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span style={{ fontSize: '1.5rem', opacity: '0.5' }}>👤</span>
                      No se encontraron usuarios con ese nombre o email
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <select className={styles.input} name="servicioId" value={addCitaForm.servicioId} onChange={handleAddCitaChange} required>
              <option value="">Selecciona un servicio</option>
              {servicios.map(servicio => (
                <option key={servicio.id} value={servicio.id}>{servicio.nombre} - {servicio.precio}€</option>
              ))}
            </select>
            <input className={styles.input} name="periodicidadDias" type="number" placeholder="Periodicidad (días)" min="1" max="365" value={addCitaForm.periodicidadDias} onChange={handleAddCitaChange} required />
            <input className={styles.input} name="fechaInicio" type="date" placeholder="Fecha de inicio" value={addCitaForm.fechaInicio} onChange={handleAddCitaChange} required />
            
            {/* Mensaje informativo */}
            {(!addCitaForm.servicioId || !addCitaForm.fechaInicio) && (
              <div style={{ 
                padding: '0.5rem', 
                backgroundColor: 'rgba(25, 118, 210, 0.1)', 
                borderRadius: '4px', 
                fontSize: '0.9rem', 
                color: '#1976d2',
                marginBottom: '0.5rem'
              }}>
                ℹ️ Selecciona un servicio y una fecha para ver las horas disponibles
              </div>
            )}
            
            <select className={styles.input} name="hora" value={addCitaForm.hora} onChange={handleAddCitaChange} required>
              <option value="">Selecciona una hora</option>
              {cargandoHoras ? (
                <option value="" disabled>Cargando horas disponibles...</option>
              ) : horasDisponibles.length > 0 ? (
                horasDisponibles.map(hora => (
                  <option key={hora} value={hora}>{hora}</option>
                ))
              ) : (
                <option value="" disabled>No hay horas disponibles para esta fecha</option>
              )}
            </select>
            <div className={styles.modalBtnGroup}>
              <button className={styles.saveBtn} type="submit" disabled={addCitaLoading}>
                <FaSave className={styles.btnIcon} />
                {addCitaLoading ? 'Creando...' : 'Crear Cita Periódica'}
              </button>
              <button className={styles.cancelBtn} type="button" onClick={() => {
                setCitasModal(null);
                setBusquedaUsuarioAdd(''); // Limpiar campo de búsqueda
                setHorasDisponibles([]); // Limpiar horas disponibles
              }} disabled={addCitaLoading}>
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

        {/* Sección de Gestión de Usuarios */}
        <div className={styles.serviciosSection} style={{ marginTop: '2rem' }}>
          <div className={styles.header}>
            <FaUserPlus className={styles.calendarIcon} />
            <h2>Gestión de Usuarios</h2>
          </div>
          
          <div className={styles.buttonGroup}>
            <button className={`${styles.configBtn} ${styles.deleteBtn}`} onClick={() => openUsuariosModal('banear')}>
              <FaTrash className={styles.btnIcon} />
              <span>Banear Usuario</span>
            </button>
            <button className={`${styles.configBtn} ${styles.editBtn}`} onClick={() => openUsuariosModal('desbanear')}>
              <FaEdit className={styles.btnIcon} />
              <span>Desbanear Usuario</span>
            </button>
          </div>
        </div>

        {/* Sección de Gestión de Reseñas */}
        <div className={styles.serviciosSection} style={{ marginTop: '2rem' }}>
          <div className={styles.header}>
            <FaTrash className={styles.resenaIcon} />
            <h2>Gestionar Reseñas</h2>
          </div>
          
          <div className={styles.buttonGroup}>
            <button className={`${styles.configBtn} ${styles.deleteBtn}`} onClick={openResenasModal}>
              <FaTrash className={styles.btnIcon} />
              <span>Eliminar Reseña</span>
            </button>
          </div>
        </div>

        {/* Modal de Gestión de Usuarios */}
        {usuariosModal && (
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              {usuariosModal === 'banear' ? (
                <FaTrash className={styles.modalIcon} />
              ) : (
                <FaEdit className={styles.modalIcon} />
              )}
              <h3>{usuariosModal === 'banear' ? 'Banear Usuario' : 'Desbanear Usuario'}</h3>
            </div>
            <form className={styles.formModal} onSubmit={handleUsuarioAction}>
              {/* Campo de usuario con búsqueda */}
              <div style={{ position: 'relative' }} className="user-dropdown-ban">
                <div style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <div style={{
                    position: 'absolute',
                    left: '12px',
                    zIndex: 1,
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: '1rem'
                  }}>
                    👤
                  </div>
                  <input
                    type="text"
                    value={busquedaUsuarioBan}
                    onChange={(e) => {
                      setBusquedaUsuarioBan(e.target.value);
                      setMostrarDropdownBan(true);
                    }}
                    onFocus={(e) => {
                      setMostrarDropdownBan(true);
                      (e.target as HTMLInputElement).style.border = '1px solid rgba(100, 181, 246, 0.5)';
                      (e.target as HTMLInputElement).style.boxShadow = '0 0 0 2px rgba(100, 181, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      (e.target as HTMLInputElement).style.border = '1px solid rgba(100, 181, 246, 0.2)';
                      (e.target as HTMLInputElement).style.boxShadow = 'none';
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLInputElement).style.border = '1px solid rgba(100, 181, 246, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      if (document.activeElement !== e.target) {
                        (e.target as HTMLInputElement).style.border = '1px solid rgba(100, 181, 246, 0.2)';
                      }
                    }}
                    placeholder={`Buscar usuario para ${usuariosModal === 'banear' ? 'banear' : 'desbanear'}...`}
                    className={styles.input}
                    style={{
                      paddingLeft: '40px',
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                      border: '1px solid rgba(100, 181, 246, 0.2)',
                      borderRadius: '8px',
                      transition: 'all 0.3s ease'
                    }}
                    required
                  />
                </div>
                {mostrarDropdownBan && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                    border: '1px solid rgba(100, 181, 246, 0.3)',
                    borderRadius: '12px',
                    maxHeight: '300px',
                    overflowY: 'auto',
                    zIndex: 9999,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3), 0 4px 16px rgba(100, 181, 246, 0.1)',
                    backdropFilter: 'blur(10px)',
                    marginTop: '4px',
                    borderTop: 'none',
                    borderTopLeftRadius: '0',
                    borderTopRightRadius: '0'
                  }}>
                    {usuariosList
                      .filter(usuario => 
                        (usuariosModal === 'banear' ? !usuario.baneado : usuario.baneado) &&
                        (usuario.nombre.toLowerCase().includes(busquedaUsuarioBan.toLowerCase()) ||
                         usuario.email.toLowerCase().includes(busquedaUsuarioBan.toLowerCase()))
                      )
                      .map(usuario => (
                        <div
                          key={usuario.id}
                          onClick={() => {
                            setUsuarioSeleccionado(usuario.id);
                            setBusquedaUsuarioBan(`${usuario.nombre} (${usuario.email})`);
                            setMostrarDropdownBan(false);
                          }}
                          style={{
                            padding: '12px 16px',
                            cursor: 'pointer',
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                            fontSize: '0.9rem',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(100, 181, 246, 0.2) 0%, rgba(100, 181, 246, 0.1) 100%)';
                            e.currentTarget.style.transform = 'translateX(4px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(100, 181, 246, 0.2)';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.transform = 'translateX(0)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          {/* Avatar/Icono del usuario */}
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: usuario.baneado 
                              ? 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)' 
                              : 'linear-gradient(135deg, #64b5f6 0%, #1976d2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontSize: '0.9rem',
                            fontWeight: 'bold',
                            flexShrink: 0,
                            boxShadow: usuario.baneado 
                              ? '0 2px 8px rgba(231, 76, 60, 0.3)' 
                              : '0 2px 8px rgba(100, 181, 246, 0.3)',
                            border: '2px solid rgba(255,255,255,0.1)'
                          }}>
                            {usuario.nombre.charAt(0).toUpperCase()}
                          </div>
                          
                          {/* Información del usuario */}
                          <div style={{ flex: 1 }}>
                            <div style={{
                              fontWeight: '600',
                              color: '#fff',
                              marginBottom: '4px',
                              fontSize: '1rem',
                              textAlign: 'left',
                              letterSpacing: '0.5px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}>
                              {usuario.nombre}
                              {usuario.baneado && (
                                <span style={{
                                  padding: '3px 8px',
                                  backgroundColor: '#e74c3c',
                                  color: '#fff',
                                  borderRadius: '6px',
                                  fontSize: '0.7rem',
                                  fontWeight: 'bold',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px',
                                  boxShadow: '0 2px 4px rgba(231, 76, 60, 0.3)'
                                }}>
                                  Baneado
                                </span>
                              )}
                            </div>
                            <div style={{
                              color: 'rgba(255,255,255,0.8)',
                              fontSize: '0.85rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              textAlign: 'left'
                            }}>
                              <span style={{ fontSize: '0.75rem', opacity: '0.8' }}>📧</span>
                              {usuario.email}
                            </div>
                          </div>
                          
                          {/* Indicador de selección */}
                          <div style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            border: '2px solid rgba(100, 181, 246, 0.4)',
                            transition: 'all 0.2s ease',
                            background: 'rgba(100, 181, 246, 0.1)'
                          }} />
                        </div>
                      ))}
                    
                    {/* Mensaje si no hay resultados */}
                    {usuariosList.filter(usuario => 
                      (usuariosModal === 'banear' ? !usuario.baneado : usuario.baneado) &&
                      (usuario.nombre.toLowerCase().includes(busquedaUsuarioBan.toLowerCase()) ||
                       usuario.email.toLowerCase().includes(busquedaUsuarioBan.toLowerCase()))
                    ).length === 0 && (
                      <div style={{
                        padding: '20px 16px',
                        textAlign: 'center',
                        color: 'rgba(255,255,255,0.6)',
                        fontSize: '0.9rem',
                        fontStyle: 'italic',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{ fontSize: '1.5rem', opacity: '0.5' }}>
                          {usuariosModal === 'banear' ? '🚫' : '✅'}
                        </span>
                        {busquedaUsuarioBan 
                          ? 'No se encontraron usuarios con ese nombre o email' 
                          : usuariosModal === 'banear' 
                            ? 'No hay usuarios disponibles para banear' 
                            : 'No hay usuarios baneados para desbanear'
                        }
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {usuariosLoading && (
                <div style={{ textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
                  Cargando usuarios...
                </div>
              )}
              
              {!usuariosLoading && usuariosList.filter(u => 
                usuariosModal === 'banear' ? !u.baneado : u.baneado
              ).length === 0 && (
                <div style={{ 
                  padding: '1rem', 
                  backgroundColor: 'rgba(255,193,7,0.1)', 
                  borderRadius: '8px', 
                  border: '1px solid rgba(255,193,7,0.3)',
                  color: '#ffc107',
                  textAlign: 'center'
                }}>
                  {usuariosModal === 'banear' 
                    ? 'No hay usuarios disponibles para banear' 
                    : 'No hay usuarios baneados para desbanear'
                  }
                </div>
              )}
              
              <div className={styles.modalBtnGroup}>
                <button 
                  className={usuariosModal === 'banear' ? styles.deleteBtn : styles.saveBtn} 
                  type="submit" 
                  disabled={usuarioActionLoading || !usuarioSeleccionado}
                >
                  {usuariosModal === 'banear' ? (
                    <FaTrash className={styles.btnIcon} />
                  ) : (
                    <FaSave className={styles.btnIcon} />
                  )}
                  {usuarioActionLoading 
                    ? 'Procesando...' 
                    : usuariosModal === 'banear' 
                      ? 'Banear Usuario' 
                      : 'Desbanear Usuario'
                  }
                </button>
                <button 
                  className={styles.cancelBtn} 
                  type="button" 
                  onClick={() => {
                    setUsuariosModal(null);
                    setBusquedaUsuarioBan(''); // Limpiar campo de búsqueda
                  }} 
                  disabled={usuarioActionLoading}
                >
                  <FaTimes className={styles.btnIcon} />
                  Cancelar
                </button>
              </div>
              {usuarioActionMsg && (
                <div className={`${styles.message} ${usuarioActionMsg.includes('correctamente') ? styles.success : styles.error}`}>
                  {usuarioActionMsg}
                </div>
              )}
            </form>
          </div>
        )}

        {/* Modal de Eliminar Reseñas */}
        {resenasModal && (
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <FaTrash className={styles.modalIcon} />
              <h3>Eliminar Reseña</h3>
            </div>
            <form className={styles.formModal} onSubmit={handleEliminarResena}>
              <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: 'rgba(220,53,69,0.1)', borderRadius: '8px', border: '1px solid rgba(220,53,69,0.3)' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#dc3545', fontSize: '1rem' }}>⚠️ Advertencia</h4>
                <p style={{ margin: '0', fontSize: '0.9rem', color: '#ccc', lineHeight: '1.4' }}>
                  Esta acción eliminará permanentemente la reseña seleccionada. Esta acción no se puede deshacer.
                </p>
              </div>
              
              {/* Campo de búsqueda con dropdown elegante */}
              <div style={{ position: 'relative' }} className="user-dropdown-resena">
                <div style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <div style={{
                    position: 'absolute',
                    left: '12px',
                    zIndex: 1,
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: '1rem'
                  }}>
                    🔍
                  </div>
                  <input
                    type="text"
                    value={busquedaResena}
                    onChange={(e) => {
                      setBusquedaResena(e.target.value);
                      setMostrarDropdownResena(true);
                    }}
                    onFocus={(e) => {
                      setMostrarDropdownResena(true);
                      (e.target as HTMLInputElement).style.border = '1px solid rgba(100, 181, 246, 0.5)';
                      (e.target as HTMLInputElement).style.boxShadow = '0 0 0 2px rgba(100, 181, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      (e.target as HTMLInputElement).style.border = '1px solid rgba(100, 181, 246, 0.2)';
                      (e.target as HTMLInputElement).style.boxShadow = 'none';
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLInputElement).style.border = '1px solid rgba(100, 181, 246, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      if (document.activeElement !== e.target) {
                        (e.target as HTMLInputElement).style.border = '1px solid rgba(100, 181, 246, 0.2)';
                      }
                    }}
                    placeholder="Buscar reseña por nombre de usuario..."
                    className={styles.input}
                    style={{
                      paddingLeft: '40px',
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                      border: '1px solid rgba(100, 181, 246, 0.2)',
                      borderRadius: '8px',
                      transition: 'all 0.3s ease'
                    }}
                  />
                </div>
                {mostrarDropdownResena && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                    border: '1px solid rgba(100, 181, 246, 0.3)',
                    borderRadius: '12px',
                    maxHeight: '300px',
                    overflowY: 'auto',
                    zIndex: 9999,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3), 0 4px 16px rgba(100, 181, 246, 0.1)',
                    backdropFilter: 'blur(10px)',
                    marginTop: '4px',
                    borderTop: 'none',
                    borderTopLeftRadius: '0',
                    borderTopRightRadius: '0'
                  }}>
                    {resenasList
                      .filter(resena => 
                        !busquedaResena || 
                        resena.usuario?.nombre?.toLowerCase().includes(busquedaResena.toLowerCase())
                      )
                      .map(resena => (
                        <div
                          key={resena.id}
                          onClick={() => {
                            setResenaSeleccionada(resena.id);
                            setBusquedaResena(`${resena.usuario?.nombre || 'Usuario'} - ${resena.comentario?.substring(0, 30) || 'Sin comentario'}...`);
                            setMostrarDropdownResena(false);
                          }}
                          style={{
                            padding: '12px 16px',
                            cursor: 'pointer',
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                            fontSize: '0.9rem',
                            transition: 'all 0.2s ease',
                            color: '#fff'
                          }}
                                                     onMouseEnter={(e) => {
                             e.currentTarget.style.background = 'linear-gradient(135deg, rgba(100, 181, 246, 0.2) 0%, rgba(100, 181, 246, 0.1) 100%)';
                             e.currentTarget.style.transform = 'translateX(4px)';
                             e.currentTarget.style.boxShadow = '0 4px 12px rgba(100, 181, 246, 0.2)';
                           }}
                           onMouseLeave={(e) => {
                             e.currentTarget.style.background = 'transparent';
                             e.currentTarget.style.transform = 'translateX(0)';
                             e.currentTarget.style.boxShadow = 'none';
                           }}
                        >
                          <div style={{ 
                            fontWeight: '600', 
                            marginBottom: '4px', 
                            fontSize: '1rem',
                            color: '#fff',
                            letterSpacing: '0.5px'
                          }}>
                            {resena.usuario?.nombre || 'Usuario'}
                          </div>
                          <div style={{ 
                            fontSize: '0.85rem', 
                            color: 'rgba(255,255,255,0.8)', 
                            marginBottom: '4px',
                            lineHeight: '1.3'
                          }}>
                            {resena.comentario?.substring(0, 50) || 'Sin comentario'}...
                          </div>
                          <div style={{ 
                            fontSize: '0.75rem', 
                            color: 'rgba(255,255,255,0.6)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <span style={{ fontSize: '0.7rem' }}>📅</span>
                            {new Date(resena.fechaCreacion).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    {resenasList.filter(resena => 
                      !busquedaResena || 
                      resena.usuario?.nombre?.toLowerCase().includes(busquedaResena.toLowerCase())
                    ).length === 0 && (
                      <div style={{
                        padding: '20px 16px',
                        textAlign: 'center',
                        color: 'rgba(255,255,255,0.6)',
                        fontSize: '0.9rem',
                        fontStyle: 'italic',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{ fontSize: '1.5rem', opacity: '0.5' }}>🔍</span>
                        {busquedaResena ? 'No se encontraron reseñas con ese nombre' : 'No hay reseñas disponibles'}
                      </div>
                    )}
                  </div>
                )}
              </div>
              


              {resenaSeleccionada && (
                <div style={{ 
                  padding: '1rem', 
                  backgroundColor: 'rgba(255,255,255,0.05)', 
                  borderRadius: '8px', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  marginBottom: '1rem'
                }}>
                  <h5 style={{ margin: '0 0 0.5rem 0', color: '#fff' }}>Reseña seleccionada:</h5>
                  {resenasList.find(r => r.id === resenaSeleccionada) && (
                    <div>
                      <p style={{ margin: '0 0 0.5rem 0', color: '#ccc' }}>
                        <strong>Usuario:</strong> {resenasList.find(r => r.id === resenaSeleccionada)?.usuario?.nombre || 'Desconocido'}
                      </p>
                      <p style={{ margin: '0 0 0.5rem 0', color: '#ccc' }}>
                        <strong>Comentario:</strong> {resenasList.find(r => r.id === resenaSeleccionada)?.comentario || 'Sin comentario'}
                      </p>
                      <p style={{ margin: '0', color: '#ccc' }}>
                        <strong>Fecha:</strong> {new Date(resenasList.find(r => r.id === resenaSeleccionada)?.fechaCreacion || '').toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {resenasLoading && (
                <div style={{ textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
                  Cargando reseñas...
                </div>
              )}



              <div className={styles.modalBtnGroup}>
                <button 
                  className={styles.deleteBtn} 
                  type="submit" 
                  disabled={eliminarResenaLoading || !resenaSeleccionada || resenasList.length === 0}
                >
                  <FaTrash className={styles.btnIcon} />
                  {eliminarResenaLoading ? 'Eliminando...' : 'Eliminar Reseña'}
                </button>
                <button 
                  className={styles.cancelBtn} 
                  type="button" 
                  onClick={() => {
                    setResenasModal(false);
                    setResenaSeleccionada(null);
                    setResenasMsg(null);
                    setBusquedaResena('');
                    setMostrarDropdownResena(false);
                  }} 
                  disabled={eliminarResenaLoading}
                >
                  <FaTimes className={styles.btnIcon} />
                  Cancelar
                </button>
              </div>
              {resenasMsg && (
                <div className={`${styles.message} ${resenasMsg.includes('correctamente') ? styles.success : styles.error}`}>
                  {resenasMsg}
                </div>
              )}
            </form>
          </div>
                 )}

    </div>
  );
};

export default Configuracion; 