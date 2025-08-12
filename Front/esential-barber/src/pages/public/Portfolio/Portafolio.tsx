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

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
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
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Validar tipos de archivo
    const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      alert('Por favor selecciona solo archivos de imagen.');
      return;
    }
    
    // Validar tamaños (máximo 5MB cada uno)
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert('Algunas imágenes son demasiado grandes. Máximo 5MB por imagen.');
      return;
    }
    
    setSelectedFiles(files);
  };

  const handleAddPhotos = async () => {
    if (selectedFiles.length === 0) {
      alert('Por favor selecciona al menos una imagen.');
      return;
    }

    try {
      setUploading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('No tienes permisos para realizar esta acción.');
        return;
      }

      // Subir cada archivo individualmente
      for (const file of selectedFiles) {
        try {
          const base64 = await convertToBase64(file);
          
          const response = await fetch('http://localhost:8080/api/portfolio/admin/añadir', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              nombre: file.name,
              imagenBase64: base64,
              urlInstagram: ''
            })
          });

          if (!response.ok) {
            // Error al subir archivo
          }
        } catch (error) {
          // Error procesando archivo
        }
      }
      
      // Recargar las fotos
      await cargarFotos();
      
      setSelectedFiles([]);
      setAdminModalOpen(false);
      
      // Limpiar el input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      alert('Error al procesar las imágenes.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (id: number) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('No tienes permisos para realizar esta acción.');
        return;
      }

      const response = await fetch(`http://localhost:8080/api/portfolio/admin/eliminar/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la foto');
      }

      await cargarFotos();
    } catch (error) {
      alert('Error al eliminar la foto.');
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
              <span>Añadir Imágenes</span>
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
                <h3>Añadir Nuevas Fotos</h3>
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
                    multiple
                    onChange={handleFileSelect}
                    className={styles.fileInput}
                    id="photo-upload"
                  />
                  <label htmlFor="photo-upload" className={styles.fileInputLabel}>
                    <FaPlus />
                    <span>Seleccionar Imágenes</span>
                  </label>
                </div>
                
                {selectedFiles.length > 0 && (
                  <div className={styles.selectedFileInfo}>
                    <p>Archivos seleccionados: {selectedFiles.length}</p>
                    {selectedFiles.map((file, index) => (
                      <div key={index} className={styles.fileItem}>
                        <span>📷 {file.name}</span>
                        <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                    ))}
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
                    onClick={handleAddPhotos}
                    disabled={selectedFiles.length === 0 || uploading}
                  >
                    {uploading ? 'Subiendo...' : `Añadir ${selectedFiles.length} Foto${selectedFiles.length !== 1 ? 's' : ''}`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}


      </section>
    </div>
  );
}

export default Portafolio
