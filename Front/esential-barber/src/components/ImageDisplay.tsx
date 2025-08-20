import React, { useState } from 'react';
import { config } from '../config/config';

interface ImageDisplayProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  onError?: () => void;
  onLoad?: () => void;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({
  src,
  alt,
  className = '',
  fallbackSrc,
  onError,
  onLoad
}) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    if (!hasError && fallbackSrc) {
      setImageSrc(fallbackSrc);
      setHasError(true);
    } else {
      setHasError(true);
      onError?.();
    }
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  // Si la imagen es una URL relativa, agregar la base URL del backend
  const getImageUrl = (url: string) => {
    if (url.startsWith('/api/files/')) {
      return `${config.API_BASE_URL}${url}`;
    }
    return url;
  };

  return (
    <div className={`image-container ${className}`} style={{ position: 'relative' }}>
      {isLoading && (
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1
          }}
        >
          <div>Cargando...</div>
        </div>
      )}
      
      {!hasError ? (
        <img
          src={getImageUrl(imageSrc)}
          alt={alt}
          className={className}
          onError={handleError}
          onLoad={handleLoad}
          style={{
            opacity: isLoading ? 0.7 : 1,
            transition: 'opacity 0.3s ease'
          }}
        />
      ) : (
        <div 
          className={`${className} fallback-image`}
          style={{
            backgroundColor: '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#666',
            fontSize: '14px'
          }}
        >
          <span>Imagen no disponible</span>
        </div>
      )}
    </div>
  );
};

export default ImageDisplay;
