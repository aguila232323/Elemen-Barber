import React, { useEffect, useState } from 'react';
import styles from './Perfil.module.css';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaPhone, FaEdit, FaSave, FaTimes, FaSignOutAlt } from 'react-icons/fa';

interface Usuario {
  nombre: string;
  email: string;
  telefono: string;
}

interface CampoEditando {
  nombre: boolean;
  email: boolean;
  telefono: boolean;
}

const Perfil: React.FC = () => {
  const [usuario, setUsuario] = useState<Usuario>({ nombre: '', email: '', telefono: '' });
  const [loading, setLoading] = useState(true);
  const [campoEditando, setCampoEditando] = useState<CampoEditando>({
    nombre: false,
    email: false,
    telefono: false
  });
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState<string | null>(null);
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

  const iniciarEdicion = (campo: keyof CampoEditando) => {
    setCampoEditando({ ...campoEditando, [campo]: true });
    setMensaje('');
    setError('');
  };

  const cancelarEdicion = (campo: keyof CampoEditando) => {
    setCampoEditando({ ...campoEditando, [campo]: false });
    // Recargar datos originales
    const token = localStorage.getItem('authToken');
    if (token) {
      fetch('http://localhost:8080/api/usuarios/perfil', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          setUsuario({ nombre: data.nombre, email: data.email, telefono: data.telefono || '' });
        });
    }
  };

  const guardarCampo = async (campo: keyof CampoEditando) => {
    setGuardando(campo);
    setMensaje('');
    setError('');
    
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
      
      setMensaje(`${campo.charAt(0).toUpperCase() + campo.slice(1)} actualizado correctamente`);
      setCampoEditando({ ...campoEditando, [campo]: false });
    } catch (err) {
      setError(`Error al actualizar ${campo}`);
    } finally {
      setGuardando(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/');
    window.location.reload();
  };

  if (loading) return (
    <div className={styles.perfilCont}>
      <div className={styles.loadingSpinner}>Cargando perfil...</div>
    </div>
  );

  return (
    <div className={styles.perfilCont}>
      <div className={styles.perfilHeader}>
        <h2 className={styles.perfilTitulo}>
          <FaUser className={styles.perfilIcon} />
          Mi Perfil
        </h2>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          <FaSignOutAlt />
          Cerrar sesión
        </button>
      </div>

      <div className={styles.perfilCampos}>
        {/* Campo Nombre */}
        <div className={styles.campoContainer}>
          <div className={styles.campoHeader}>
            <FaUser className={styles.campoIcon} />
            <span className={styles.campoLabel}>Nombre</span>
          </div>
          <div className={styles.campoContent}>
            {campoEditando.nombre ? (
              <div className={styles.campoEditando}>
                <input
                  className={styles.campoInput}
                  type="text"
                  name="nombre"
                  value={usuario.nombre}
                  onChange={handleChange}
                  required
                />
                <div className={styles.campoBotones}>
                  <button 
                    type="button" 
                    className={styles.btnGuardar}
                    onClick={() => guardarCampo('nombre')}
                    disabled={guardando === 'nombre'}
                  >
                    {guardando === 'nombre' ? 'Guardando...' : <FaSave />}
                  </button>
                  <button 
                    type="button" 
                    className={styles.btnCancelar}
                    onClick={() => cancelarEdicion('nombre')}
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.campoMostrar}>
                <span className={styles.campoValor}>{usuario.nombre}</span>
                <button 
                  type="button" 
                  className={styles.btnEditar}
                  onClick={() => iniciarEdicion('nombre')}
                >
                  <FaEdit />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Campo Email */}
        <div className={styles.campoContainer}>
          <div className={styles.campoHeader}>
            <FaEnvelope className={styles.campoIcon} />
            <span className={styles.campoLabel}>Email</span>
          </div>
          <div className={styles.campoContent}>
            {campoEditando.email ? (
              <div className={styles.campoEditando}>
                <input
                  className={styles.campoInput}
                  type="email"
                  name="email"
                  value={usuario.email}
                  onChange={handleChange}
                  required
                />
                <div className={styles.campoBotones}>
                  <button 
                    type="button" 
                    className={styles.btnGuardar}
                    onClick={() => guardarCampo('email')}
                    disabled={guardando === 'email'}
                  >
                    {guardando === 'email' ? 'Guardando...' : <FaSave />}
                  </button>
                  <button 
                    type="button" 
                    className={styles.btnCancelar}
                    onClick={() => cancelarEdicion('email')}
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.campoMostrar}>
                <span className={styles.campoValor}>{usuario.email}</span>
                <button 
                  type="button" 
                  className={styles.btnEditar}
                  onClick={() => iniciarEdicion('email')}
                >
                  <FaEdit />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Campo Teléfono */}
        <div className={styles.campoContainer}>
          <div className={styles.campoHeader}>
            <FaPhone className={styles.campoIcon} />
            <span className={styles.campoLabel}>Teléfono</span>
          </div>
          <div className={styles.campoContent}>
            {campoEditando.telefono ? (
              <div className={styles.campoEditando}>
                <input
                  className={styles.campoInput}
                  type="text"
                  name="telefono"
                  value={usuario.telefono}
                  onChange={handleChange}
                />
                <div className={styles.campoBotones}>
                  <button 
                    type="button" 
                    className={styles.btnGuardar}
                    onClick={() => guardarCampo('telefono')}
                    disabled={guardando === 'telefono'}
                  >
                    {guardando === 'telefono' ? 'Guardando...' : <FaSave />}
                  </button>
                  <button 
                    type="button" 
                    className={styles.btnCancelar}
                    onClick={() => cancelarEdicion('telefono')}
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.campoMostrar}>
                <span className={styles.campoValor}>
                  {usuario.telefono || 'No especificado'}
                </span>
                <button 
                  type="button" 
                  className={styles.btnEditar}
                  onClick={() => iniciarEdicion('telefono')}
                >
                  <FaEdit />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {mensaje && <div className={styles.perfilMsg}>{mensaje}</div>}
      {error && <div className={styles.perfilError}>{error}</div>}
    </div>
  );
};

export default Perfil; 