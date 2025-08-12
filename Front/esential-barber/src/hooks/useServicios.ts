import { useState, useEffect } from 'react';

export interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  duracionMinutos: number;
  emoji?: string;
  textoDescriptivo?: string;
  colorGoogleCalendar?: string;
}

export const useServicios = () => {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServicios = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8080/api/servicios', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setServicios(data);
        } else {
          setError('Error al cargar los servicios');
        }
      } catch (err) {
        setError('Error de conexión al cargar los servicios');
      } finally {
        setLoading(false);
      }
    };

    fetchServicios();
  }, []);

  return { servicios, loading, error };
}; 