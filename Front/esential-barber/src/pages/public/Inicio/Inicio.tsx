import React from 'react'
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

const bannerImg = 'https://static.vecteezy.com/system/resources/previews/005/121/041/non_2x/hairdressers-cut-their-clients-in-barbershop-advertising-and-barber-shop-concept-free-photo.jpg'; // panorámica barbería

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
  
  return (
    <>
      <div style={{
        width: '100%',
        minHeight: '400px',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '2.5rem',
        overflow: 'hidden',
        boxShadow: '0 4px 32px rgba(0,0,0,0.09)',
      }}>
        <img
          src={bannerImg}
          alt="Barbería panorámica"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'grayscale(1) brightness(0.55)',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 1,
          }}
        />
        <div style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
        }}>
          <span style={{
            color: '#fff',
            fontSize: '4.2rem',
            fontWeight: 'bold',
            letterSpacing: '2px',
            textShadow: '0 4px 24px #000, 0 1px 2px #000',
            fontFamily: 'serif',
            lineHeight: 1.05,
            textAlign: 'center',
          }}>
            ELEMEN
          </span>
          <span style={{
            color: '#fff',
            fontSize: '1.45rem',
            fontWeight: 400,
            letterSpacing: '2.5px',
            textShadow: '0 2px 12px #000, 0 1px 2px #000',
            fontFamily: 'sans-serif',
            marginTop: '0.3rem',
            textAlign: 'center',
          }}>
            BARBER STUDIO
          </span>
        </div>
      </div>

      <div style={{
        width: '100%',
        background: '#111',
        color: '#fff',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '6rem',
        padding: '1.7rem 2vw', // aumentar el alto de la barra
        fontSize: '0.92rem',
        letterSpacing: '1px',
        zIndex: 10,
      }}>
        {/* Horario */}
        <span style={{display: 'flex', alignItems: 'center', gap: '0.7rem'}}>
          <span style={{
            background: '#222',
            borderRadius: '12px',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <FaClock style={{color: '#FFD600', fontSize: '1.2rem'}} />
          </span>
          <span style={{display: 'flex', flexDirection: 'column', lineHeight: 1.1}}>
            <span style={{fontWeight: 600, fontSize: '0.93em'}}>Martes - Sábado</span>
            <span style={{fontSize: '0.85em', color: '#ccc'}}>9:00 - 21:15</span>
          </span>
        </span>
        {/* Peluquero */}
        <span style={{display: 'flex', alignItems: 'center', gap: '0.7rem'}}>
          <span style={{
            background: '#222',
            borderRadius: '12px',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <FaUser style={{color: '#FFD600', fontSize: '1.2rem'}} />
          </span>
          <span style={{display: 'flex', flexDirection: 'column', lineHeight: 1.1}}>
            <span style={{fontWeight: 600, fontSize: '0.93em'}}>Luis</span>
            <span style={{fontSize: '0.85em', color: '#ccc'}}>Barbero principal</span>
          </span>
        </span>
        {/* Ubicación */}
        <span style={{display: 'flex', alignItems: 'center', gap: '0.7rem'}}>
          <span style={{
            background: '#222',
            borderRadius: '12px',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <FaMapMarkerAlt style={{color: '#FFD600', fontSize: '1.2rem'}} />
          </span>
          <span style={{display: 'flex', flexDirection: 'column', lineHeight: 1.1}}>
            <span style={{fontWeight: 600, fontSize: '0.93em'}}>4 Paseo Dr. Revuelta</span>
            <span style={{fontSize: '0.85em', color: '#ccc'}}>Begíjar, Andalucía</span>
          </span>
        </span>
      </div>
      {/* Reviews Carrusel Moderno */}
      <div style={{
        width: '100%',
        background: 'linear-gradient(180deg, #121212 0%, #0a0a0a 15%, #1a1a1a 30%, #2d2d2d 50%, #1a1a1a 70%, #0a0a0a 85%, #121212 100%)',
        margin: '3rem 0',
        padding: '4rem 2rem',
        position: 'relative',
        overflow: 'hidden'
      }}>

        
        {/* Título de la sección */}
        <div style={{
          textAlign: 'center',
          marginBottom: '3rem',
          position: 'relative',
          zIndex: 2
        }}>
          <h2 style={{
            color: '#fff',
            fontSize: '2.5rem',
            fontWeight: 'bold',
            margin: '0 0 1rem 0',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            Lo que opinan nuestros clientes
          </h2>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.5rem',
            marginTop: '1rem'
          }}>
            <span style={{color: '#FFD600', fontSize: '2rem'}}>★★★★★</span>
            <span style={{color: '#fff', fontSize: '1.1rem', marginLeft: '0.5rem'}}>4.9/5</span>
          </div>
        </div>

        {/* Carrusel de reviews */}
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 2
        }}>
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
                slidesPerView: 1, 
                centeredSlides: false, 
                slidesOffsetBefore: 0, 
                slidesOffsetAfter: 0,
                coverflowEffect: { depth: 100, modifier: 1.5 }
              },
              600: { 
                slidesPerView: 2, 
                centeredSlides: true, 
                slidesOffsetBefore: 40, 
                slidesOffsetAfter: 20,
                coverflowEffect: { depth: 120, modifier: 2 }
              },
              900: { 
                slidesPerView: 3, 
                centeredSlides: true, 
                slidesOffsetBefore: 80, 
                slidesOffsetAfter: 32,
                coverflowEffect: { depth: 150, modifier: 2.5 }
              }
            }}
          >
            {reviews.map((review, idx) => {
              // Colores variados para las cards
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
                    borderRadius: '25px',
                    padding: '2.5rem',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    cursor: 'pointer',
                    minHeight: '320px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    border: `2px solid ${color.accent}20`,
                    backdropFilter: 'blur(10px)',
                    transform: 'translateZ(0)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateZ(20px) scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateZ(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.4)';
                  }}>
                    
                    {/* Contenido del review */}
                    <div>
                      <p style={{
                        fontSize: '1.2rem',
                        lineHeight: '1.7',
                        marginBottom: '2rem',
                        fontStyle: 'italic',
                        textAlign: 'center'
                      }}>
                        "{review.text}"
                      </p>
                      
                      {/* Estrellas con bordes redondeados */}
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
                            background: starIdx < review.rating ? color.accent : 'rgba(255,255,255,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.2rem',
                            color: starIdx < review.rating ? '#fff' : 'rgba(255,255,255,0.5)',
                            boxShadow: starIdx < review.rating ? 
                              `0 4px 12px ${color.accent}40` : 'none',
                            transition: 'all 0.3s ease'
                          }}>
                            ★
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Información del autor */}
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
                        border: `3px solid ${color.accent}30`
                      }}>
                        {review.avatar}
                      </div>
                      <div>
                        <div style={{
                          fontWeight: 'bold',
                          fontSize: '1.2rem',
                          marginBottom: '0.3rem',
                          textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                        }}>
                          {review.author}
                        </div>
                        <div style={{
                          fontSize: '1rem',
                          opacity: '0.9',
                          fontStyle: 'italic'
                        }}>
                          {review.company}
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
      {/* Servicios destacados tipo caja dorada */}
      <div style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '2.5rem',
        margin: '2.5rem 0 3.5rem 0',
        flexWrap: 'wrap',
      }}>
        {[
          {
            // Emoji de tijeras para cortes
            icon: <span style={{fontSize:'2.7rem'}} role="img" aria-label="Tijeras">✂️</span>,
            title: 'CORTES',
            desc: 'Corte de pelo profesional adaptado a tu estilo. Asesoría personalizada, técnicas modernas y acabado impecable para que siempre luzcas tu mejor versión.'
          },
          {
            // Emoji de bote de tinte
            icon: <span style={{fontSize:'2.7rem'}} role="img" aria-label="Tinte">🧴</span>,
            title: 'TINTES',
            desc: 'Coloración y matiz para un look renovado. Trabajamos con productos de alta calidad para cuidar tu cabello y lograr el tono perfecto que buscas.'
          },
          {
            // Emoji de barba
            icon: <span style={{fontSize:'2.7rem'}} role="img" aria-label="Barba">🧔</span>,
            title: 'BARBAS',
            desc: 'Arreglo, perfilado y cuidado de barba. Disfruta de un tratamiento completo para tu barba, desde el recorte hasta el cuidado con aceites especiales.'
          },
        ].map((serv, idx) => (
          <div key={idx} style={{
            border: '2px solid #FFD600',
            borderRadius: '20px',
            padding: '2.5rem 2rem 2rem 2rem',
            background: 'linear-gradient(145deg, #121212 0%, #1a1a1a 100%)',
            minWidth: 240,
            maxWidth: 290,
            minHeight: 300,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: '0 8px 32px rgba(255,215,0,0.15), 0 4px 16px rgba(0,0,0,0.3)',
            position: 'relative',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(255,215,0,0.25), 0 8px 24px rgba(0,0,0,0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(255,215,0,0.15), 0 4px 16px rgba(0,0,0,0.3)';
          }}>
            <div style={{
              marginBottom: '1.5rem',
              padding: '1rem',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #FFD600, #FFA500)',
              boxShadow: '0 4px 20px rgba(255,215,0,0.4)'
            }}>{serv.icon}</div>
            <div style={{
              color:'#FFD600', 
              fontWeight:900, 
              fontSize:'1.3rem', 
              letterSpacing:2, 
              marginBottom:12,
              textShadow: '0 2px 8px rgba(255,215,0,0.3)'
            }}>{serv.title}</div>
            <div style={{
              color:'#ddd', 
              textAlign:'center', 
              fontSize:'1.05rem',
              lineHeight: '1.6',
              opacity: '0.9'
            }}>{serv.desc}</div>
          </div>
        ))}
      </div>
      <div className={styles.content}>
        <section className={styles.hero}>
          <h1>Bienvenido a Esential Barber</h1>
          <p>Tu barbería de confianza. Estilo, elegancia y profesionalismo en cada corte.</p>
        </section>
        {/* Apartado de servicios mejorado */}
        <div
          style={{
            background: 'linear-gradient(135deg, #121212 0%, #1a1a1a 50%, #121212 100%)',
            borderRadius: '40px',
            margin: '3rem auto',
            maxWidth: 1100,
            boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
            padding: '4rem 2vw 4rem 2vw',
            position: 'relative',
            border: '2px solid #FFD600',
            overflow: 'hidden',
          }}
        >
          <div style={{textAlign:'center', marginBottom:'3rem'}}>
            <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:12, marginBottom:15}}>
              <span style={{height:3, width:80, background:'linear-gradient(90deg, transparent, #FFD600, transparent)', borderRadius:2, display:'inline-block'}}></span>
              <span style={{height:12, width:12, background:'#FFD600', borderRadius:'50%', display:'inline-block', boxShadow: '0 0 20px #FFD600'}}></span>
              <span style={{height:3, width:80, background:'linear-gradient(90deg, transparent, #FFD600, transparent)', borderRadius:2, display:'inline-block'}}></span>
            </div>
            <h2 style={{fontSize:'3rem', fontWeight:900, letterSpacing:3, color:'#FFD600', margin:0, textTransform:'uppercase', textShadow: '0 2px 10px rgba(255,215,0,0.5)'}}>Servicios de Barbería</h2>
            <p style={{color:'#ccc', fontSize:'1.2rem', marginTop:'1rem', fontStyle:'italic'}}>Profesionales al servicio de tu estilo</p>
            <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:12, marginTop:15}}>
              <span style={{height:3, width:80, background:'linear-gradient(90deg, transparent, #FFD600, transparent)', borderRadius:2, display:'inline-block'}}></span>
              <span style={{height:12, width:12, background:'#FFD600', borderRadius:'50%', display:'inline-block', boxShadow: '0 0 20px #FFD600'}}></span>
              <span style={{height:3, width:80, background:'linear-gradient(90deg, transparent, #FFD600, transparent)', borderRadius:2, display:'inline-block'}}></span>
            </div>
          </div>
          {loading ? (
            <div style={{textAlign: 'center', padding: '2rem'}}>
              <div style={{fontSize: '1.5rem', marginBottom: '1rem'}}>⏳</div>
              <p>Cargando servicios...</p>
            </div>
          ) : error ? (
            <div style={{textAlign: 'center', padding: '2rem', color: '#d32f2f'}}>
              <div style={{fontSize: '1.5rem', marginBottom: '1rem'}}>❌</div>
              <p>{error}</p>
            </div>
          ) : servicios.length > 0 ? (
            <div style={{display:'flex', gap:'3.5rem', justifyContent:'center', flexWrap:'wrap'}}>
              {/* Columna izquierda */}
              <div style={{flex:'1 1 320px', minWidth:260, maxWidth:400}}>
                {servicios.slice(0, Math.ceil(servicios.length / 2)).map((servicio) => (
                  <ServiceRow 
                    key={servicio.id}
                    name={servicio.nombre} 
                    price={`${servicio.precio}€`} 
                    desc={servicio.descripcion || `Duración: ${servicio.duracionMinutos} minutos`} 
                  />
                ))}
              </div>
              {/* Columna derecha */}
              <div style={{flex:'1 1 320px', minWidth:260, maxWidth:400}}>
                {servicios.slice(Math.ceil(servicios.length / 2)).map((servicio) => (
                  <ServiceRow 
                    key={servicio.id}
                    name={servicio.nombre} 
                    price={`${servicio.precio}€`} 
                    desc={servicio.descripcion || `Duración: ${servicio.duracionMinutos} minutos`} 
                  />
                ))}
              </div>
            </div>
          ) : (
            <div style={{textAlign: 'center', padding: '2rem', color: '#666'}}>
              <div style={{fontSize: '1.5rem', marginBottom: '1rem'}}>📋</div>
              <p>No hay servicios disponibles en este momento.</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Inicio

// Componente auxiliar para una fila de servicio mejorado
function ServiceRow({name, price, desc}:{name:string, price:string, desc:string}) {
  return (
    <div style={{
      display:'flex', 
      alignItems:'flex-start', 
      justifyContent:'space-between', 
      marginBottom:'2.5rem', 
      fontSize:'1.15rem',
      padding: '1.5rem',
      background: 'linear-gradient(145deg, rgba(255,215,0,0.05) 0%, rgba(255,215,0,0.02) 100%)',
      borderRadius: '15px',
      border: '1px solid rgba(255,215,0,0.2)',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = 'linear-gradient(145deg, rgba(255,215,0,0.1) 0%, rgba(255,215,0,0.05) 100%)';
      e.currentTarget.style.border = '1px solid rgba(255,215,0,0.4)';
      e.currentTarget.style.transform = 'translateX(5px)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = 'linear-gradient(145deg, rgba(255,215,0,0.05) 0%, rgba(255,215,0,0.02) 100%)';
      e.currentTarget.style.border = '1px solid rgba(255,215,0,0.2)';
      e.currentTarget.style.transform = 'translateX(0)';
    }}>
      <div style={{flex:1, fontWeight:700, color:'#FFD600', fontSize:'1.2rem'}}>
        {name}
        <div style={{
          fontWeight:400, 
          color:'#ccc', 
          fontSize:'1rem', 
          marginTop:8,
          lineHeight: '1.5'
        }}>
          {desc}
        </div>
      </div>
      <div style={{flex:'0 0 100px', display:'flex', alignItems:'center', justifyContent:'flex-end'}}>
        <span style={{
          flex:1, 
          borderBottom:'2px dotted #FFD600', 
          margin:'0 1rem 0 1.5rem', 
          height:2, 
          minWidth:40, 
          opacity:0.8
        }}></span>
        <span style={{
          fontWeight:700, 
          color:'#FFD600', 
          fontSize:'1.3rem',
          textShadow: '0 2px 4px rgba(255,215,0,0.3)'
        }}>
          {price}
        </span>
      </div>
    </div>
  );
} 