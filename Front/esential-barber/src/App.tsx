import { useState } from 'react';
import './App.css';
import Navbar from './components/Navbar/NavbarSuperior';
import NavbarInferior from './components/Navbar/NavbarInferior';
import AdminNavbar from './components/Navbar/AdminNavbar';
import Inicio from './pages/public/Inicio/Inicio';
import Portafolio from './pages/public/Portfolio/Portafolio';
import ContactoResenas from './pages/public/ContactoResenas/ContactoResenas';
import PoliticaPrivacidad from './pages/public/PoliticaPrivacidad/PoliticaPrivacidad';
import Login from './pages/auth/Login';
import Citas from './pages/user/Citas/Citas';
import Toast from './components/ui/Toast';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Perfil from './pages/user/Perfil/Perfil';
import Register from './pages/auth/Register';
import ResetPassword from './pages/auth/ResetPassword';
import GoogleCallback from './pages/auth/GoogleCallback';
import { AuthProvider, useAuth } from './context/AuthContext';
import CitasAdmin from './pages/admin/CitasAdmin';
import Configuracion from './pages/admin/Configuracion';
import DiasLaborables from './pages/admin/DiasLaborables';
import PrivateRoute from './components/PrivateRoute';

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Determinar sección activa para el navbar superior
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

  // Función global para manejar login exitoso
  const handleLoginSuccess = () => {
    setShowLoginToast(true);
  };

  // Funciones para la NavbarInferior/AdminNavbar
  const goToCitas = () => navigate('/citas');
  const goToPerfil = () => navigate('/perfil');
  const goToInicio = () => navigate('/');
  const goToConfig = () => navigate('/admin/configuracion');
  const goToDiasLaborables = () => navigate('/admin/dias-laborables');

  // Determinar si mostrar la barra superior
  const shouldShowNavbar = true; // Mostrar navbar superior en todas las páginas

  // Determinar pestaña activa para la navbar inferior
  let activeTab: 'inicio' | 'citas' | 'perfil' | 'config' = 'inicio';
  if (location.pathname.startsWith('/citas')) activeTab = 'citas';
  else if (location.pathname.startsWith('/perfil')) activeTab = 'perfil';
  else if (location.pathname.startsWith('/admin/configuracion') || location.pathname.startsWith('/admin/dias-laborables')) activeTab = 'config';

  return (
    <div className="main-container">
      {shouldShowNavbar && (
        <Navbar section={section} setSection={setSection} onLoginSuccess={handleLoginSuccess} />
      )}
      <main className="content">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/contacto" element={<ContactoResenas />} />
          <Route path="/portafolio" element={<Portafolio />} />
          <Route path="/politica-privacidad" element={<PoliticaPrivacidad />} />
          <Route path="/auth/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/auth/google/callback" element={<GoogleCallback />} />
          <Route path="/citas" element={
            <PrivateRoute>
              {user && user.rol === 'ADMIN' ? <CitasAdmin /> : <Citas onLoginSuccess={handleLoginSuccess} />}
            </PrivateRoute>
          } />
          <Route path="/perfil" element={
            <PrivateRoute>
              <Perfil />
            </PrivateRoute>
          } />
          <Route path="/admin/configuracion" element={
            <PrivateRoute requiredRole="ADMIN">
              <Configuracion />
            </PrivateRoute>
          } />
          <Route path="/admin/dias-laborables" element={
            <PrivateRoute requiredRole="ADMIN">
              <DiasLaborables />
            </PrivateRoute>
          } />
        </Routes>
      </main>
      {!loading && user && (
        user.rol === 'ADMIN' ? (
          <AdminNavbar
            onCitas={goToCitas}
            onPerfil={goToPerfil}
            onInicio={goToInicio}
            onConfig={goToConfig}
            activeTab={activeTab}
          />
        ) : (
          <NavbarInferior
            onCitas={goToCitas}
            onPerfil={goToPerfil}
            onInicio={goToInicio}
            activeTab={activeTab as 'inicio' | 'citas' | 'perfil'}
          />
        )
      )}
      {showLoginToast && (
        <Toast message="¡Inicio de sesión exitoso!" type="success" onClose={() => setShowLoginToast(false)} />
      )}
      <footer className="footer">
        © {new Date().getFullYear()} Elemen Barber. Todos los derechos reservados. | 
        <a href="/politica-privacidad" style={{ color: 'inherit', textDecoration: 'underline', marginLeft: '5px' }}>
          Política de Privacidad
        </a> | 
        Contacto: elemenbarber@gmail.com
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
