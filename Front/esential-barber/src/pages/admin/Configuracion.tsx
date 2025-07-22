import React, { useState } from 'react';
import styles from './Configuracion.module.css';

interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  duracionMinutos: number;
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
  const [deleteId, setDeleteId] = useState<number | null>(null);

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

  // Abrir modal y cargar servicios si es necesario
  const openModal = (type: 'add' | 'edit' | 'delete') => {
    setModal(type);
    if (type === 'edit' || type === 'delete') fetchServicios();
    if (type === 'edit') {
      setEditId(null);
      setEditForm({ nombre: '', descripcion: '', precio: '', duracion: '' });
    }
    if (type === 'delete') setDeleteId(null);
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

  return (
    <div className={styles.configContainer}>
      <h2>Configuración de Servicios</h2>
      <div className={styles.buttonGroup}>
        <button className={styles.configBtn} onClick={() => openModal('add')}>Añadir servicio</button>
        <button className={styles.configBtn} onClick={() => openModal('edit')}>Modificar servicio</button>
        <button className={styles.configBtn} onClick={() => openModal('delete')}>Eliminar servicio</button>
      </div>
      {modal === 'add' && (
        <div className={styles.modal}>
          <h3>Añadir servicio</h3>
          <form className={styles.formModal} onSubmit={handleAddSubmit}>
            <input className={styles.input} name="nombre" type="text" placeholder="Nombre del servicio" value={addForm.nombre} onChange={handleAddChange} required />
            <textarea className={styles.input} name="descripcion" placeholder="Descripción" value={addForm.descripcion} onChange={handleAddChange} required />
            <input className={styles.input} name="precio" type="number" placeholder="Precio (€)" min="0" step="0.01" value={addForm.precio} onChange={handleAddChange} required />
            <input className={styles.input} name="duracion" type="number" placeholder="Duración (minutos)" min="1" value={addForm.duracion} onChange={handleAddChange} required />
            <div className={styles.modalBtnGroup}>
              <button className={styles.saveBtn} type="submit" disabled={addLoading}>{addLoading ? 'Guardando...' : 'Guardar'}</button>
              <button className={styles.cancelBtn} type="button" onClick={() => setModal(null)} disabled={addLoading}>Cancelar</button>
            </div>
            {addMsg && <div style={{marginTop:8, color: addMsg.startsWith('¡') ? '#43b94a' : '#e74c3c'}}>{addMsg}</div>}
          </form>
        </div>
      )}
      {modal === 'edit' && (
        <div className={styles.modal}>
          <h3>Modificar servicio</h3>
          <form className={styles.formModal}>
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
              <button className={styles.saveBtn} type="submit">Guardar cambios</button>
              <button className={styles.cancelBtn} type="button" onClick={() => setModal(null)}>Cancelar</button>
            </div>
          </form>
        </div>
      )}
      {modal === 'delete' && (
        <div className={styles.modal}>
          <h3>Eliminar servicio</h3>
          <form className={styles.formModal}>
            <select className={styles.input} value={deleteId ?? ''} onChange={handleDeleteSelect} required>
              <option value="">Selecciona un servicio</option>
              {servicios.map(s => (
                <option key={s.id} value={s.id}>{s.nombre}</option>
              ))}
            </select>
            <div className={styles.modalBtnGroup}>
              <button className={styles.deleteBtn} type="submit">Eliminar</button>
              <button className={styles.cancelBtn} type="button" onClick={() => setModal(null)}>Cancelar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Configuracion; 