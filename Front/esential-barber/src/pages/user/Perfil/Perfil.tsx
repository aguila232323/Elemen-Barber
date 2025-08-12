import React, { useEffect, useState } from 'react';
import styles from './Perfil.module.css';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaPhone, FaEdit, FaSave, FaTimes, FaSignOutAlt, FaLock, FaEye, FaEyeSlash, FaCheckCircle, FaTrash, FaUserEdit } from 'react-icons/fa';
import defaultProfile from '../../../assets/images/usuario.png';
// import GoogleCalendarInfo from '../../../components/GoogleCalendarInfo';

// Función para generar avatar genérico basado en el nombre
const generarAvatar = (nombre: string): string => {
  if (!nombre || nombre.trim() === '') {
    return '👤';
  }
  
  const avatares = [
    '👨‍💼', '👩‍💼', '👨‍🦱', '👩‍🦰', '👨‍🦳', '👩‍🦳', 
    '👨‍🦲', '👩‍🦲', '👨‍🦰', '👩‍🦱', '👨‍🦯', '👩‍🦯',
    '👨‍⚕️', '👩‍⚕️', '👨‍🎓', '👩‍🎓', '👨‍🏫', '👩‍🏫',
    '👨‍💻', '👩‍💻', '👨‍🔧', '👩‍🔧', '👨‍🚀', '👩‍🚀'
  ];
  
  const hash = Math.abs(nombre.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0));
  
  return avatares[hash % avatares.length];
};

// Array de avatares mejorados para el selector
const avataresMejorados = [
  // Personas profesionales
  '👨‍💼', '👩‍💼', '👨‍⚕️', '👩‍⚕️', '👨‍🎓', '👩‍🎓', '👨‍🏫', '👩‍🏫',
  // Personas con diferentes estilos de pelo
  '👨‍🦱', '👩‍🦰', '👨‍🦳', '👩‍🦳', '👨‍🦲', '👩‍🦲', '👨‍🦰', '👩‍🦱',
  // Personas con diferentes profesiones
  '👨‍💻', '👩‍💻', '👨‍🔧', '👩‍🔧', '👨‍🚀', '👩‍🚀', '👨‍🎨', '👩‍🎨',
  // Personas con diferentes edades y estilos
  '🧑‍🦱', '🧑‍🦰', '🧑‍🦳', '🧑‍🦲', '🧑‍🦰', '🧑‍🦱', '🧑‍🦳', '🧑‍🦲',
  // Personas con diferentes expresiones
  '😊', '😄', '😎', '🤓', '😌', '😇', '🤠', '🦸‍♂️', '🦸‍♀️', '🧙‍♂️', '🧙‍♀️',
  // Personas con diferentes actividades
  '🏃‍♂️', '🏃‍♀️', '🚴‍♂️', '🚴‍♀️', '🏊‍♂️', '🏊‍♀️', '⛷️', '🏂',
  // Personas con diferentes hobbies
  '🎸', '🎹', '🎨', '📚', '🎮', '🎯', '🎪', '🎭',
  // Personas con diferentes estilos
  '👨‍🦱', '👩‍🦰', '👨‍🦳', '👩‍🦳', '👨‍🦲', '👩‍🦲', '👨‍🦰', '👩‍🦱'
];

// Función para verificar si una URL de imagen es válida
const isValidImageUrl = (url: string): boolean => {
  if (!url || url.trim() === '') return false;
  
  // Verificar que sea una URL válida
  try {
    new URL(url);
  } catch {
    return false;
  }
  
  // Verificar que sea una URL de Google (más flexible)
  return url.includes('googleusercontent.com') || 
         url.includes('lh3.googleusercontent.com') ||
         url.includes('lh4.googleusercontent.com') ||
         url.includes('lh5.googleusercontent.com') ||
         url.includes('lh6.googleusercontent.com') ||
         url.startsWith('https://') && url.includes('google');
};

// Función para verificar si una imagen es accesible
const isImageAccessible = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { 
      method: 'HEAD',
      mode: 'no-cors' // Esto evita errores de CORS en la verificación
    });
    return true; // Si no hay error, asumimos que es accesible
  } catch (error) {
    // Error verificando accesibilidad de imagen
    return false;
  }
};

// Función para crear una URL proxy para evitar problemas de CORS
const createProxyUrl = (originalUrl: string): string => {
  // Usar un servicio de proxy de imágenes para evitar CORS
  // Opción 1: Usar images.weserv.nl (gratuito y confiable)
  return `https://images.weserv.nl/?url=${encodeURIComponent(originalUrl)}&w=200&h=200&fit=cover&output=webp`;
  
  // Opción 2: Usar un proxy local (si tienes uno configurado)
  // return `https://tu-proxy.com/proxy?url=${encodeURIComponent(originalUrl)}`;
  
  // Opción 3: Usar Google Images Proxy
  // return `https://images1-focus-opensocial.googleusercontent.com/gadgets/proxy?container=focus&refresh=2592000&url=${encodeURIComponent(originalUrl)}`;
};
import { 
  validateSpanishPhone, 
  normalizePhoneForStorage, 
  getPhoneErrorMessage,
  handlePhoneChange,
  handlePhoneBlur,
  formatPhoneForDisplay
} from '../../../utils/phoneUtils';

interface Usuario {
  nombre: string;
  email: string;
  telefono: string;
  googlePictureUrl?: string;
  avatar?: string;
}

interface CampoEditando {
  nombre: boolean;
  email: boolean;
  telefono: boolean;
  password: boolean;
}

interface PasswordData {
  passwordActual: string;
  passwordNueva: string;
  passwordConfirmar: string;
}

const Perfil: React.FC = () => {
  const [usuario, setUsuario] = useState<Usuario>({ nombre: '', email: '', telefono: '' });
  const [passwordData, setPasswordData] = useState<PasswordData>({
    passwordActual: '',
    passwordNueva: '',
    passwordConfirmar: ''
  });
  const [loading, setLoading] = useState(true);
  const [campoEditando, setCampoEditando] = useState<CampoEditando>({
    nombre: false,
    email: false,
    telefono: false,
    password: false
  });
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState({
    actual: false,
    nueva: false,
    confirmar: false
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [showPasswordError, setShowPasswordError] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string>('');
  const [imageLoadError, setImageLoadError] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [useProxy, setUseProxy] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    fetch('http://localhost:8080/api/usuarios/perfil', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(async res => {
        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then(data => {

        setUsuario({ 
          nombre: data.nombre, 
          email: data.email, 
          telefono: data.telefono || '',
          googlePictureUrl: data.googlePictureUrl || null,
          avatar: data.avatar || null
        });
        // Establecer el avatar seleccionado si existe
        if (data.avatar) {
          setSelectedAvatar(data.avatar);
        }
        // No necesitamos setProfileImage porque usamos googlePictureUrl directamente
        setProfileImage(null); // Set profile image from backend
        setLoading(false);
      })
      .catch((err) => {
        setError('Error al cargar el perfil');
        setLoading(false);
      });
  }, []);

  // Resetear estados de imagen cuando cambie la URL de Google
  useEffect(() => {
    if (usuario.googlePictureUrl) {
      setImageLoadError(false);
      setImageLoading(false);
      setUseProxy(false); // Resetear el proxy al cambiar URL
    }
  }, [usuario.googlePictureUrl]);

  // Función para activar el proxy si hay problemas de CORS
  const activateProxy = () => {
    if (usuario.googlePictureUrl) {
              // Activando proxy para evitar problemas de CORS
      setUseProxy(true);
      setImageLoadError(false);
      setImageLoading(true);
    }
  };

  // Función para detectar si el usuario es de Google Auth
  const isGoogleUser = (): boolean => {
    return !!(usuario.googlePictureUrl && usuario.googlePictureUrl.includes('googleusercontent.com'));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'telefono') {
      handlePhoneChange(value, (newValue) => {
        setUsuario({ ...usuario, telefono: newValue });
      });
    } else {
      setUsuario({ ...usuario, [name]: value });
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setProfileImage(ev.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleAvatarSelection = async (avatar: string) => {
    setSelectedAvatar(avatar);
    setShowAvatarSelector(false);
    
    // Guardar el avatar en el backend
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        // No hay token de autenticación
        return;
      }

      const res = await fetch('http://localhost:8080/api/usuarios/avatar', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ avatar })
      });

      if (!res.ok) {
        let errorMessage = 'Error al guardar el avatar';
        try {
          const errorData = await res.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          errorMessage = `Error ${res.status}: ${res.statusText}`;
        }
        throw new Error(errorMessage);
      }

      setMensaje('Avatar actualizado correctamente');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el avatar');
    }
  };

  const openAvatarSelector = () => {
    setSelectedAvatar(generarAvatar(usuario.nombre));
    setShowAvatarSelector(true);
  };

  const iniciarEdicion = (campo: keyof CampoEditando) => {
    setCampoEditando({ ...campoEditando, [campo]: true });
    setMensaje('');
    setError('');
    if (campo === 'password') {
      setPasswordData({ passwordActual: '', passwordNueva: '', passwordConfirmar: '' });
    }
  };

  const cancelarEdicion = (campo: keyof CampoEditando) => {
    setCampoEditando({ ...campoEditando, [campo]: false });
    if (campo === 'password') {
      setPasswordData({ passwordActual: '', passwordNueva: '', passwordConfirmar: '' });
      setShowPasswords({ actual: false, nueva: false, confirmar: false });
    } else {
      // Recargar datos originales
      const token = localStorage.getItem('authToken');
      if (token) {
        fetch('http://localhost:8080/api/usuarios/perfil', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
          .then(async res => {
            if (!res.ok) {
              throw new Error(`Error ${res.status}: ${res.statusText}`);
            }
            return res.json();
          })
          .then(data => {
            setUsuario({ nombre: data.nombre, email: data.email, telefono: data.telefono || '' });
            setProfileImage(data.imagenUrl || null); // Recargar imagen
          })
          .catch((err) => {
            setError('Error al recargar los datos');
          });
      }
    }
  };

  const validarPassword = (): string | null => {
    if (!passwordData.passwordActual) return 'La contraseña actual es requerida';
    if (!passwordData.passwordNueva) return 'La nueva contraseña es requerida';
    if (passwordData.passwordNueva.length < 6) return 'La nueva contraseña debe tener al menos 6 caracteres';
    if (passwordData.passwordNueva !== passwordData.passwordConfirmar) return 'Las contraseñas no coinciden';
    return null;
  };

  const guardarCampo = async (campo: keyof CampoEditando) => {
    setGuardando(campo);
    setMensaje('');
    setError('');
    
    const token = localStorage.getItem('authToken');
    if (!token) return;
    
    try {
      if (campo === 'password') {
        const errorValidacion = validarPassword();
        if (errorValidacion) {
          setError(errorValidacion);
          setGuardando(null);
          return;
        }

        const res = await fetch('http://localhost:8080/api/usuarios/cambiar-password', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            passwordActual: passwordData.passwordActual,
            passwordNueva: passwordData.passwordNueva
          })
        });
        
        if (!res.ok) {
          let errorMessage = 'Error al cambiar la contraseña';
          try {
            const errorData = await res.json();
            errorMessage = errorData.message || errorMessage;
          } catch (jsonError) {
            errorMessage = `Error ${res.status}: ${res.statusText}`;
          }
          throw new Error(errorMessage);
        }
        
        let successMessage = 'Contraseña actualizada correctamente';
        try {
          const responseData = await res.json();
          successMessage = responseData.message || successMessage;
        } catch (jsonError) {
          // Response no es JSON, usando mensaje por defecto
        }
        
        setMensaje(successMessage);
        setCampoEditando({ ...campoEditando, [campo]: false });
        setPasswordData({ passwordActual: '', passwordNueva: '', passwordConfirmar: '' });
        setShowPasswords({ actual: false, nueva: false, confirmar: false });
      } else {
        // Validar teléfono si es el campo que se está editando
        let res;
        if (campo === 'telefono') {
          const phoneError = getPhoneErrorMessage(usuario.telefono);
          if (phoneError) {
            setError(phoneError);
            setGuardando(null);
            return;
          }
          
          // Normalizar teléfono para almacenamiento
          const normalizedPhone = normalizePhoneForStorage(usuario.telefono);
          const usuarioConTelefonoNormalizado = { ...usuario, telefono: normalizedPhone };
          
          res = await fetch('http://localhost:8080/api/usuarios/perfil', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(usuarioConTelefonoNormalizado)
          });
        } else {
          res = await fetch('http://localhost:8080/api/usuarios/perfil', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(usuario)
          });
        }
        
        if (!res.ok) {
          let errorMessage = 'No se pudo actualizar el perfil';
          try {
            const errorData = await res.json();
            errorMessage = errorData.message || errorMessage;
          } catch (jsonError) {
            errorMessage = `Error ${res.status}: ${res.statusText}`;
          }
          throw new Error(errorMessage);
        }
        
        let successMessage = `${campo.charAt(0).toUpperCase() + campo.slice(1)} actualizado correctamente`;
        try {
          const responseData = await res.json();
          successMessage = responseData.message || successMessage;
        } catch (jsonError) {
          // Response no es JSON, usando mensaje por defecto
        }
        
        setMensaje(successMessage);
        setCampoEditando({ ...campoEditando, [campo]: false });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Error al actualizar ${campo}`);
    } finally {
      setGuardando(null);
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords({ ...showPasswords, [field]: !showPasswords[field] });
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/');
    window.location.reload();
  };

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(true);
    setError('');
    setMensaje('');
  };

  const confirmDeleteAccount = () => {
    setShowDeleteConfirm(false);
    
    // Si es usuario de Google, eliminar directamente sin pedir contraseña
    if (isGoogleUser()) {
      submitDeleteAccountWithoutPassword();
    } else {
      // Si no es usuario de Google, pedir contraseña
      setShowPasswordModal(true);
      setDeletePassword('');
      setShowPasswordError(false);
    }
  };

  const cancelDeleteAccount = () => {
    setShowDeleteConfirm(false);
    setShowPasswordModal(false);
    setDeletePassword('');
    setShowPasswordError(false);
  };

  const submitDeleteAccountWithoutPassword = async () => {
    setDeletingAccount(true);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const res = await fetch('http://localhost:8080/api/usuarios/eliminar-cuenta', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password: 'GOOGLE_AUTH_USER' }) // Contraseña especial para usuarios de Google
      });

      if (!res.ok) {
        let errorMessage = 'Error al eliminar la cuenta';
        try {
          const errorData = await res.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          errorMessage = `Error ${res.status}: ${res.statusText}`;
        }
        throw new Error(errorMessage);
      }

      // Cuenta eliminada exitosamente
      localStorage.removeItem('authToken');
      setDeletingAccount(false);
      navigate('/');
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar la cuenta');
      setDeletingAccount(false);
    }
  };

  const submitDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      setShowPasswordError(true);
      return;
    }

    setDeletingAccount(true);
    setShowPasswordError(false);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const res = await fetch('http://localhost:8080/api/usuarios/eliminar-cuenta', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password: deletePassword })
      });

      if (!res.ok) {
        let errorMessage = 'Error al eliminar la cuenta';
        try {
          const errorData = await res.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          errorMessage = `Error ${res.status}: ${res.statusText}`;
        }
        throw new Error(errorMessage);
      }

      // Cuenta eliminada exitosamente
      localStorage.removeItem('authToken');
      setShowPasswordModal(false);
      setDeletePassword('');
      setDeletingAccount(false);
      navigate('/');
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar la cuenta');
      setDeletingAccount(false);
    }
  };

  if (loading) return (
    <div className={styles.perfilCont}>
      <div className={styles.loadingSpinner}>Cargando perfil...</div>
    </div>
  );

  return (
    <div className={styles.perfilCont}>
      <div className={styles.profileImageSection}>
        <div className={styles.profileImageContainer}>

          {usuario.googlePictureUrl && isValidImageUrl(usuario.googlePictureUrl) && !imageLoadError ? (
            <img
              src={useProxy ? createProxyUrl(usuario.googlePictureUrl) : usuario.googlePictureUrl}
              alt="Imagen de perfil de Google"
              className={styles.profileImage}
              style={{
                borderRadius: '50%',
                objectFit: 'cover',
                opacity: imageLoading ? 0.7 : 1,
                transition: 'opacity 0.3s ease'
              }}
              onLoadStart={() => {
                setImageLoading(true);
                setImageLoadError(false);
              }}
              onError={(e) => {
                const imgElement = e.currentTarget as HTMLImageElement;
                
                // Intentar obtener más información del error
                if (imgElement.naturalWidth === 0 && usuario.googlePictureUrl) {
                  // Si no estamos usando proxy, intentar activarlo
                  if (!useProxy) {
                    activateProxy();
                    return; // No continuar con el manejo de error normal
                  } else {
                    setImageLoadError(true);
                    setImageLoading(false);
                    imgElement.style.display = 'none';
                    const fallbackAvatar = imgElement.parentElement?.querySelector('.fallback-avatar');
                    if (fallbackAvatar) {
                      (fallbackAvatar as HTMLElement).style.display = 'flex';
                    }
                    return;
                  }
                }
                
                setImageLoadError(true);
                setImageLoading(false);
                
                // Ocultar la imagen de Google y mostrar el avatar genérico
                imgElement.style.display = 'none';
                const fallbackAvatar = imgElement.parentElement?.querySelector('.fallback-avatar');
                if (fallbackAvatar) {
                  (fallbackAvatar as HTMLElement).style.display = 'flex';
                }
              }}
              onLoad={(e) => {
                setImageLoading(false);
                setImageLoadError(false);
                // Asegurar que el avatar de fallback esté oculto
                const fallbackAvatar = e.currentTarget.parentElement?.querySelector('.fallback-avatar');
                if (fallbackAvatar) {
                  (fallbackAvatar as HTMLElement).style.display = 'none';
                }
              }}
            />
          ) : null}
          <div 
            className={`${styles.profileImage} fallback-avatar`}
            style={{
              display: (usuario.googlePictureUrl && isValidImageUrl(usuario.googlePictureUrl) && !imageLoadError) ? 'none' : 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '3rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: '50%',
              width: '100%',
              height: '100%',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
            }}
          >
            {selectedAvatar || generarAvatar(usuario.nombre)}
          </div>
          {/* Solo mostrar botón de editar si no tiene foto de Google */}
          {!usuario.googlePictureUrl && (
            <button 
              className={styles.profileImageEdit}
              onClick={openAvatarSelector}
              title="Modificar avatar"
            >
              <FaUserEdit />
            </button>
          )}
        </div>
      </div>
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
            <div className={styles.campoMostrar}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className={styles.campoValor}>{usuario.email}</span>
                <FaCheckCircle 
                  style={{ 
                    color: '#28a745', 
                    fontSize: '16px',
                    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
                  }} 
                  title="Email verificado"
                />
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: '#6c757d', 
                fontStyle: 'italic',
                marginTop: '4px'
              }}>
                El email no se puede modificar
              </div>
            </div>
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
                  onBlur={() => handlePhoneBlur(usuario.telefono, (newValue) => {
                    setUsuario({ ...usuario, telefono: newValue });
                  })}
                  placeholder="Ej: 612 345 678"
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

        {/* Campo Contraseña */}
        <div className={styles.campoContainer}>
          <div className={styles.campoHeader}>
            <FaLock className={styles.campoIcon} />
            <span className={styles.campoLabel}>Contraseña</span>
          </div>
          <div className={styles.campoContent}>
            {campoEditando.password ? (
              <div className={styles.campoEditando}>
                <div className={styles.passwordFields}>
                  {/* Contraseña Actual */}
                  <div className={styles.passwordField}>
                    <label className={styles.passwordLabel}>Contraseña Actual</label>
                    <div className={styles.passwordInputContainer}>
                      <input
                        className={styles.campoInput}
                        type={showPasswords.actual ? "text" : "password"}
                        name="passwordActual"
                        value={passwordData.passwordActual}
                        onChange={handlePasswordChange}
                        placeholder="Ingresa tu contraseña actual"
                        required
                      />
                      <button
                        type="button"
                        className={styles.passwordToggle}
                        onClick={() => togglePasswordVisibility('actual')}
                      >
                        {showPasswords.actual ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  {/* Nueva Contraseña */}
                  <div className={styles.passwordField}>
                    <label className={styles.passwordLabel}>Nueva Contraseña</label>
                    <div className={styles.passwordInputContainer}>
                      <input
                        className={styles.campoInput}
                        type={showPasswords.nueva ? "text" : "password"}
                        name="passwordNueva"
                        value={passwordData.passwordNueva}
                        onChange={handlePasswordChange}
                        placeholder="Ingresa tu nueva contraseña"
                        required
                      />
                      <button
                        type="button"
                        className={styles.passwordToggle}
                        onClick={() => togglePasswordVisibility('nueva')}
                      >
                        {showPasswords.nueva ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  {/* Confirmar Nueva Contraseña */}
                  <div className={styles.passwordField}>
                    <label className={styles.passwordLabel}>Confirmar Nueva Contraseña</label>
                    <div className={styles.passwordInputContainer}>
                      <input
                        className={styles.campoInput}
                        type={showPasswords.confirmar ? "text" : "password"}
                        name="passwordConfirmar"
                        value={passwordData.passwordConfirmar}
                        onChange={handlePasswordChange}
                        placeholder="Confirma tu nueva contraseña"
                        required
                      />
                      <button
                        type="button"
                        className={styles.passwordToggle}
                        onClick={() => togglePasswordVisibility('confirmar')}
                      >
                        {showPasswords.confirmar ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                </div>
                <div className={styles.campoBotones}>
                  <button 
                    type="button" 
                    className={styles.btnGuardar}
                    onClick={() => guardarCampo('password')}
                    disabled={guardando === 'password'}
                  >
                    {guardando === 'password' ? 'Guardando...' : <FaSave />}
                  </button>
                  <button 
                    type="button" 
                    className={styles.btnCancelar}
                    onClick={() => cancelarEdicion('password')}
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.campoMostrar}>
                <span className={styles.campoValor}>••••••••</span>
                <button 
                  type="button" 
                  className={styles.btnEditar}
                  onClick={() => iniciarEdicion('password')}
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

      {/* Sección de eliminar cuenta */}
      <div className={styles.deleteAccountSection}>
        <div className={styles.deleteAccountHeader}>
          <FaTrash className={styles.deleteAccountIcon} />
          <span className={styles.deleteAccountTitle}>Eliminar Cuenta</span>
        </div>
        <div className={styles.deleteAccountContent}>
          <button 
            className={styles.deleteAccountBtn}
            onClick={handleDeleteAccount}
            disabled={deletingAccount}
          >
            {deletingAccount ? (
              <>
                <div className={styles.spinner}></div>
                Eliminando cuenta...
              </>
            ) : (
              <>
                <FaTrash />
                Eliminar mi cuenta
              </>
            )}
          </button>
        </div>
      </div>

      {/* Sección de Google Calendar - Comentada temporalmente */}
      {/* <GoogleCalendarInfo /> */}

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className={styles.modalOverlay} onClick={cancelDeleteAccount}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <FaTrash className={styles.modalIcon} />
              <h3 className={styles.modalTitle}>Confirmar Eliminación</h3>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.modalText}>
                ¿Estás seguro de que quieres eliminar tu cuenta? Esta acción es irreversible y no se puede deshacer.
              </p>
              {isGoogleUser() && (
                <div className={styles.modalInfo}>
                  <strong>ℹ️ Nota:</strong> Como usuario de Google, no necesitarás ingresar contraseña.
                </div>
              )}
              <div className={styles.modalWarning}>
                <strong>⚠️ Advertencia:</strong>
                <ul>
                  <li>Se eliminarán todos tus datos personales</li>
                  <li>Se cancelarán todas tus citas pendientes</li>
                  <li>No podrás recuperar tu cuenta</li>
                  <li>Perderás acceso a todos los servicios</li>
                </ul>
              </div>
            </div>
            <div className={styles.modalActions}>
              <button 
                className={styles.modalBtnCancel}
                onClick={cancelDeleteAccount}
              >
                Cancelar
              </button>
              <button 
                className={styles.modalBtnConfirm}
                onClick={confirmDeleteAccount}
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de contraseña */}
      {showPasswordModal && (
        <div className={styles.modalOverlay} onClick={cancelDeleteAccount}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <FaLock className={styles.modalIcon} />
              <h3 className={styles.modalTitle}>Confirmar Contraseña</h3>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.modalText}>
                Por favor, ingresa tu contraseña para confirmar la eliminación de tu cuenta:
              </p>
              <div className={styles.passwordInputContainer}>
                <input
                  type="password"
                  className={`${styles.modalInput} ${showPasswordError ? styles.inputError : ''}`}
                  value={deletePassword}
                  onChange={(e) => {
                    setDeletePassword(e.target.value);
                    setShowPasswordError(false);
                  }}
                  placeholder="Ingresa tu contraseña"
                  autoFocus
                />
                {showPasswordError && (
                  <div className={styles.errorMessage}>
                    La contraseña es requerida
                  </div>
                )}
              </div>
            </div>
            <div className={styles.modalActions}>
              <button 
                className={styles.modalBtnCancel}
                onClick={cancelDeleteAccount}
                disabled={deletingAccount}
              >
                Cancelar
              </button>
              <button 
                className={styles.modalBtnConfirm}
                onClick={submitDeleteAccount}
                disabled={deletingAccount}
              >
                {deletingAccount ? (
                  <>
                    <div className={styles.spinner}></div>
                    Eliminando...
                  </>
                ) : (
                  'Eliminar Cuenta'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal selector de avatares */}
      {showAvatarSelector && (
        <div className={styles.modalOverlay} onClick={() => setShowAvatarSelector(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <FaUser className={styles.modalIcon} />
              <h3 className={styles.modalTitle}>Seleccionar Avatar</h3>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.modalText}>
                Elige un avatar para tu perfil:
              </p>
              <div className={styles.avatarGrid}>
                {avataresMejorados.map((avatar, index) => (
                  <button
                    key={index}
                    className={`${styles.avatarOption} ${selectedAvatar === avatar ? styles.avatarSelected : ''}`}
                    onClick={() => handleAvatarSelection(avatar)}
                    style={{
                      fontSize: '1.8rem',
                      padding: '8px',
                      border: selectedAvatar === avatar ? '3px solid #667eea' : '2px solid #444',
                      borderRadius: '50%',
                      background: selectedAvatar === avatar ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#2a2a2a',
                      color: selectedAvatar === avatar ? 'white' : '#fff',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      width: '50px',
                      height: '50px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '50px',
                      minHeight: '50px'
                    }}
                  >
                    {avatar}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.modalActions}>
              <button 
                className={styles.modalBtnCancel}
                onClick={() => setShowAvatarSelector(false)}
              >
                Cancelar
              </button>
              <button 
                className={styles.modalBtnConfirm}
                onClick={() => {
                  setShowAvatarSelector(false);
                  // Aquí podrías guardar el avatar en el backend
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Perfil; 