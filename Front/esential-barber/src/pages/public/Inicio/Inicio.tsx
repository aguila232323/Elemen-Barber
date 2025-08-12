import React, { useState, useEffect } from 'react'
import styles from './Inicio.module.css'
import { FaClock, FaUser, FaMapMarkerAlt } from 'react-icons/fa';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectCoverflow } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import { useServicios } from '../../../hooks/useServicios';

const reviews = [
  { 
    text: 'Excelente servicio y atención. ¡Repetiré sin duda! El ambiente es increíble y el resultado perfecto.', 
    author: 'Juan Pérez', 
    rating: 5,
    company: 'Cliente Regular',
    avatar: '👨‍💼'
  },
  { 
    text: 'El mejor corte de mi vida, muy recomendado. Luis es un verdadero profesional.', 
    author: 'Carlos Gómez', 
    rating: 5,
    company: 'Cliente VIP',
    avatar: '👨‍🦱'
  },
  { 
    text: 'Ambiente agradable y profesionales de primera. El trato es excepcional.', 
    author: 'Luis Martínez', 
    rating: 4,
    company: 'Cliente Frecuente',
    avatar: '👨‍🦳'
  },
  { 
    text: 'Muy buen trato y resultados espectaculares. Definitivamente volveré.', 
    author: 'Ana Torres', 
    rating: 5,
    company: 'Cliente Satisfecha',
    avatar: '👩‍💼'
  },
  { 
    text: 'Rápidos y muy profesionales. El mejor servicio de barbería que he probado.', 
    author: 'Pedro Ruiz', 
    rating: 4,
    company: 'Cliente Leal',
    avatar: '👨‍🦲'
  },
  { 
    text: 'Increíble experiencia. El detalle en cada corte es impresionante.', 
    author: 'María García', 
    rating: 5,
    company: 'Cliente Premium',
    avatar: '👩‍🦰'
  },
];

const getStars = (rating: number) => '★'.repeat(rating) + '☆'.repeat(5 - rating);

const bannerImg = 'https://static.vecteezy.com/system/resources/previews/005/121/041/non_2x/hairdressers-cut-their-clients-in-barbershop-advertising-and-barber-shop-concept-free-photo.jpg';

const getUserName = () => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    const payload = JSON.parse(jsonPayload);
    return payload.nombre || payload.name || payload.email || 'Usuario';
  } catch {
    return null;
  }
};

const Inicio: React.FC = () => {
  const userName = getUserName();
  const { servicios, loading, error } = useServicios();
  const [resenas, setResenas] = useState<any[]>([]);
  const [estadisticasResenas, setEstadisticasResenas] = useState<any>({});
  const [loadingResenas, setLoadingResenas] = useState(true);

  // Cargar reseñas públicas
  useEffect(() => {
    const cargarResenas = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/resenas/publicas', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          mode: 'cors'
        });
        if (res.ok) {
          const data = await res.json();
          setResenas(data.resenas || []);
          setEstadisticasResenas(data.estadisticas || {});
        } else {
          console.error('Error en la respuesta:', res.status, res.statusText);
        }
      } catch (error) {
        console.error('Error cargando reseñas:', error);
      } finally {
        setLoadingResenas(false);
      }
    };

    cargarResenas();
  }, []);
  
  return (
    <>
      {/* Banner Principal */}
      <div className={styles.heroBanner}>
        <img
          src={bannerImg}
          alt="Barbería panorámica"
          className={styles.heroImage}
        />
        <div className={styles.heroContent}>
          <span className={styles.heroTitle}>
            ELEMEN
          </span>
          <span className={styles.heroSubtitle}>
            BARBER STUDIO
          </span>
        </div>
      </div>

      {/* Barra de Información */}
      <div className={styles.infoBar}>
        {/* Horario */}
        <span className={styles.infoItem}>
          <span className={styles.infoIcon}>
            <FaClock />
          </span>
          <span className={styles.infoContent}>
            <span className={styles.infoTitle}>Martes - Sábado</span>
            <span className={styles.infoSubtitle}>
              <span className={styles.desktopText}>9:00 - 21:15 (Sábados hasta 15:00)</span>
              <span className={styles.mobileText}>9:00 - 21:15</span>
            </span>
          </span>
        </span>
        
        {/* Peluquero */}
        <span className={styles.infoItem}>
          <span className={styles.infoIcon}>
            <FaUser />
          </span>
          <span className={styles.infoContent}>
            <span className={styles.infoTitle}>Luis</span>
            <span className={styles.infoSubtitle}>
              <span className={styles.desktopText}>Barbero principal</span>
              <span className={styles.mobileText}>Barbero</span>
            </span>
          </span>
        </span>
        
        {/* Ubicación */}
        <span className={styles.infoItem}>
          <span className={styles.infoIcon}>
            <FaMapMarkerAlt />
          </span>
          <span className={styles.infoContent}>
            <span className={styles.infoTitle}>4 Paseo Dr. Revuelta</span>
            <span className={styles.infoSubtitle}>
              <span className={styles.desktopText}>Begíjar, Andalucía</span>
              <span className={styles.mobileText}>Begíjar</span>
            </span>
          </span>
        </span>
      </div>

      {/* Reviews Carrusel */}
      <div className={styles.reviewsSection}>
        <div className={styles.reviewsTitle}>
          <h2>Lo que opinan nuestros clientes</h2>
          <div className={styles.reviewsRating}>
            <span className={styles.reviewsStars}>
              {estadisticasResenas.promedioCalificacion ? 
                '★'.repeat(Math.round(estadisticasResenas.promedioCalificacion)) + 
                '☆'.repeat(5 - Math.round(estadisticasResenas.promedioCalificacion)) : 
                '★★★★★'
              }
            </span>
            <span className={styles.reviewsScore}>
              {estadisticasResenas.promedioCalificacion ? 
                `${estadisticasResenas.promedioCalificacion}/5` : 
                '4.9/5'
              }
            </span>
          </div>
        </div>

        <div className={styles.reviewsContainer}>
          <Swiper
            modules={[Autoplay, EffectCoverflow]}
            slidesPerView={3}
            centeredSlides={true}
            loop={true}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            effect="coverflow"
            coverflowEffect={{ 
              rotate: 0, 
              stretch: 0, 
              depth: 150, 
              modifier: 2.5, 
              slideShadows: true
            }}
            style={{ padding: '2rem 0' }}
            slidesOffsetBefore={80}
            slidesOffsetAfter={32}
            breakpoints={{
              0: { 
                slidesPerView: 1.2, 
                centeredSlides: false, 
                slidesOffsetBefore: 10, 
                slidesOffsetAfter: 10,
                coverflowEffect: { depth: 30, modifier: 0.8 }
              },
              480: { 
                slidesPerView: 1.5, 
                centeredSlides: false, 
                slidesOffsetBefore: 15, 
                slidesOffsetAfter: 15,
                coverflowEffect: { depth: 50, modifier: 1 }
              },
              600: { 
                slidesPerView: 2.2, 
                centeredSlides: false, 
                slidesOffsetBefore: 20, 
                slidesOffsetAfter: 20,
                coverflowEffect: { depth: 80, modifier: 1.5 }
              },
              900: { 
                slidesPerView: 3.2, 
                centeredSlides: false, 
                slidesOffsetBefore: 40, 
                slidesOffsetAfter: 40,
                coverflowEffect: { depth: 120, modifier: 2 }
              }
            }}
          >
            {(loadingResenas ? reviews : resenas.length > 0 ? resenas : reviews).map((review, idx) => {
              const colors = [
                { bg: '#2c3e50', text: '#fff', accent: '#3498db' },
                { bg: '#e74c3c', text: '#fff', accent: '#f39c12' },
                { bg: '#27ae60', text: '#fff', accent: '#2ecc71' },
                { bg: '#8e44ad', text: '#fff', accent: '#9b59b6' },
                { bg: '#f39c12', text: '#fff', accent: '#e67e22' },
                { bg: '#34495e', text: '#fff', accent: '#3498db' }
              ];
              const color = colors[idx % colors.length];
              
              return (
                <SwiperSlide key={idx}>
                  <div style={{
                    background: color.bg,
                    color: color.text,
                    borderRadius: '20px',
                    padding: '1.8rem',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    cursor: 'pointer',
                    minHeight: '280px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    border: `2px solid ${color.accent}20`,
                    backdropFilter: 'blur(10px)',
                    transform: 'translateZ(0)',
                    margin: '0 0.5rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateZ(20px) scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateZ(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.4)';
                  }}>
                    
                    <div>
                      <p style={{
                        fontSize: '1.2rem',
                        lineHeight: '1.7',
                        marginBottom: '2rem',
                        fontStyle: 'italic',
                        textAlign: 'center'
                      }}>
                        "{resenas.length > 0 && !loadingResenas ? review.comentario : review.text}"
                      </p>
                      
                      <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '0.3rem',
                        marginBottom: '1.5rem'
                      }}>
                        {[...Array(5)].map((_, starIdx) => (
                          <div key={starIdx} style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            background: starIdx < (resenas.length > 0 && !loadingResenas ? review.calificacion : review.rating) ? color.accent : 'rgba(255,255,255,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.2rem',
                            color: starIdx < (resenas.length > 0 && !loadingResenas ? review.calificacion : review.rating) ? '#fff' : 'rgba(255,255,255,0.5)',
                            boxShadow: starIdx < (resenas.length > 0 && !loadingResenas ? review.calificacion : review.rating) ? 
                              `0 4px 12px ${color.accent}40` : 'none',
                            transition: 'all 0.3s ease'
                          }}>
                            ★
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1.2rem',
                      marginTop: 'auto',
                      padding: '1rem',
                      background: `${color.accent}15`,
                      borderRadius: '15px',
                      border: `1px solid ${color.accent}30`
                    }}>
                      <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${color.accent}, ${color.accent}dd)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                        boxShadow: `0 6px 20px ${color.accent}40`,
                        border: `3px solid ${color.accent}30`,
                        overflow: 'hidden'
                      }}>
                        {resenas.length > 0 && !loadingResenas ? (
                          review.cliente?.isGooglePicture ? (
                            <img 
                              src={review.cliente.avatar} 
                              alt="Foto de perfil"
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                borderRadius: '50%'
                              }}
                            />
                          ) : (
                            <span>{review.cliente?.avatar || '👤'}</span>
                          )
                        ) : (
                          <span>{review.avatar}</span>
                        )}
                      </div>
                      <div>
                        <div style={{
                          fontWeight: 'bold',
                          fontSize: '1.2rem',
                          marginBottom: '0.3rem',
                          textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                        }}>
                          {resenas.length > 0 && !loadingResenas ? (review.cliente?.nombre || 'Cliente') : review.author}
                        </div>
                        <div style={{
                          fontSize: '1rem',
                          opacity: '0.9',
                          fontStyle: 'italic'
                        }}>
                          {resenas.length > 0 && !loadingResenas ? 'Cliente Satisfecho' : review.company}
                        </div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </div>

      {/* Servicios Destacados */}
      <div className={styles.featuredServices}>
        {servicios.slice(0, 3).map((servicio, idx) => (
          <div key={servicio.id} className={styles.serviceCard}>
            <div className={styles.serviceIcon}>
              <span style={{fontSize:'2.7rem'}} role="img" aria-label={servicio.nombre}>
                {servicio.emoji || '💇'}
              </span>
            </div>
            <div className={styles.serviceTitle}>{servicio.nombre.toUpperCase()}</div>
            <div className={styles.serviceDesc}>
              {servicio.textoDescriptivo || servicio.descripcion || `Servicio profesional de ${servicio.nombre.toLowerCase()} con técnicas modernas y acabado impecable.`}
            </div>
          </div>
        ))}
      </div>

      {/* Sección de Servicios */}
      <div className={styles.servicesSection}>
        <div className={styles.servicesHeader}>
          <div className={styles.servicesDivider}>
            <span className={styles.servicesDividerLine}></span>
            <span className={styles.servicesDividerDot}></span>
            <span className={styles.servicesDividerLine}></span>
          </div>
          <h2 className={styles.servicesTitle}>Servicios de Barbería</h2>
          <p className={styles.servicesSubtitle}>Profesionales al servicio de tu estilo</p>
          <div className={styles.servicesDivider}>
            <span className={styles.servicesDividerLine}></span>
            <span className={styles.servicesDividerDot}></span>
            <span className={styles.servicesDividerLine}></span>
          </div>
        </div>

        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.loadingIcon}>⏳</div>
            <p>Cargando servicios...</p>
          </div>
        ) : error ? (
          <div className={styles.errorState}>
            <div className={styles.errorIcon}>❌</div>
            <p>{error}</p>
          </div>
        ) : servicios.length > 0 ? (
          <div className={styles.servicesGrid}>
            {/* Columna izquierda */}
            <div className={styles.servicesColumn}>
              {servicios.slice(0, Math.floor(servicios.length / 2)).map((servicio) => (
                <ServiceRow 
                  key={servicio.id}
                  name={servicio.nombre} 
                  price={`${servicio.precio}€`} 
                  desc={servicio.descripcion || `Duración: ${servicio.duracionMinutos} minutos`} 
                />
              ))}
            </div>
            {/* Columna derecha */}
            <div className={styles.servicesColumn}>
              {servicios.slice(Math.floor(servicios.length / 2), servicios.length % 2 === 0 ? undefined : -1).map((servicio) => (
                <ServiceRow 
                  key={servicio.id}
                  name={servicio.nombre} 
                  price={`${servicio.precio}€`} 
                  desc={servicio.descripcion || `Duración: ${servicio.duracionMinutos} minutos`} 
                />
              ))}
            </div>
            {/* Último servicio centrado si hay número impar */}
            {servicios.length % 2 !== 0 && (
              <div style={{ 
                gridColumn: '1 / -1',
                display: 'flex',
                justifyContent: 'center',
                width: '100%'
              }}>
                <div style={{ width: '100%', maxWidth: '400px' }}>
                  <ServiceRow 
                    key={servicios[servicios.length - 1].id}
                    name={servicios[servicios.length - 1].nombre} 
                    price={`${servicios[servicios.length - 1].precio}€`} 
                    desc={servicios[servicios.length - 1].descripcion || `Duración: ${servicios[servicios.length - 1].duracionMinutos} minutos`} 
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📋</div>
            <p>No hay servicios disponibles en este momento.</p>
          </div>
        )}
      </div>
      
      {/* Componente de demostración de colores oculto */}
    </>
  )
}

export default Inicio

// Componente auxiliar para una fila de servicio
function ServiceRow({name, price, desc}:{name:string, price:string, desc:string}) {
  return (
    <div className={styles.serviceRow}>
      <div className={styles.serviceRowContent}>
        {name}
        <div className={styles.serviceRowDesc}>
          {desc}
        </div>
      </div>
      <div className={styles.serviceRowPrice}>
        <span className={styles.serviceRowDots}></span>
        <span className={styles.serviceRowAmount}>
          {price}
        </span>
      </div>
    </div>
  );
} 