import React, { useState } from 'react';
import { 
  COLORS, 
  BUSINESS_INFO, 
  changePrimaryColor, 
  changeBackgroundColor,
  getCurrentCSSValue 
} from '../../config/theme';

const ThemeDemo = () => {
  const [currentPrimaryColor, setCurrentPrimaryColor] = useState(COLORS.primary);
  const [currentBackgroundColor, setCurrentBackgroundColor] = useState(COLORS.backgroundPrimary);

  // Colores predefinidos para demostración
  const colorOptions = [
    { name: 'Dorado', value: '#FFD600' },
    { name: 'Blanco', value: '#FFFFFF' },
    { name: 'Azul', value: '#2196F3' },
    { name: 'Rojo', value: '#f44336' },
    { name: 'Verde', value: '#4CAF50' },
    { name: 'Morado', value: '#9C27B0' },
    { name: 'Naranja', value: '#FF9800' },
    { name: 'Rosa', value: '#E91E63' }
  ];

  const backgroundOptions = [
    { name: 'Negro', value: '#000000' },
    { name: 'Gris Oscuro', value: '#121212' },
    { name: 'Gris Medio', value: '#2a2a2a' },
    { name: 'Gris Claro', value: '#404040' }
  ];

  const handlePrimaryColorChange = (color) => {
    changePrimaryColor(color);
    setCurrentPrimaryColor(color);
  };

  const handleBackgroundColorChange = (color) => {
    changeBackgroundColor(color);
    setCurrentBackgroundColor(color);
  };

  const resetToDefaults = () => {
    changePrimaryColor(COLORS.primary);
    changeBackgroundColor(COLORS.backgroundPrimary);
    setCurrentPrimaryColor(COLORS.primary);
    setCurrentBackgroundColor(COLORS.backgroundPrimary);
  };

  return (
    <div style={{
      padding: '2rem',
      background: 'var(--background-secondary)',
      borderRadius: 'var(--border-radius-lg)',
      margin: '2rem',
      border: '2px solid var(--primary-color)'
    }}>
      <h2 style={{ 
        color: 'var(--primary-color)', 
        textAlign: 'center',
        marginBottom: '2rem',
        fontSize: 'var(--font-size-2xl)',
        fontWeight: 'var(--font-weight-bold)'
      }}>
        🎨 Demo de Variables Globales
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        
        {/* Sección de Color Principal */}
        <div style={{
          background: 'var(--background-card)',
          padding: '1.5rem',
          borderRadius: 'var(--border-radius-md)',
          border: '1px solid var(--primary-color)'
        }}>
          <h3 style={{ 
            color: 'var(--primary-color)', 
            marginBottom: '1rem',
            fontSize: 'var(--font-size-lg)'
          }}>
            🎯 Color Principal
          </h3>
          
          <p style={{ 
            color: 'var(--text-secondary)', 
            marginBottom: '1rem',
            fontSize: 'var(--font-size-sm)'
          }}>
            Color actual: <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>
              {currentPrimaryColor}
            </span>
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
            {colorOptions.map((color) => (
              <button
                key={color.value}
                onClick={() => handlePrimaryColorChange(color.value)}
                style={{
                  background: color.value,
                  color: color.value === '#FFFFFF' ? '#000' : '#fff',
                  border: 'none',
                  padding: '0.5rem',
                  borderRadius: 'var(--border-radius-sm)',
                  cursor: 'pointer',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 'var(--font-weight-medium)',
                  transition: 'var(--transition-normal)',
                  transform: currentPrimaryColor === color.value ? 'scale(1.05)' : 'scale(1)',
                  boxShadow: currentPrimaryColor === color.value ? 'var(--shadow-md)' : 'none'
                }}
              >
                {color.name}
              </button>
            ))}
          </div>
        </div>

        {/* Sección de Color de Fondo */}
        <div style={{
          background: 'var(--background-card)',
          padding: '1.5rem',
          borderRadius: 'var(--border-radius-md)',
          border: '1px solid var(--primary-color)'
        }}>
          <h3 style={{ 
            color: 'var(--primary-color)', 
            marginBottom: '1rem',
            fontSize: 'var(--font-size-lg)'
          }}>
            🌍 Color de Fondo
          </h3>
          
          <p style={{ 
            color: 'var(--text-secondary)', 
            marginBottom: '1rem',
            fontSize: 'var(--font-size-sm)'
          }}>
            Color actual: <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>
              {currentBackgroundColor}
            </span>
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
            {backgroundOptions.map((color) => (
              <button
                key={color.value}
                onClick={() => handleBackgroundColorChange(color.value)}
                style={{
                  background: color.value,
                  color: '#fff',
                  border: 'none',
                  padding: '0.5rem',
                  borderRadius: 'var(--border-radius-sm)',
                  cursor: 'pointer',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 'var(--font-weight-medium)',
                  transition: 'var(--transition-normal)',
                  transform: currentBackgroundColor === color.value ? 'scale(1.05)' : 'scale(1)',
                  boxShadow: currentBackgroundColor === color.value ? 'var(--shadow-md)' : 'none'
                }}
              >
                {color.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Información del Negocio */}
      <div style={{
        background: 'var(--background-card)',
        padding: '1.5rem',
        borderRadius: 'var(--border-radius-md)',
        marginTop: '2rem',
        border: '1px solid var(--primary-color)'
      }}>
        <h3 style={{ 
          color: 'var(--primary-color)', 
          marginBottom: '1rem',
          fontSize: 'var(--font-size-lg)'
        }}>
          🏢 Información del Negocio
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
              <strong style={{ color: 'var(--primary-color)' }}>Barbero:</strong> {BUSINESS_INFO.barberFullName}
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
              <strong style={{ color: 'var(--primary-color)' }}>Teléfono:</strong> {BUSINESS_INFO.businessPhone}
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
              <strong style={{ color: 'var(--primary-color)' }}>Email:</strong> {BUSINESS_INFO.businessEmail}
            </p>
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
              <strong style={{ color: 'var(--primary-color)' }}>Dirección:</strong> {BUSINESS_INFO.businessAddress}
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
              <strong style={{ color: 'var(--primary-color)' }}>Horario:</strong> {BUSINESS_INFO.schedule.tuesday}
            </p>
          </div>
        </div>
      </div>

      {/* Botón de Reset */}
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button
          onClick={resetToDefaults}
          style={{
            background: 'var(--primary-color)',
            color: '#000',
            border: 'none',
            padding: '1rem 2rem',
            borderRadius: 'var(--border-radius-md)',
            cursor: 'pointer',
            fontSize: 'var(--font-size-base)',
            fontWeight: 'var(--font-weight-bold)',
            transition: 'var(--transition-normal)',
            boxShadow: 'var(--shadow-md)'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = 'var(--shadow-lg)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'var(--shadow-md)';
          }}
        >
          🔄 Restaurar Colores por Defecto
        </button>
      </div>

      {/* Instrucciones */}
      <div style={{
        background: 'var(--background-tertiary)',
        padding: '1.5rem',
        borderRadius: 'var(--border-radius-md)',
        marginTop: '2rem',
        border: '1px solid var(--primary-color)'
      }}>
        <h4 style={{ 
          color: 'var(--primary-color)', 
          marginBottom: '1rem',
          fontSize: 'var(--font-size-base)'
        }}>
          📝 Cómo Usar las Variables Globales
        </h4>
        
        <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
          <p><strong>1.</strong> Para cambiar colores dinámicamente:</p>
          <code style={{ 
            background: 'var(--background-primary)', 
            padding: '0.5rem', 
            borderRadius: 'var(--border-radius-sm)',
            display: 'block',
            margin: '0.5rem 0',
            color: 'var(--primary-color)'
          }}>
            import { changePrimaryColor } from './config/theme';<br/>
            changePrimaryColor('#FFFFFF'); // Cambiar a blanco
          </code>
          
          <p><strong>2.</strong> Para usar en CSS:</p>
          <code style={{ 
            background: 'var(--background-primary)', 
            padding: '0.5rem', 
            borderRadius: 'var(--border-radius-sm)',
            display: 'block',
            margin: '0.5rem 0',
            color: 'var(--primary-color)'
          }}>
            color: var(--primary-color);<br/>
            background: var(--background-primary);
          </code>
          
          <p><strong>3.</strong> Para usar en React inline styles:</p>
          <code style={{ 
            background: 'var(--background-primary)', 
            padding: '0.5rem', 
            borderRadius: 'var(--border-radius-sm)',
            display: 'block',
            margin: '0.5rem 0',
            color: 'var(--primary-color)'
          }}>
            style={{ color: 'var(--primary-color)' }}
          </code>
        </div>
      </div>
    </div>
  );
};

export default ThemeDemo; 