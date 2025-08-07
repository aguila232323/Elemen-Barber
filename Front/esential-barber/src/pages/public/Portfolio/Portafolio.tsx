import React, { useState, useEffect, useRef } from 'react'
import styles from './Portafolio.module.css'
import { useAuth } from '../../../context/AuthContext'
import { FaPlus, FaTrash, FaTimes } from 'react-icons/fa'

interface Foto {
  id: number;
  nombre: string;
  imagenBase64: string;
  urlInstagram: string;
  fechaCreacion: string;
  activo: boolean;
}

const Portafolio: React.FC = () => {
  const { user } = useAuth();
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [activeInstaUrl, setActiveInstaUrl] = useState('');
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isAdmin] = useState(user?.rol === 'ADMIN');
  const embedRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cargar fotos del portfolio
  const cargarFotos = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/portfolio/fotos');
      if (!response.ok) {
        throw new Error('Error al cargar las fotos');
      }
      const data = await response.json();
      setFotos(data);
    } catch (err) {
      setError('Error al cargar las fotos del portfolio');
      console.error('Error cargando fotos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarFotos();
  }, []);

  useEffect(() => {
    if (modalOpen && activeInstaUrl) {
      // Cargar el script solo si no existe
      if (!document.querySelector('script[src="https://www.instagram.com/embed.js"]')) {
        const script = document.createElement('script');
        script.src = 'https://www.instagram.com/embed.js';
        script.async = true;
        document.body.appendChild(script);
        script.onload = () => {
          const w = window as any;
          if (w.instgrm && w.instgrm.Embeds && typeof w.instgrm.Embeds.process === 'function') {
            w.instgrm.Embeds.process();
          }
        };
      } else {
        // Si el script ya está cargado, forzar el procesado
        setTimeout(() => {
          const w = window as any;
          if (w.instgrm && w.instgrm.Embeds && typeof w.instgrm.Embeds.process === 'function') {
            w.instgrm.Embeds.process();
          }
        }, 100);
      }
    }
  }, [modalOpen, activeInstaUrl]);

  const handleFotoClick = (instaUrl: string) => {
    if (instaUrl) {
      setActiveInstaUrl(instaUrl);
      setModalOpen(true);
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona solo archivos de imagen.');
        return;
      }
      
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen es demasiado grande. Máximo 5MB.');
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleAddPhoto = async () => {
    if (!selectedFile) {
      alert('Por favor selecciona una imagen.');
      return;
    }

    try {
      setUploading(true);
      const base64 = await convertToBase64(selectedFile);
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('No tienes permisos para realizar esta acción.');
        return;
      }

      const response = await fetch('http://localhost:8080/api/portfolio/admin/añadir', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nombre: selectedFile.name,
          imagenBase64: base64,
          urlInstagram: ''
        })
      });

      if (!response.ok) {
        throw new Error('Error al subir la imagen');
      }

      const result = await response.json();
      
      // Recargar las fotos
      await cargarFotos();
      
      setSelectedFile(null);
      setAdminModalOpen(false);
      
      // Limpiar el input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      alert('Error al procesar la imagen.');
      console.error('Error subiendo foto:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (id: number) => {
    setPhotoToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDeletePhoto = async () => {
    if (!photoToDelete) return;

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('No tienes permisos para realizar esta acción.');
        return;
      }

      const response = await fetch(`http://localhost:8080/api/portfolio/admin/eliminar/${photoToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la foto');
      }

      await cargarFotos();
      setDeleteModalOpen(false);
      setPhotoToDelete(null);
    } catch (error) {
      alert('Error al eliminar la foto.');
      console.error('Error eliminando foto:', error);
    }
  };

  const openAdminModal = () => {
    setAdminModalOpen(true);
  };

  if (loading) {
    return (
      <div className={styles.portafolioContainer}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <div className={styles.loadingText}>Cargando portfolio...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.portafolioContainer}>
        <div className={styles.errorContainer}>
          <div className={styles.errorText}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.portafolioContainer}>
      <section className={styles.portafolioSection}>
        <h2 className={styles.portafolioTitulo}></h2>
        <div className={styles.portafolioContent}>
          <div className={styles.galeria}>
            {fotos.map((foto) => (
              <div
                key={foto.id}
                className={`${styles.foto} ${foto.urlInstagram ? styles.fotoClickable : ''}`}
                style={{backgroundImage: `url(${foto.imagenBase64})`}}
                onClick={() => handleFotoClick(foto.urlInstagram)}
                role={foto.urlInstagram ? "button" : undefined}
                tabIndex={foto.urlInstagram ? 0 : undefined}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleFotoClick(foto.urlInstagram);
                  }
                }}
                aria-label={foto.urlInstagram ? "Ver en Instagram" : "Imagen del portafolio"}
              >
                {isAdmin && (
                  <button
                    className={styles.deletePhotoBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePhoto(foto.id);
                    }}
                    aria-label="Eliminar imagen"
                    title="Eliminar imagen del portfolio"
                  >
                    <FaTrash />
                    <span>Eliminar</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Botón flotante de admin */}
        {isAdmin && (
          <div className={styles.adminButtons}>
            <button
              className={styles.addPhotoBtn}
              onClick={openAdminModal}
              aria-label="Añadir imagen"
              title="Añadir imagen al portfolio"
            >
              <FaPlus />
              <span>Añadir Imagen</span>
            </button>
          </div>
        )}
        
        {/* Modal de Instagram */}
        {modalOpen && activeInstaUrl && (
          <div className={styles.modalOverlay} onClick={() => setModalOpen(false)}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()} ref={embedRef}>
              <button
                className={styles.modalCloseBtn}
                onClick={() => setModalOpen(false)}
                aria-label="Cerrar"
              >
                <span className={styles.closeIcon}>✕</span>
              </button>
              <div
                className={styles.instagramEmbed}
                dangerouslySetInnerHTML={{
                  __html: `<blockquote class='instagram-media' data-instgrm-permalink='${activeInstaUrl}' data-instgrm-version='14' style='background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 1px; max-width:400px; min-width:326px; padding:0; width:100%;'><a href='${activeInstaUrl}' target='_blank'></a></blockquote>`
                }}
              />
            </div>
          </div>
        )}

        {/* Modal de admin para añadir fotos */}
        {adminModalOpen && (
          <div className={styles.adminModalOverlay} onClick={() => setAdminModalOpen(false)}>
            <div className={styles.adminModalContent} onClick={e => e.stopPropagation()}>
              <div className={styles.adminModalHeader}>
                <h3>Añadir Nueva Foto</h3>
                <button
                  className={styles.adminModalCloseBtn}
                  onClick={() => setAdminModalOpen(false)}
                  aria-label="Cerrar"
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className={styles.adminModalBody}>
                <div className={styles.fileInputContainer}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className={styles.fileInput}
                    id="photo-upload"
                  />
                  <label htmlFor="photo-upload" className={styles.fileInputLabel}>
                    <FaPlus />
                    <span>Seleccionar Imagen</span>
                  </label>
                </div>
                
                {selectedFile && (
                  <div className={styles.selectedFileInfo}>
                    <p>Archivo seleccionado: {selectedFile.name}</p>
                    <p>Tamaño: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                )}
                
                <div className={styles.adminModalActions}>
                  <button
                    className={styles.cancelBtn}
                    onClick={() => setAdminModalOpen(false)}
                    disabled={uploading}
                  >
                    Cancelar
                  </button>
                  <button
                    className={styles.addBtn}
                    onClick={handleAddPhoto}
                    disabled={!selectedFile || uploading}
                  >
                    {uploading ? 'Subiendo...' : 'Añadir Foto'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de confirmación de eliminación */}
        {deleteModalOpen && (
          <div className={styles.deleteModalOverlay} onClick={() => setDeleteModalOpen(false)}>
            <div className={styles.deleteModalContent} onClick={e => e.stopPropagation()}>
              <div className={styles.deleteModalHeader}>
                <h3>Confirmar Eliminación</h3>
                <button
                  className={styles.deleteModalCloseBtn}
                  onClick={() => setDeleteModalOpen(false)}
                  aria-label="Cerrar"
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className={styles.deleteModalBody}>
                <div className={styles.deleteModalIcon}>
                  <FaTrash />
                </div>
                <p className={styles.deleteModalText}>
                  ¿Estás seguro de que quieres eliminar esta imagen del portfolio?
                </p>
                <p className={styles.deleteModalWarning}>
                  Esta acción no se puede deshacer.
                </p>
              </div>
              
              <div className={styles.deleteModalActions}>
                <button
                  className={styles.cancelDeleteBtn}
                  onClick={() => setDeleteModalOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  className={styles.confirmDeleteBtn}
                  onClick={confirmDeletePhoto}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default Portafolio
