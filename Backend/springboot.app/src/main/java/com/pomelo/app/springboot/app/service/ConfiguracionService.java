package com.pomelo.app.springboot.app.service;

import com.pomelo.app.springboot.app.entity.Configuracion;
import com.pomelo.app.springboot.app.repository.ConfiguracionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ConfiguracionService {
    
    @Autowired
    private ConfiguracionRepository configuracionRepository;
    
    private static final String CLAVE_TIEMPO_MINIMO = "tiempo_minimo_reserva";
    
    public void configurarTiempoMinimo(int horasMinimas) {
        Optional<Configuracion> configOpt = configuracionRepository.findByClave(CLAVE_TIEMPO_MINIMO);
        
        if (configOpt.isPresent()) {
            // Actualizar configuración existente
            Configuracion config = configOpt.get();
            config.setValor(String.valueOf(horasMinimas));
            configuracionRepository.save(config);
        } else {
            // Crear nueva configuración
            Configuracion config = new Configuracion(
                CLAVE_TIEMPO_MINIMO, 
                String.valueOf(horasMinimas), 
                "Tiempo mínimo en horas para reservar una cita"
            );
            configuracionRepository.save(config);
        }
    }
    
    public int obtenerTiempoMinimo() {
        Optional<Configuracion> configOpt = configuracionRepository.findByClave(CLAVE_TIEMPO_MINIMO);
        
        if (configOpt.isPresent()) {
            try {
                return Integer.parseInt(configOpt.get().getValor());
            } catch (NumberFormatException e) {
                return 24; // Valor por defecto
            }
        }
        
        return 24; // Valor por defecto si no existe configuración
    }
    
    public boolean puedeReservar(String rolUsuario, int horasAntes) {
        // Los administradores pueden reservar en cualquier momento
        if ("ADMIN".equals(rolUsuario)) {
            return true;
        }
        
        // Para usuarios normales, verificar el tiempo mínimo
        int tiempoMinimo = obtenerTiempoMinimo();
        return horasAntes >= tiempoMinimo;
    }
} 