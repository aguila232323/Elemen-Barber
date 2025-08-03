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
    <div className={styles.portafolioContainer}>
      <section className={styles.portafolioSection}>
        <h2 className={styles.portafolioTitulo}></h2>
        <div className={styles.portafolioContent}>
          <div className={styles.galeria}>
            {fotos.map((foto, i) => (
              <div
                key={i}
                className={`${styles.foto} ${foto.instaUrl ? styles.fotoClickable : ''}`}
                style={{backgroundImage: `url(${foto.img})`}}
                onClick={() => handleFotoClick(foto.instaUrl)}
                role={foto.instaUrl ? "button" : undefined}
                tabIndex={foto.instaUrl ? 0 : undefined}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleFotoClick(foto.instaUrl);
                  }
                }}
                aria-label={foto.instaUrl ? "Ver en Instagram" : "Imagen del portafolio"}
              />
            ))}
          </div>
        </div>
        
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
      </section>
    </div>
  );
}

export default Portafolio
