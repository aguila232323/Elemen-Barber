// Utilidades para validación y formateo de números de teléfono

/**
 * Limpia un número de teléfono removiendo todos los caracteres no numéricos
 * @param phone - Número de teléfono a limpiar
 * @returns Número de teléfono solo con dígitos
 */
export const cleanPhoneNumber = (phone: string): string => {
  return phone.replace(/\D/g, '');
};

/**
 * Valida si un número de teléfono tiene el formato correcto para España
 * @param phone - Número de teléfono a validar
 * @returns true si es válido, false en caso contrario
 */
export const validateSpanishPhone = (phone: string): boolean => {
  const cleanPhone = cleanPhoneNumber(phone);
  
  // Patrones válidos para España:
  // - 9 dígitos: 6XXXXXXXX, 7XXXXXXXX, 8XXXXXXXX, 9XXXXXXXX
  // - 9 dígitos con prefijo: +346XXXXXXXX, +347XXXXXXXX, etc.
  // - 9 dígitos con prefijo 00: 00346XXXXXXXX, 00347XXXXXXXX, etc.
  
  const patterns = [
    /^[679]\d{8}$/,           // 9 dígitos empezando por 6, 7, 9
    /^\+34[679]\d{8}$/,       // +34 seguido de 9 dígitos
    /^0034[679]\d{8}$/,       // 0034 seguido de 9 dígitos
  ];
  
  return patterns.some(pattern => pattern.test(cleanPhone));
};

/**
 * Formatea un número de teléfono para mostrar en la interfaz
 * @param phone - Número de teléfono a formatear
 * @returns Número formateado para mostrar
 */
export const formatPhoneForDisplay = (phone: string): string => {
  const cleanPhone = cleanPhoneNumber(phone);
  
  if (cleanPhone.length === 0) return '';
  
  // Si empieza con +34, formatear como +34 XXX XXX XXX
  if (cleanPhone.startsWith('34') && cleanPhone.length === 11) {
    return `+34 ${cleanPhone.slice(2, 5)} ${cleanPhone.slice(5, 8)} ${cleanPhone.slice(8)}`;
  }
  
  // Si empieza con 0034, formatear como +34 XXX XXX XXX
  if (cleanPhone.startsWith('0034') && cleanPhone.length === 13) {
    return `+34 ${cleanPhone.slice(4, 7)} ${cleanPhone.slice(7, 10)} ${cleanPhone.slice(10)}`;
  }
  
  // Para números de 9 dígitos, formatear como XXX XXX XXX
  if (cleanPhone.length === 9) {
    return `${cleanPhone.slice(0, 3)} ${cleanPhone.slice(3, 6)} ${cleanPhone.slice(6)}`;
  }
  
  // Si no coincide con ningún patrón, devolver el número limpio
  return cleanPhone;
};

/**
 * Normaliza un número de teléfono para almacenar en la base de datos
 * @param phone - Número de teléfono a normalizar
 * @returns Número normalizado (solo dígitos)
 */
export const normalizePhoneForStorage = (phone: string): string => {
  const cleanPhone = cleanPhoneNumber(phone);
  
  // Si empieza con +34, remover el + y mantener solo los dígitos
  if (cleanPhone.startsWith('34') && cleanPhone.length === 11) {
    return cleanPhone;
  }
  
  // Si empieza con 0034, remover el 00 y mantener solo los dígitos
  if (cleanPhone.startsWith('0034') && cleanPhone.length === 13) {
    return cleanPhone.slice(2);
  }
  
  // Para números de 9 dígitos, agregar el prefijo 34
  if (cleanPhone.length === 9) {
    return `34${cleanPhone}`;
  }
  
  return cleanPhone;
};

/**
 * Obtiene el mensaje de error para un número de teléfono inválido
 * @param phone - Número de teléfono a validar
 * @returns Mensaje de error o null si es válido
 */
export const getPhoneErrorMessage = (phone: string): string | null => {
  const cleanPhone = cleanPhoneNumber(phone);
  
  if (cleanPhone.length === 0) {
    return 'El número de teléfono es obligatorio';
  }
  
  if (!validateSpanishPhone(phone)) {
    return 'El número de teléfono debe tener 9 dígitos y empezar por 6, 7 o 9';
  }
  
  return null;
};

/**
 * Maneja el cambio en un campo de teléfono, aplicando formato automático
 * @param value - Valor actual del campo
 * @param setValue - Función para actualizar el valor
 */
export const handlePhoneChange = (
  value: string, 
  setValue: (value: string) => void
): void => {
  // Solo permitir dígitos, espacios, + y -
  const allowedChars = /^[\d\s\+\-\(\)]*$/;
  
  if (!allowedChars.test(value)) {
    return;
  }
  
  // Si el usuario está escribiendo, no aplicar formato automático
  // Solo limpiar caracteres no permitidos
  const cleanValue = value.replace(/[^\d\s\+\-\(\)]/g, '');
  setValue(cleanValue);
};

/**
 * Aplica formato automático cuando el usuario termina de escribir
 * @param value - Valor actual del campo
 * @param setValue - Función para actualizar el valor
 */
export const handlePhoneBlur = (
  value: string, 
  setValue: (value: string) => void
): void => {
  const formatted = formatPhoneForDisplay(value);
  setValue(formatted);
}; 