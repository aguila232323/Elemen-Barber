import React from 'react'
import styles from './Inicio.module.css'
import { FaClock, FaUser, FaMapMarkerAlt } from 'react-icons/fa';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectCoverflow } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';


const reviews = [
  { text: 'Excelente servicio y atención. ¡Repetiré sin duda!', author: 'Juan Pérez', rating: 5 },
  { text: 'El mejor corte de mi vida, muy recomendado.', author: 'Carlos Gómez', rating: 5 },
  { text: 'Ambiente agradable y profesionales de primera.', author: 'Luis Martínez', rating: 4 },
  { text: 'Muy buen trato y resultados espectaculares.', author: 'Ana Torres', rating: 5 },
  { text: 'Rápidos y muy profesionales.', author: 'Pedro Ruiz', rating: 4 },
];

const getStars = (rating: number) => '★'.repeat(rating) + '☆'.repeat(5 - rating);

const bannerImg = 'https://static.vecteezy.com/system/resources/previews/005/121/041/non_2x/hairdressers-cut-their-clients-in-barbershop-advertising-and-barber-shop-concept-free-photo.jpg'; // panorámica barbería

const servicios = [
  {
    nombre: 'Corte',
    precio: '12€',
    icono: '💈',
    descripcion: 'Corte de pelo profesional adaptado a tu estilo.'
  },
  {
    nombre: 'Tinte',
    precio: '18€',
    icono: '🧴',
    descripcion: 'Coloración y matiz para un look renovado.'
  },
  {
    nombre: 'Barba',
    precio: '8€',
    icono: '🪒',
    descripcion: 'Arreglo, perfilado y cuidado de barba.'
  }
];

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
        // borderRadius: '0 0 32px 32px',
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
        <span style={{
          position: 'relative',
          zIndex: 2,
          color: '#fff',
          fontSize: '2.7rem',
          fontWeight: 'bold',
          letterSpacing: '2px',
          textShadow: '0 4px 24px #000, 0 1px 2px #000',
          textAlign: 'center',
        }}>
          Esential Barber
        </span>
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
            <span style={{fontWeight: 600, fontSize: '0.93em'}}>Lunes - Sábado</span>
            <span style={{fontSize: '0.85em', color: '#ccc'}}>10:00 - 20:00</span>
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
            <span style={{fontWeight: 600, fontSize: '0.93em'}}>Juan García</span>
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
            <span style={{fontWeight: 600, fontSize: '0.93em'}}>Calle Falsa 123</span>
            <span style={{fontSize: '0.85em', color: '#ccc'}}>Madrid</span>
          </span>
        </span>
      </div>
      {/* Carrusel de reseñas con Swiper */}
      <div style={{width:'100%', background:'none', margin:'2.5rem 0', display:'flex', justifyContent:'center'}}>
        <div style={{width:'100%', maxWidth:900}}>
          <Swiper
            modules={[Autoplay, EffectCoverflow]}
            slidesPerView={3}
            centeredSlides={true}
            loop={true}
            autoplay={{ delay: 2600, disableOnInteraction: false }}
            effect="coverflow"
            coverflowEffect={{ rotate: 0, stretch: 0, depth: 120, modifier: 2, slideShadows: false }}
            style={{ padding: '2rem 0', paddingLeft: '4vw', paddingRight: '2vw' }}
            slidesOffsetBefore={80}
            slidesOffsetAfter={32}
            breakpoints={{
              0: { slidesPerView: 1, centeredSlides: false, slidesOffsetBefore: 0, slidesOffsetAfter: 0 },
              600: { slidesPerView: 2, centeredSlides: true, slidesOffsetBefore: 40, slidesOffsetAfter: 20 },
              900: { slidesPerView: 3, centeredSlides: true, slidesOffsetBefore: 80, slidesOffsetAfter: 32 }
            }}
          >
            {reviews.map((review, idx) => (
              <SwiperSlide key={idx}>
                <div style={{
                  background: '#fff',
                  color: '#111',
                  borderRadius: '14px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                  padding: '1.2rem 1.5rem',
                  minWidth: '260px',
                  maxWidth: '320px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  fontStyle: 'italic',
                  borderLeft: '4px solid #111',
                  position: 'relative',
                  transition: 'transform 0.4s cubic-bezier(.4,2,.6,1)',
                }}>
                  <span style={{fontSize: '1.3rem', marginBottom: '0.7rem'}}>{review.text}</span>
                  <span style={{color: '#f5b301', fontSize: '1.2rem', marginBottom: '0.3rem'}}>{getStars(review.rating)}</span>
                  <span style={{fontWeight: 'bold', color: '#222', fontStyle: 'normal', fontSize: '1rem'}}>  {review.author}</span>
                </div>
              </SwiperSlide>
            ))}
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
            borderRadius: '14px',
            padding: '2.2rem 2.2rem 1.5rem 2.2rem',
            background: '#181818',
            minWidth: 220,
            maxWidth: 270,
            minHeight: 280,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: '0 2px 24px rgba(0,0,0,0.18)',
            position: 'relative',
          }}>
            <div style={{marginBottom: '1.2rem'}}>{serv.icon}</div>
            <div style={{color:'#FFD600', fontWeight:900, fontSize:'1.18rem', letterSpacing:1, marginBottom:8}}>{serv.title}</div>
            <div style={{color:'#ccc', textAlign:'center', fontSize:'1rem'}}>{serv.desc}</div>
          </div>
        ))}
      </div>
      <div className={styles.content}>
        <section className={styles.hero}>
          <h1>Bienvenido a Esential Barber</h1>
          <p>Tu barbería de confianza. Estilo, elegancia y profesionalismo en cada corte.</p>
        </section>
        {/* Apartado de servicios tipo carta */}
        <div
          style={{
            background: 'url("https://www.transparenttextures.com/patterns/paper-fibers.png") repeat #f7f6f3',
            borderRadius: '1.5rem',
            margin: '3rem auto',
            maxWidth: 1100,
            boxShadow: '0 4px 32px rgba(0,0,0,0.07)',
            padding: '3.5rem 2vw 3.5rem 2vw',
            position: 'relative',
          }}
        >
          <div style={{textAlign:'center', marginBottom:'2.5rem'}}>
            <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:12, marginBottom:10}}>
              <span style={{height:2, width:60, background:'#FFD600', borderRadius:2, display:'inline-block'}}></span>
              <span style={{height:10, width:10, background:'#FFD600', borderRadius:'50%', display:'inline-block'}}></span>
              <span style={{height:2, width:60, background:'#FFD600', borderRadius:2, display:'inline-block'}}></span>
            </div>
            <h2 style={{fontSize:'2.5rem', fontWeight:900, letterSpacing:2, color:'#222', margin:0, textTransform:'uppercase'}}>Servicios de Barbería</h2>
            <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:12, marginTop:10}}>
              <span style={{height:2, width:60, background:'#FFD600', borderRadius:2, display:'inline-block'}}></span>
              <span style={{height:10, width:10, background:'#FFD600', borderRadius:'50%', display:'inline-block'}}></span>
              <span style={{height:2, width:60, background:'#FFD600', borderRadius:2, display:'inline-block'}}></span>
            </div>
          </div>
          <div style={{display:'flex', gap:'3.5rem', justifyContent:'center', flexWrap:'wrap'}}>
            {/* Columna izquierda */}
            <div style={{flex:'1 1 320px', minWidth:260, maxWidth:400}}>
              <ServiceRow name="Corte sencillo" price="20€" desc="Corte clásico y rápido para mantener tu estilo." />
              <ServiceRow name="Corte de pelo" price="15€" desc="Corte personalizado adaptado a tus gustos." />
              <ServiceRow name="Corte a máquina" price="45€" desc="Corte profesional con máquina para un acabado perfecto." />
              <ServiceRow name="Secador de pelo" price="36€" desc="Secado y peinado para un look impecable." />
            </div>
            {/* Columna derecha */}
            <div style={{flex:'1 1 320px', minWidth:260, maxWidth:400}}>
              <ServiceRow name="Arreglo de bigote" price="32€" desc="Perfilado y arreglo de bigote con detalle." />
              <ServiceRow name="Afeitado facial" price="10€" desc="Afeitado clásico y cuidado de la piel." />
              <ServiceRow name="Lavado de pelo" price="18€" desc="Lavado y tratamiento capilar profesional." />
              <ServiceRow name="Coloración" price="42€" desc="Coloración y matiz para renovar tu imagen." />
            </div>
          </div>
        </div>
        <section style={{marginTop: '2.5rem'}}>
          <h2 style={{textAlign: 'center', marginBottom: '2rem', fontSize: '2rem'}}>Servicios</h2>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '2rem',
            flexWrap: 'nowrap',
            overflowX: 'auto',
            width: '100%',
            paddingBottom: '1rem',
          }}>
            {servicios.map((serv, idx) => (
              <div key={idx} style={{
                background: '#fff',
                borderRadius: '16px',
                boxShadow: '0 4px 24px rgba(25, 118, 210, 0.18), 0 -4px 24px rgba(25, 118, 210, 0.10), 0 1.5px 8px rgba(0,0,0,0.10), 0 -1.5px 8px rgba(0,0,0,0.07)',
                padding: '2rem 1.5rem 1.5rem 1.5rem',
                minWidth: 220,
                maxWidth: 260,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginBottom: '1.5rem',
                paddingTop: '1.5rem',
              }}>
                <span style={{fontSize: '2.5rem', marginBottom: '1rem'}}>{serv.icono}</span>
                <h3 style={{margin: 0, fontSize: '1.3rem', fontWeight: 600}}>{serv.nombre}</h3>
                <div style={{fontSize: '1.1rem', color: '#555', margin: '0.5rem 0 1rem 0', textAlign: 'center'}}>{serv.descripcion}</div>
                <div style={{fontWeight: 700, fontSize: '1.2rem', marginBottom: '1.2rem'}}>{serv.precio}</div>
                <button style={{
                  background: '#1976d2',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.7rem 1.5rem',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(25,118,210,0.08)',
                  transition: 'background 0.2s',
                }}
                onClick={() => alert('Función de reserva próximamente')}
                >Reservar</button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}

export default Inicio 

// Componente auxiliar para una fila de servicio
function ServiceRow({name, price, desc}:{name:string, price:string, desc:string}) {
  return (
    <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'2.1rem', fontSize:'1.13rem'}}>
      <div style={{flex:1, fontWeight:700, color:'#222'}}>{name}
        <div style={{fontWeight:400, color:'#aaa', fontSize:'0.98rem', marginTop:2}}>{desc}</div>
      </div>
      <div style={{flex:'0 0 90px', display:'flex', alignItems:'center', justifyContent:'flex-end'}}>
        <span style={{flex:1, borderBottom:'1.5px dotted #FFD600', margin:'0 1rem 0 1.5rem', height:1, minWidth:40, opacity:0.7}}></span>
        <span style={{fontWeight:700, color:'#222', fontSize:'1.13rem'}}>{price}</span>
      </div>
    </div>
  );
} 