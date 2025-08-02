import React, { useState } from 'react';
import { changePrimaryColor, COLORS } from '../../config/theme';

const ColorDemo = () => {
  const [customColor, setCustomColor] = useState('#2196F3');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleChangeToBlue = () => {
    changePrimaryColor('#2196F3');
  };

  const handleChangeToGold = () => {
    changePrimaryColor('#FFD600');
  };

  const handleChangeToRed = () => {
    changePrimaryColor('#f44336');
  };

  const handleChangeToGreen = () => {
    changePrimaryColor('#4CAF50');
  };

  const handleChangeToPurple = () => {
    changePrimaryColor('#9C27B0');
  };

  const handleChangeToOrange = () => {
    changePrimaryColor('#FF9800');
  };

  const handleCustomColorChange = (e) => {
    setCustomColor(e.target.value);
  };

  const handleApplyCustomColor = () => {
    changePrimaryColor(customColor);
  };

  const handleToggleCustomInput = () => {
    setShowCustomInput(!showCustomInput);
  };

  return (
    <div style={{
      position: 'fixed',
      top: '120px', // Desplazado hacia abajo
      right: '20px',
      background: 'var(--background-card)',
      padding: '1.2rem',
      borderRadius: 'var(--border-radius-md)',
      border: '2px solid var(--primary-color)',
      zIndex: 9999,
      boxShadow: 'var(--shadow-lg)',
      minWidth: '200px',
      maxWidth: '220px'
    }}>
      <h3 style={{ 
        color: 'var(--primary-color)', 
        marginBottom: '1rem',
        fontSize: 'var(--font-size-sm)',
        textAlign: 'center',
        fontWeight: 'var(--font-weight-bold)'
      }}>
        🎨 Demo de Colores
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <button
          onClick={handleChangeToBlue}
          style={{
            background: '#2196F3',
            color: '#fff',
            border: 'none',
            padding: '0.5rem',
            borderRadius: 'var(--border-radius-sm)',
            cursor: 'pointer',
            fontSize: 'var(--font-size-xs)',
            fontWeight: 'var(--font-weight-medium)',
            transition: 'var(--transition-normal)'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          🔵 Azul
        </button>
        
        <button
          onClick={handleChangeToGold}
          style={{
            background: '#FFD600',
            color: '#000',
            border: 'none',
            padding: '0.5rem',
            borderRadius: 'var(--border-radius-sm)',
            cursor: 'pointer',
            fontSize: 'var(--font-size-xs)',
            fontWeight: 'var(--font-weight-medium)',
            transition: 'var(--transition-normal)'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          🟡 Dorado
        </button>
        
        <button
          onClick={handleChangeToRed}
          style={{
            background: '#f44336',
            color: '#fff',
            border: 'none',
            padding: '0.5rem',
            borderRadius: 'var(--border-radius-sm)',
            cursor: 'pointer',
            fontSize: 'var(--font-size-xs)',
            fontWeight: 'var(--font-weight-medium)',
            transition: 'var(--transition-normal)'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          🔴 Rojo
        </button>
        
        <button
          onClick={handleChangeToGreen}
          style={{
            background: '#4CAF50',
            color: '#fff',
            border: 'none',
            padding: '0.5rem',
            borderRadius: 'var(--border-radius-sm)',
            cursor: 'pointer',
            fontSize: 'var(--font-size-xs)',
            fontWeight: 'var(--font-weight-medium)',
            transition: 'var(--transition-normal)'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          🟢 Verde
        </button>

        <button
          onClick={handleChangeToPurple}
          style={{
            background: '#9C27B0',
            color: '#fff',
            border: 'none',
            padding: '0.5rem',
            borderRadius: 'var(--border-radius-sm)',
            cursor: 'pointer',
            fontSize: 'var(--font-size-xs)',
            fontWeight: 'var(--font-weight-medium)',
            transition: 'var(--transition-normal)'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          🟣 Púrpura
        </button>

        <button
          onClick={handleChangeToOrange}
          style={{
            background: '#FF9800',
            color: '#fff',
            border: 'none',
            padding: '0.5rem',
            borderRadius: 'var(--border-radius-sm)',
            cursor: 'pointer',
            fontSize: 'var(--font-size-xs)',
            fontWeight: 'var(--font-weight-medium)',
            transition: 'var(--transition-normal)'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          🟠 Naranja
        </button>

        {/* Botón para mostrar/ocultar input personalizado */}
        <button
          onClick={handleToggleCustomInput}
          style={{
            background: 'var(--background-primary)',
            color: 'var(--primary-color)',
            border: '1px solid var(--primary-color)',
            padding: '0.5rem',
            borderRadius: 'var(--border-radius-sm)',
            cursor: 'pointer',
            fontSize: 'var(--font-size-xs)',
            fontWeight: 'var(--font-weight-medium)',
            transition: 'var(--transition-normal)',
            marginTop: '0.5rem'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          {showCustomInput ? '❌ Cerrar' : '🎨 Color Personalizado'}
        </button>

        {/* Input para color personalizado */}
        {showCustomInput && (
          <div style={{
            marginTop: '0.5rem',
            padding: '0.5rem',
            background: 'var(--background-primary)',
            borderRadius: 'var(--border-radius-sm)',
            border: '1px solid var(--primary-color)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.5rem'
            }}>
              <input
                type="color"
                value={customColor}
                onChange={handleCustomColorChange}
                style={{
                  width: '30px',
                  height: '30px',
                  border: 'none',
                  borderRadius: 'var(--border-radius-sm)',
                  cursor: 'pointer'
                }}
              />
              <input
                type="text"
                value={customColor}
                onChange={handleCustomColorChange}
                style={{
                  flex: 1,
                  background: 'var(--background-secondary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--primary-color)',
                  borderRadius: 'var(--border-radius-sm)',
                  padding: '0.3rem',
                  fontSize: 'var(--font-size-xs)'
                }}
                placeholder="#000000"
              />
            </div>
            <button
              onClick={handleApplyCustomColor}
              style={{
                width: '100%',
                background: 'var(--primary-color)',
                color: '#fff',
                border: 'none',
                padding: '0.4rem',
                borderRadius: 'var(--border-radius-sm)',
                cursor: 'pointer',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 'var(--font-weight-medium)',
                transition: 'var(--transition-normal)'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            >
              Aplicar Color
            </button>
          </div>
        )}
      </div>
      
      <div style={{ 
        marginTop: '1rem', 
        padding: '0.5rem',
        background: 'var(--background-primary)',
        borderRadius: 'var(--border-radius-sm)',
        fontSize: 'var(--font-size-xs)',
        color: 'var(--text-secondary)',
        textAlign: 'center'
      }}>
        Color actual: <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>
          {COLORS.primary}
        </span>
      </div>
    </div>
  );
};

export default ColorDemo; 