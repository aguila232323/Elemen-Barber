import { config } from '../config/config';

export interface ImageUploadResponse {
  fileName: string;
  message: string;
}

export interface Base64UploadRequest {
  base64Data: string;
  fileName: string;
}

export class ImageService {
  /**
   * Convierte un archivo a Base64
   */
  static async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  /**
   * Valida un archivo de imagen
   */
  static validateImageFile(file: File): { isValid: boolean; error?: string } {
    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      return { isValid: false, error: 'Solo se permiten archivos de imagen' };
    }

    // Validar tamaño (5MB máximo)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return { isValid: false, error: 'El archivo es demasiado grande. Máximo 5MB' };
    }

    return { isValid: true };
  }

  /**
   * Sube una imagen usando Base64
   */
  static async uploadBase64Image(base64Data: string, fileName: string): Promise<ImageUploadResponse> {
    const response = await fetch(`${config.API_BASE_URL}/api/files/upload-base64`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        base64Data,
        fileName
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al subir la imagen');
    }

    return response.json();
  }

  /**
   * Sube un archivo usando FormData
   */
  static async uploadFile(file: File): Promise<ImageUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${config.API_BASE_URL}/api/files/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al subir la imagen');
    }

    return response.json();
  }

  /**
   * Elimina un archivo
   */
  static async deleteFile(fileName: string): Promise<void> {
    const response = await fetch(`${config.API_BASE_URL}/api/files/${fileName}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al eliminar el archivo');
    }
  }

  /**
   * Obtiene la URL completa de una imagen
   */
  static getImageUrl(imageUrl: string): string {
    if (imageUrl.startsWith('/api/files/')) {
      return `${config.API_BASE_URL}${imageUrl}`;
    }
    return imageUrl;
  }

  /**
   * Comprime una imagen antes de subirla
   */
  static async compressImage(file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();

      img.onload = () => {
        // Calcular nuevas dimensiones manteniendo la proporción
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        const newWidth = img.width * ratio;
        const newHeight = img.height * ratio;

        canvas.width = newWidth;
        canvas.height = newHeight;

        // Dibujar la imagen redimensionada
        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        // Convertir a blob
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        }, file.type, quality);
      };

      img.src = URL.createObjectURL(file);
    });
  }
}
