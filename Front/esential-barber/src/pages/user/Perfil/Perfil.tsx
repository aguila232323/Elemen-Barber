import React, { useEffect, useState } from 'react';
import styles from './Perfil.module.css';
import { useNavigate } from 'react-router-dom';

interface Usuario {
  nombre: string;
  email: string;
  telefono: string;
}

const Perfil: React.FC = () => {
  const [usuario, setUsuario] = useState<Usuario>({ nombre: '', email: '', telefono: '' });
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    fetch('http://localhost:8080/api/usuarios/perfil', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setUsuario({ nombre: data.nombre, email: data.email, telefono: data.telefono || '' });
        setLoading(false);
      })
      .catch(() => {
        setError('Error al cargar el perfil');
        setLoading(false);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsuario({ ...usuario, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje('');
    setError('');
    setEditando(false);
    const token = localStorage.getItem('authToken');
    if (!token) return;
    try {
      const res = await fetch('http://localhost:8080/api/usuarios/perfil', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(usuario)
      });
      if (!res.ok) throw new Error('No se pudo actualizar el perfil');
      setMensaje('Perfil actualizado correctamente');
    } catch (err) {
      setError('Error al actualizar el perfil');
    }
  };

  if (loading) return <div className={styles.perfilCont}>Cargando perfil...</div>;

  return (
    <div className={styles.perfilCont}>
      <h2 className={styles.perfilTitulo}>Mi Perfil</h2>
      <button className={styles.cerrarSesionBtn} onClick={() => {
        localStorage.removeItem('authToken');
        navigate('/');
        window.location.reload();
      }}>
        Cerrar sesión
      </button>
      <form className={styles.perfilForm} onSubmit={handleSubmit}>
        <label className={styles.perfilLabel}>
          Nombre:
          <input
            className={styles.perfilInput}
            type="text"
            name="nombre"
            value={usuario.nombre}
            onChange={handleChange}
            disabled={!editando}
            required
          />
        </label>
        <label className={styles.perfilLabel}>
          Email:
          <input
            className={styles.perfilInput}
            type="email"
            name="email"
            value={usuario.email}
            onChange={handleChange}
            disabled={!editando}
            required
          />
        </label>
        <label className={styles.perfilLabel}>
          Teléfono:
          <input
            className={styles.perfilInput}
            type="text"
            name="telefono"
            value={usuario.telefono}
            onChange={handleChange}
            disabled={!editando}
          />
        </label>
        {mensaje && <div className={styles.perfilMsg}>{mensaje}</div>}
        {error && <div className={styles.perfilError}>{error}</div>}
        <div className={styles.perfilBotones}>
          {!editando ? (
            <button type="button" className={styles.perfilBtn} onClick={()=>setEditando(true)}>
              Editar
            </button>
          ) : (
            <>
              <button type="submit" className={styles.perfilBtn}>Guardar</button>
              <button type="button" className={styles.perfilBtnSec} onClick={()=>{setEditando(false); setMensaje(''); setError('');}}>
                Cancelar
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default Perfil; 