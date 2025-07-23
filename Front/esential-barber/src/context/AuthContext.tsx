import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';

interface User {
  email?: string;
  nombre?: string;
  rol?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null | 'reload') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Función para cargar el usuario desde la API
  const fetchUser = useCallback(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setLoading(true);
      fetch('http://localhost:8080/api/usuarios/perfil', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(async res => {
          if (!res.ok) throw new Error('No autorizado');
          return res.json();
        })
        .then(data => {
          setUserState({
            email: data.email,
            nombre: data.nombre,
            rol: data.rol || data.role || 'USER',
          });
          setLoading(false);
        })
        .catch(() => {
          localStorage.removeItem('authToken'); // Eliminar token si es inválido
          setUserState(null);
          setLoading(false);
        });
    } else {
      setUserState(null);
      setLoading(false);
    }
  }, []);

  // Cargar usuario al montar
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // setUser mejorado: acepta null, User o 'reload'
  const setUser = (value: User | null | 'reload') => {
    if (value === 'reload') {
      fetchUser();
    } else {
      setUserState(value);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};



