package com.pomelo.app.springboot.app.service;

import org.springframework.stereotype.Service;
import java.util.regex.Pattern;

@Service
public class PhoneValidationService {

    /**
     * Limpia un número de teléfono removiendo todos los caracteres no numéricos
     * @param phone Número de teléfono a limpiar
     * @return Número de teléfono solo con dígitos
     */
    public String cleanPhoneNumber(String phone) {
        if (phone == null) return "";
        return phone.replaceAll("\\D", "");
    }

    /**
     * Valida si un número de teléfono tiene el formato correcto (internacional)
     * @param phone Número de teléfono a validar
     * @return true si es válido, false en caso contrario
     */
    public boolean validateSpanishPhone(String phone) {
        if (phone == null || phone.trim().isEmpty()) {
            return false;
        }

        String cleanPhone = cleanPhoneNumber(phone);
        
        // Patrones válidos para números internacionales:
        // - 7-15 dígitos (rango estándar internacional)
        // - Números españoles: 9 dígitos empezando por 6, 7, 9
        // - Números con prefijo internacional: +34, +1, +44, etc.
        
        // Validación básica: entre 7 y 15 dígitos
        if (cleanPhone.length() < 7 || cleanPhone.length() > 15) {
            return false;
        }
        
        // Para números españoles (9 dígitos), verificar que empiece por 6, 7 o 9
        if (cleanPhone.length() == 9) {
            return Pattern.compile("^[679]\\d{8}$").matcher(cleanPhone).matches();
        }
        
        // Para números con prefijo internacional, verificar formato
        if (cleanPhone.startsWith("34") && cleanPhone.length() == 11) {
            return Pattern.compile("^34[679]\\d{8}$").matcher(cleanPhone).matches();
        }
        
        // Para otros prefijos internacionales, solo verificar longitud
        return true;
    }

    /**
     * Normaliza un número de teléfono para almacenar en la base de datos
     * @param phone Número de teléfono a normalizar
     * @return Número normalizado (solo dígitos)
     */
    public String normalizePhoneForStorage(String phone) {
        if (phone == null || phone.trim().isEmpty()) {
            return "";
        }

        String cleanPhone = cleanPhoneNumber(phone);
        
        // Si empieza con +34, remover el + y mantener solo los dígitos
        if (cleanPhone.startsWith("34") && cleanPhone.length() == 11) {
            return cleanPhone;
        }
        
        // Si empieza con 0034, remover el 00 y mantener solo los dígitos
        if (cleanPhone.startsWith("0034") && cleanPhone.length() == 13) {
            return cleanPhone.substring(2);
        }
        
        // Para números de 9 dígitos españoles, agregar el prefijo 34
        if (cleanPhone.length() == 9 && Pattern.compile("^[679]\\d{8}$").matcher(cleanPhone).matches()) {
            return "34" + cleanPhone;
        }
        
        // Para otros números, mantener como están (solo dígitos)
        return cleanPhone;
    }

    /**
     * Formatea un número de teléfono para mostrar en la interfaz
     * @param phone Número de teléfono a formatear
     * @return Número formateado para mostrar
     */
    public String formatPhoneForDisplay(String phone) {
        if (phone == null || phone.trim().isEmpty()) {
            return "";
        }

        String cleanPhone = cleanPhoneNumber(phone);
        
        if (cleanPhone.length() == 0) return "";
        
        // Si empieza con +34, formatear como +34 XXX XXX XXX
        if (cleanPhone.startsWith("34") && cleanPhone.length() == 11) {
            return String.format("+34 %s %s %s", 
                cleanPhone.substring(2, 5), 
                cleanPhone.substring(5, 8), 
                cleanPhone.substring(8));
        }
        
        // Si empieza con 0034, formatear como +34 XXX XXX XXX
        if (cleanPhone.startsWith("0034") && cleanPhone.length() == 13) {
            return String.format("+34 %s %s %s", 
                cleanPhone.substring(4, 7), 
                cleanPhone.substring(7, 10), 
                cleanPhone.substring(10));
        }
        
        // Para números de 9 dígitos, formatear como XXX XXX XXX
        if (cleanPhone.length() == 9) {
            return String.format("%s %s %s", 
                cleanPhone.substring(0, 3), 
                cleanPhone.substring(3, 6), 
                cleanPhone.substring(6));
        }
        
        // Si no coincide con ningún patrón, devolver el número limpio
        return cleanPhone;
    }

    /**
     * Obtiene el mensaje de error para un número de teléfono inválido
     * @param phone Número de teléfono a validar
     * @return Mensaje de error o null si es válido
     */
    public String getPhoneErrorMessage(String phone) {
        if (phone == null || phone.trim().isEmpty()) {
            return "El número de teléfono es obligatorio";
        }
        
        if (!validateSpanishPhone(phone)) {
            return "El número de teléfono debe tener entre 7 y 15 dígitos. Para números españoles debe empezar por 6, 7 o 9";
        }
        
        return null;
    }
} 