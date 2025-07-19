import { useState, useEffect } from 'react'
import './App.css'
import Navbar from './components/Navbar/NavbarSuperior'
import NavbarInferior from './components/Navbar/NavbarInferior'
import Inicio from './pages/public/Inicio/Inicio'
import Portafolio from './pages/public/Portfolio/Portafolio'
import ContactoResenas from './pages/public/ContactoResenas/ContactoResenas'
import Login from './pages/auth/Login'
import Citas from './pages/user/Citas/Citas';
import Toast from './components/ui/Toast';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Perfil from './pages/user/Perfil/Perfil';


// Función para decodificar el payload del JWT
function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  // Determinar sección activa para el navbar
  let section = 'inicio';
  if (location.pathname === '/contacto') section = 'contactoResenas';
  else if (location.pathname === '/portafolio') section = 'portafolio';

  // Función para cambiar de sección usando rutas
  const setSection = (id: string) => {
    if (id === 'inicio') navigate('/');
    else if (id === 'contactoResenas') navigate('/contacto');
    else if (id === 'portafolio') navigate('/portafolio');
  };

  // Estado para Toast de login exitoso
  const [showLoginToast, setShowLoginToast] = useState(false);

  // Estado de autenticación
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return false;
    const payload = parseJwt(token);
    if (payload && payload.exp) {
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now) {
        localStorage.removeItem('authToken');
        return false;
      }
    }
    return true;
  });

  // Función global para manejar login exitoso
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setShowLoginToast(true);
  };

  // Funciones para la NavbarInferior
  const goToCitas = () => navigate('/citas');
  const goToPerfil = () => navigate('/perfil');
  const goToInicio = () => navigate('/');

  // Efecto para comprobar expiración del token periódicamente
  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem('authToken');
      if (token) {
        const payload = parseJwt(token);
        if (payload && payload.exp) {
          const now = Math.floor(Date.now() / 1000);
          if (payload.exp < now) {
            localStorage.removeItem('authToken');
            setIsAuthenticated(false);
          }
        }
      }
    }, 5000); // Comprobar cada 5 segundos
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="main-container">
      <Navbar section={section} setSection={setSection} onLoginSuccess={handleLoginSuccess} />
      <main className="content">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/contacto" element={<ContactoResenas />} />
          <Route path="/portafolio" element={<Portafolio />} />
          <Route path="/auth/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/citas" element={<Citas onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/perfil" element={<Perfil />} />
        </Routes>
      </main>
      {isAuthenticated && (
        <NavbarInferior onCitas={goToCitas} onPerfil={goToPerfil} onInicio={goToInicio} />
      )}
      {showLoginToast && (
        <Toast message="¡Inicio de sesión exitoso!" type="success" onClose={() => setShowLoginToast(false)} />
      )}
      <footer className="footer">
        © {new Date().getFullYear()} Esential Barber. Todos los derechos reservados.
      </footer>
    </div>
  )
}

export default App
