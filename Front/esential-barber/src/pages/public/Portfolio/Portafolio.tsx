import React, { useState, useEffect, useRef } from 'react'
import styles from './Portafolio.module.css'
import { useAuth } from '../../../context/AuthContext'
import { FaPlus, FaTrash, FaTimes } from 'react-icons/fa'
import { config } from '../../../config/config'
import { ImageService } from '../../../services/imageService'
import ImageDisplay from '../../../components/ImageDisplay'

interface Foto {
  id: number;
  nombre: string;
  imagenUrl: string;
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
      const response = await fetch(`${config.API_BASE_URL}/api/portfolio/fotos`);
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



  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Validar cada archivo
    for (const file of files) {
      const validation = ImageService.validateImageFile(file);
      if (!validation.isValid) {
        alert(validation.error);
        return;
      }
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

      let uploadedCount = 0;
      let errors: string[] = [];

      // Subir cada archivo individualmente
      for (const file of selectedFiles) {
        try {
          // Comprimir la imagen antes de subirla
          const compressedFile = await ImageService.compressImage(file, 1920, 0.8);
          
          // Subir usando FormData (más eficiente que Base64)
          const formData = new FormData();
          formData.append('file', compressedFile);

          const uploadResponse = await fetch(`${config.API_BASE_URL}/api/files/upload`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          });

          if (!uploadResponse.ok) {
            throw new Error('Error al subir la imagen al servidor');
          }

          const uploadResult = await uploadResponse.json();
          
          // Ahora crear la entrada en el portfolio
          const portfolioResponse = await fetch(`${config.API_BASE_URL}/api/portfolio/admin/añadir`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              nombre: file.name,
              imagenUrl: `/api/files/${uploadResult.fileName}`,
              urlInstagram: ''
            })
          });

          if (!portfolioResponse.ok) {
            // Si falla, eliminar el archivo subido
            await fetch(`${config.API_BASE_URL}/api/files/${uploadResult.fileName}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            throw new Error('Error al crear la entrada en el portfolio');
          }

          uploadedCount++;
        } catch (error) {
          console.error('Error subiendo archivo:', file.name, error);
          errors.push(`${file.name}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
      }
      
      // Mostrar resultados
      if (uploadedCount > 0) {
        alert(`${uploadedCount} imagen(es) subida(s) exitosamente.`);
        // Recargar las fotos
        await cargarFotos();
      }
      
      if (errors.length > 0) {
        console.error('Errores al subir archivos:', errors);
        alert(`Errores al subir ${errors.length} archivo(s). Revisa la consola para más detalles.`);
      }
      
      setSelectedFiles([]);
      setAdminModalOpen(false);
      
      // Limpiar el input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error general al procesar las imágenes:', error);
      alert('Error al procesar las imágenes.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta foto permanentemente?')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('No tienes permisos para realizar esta acción.');
        return;
      }

      const response = await fetch(`${config.API_BASE_URL}/api/portfolio/admin/eliminar-permanente/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Foto eliminada correctamente.');
        await cargarFotos();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Error al eliminar la foto.');
      }
    } catch (error) {
      console.error('Error al eliminar la foto:', error);
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
                <ImageDisplay
                  src={foto.imagenUrl}
                  alt={`Portfolio image: ${foto.nombre}`}
                  className={styles.fotoImage}
                />
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
