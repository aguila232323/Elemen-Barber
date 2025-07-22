import React from 'react'
import styles from './ContactoResenas.module.css'
import { FaMapMarkerAlt, FaWhatsapp, FaEnvelope, FaFacebookF, FaInstagram, FaTiktok, FaTwitter } from 'react-icons/fa';

const ContactoResenas: React.FC = () => (
  <div style={{background:'#181818', minHeight:'100vh', color:'#fff', padding:'0', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center'}}>
    <div style={{maxWidth:1200, margin:'0 auto', padding:'3rem 2vw 2rem 2vw', display:'flex', flexWrap:'wrap', gap:'2.5rem', alignItems:'center', justifyContent:'center'}}>
      {/* Columna Izquierda */}
      <div style={{flex:'1 1 340px', minWidth:320, maxWidth:420, display:'flex', flexDirection:'column', gap:'2.5rem'}}>
        <div>
          <span style={{color:'#FFD600', fontWeight:700, fontSize:'1rem', letterSpacing:1, display:'flex', alignItems:'center', gap:8, marginBottom:12}}>
            <FaMapMarkerAlt style={{fontSize:'1.1rem'}}/> CONTACTO
          </span>
          <h1 style={{fontSize:'3rem', fontWeight:900, margin:'0.2em 0 0 0', lineHeight:1.05}}>BEGÍJAR</h1>
        </div>
        <div style={{display:'flex', flexDirection:'column', gap:'1.5rem', fontSize:'1.08rem'}}>
          <div style={{display:'flex', alignItems:'flex-start', gap:16}}>
            <span style={{background:'#222', color:'#FFD600', borderRadius:8, width:38, height:38, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem'}}><FaMapMarkerAlt/></span>
            <span>
              4 Paseo Dr. Revuelta,<br/>Begíjar, Andalucía<br/>
              <span style={{color:'#aaa', fontSize:'0.97em'}}>Barbería</span>
            </span>
          </div>
          <div style={{display:'flex', alignItems:'flex-start', gap:16}}>
            <span style={{background:'#222', color:'#25D366', borderRadius:8, width:38, height:38, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem'}}><FaWhatsapp/></span>
            <span>
              +34 600 123 456<br/>
              <span style={{color:'#aaa', fontSize:'0.97em'}}>Atención al cliente</span>
            </span>
          </div>
          <div style={{display:'flex', alignItems:'flex-start', gap:16}}>
            <span style={{background:'#222', color:'#FFD600', borderRadius:8, width:38, height:38, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem'}}><FaEnvelope/></span>
            <span>
              info@esentialbarber.com<br/>
              <span style={{color:'#aaa', fontSize:'0.97em'}}>Reservar cita</span>
            </span>
          </div>
        </div>
        <div style={{display:'flex', gap:'1rem', flexWrap:'wrap', marginTop:'1.2rem'}}>
          <button style={{background:'none', color:'#fff', border:'2px solid #FFD600', borderRadius:6, padding:'0.5em 1.2em', fontWeight:600, fontSize:'1em', cursor:'pointer', display:'flex', alignItems:'center', gap:8}}><FaFacebookF/> Facebook</button>
          <button style={{background:'none', color:'#fff', border:'2px solid #FFD600', borderRadius:6, padding:'0.5em 1.2em', fontWeight:600, fontSize:'1em', cursor:'pointer', display:'flex', alignItems:'center', gap:8}}><FaInstagram/> Instagram</button>
          <button style={{background:'none', color:'#fff', border:'2px solid #FFD600', borderRadius:6, padding:'0.5em 1.2em', fontWeight:600, fontSize:'1em', cursor:'pointer', display:'flex', alignItems:'center', gap:8}}><FaTiktok/> Tiktok</button>
          <button style={{background:'none', color:'#fff', border:'2px solid #FFD600', borderRadius:6, padding:'0.5em 1.2em', fontWeight:600, fontSize:'1em', cursor:'pointer', display:'flex', alignItems:'center', gap:8}}><FaTwitter/> Twitter</button>
        </div>
      </div>
      {/* Columna Derecha */}
      <div style={{flex:'1 1 340px', minWidth:320, maxWidth:500, display:'flex', flexDirection:'column', gap:'2.5rem', justifyContent:'flex-start'}}>
        <div style={{background:'#222', borderRadius:'1rem', padding:'2rem 2.5rem', marginBottom:'1.5rem', width:'100%', maxWidth:400, marginTop:'4.5rem'}}>
          <table style={{width:'100%', color:'#fff', fontSize:'1.08rem', borderCollapse:'collapse'}}>
            <tbody>
              <tr><td style={{color:'#aaa', padding:'0.3em 0'}}>Lun:</td><td style={{textAlign:'right', fontWeight:600, padding:'0.3em 0'}}>Cerrado</td></tr>
              <tr><td style={{color:'#aaa', padding:'0.3em 0'}}>Mar:</td><td style={{textAlign:'right', fontWeight:600, padding:'0.3em 0'}}>9:00 – 14:00 / 16:00 – 21:15</td></tr>
              <tr><td style={{color:'#aaa', padding:'0.3em 0'}}>Mié:</td><td style={{textAlign:'right', fontWeight:600, padding:'0.3em 0'}}>9:00 – 14:00 / 16:00 – 21:15</td></tr>
              <tr><td style={{color:'#aaa', padding:'0.3em 0'}}>Jue:</td><td style={{textAlign:'right', fontWeight:600, padding:'0.3em 0'}}>9:00 – 14:00 / 16:00 – 21:15</td></tr>
              <tr><td style={{color:'#aaa', padding:'0.3em 0'}}>Vie:</td><td style={{textAlign:'right', fontWeight:600, padding:'0.3em 0'}}>9:00 – 14:00 / 16:00 – 21:15</td></tr>
              <tr><td style={{color:'#aaa', padding:'0.3em 0'}}>Sáb:</td><td style={{textAlign:'right', fontWeight:600, padding:'0.3em 0'}}>9:00 – 14:00 / 16:00 – 21:15</td></tr>
              <tr><td style={{color:'#aaa', padding:'0.3em 0'}}>Dom:</td><td style={{textAlign:'right', fontWeight:600, padding:'0.3em 0'}}>Cerrado</td></tr>
            </tbody>
          </table>
        </div>
        <div style={{flex:1, display:'flex', alignItems:'center', justifyContent:'center'}}>
          <a href="https://www.google.com/maps?q=4+Paseo+Dr.+Revuelta,+Begíjar,+Andalucía" target="_blank" rel="noopener noreferrer" style={{width:'100%', maxWidth:400, minHeight:260, background:'radial-gradient(circle at 60% 40%, #FFD60033 0%, #181818 80%)', borderRadius:'1rem', display:'flex', alignItems:'center', justifyContent:'center', position:'relative', textDecoration:'none', cursor:'pointer'}}>
            <FaMapMarkerAlt style={{position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', color:'#FFD600', fontSize:'3.5rem', filter:'drop-shadow(0 0 12px #FFD60088)'}}/>
          </a>
        </div>
      </div>
    </div>
  </div>
)

export default ContactoResenas 