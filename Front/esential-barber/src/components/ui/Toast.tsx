import React from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error';
  onClose: () => void;
}

const toastStyles: React.CSSProperties = {
  position: 'fixed',
  bottom: '2rem',
  left: '50%',
  transform: 'translateX(-50%)',
  background: '#222',
  color: '#fff',
  padding: '1rem 2rem',
  borderRadius: 8,
  boxShadow: '0 2px 16px rgba(0,0,0,0.18)',
  zIndex: 2000,
  fontWeight: 600,
  fontSize: '1.1rem',
  minWidth: 220,
  textAlign: 'center',
};

const successStyle: React.CSSProperties = {
  background: '#43b94a',
};

const errorStyle: React.CSSProperties = {
  background: '#e74c3c',
};

const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 2500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div style={{
      ...toastStyles,
      ...(type === 'success' ? successStyle : {}),
      ...(type === 'error' ? errorStyle : {}),
    }}>
      {message}
    </div>
  );
};

export default Toast; 