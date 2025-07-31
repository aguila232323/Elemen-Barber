package com.pomelo.app.springboot.app.service;

import com.pomelo.app.springboot.app.entity.Vacaciones;
import com.pomelo.app.springboot.app.repository.VacacionesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class VacacionesService {
    
    @Autowired
    private VacacionesRepository vacacionesRepository;
    
    public Vacaciones crearVacaciones(LocalDate fechaInicio, LocalDate fechaFin, String descripcion) {
        try {
            // Validar que la fecha de inicio no sea posterior a la fecha de fin
            if (fechaInicio.isAfter(fechaFin)) {
                throw new RuntimeException("La fecha de inicio no puede ser posterior a la fecha de fin");
            }
            
            // Validar que no se solape con vacaciones existentes
            List<Vacaciones> vacacionesSolapadas = vacacionesRepository.findVacacionesActivasEnRango(fechaInicio, fechaFin);
            if (!vacacionesSolapadas.isEmpty()) {
                throw new RuntimeException("Ya existe un período de vacaciones que se solapa con las fechas especificadas");
            }
            
            Vacaciones vacaciones = new Vacaciones(fechaInicio, fechaFin, descripcion);
            return vacacionesRepository.save(vacaciones);
        } catch (Exception e) {
            throw new RuntimeException("Error al crear vacaciones: " + e.getMessage(), e);
        }
    }
    
    public List<Vacaciones> listarVacacionesActivas() {
        try {
            return vacacionesRepository.findByActivoTrue();
        } catch (Exception e) {
            throw new RuntimeException("Error al listar vacaciones: " + e.getMessage(), e);
        }
    }
    
    public void eliminarVacaciones(Long id) {
        try {
            Vacaciones vacaciones = vacacionesRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vacaciones no encontradas"));
            
            vacaciones.setActivo(false);
            vacacionesRepository.save(vacaciones);
        } catch (Exception e) {
            throw new RuntimeException("Error al eliminar vacaciones: " + e.getMessage(), e);
        }
    }
    
    public boolean esFechaVacaciones(LocalDate fecha) {
        try {
            return vacacionesRepository.existeVacacionEnFecha(fecha);
        } catch (Exception e) {
            // En caso de error, asumir que no es vacaciones
            return false;
        }
    }
    
    public List<Vacaciones> obtenerVacacionesEnRango(LocalDate fechaInicio, LocalDate fechaFin) {
        try {
            return vacacionesRepository.findVacacionesActivasEnRango(fechaInicio, fechaFin);
        } catch (Exception e) {
            throw new RuntimeException("Error al obtener vacaciones en rango: " + e.getMessage(), e);
        }
    }
} 