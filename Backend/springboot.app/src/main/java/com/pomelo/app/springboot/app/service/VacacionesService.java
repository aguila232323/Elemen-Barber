package com.pomelo.app.springboot.app.service;

import com.pomelo.app.springboot.app.entity.Vacaciones;
import com.pomelo.app.springboot.app.entity.Cita;
import com.pomelo.app.springboot.app.repository.VacacionesRepository;
import com.pomelo.app.springboot.app.repository.CitaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class VacacionesService {
    @Autowired private VacacionesRepository vacacionesRepository;
    @Autowired private CitaRepository citaRepository;
    
    public Vacaciones crearVacaciones(LocalDate fechaInicio, LocalDate fechaFin, String descripcion) {
        Vacaciones vacaciones = new Vacaciones(fechaInicio, fechaFin, descripcion);
        Vacaciones savedVacaciones = vacacionesRepository.save(vacaciones);
        
        // Cancelar citas que coincidan con el período de vacaciones
        cancelarCitasEnVacaciones(fechaInicio, fechaFin);
        
        return savedVacaciones;
    }
    
    public List<Vacaciones> listarVacacionesActivas() {
        return vacacionesRepository.findByActivoTrue();
    }
    
    public void eliminarVacaciones(Long id) {
        Vacaciones vacaciones = vacacionesRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Vacaciones no encontradas"));
        vacaciones.setActivo(false);
        vacacionesRepository.save(vacaciones);
    }
    
    public boolean esFechaVacaciones(LocalDate fecha) {
        return vacacionesRepository.existeVacacionEnFecha(fecha);
    }
    
    public List<Vacaciones> obtenerVacacionesEnRango(LocalDate fechaInicio, LocalDate fechaFin) {
        return vacacionesRepository.findVacacionesActivasEnRango(fechaInicio, fechaFin);
    }
    
    /**
     * Cancela todas las citas que coincidan con el período de vacaciones
     */
    private void cancelarCitasEnVacaciones(LocalDate fechaInicio, LocalDate fechaFin) {
        // Obtener todas las citas que coincidan con el período de vacaciones
        List<Cita> citasACancelar = citaRepository.findByFechaHoraBetweenAndEstadoNot(
            fechaInicio.atStartOfDay(),
            fechaFin.atTime(23, 59, 59),
            "cancelada"
        );
        
        // Cancelar cada cita
        for (Cita cita : citasACancelar) {
            cita.setEstado("cancelada");
            cita.setComentario("Cancelada automáticamente por período de vacaciones");
            citaRepository.save(cita);
        }
    }
} 