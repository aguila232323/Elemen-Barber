import React, { useState, useEffect } from 'react';
import { FaStar, FaTimes, FaSave } from 'react-icons/fa';

interface ResenaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (calificacion: number, comentario: string) => void;
  citaId: number;
  servicioNombre: string;
  loading?: boolean;
}

const ResenaModal: React.FC<ResenaModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  citaId,
  servicioNombre,
  loading = false
}) => {
  const [calificacion, setCalificacion] = useState(0);
  const [comentario, setComentario] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Manejar el resize de la ventana
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (calificacion === 0) {
      alert('Por favor selecciona una calificación');
      return;
    }
    onSubmit(calificacion, comentario);
  };

  const handleStarClick = (star: number) => {
    setCalificacion(star);
  };

  const handleStarHover = (star: number) => {
    setHoveredStar(star);
  };

  const handleStarLeave = () => {
    setHoveredStar(0);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.85)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backdropFilter: 'blur(5px)',
      padding: '1rem'
    }} onClick={onClose}>
      <div style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
        color: '#fff',
        borderRadius: '16px',
        padding: windowWidth <= 768 ? '1.5rem' : '2.5rem',
        width: '100%',
        maxWidth: windowWidth <= 480 ? '95%' : windowWidth <= 768 ? '90%' : '500px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 80px rgba(0,0,0,0.8), 0 10px 30px rgba(100, 181, 246, 0.4)',
        position: 'relative',
        border: '1px solid rgba(100, 181, 246, 0.3)'
      }} onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: windowWidth <= 480 ? '0.8rem' : '1.2rem',
          marginBottom: windowWidth <= 768 ? '1.5rem' : '2rem',
          borderBottom: '2px solid rgba(100, 181, 246, 0.2)',
          paddingBottom: windowWidth <= 768 ? '1rem' : '1.2rem',
          flexDirection: windowWidth <= 480 ? 'column' : 'row',
          textAlign: windowWidth <= 480 ? 'center' : 'left'
        }}>
          <div style={{
            width: windowWidth <= 480 ? '50px' : '60px',
            height: windowWidth <= 480 ? '50px' : '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #64b5f6, #1976d2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: windowWidth <= 480 ? '1.5rem' : '1.8rem',
            color: '#fff',
            boxShadow: '0 4px 15px rgba(100, 181, 246, 0.4)',
            flexShrink: 0
          }}>
            ⭐
          </div>
          <div>
            <h3 style={{
              margin: 0,
              fontSize: windowWidth <= 480 ? '1.2rem' : windowWidth <= 768 ? '1.3rem' : '1.4rem',
              fontWeight: 700,
              color: '#64b5f6',
              textShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}>Añadir Reseña</h3>
            <p style={{
              margin: '0.3rem 0 0 0',
              fontSize: windowWidth <= 480 ? '0.85rem' : '0.95rem',
              color: '#bdc3c7',
              lineHeight: '1.4'
            }}>Comparte tu experiencia con este servicio</p>
          </div>
        </div>

        {/* Información del servicio */}
        <div style={{
          background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #0f0f0f 100%)',
          borderRadius: '12px',
          padding: windowWidth <= 768 ? '1rem' : '1.5rem',
          marginBottom: windowWidth <= 768 ? '1.5rem' : '2rem',
          border: '1px solid rgba(100, 181, 246, 0.4)',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.4)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            padding: '0.5rem',
            borderRadius: '8px',
            background: 'rgba(255,255,255,0.05)',
            flexDirection: windowWidth <= 480 ? 'column' : 'row',
            textAlign: windowWidth <= 480 ? 'center' : 'left'
          }}>
            <span style={{ 
              fontWeight: 600, 
              color: '#64b5f6', 
              fontSize: windowWidth <= 480 ? '0.8rem' : '0.9rem' 
            }}>💇 Servicio:</span>
            <span style={{ 
              color: '#ecf0f1', 
              fontSize: windowWidth <= 480 ? '0.85rem' : '0.95rem',
              wordBreak: 'break-word'
            }}>{servicioNombre}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Calificación con estrellas */}
          <div style={{ marginBottom: windowWidth <= 768 ? '1.5rem' : '2rem' }}>
            <label style={{
              display: 'block',
              marginBottom: windowWidth <= 768 ? '0.8rem' : '1rem',
              fontSize: windowWidth <= 480 ? '0.9rem' : '1rem',
              fontWeight: 600,
              color: '#64b5f6',
              textAlign: windowWidth <= 480 ? 'center' : 'left'
            }}>
              Calificación *
            </label>
            <div style={{
              display: 'flex',
              gap: windowWidth <= 480 ? '0.3rem' : '0.5rem',
              justifyContent: 'center',
              marginBottom: windowWidth <= 768 ? '0.8rem' : '1rem',
              flexWrap: 'wrap'
            }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleStarClick(star)}
                  onMouseEnter={() => handleStarHover(star)}
                  onMouseLeave={handleStarLeave}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: windowWidth <= 480 ? '2rem' : windowWidth <= 768 ? '2.2rem' : '2.5rem',
                    cursor: 'pointer',
                    color: (hoveredStar >= star || calificacion >= star) ? '#ffd700' : '#666',
                    transition: 'all 0.3s ease',
                    transform: (hoveredStar >= star || calificacion >= star) ? 'scale(1.1)' : 'scale(1)',
                    padding: windowWidth <= 480 ? '0.2rem' : '0.3rem'
                  }}
                >
                  <FaStar />
                </button>
              ))}
            </div>
            <p style={{
              textAlign: 'center',
              fontSize: windowWidth <= 480 ? '0.8rem' : '0.9rem',
              color: '#bdc3c7',
              margin: 0
            }}>
              {calificacion === 0 && 'Selecciona una calificación'}
              {calificacion === 1 && 'Muy malo'}
              {calificacion === 2 && 'Malo'}
              {calificacion === 3 && 'Regular'}
              {calificacion === 4 && 'Bueno'}
              {calificacion === 5 && 'Excelente'}
            </p>
          </div>

          {/* Comentario */}
          <div style={{ marginBottom: windowWidth <= 768 ? '1.5rem' : '2rem' }}>
            <label style={{
              display: 'block',
              marginBottom: windowWidth <= 768 ? '0.6rem' : '0.8rem',
              fontSize: windowWidth <= 480 ? '0.9rem' : '1rem',
              fontWeight: 600,
              color: '#64b5f6',
              textAlign: windowWidth <= 480 ? 'center' : 'left'
            }}>
              Comentario (opcional)
            </label>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Comparte tu experiencia con este servicio..."
              style={{
                width: '100%',
                minHeight: windowWidth <= 480 ? '100px' : '120px',
                padding: windowWidth <= 768 ? '0.8rem' : '1rem',
                borderRadius: '12px',
                border: '2px solid rgba(100, 181, 246, 0.3)',
                background: 'rgba(255,255,255,0.05)',
                color: '#fff',
                fontSize: windowWidth <= 480 ? '0.85rem' : '0.95rem',
                outline: 'none',
                transition: 'all 0.3s ease',
                resize: 'vertical'
              }}
              maxLength={1000}
            />
            <div style={{
              textAlign: 'right',
              fontSize: windowWidth <= 480 ? '0.7rem' : '0.8rem',
              color: '#888',
              marginTop: '0.5rem'
            }}>
              {comentario.length}/1000 caracteres
            </div>
          </div>

          {/* Botones */}
          <div style={{
            display: 'flex',
            gap: windowWidth <= 480 ? '0.5rem' : '1rem',
            justifyContent: windowWidth <= 480 ? 'center' : 'flex-end',
            flexDirection: windowWidth <= 480 ? 'column' : 'row'
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #6c757d, #5a6268)',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                padding: windowWidth <= 480 ? '0.8rem 1.5rem' : '0.9rem 1.8rem',
                fontSize: windowWidth <= 480 ? '0.85rem' : '0.95rem',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 3px 10px rgba(108, 117, 125, 0.3)',
                opacity: loading ? 0.7 : 1,
                width: windowWidth <= 480 ? '100%' : 'auto'
              }}
              onMouseOver={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 5px 15px rgba(108, 117, 125, 0.4)';
                }
              }}
              onMouseOut={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 3px 10px rgba(108, 117, 125, 0.3)';
                }
              }}
            >
              <FaTimes style={{marginRight: '0.5rem'}} />
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || calificacion === 0}
              style={{
                background: 'linear-gradient(135deg, #64b5f6, #1976d2)',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                padding: windowWidth <= 480 ? '0.8rem 1.5rem' : '0.9rem 1.8rem',
                fontSize: windowWidth <= 480 ? '0.85rem' : '0.95rem',
                fontWeight: 600,
                cursor: (loading || calificacion === 0) ? 'not-allowed' : 'pointer',
                opacity: (loading || calificacion === 0) ? 0.7 : 1,
                transition: 'all 0.3s ease',
                boxShadow: '0 3px 10px rgba(100, 181, 246, 0.3)',
                width: windowWidth <= 480 ? '100%' : 'auto'
              }}
              onMouseOver={(e) => {
                if (!loading && calificacion !== 0) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 5px 15px rgba(100, 181, 246, 0.4)';
                }
              }}
              onMouseOut={(e) => {
                if (!loading && calificacion !== 0) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 3px 10px rgba(100, 181, 246, 0.3)';
                }
              }}
            >
              {loading ? (
                <>
                  <span style={{marginRight: '0.5rem'}}>⏳</span>
                  Guardando...
                </>
              ) : (
                <>
                  <FaSave style={{marginRight: '0.5rem'}} />
                  Guardar Reseña
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResenaModal; 