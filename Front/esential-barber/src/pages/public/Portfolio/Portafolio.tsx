import React, { useState, useEffect, useRef } from 'react'
import styles from './Portafolio.module.css'

import foto1 from '../../../assets/images/1.jpg';
import foto2 from '../../../assets/images/2.jpg'; 
import foto3 from '../../../assets/images/3.jpg';
import foto4 from '../../../assets/images/4.jpg';
import foto5 from '../../../assets/images/5.jpg';
import foto6 from '../../../assets/images/6.jpg';
import foto7 from '../../../assets/images/7.jpg';
import foto8 from '../../../assets/images/8.jpg';
import foto9 from '../../../assets/images/9.jpg';


const fotos = [
  { img: foto1, instaUrl: 'https://www.instagram.com/p/CgmLWvGjP2n/?utm_source=ig_web_button_share_sheet&igsh=MzRlODBiNWFlZA==' },
  { img: foto2, instaUrl: 'https://www.instagram.com/p/CgmLWvGjP2n/?utm_source=ig_web_button_share_sheet&igsh=MzRlODBiNWFlZA==' },
  { img: foto3, instaUrl: '' },
  { img: foto4, instaUrl: '' },
  { img: foto5, instaUrl: '' },
  { img: foto6, instaUrl: '' },
  { img: foto7, instaUrl: '' },
  { img: foto8, instaUrl: '' },
  { img: foto9, instaUrl: '' },
];

const Portafolio: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeInstaUrl, setActiveInstaUrl] = useState('');
  const embedRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className={styles.portafolio} style={{background:'#121212', minHeight:'100vh', padding:'2.5rem 0'}}>
      <section>
        <h2 style={{color:'#fff'}}></h2>
        <div style={{background:'#fff', borderRadius:'1.2rem', padding:'2.5rem 2vw', boxShadow:'0 4px 32px rgba(0,0,0,0.10)', maxWidth:1100, margin:'0 auto'}}>
          <div className={styles.galeria}>
            {fotos.map((foto, i) => (
              <div
                key={i}
                className={styles.foto}
                style={{backgroundImage: `url(${foto.img})`, cursor: foto.instaUrl ? 'pointer' : 'default'}}
                onClick={() => handleFotoClick(foto.instaUrl)}
              />
            ))}
          </div>
        </div>
        {modalOpen && activeInstaUrl && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0,0,0,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
            onClick={() => setModalOpen(false)}
          >
            <div
              style={{
                background: 'transparent',
                padding: 0,
                boxShadow: 'none',
                borderRadius: 0,
                maxWidth: 400,
                width: '100%',
                minWidth: 326,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                // sin overflow ni maxHeight
              }}
              onClick={e => e.stopPropagation()}
              ref={embedRef}
            >
              <button
                style={{
                  position: 'absolute',
                  top: -18,
                  right: -18,
                  background: '#111',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  cursor: 'pointer',
                  fontSize: 18,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  zIndex: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                }}
                onClick={() => setModalOpen(false)}
                aria-label="Cerrar"
              >
                <span style={{display:'block', width:'100%', textAlign:'center', lineHeight:'32px', fontSize:'1.3rem'}}>✕</span>
              </button>
              <div
                dangerouslySetInnerHTML={{
                  __html: `<blockquote class='instagram-media' data-instgrm-permalink='${activeInstaUrl}' data-instgrm-version='14' style='background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 1px; max-width:400px; min-width:326px; padding:0; width:100%;'><a href='${activeInstaUrl}' target='_blank'></a></blockquote>`
                }}
              />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default Portafolio
