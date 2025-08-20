import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRole?: 'ADMIN' | 'CLIENTE';
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  // Si está cargando, mostrar loading
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Cargando...
      </div>
    );
  }

  // Si no hay usuario, redirigir al inicio
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Si se requiere un rol específico y el usuario no lo tiene
  if (requiredRole && user.rol !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  // Si todo está bien, mostrar el contenido
  return <>{children}</>;
};

export default PrivateRoute;
