package com.pomelo.app.springboot.app.service;

import com.pomelo.app.springboot.app.entity.DiasLaborables;
import com.pomelo.app.springboot.app.entity.DiasNoLaborables;
import com.pomelo.app.springboot.app.repository.DiasLaborablesRepository;
import com.pomelo.app.springboot.app.repository.DiasNoLaborablesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class DiasLaborablesService {
    
    @Autowired
    private DiasLaborablesRepository diasLaborablesRepository;
    
    @Autowired
    private DiasNoLaborablesRepository diasNoLaborablesRepository;
    
    /**
     * Inicializa los días laborables por defecto (Lunes a Viernes)
     */
    public void inicializarDiasLaborables() {
        // Verificar si ya existen registros
        if (diasLaborablesRepository.count() == 0) {
            // Crear configuración por defecto: Lunes a Viernes laborables
            for (DayOfWeek dia : DayOfWeek.values()) {
                boolean esLaborable = dia != DayOfWeek.SATURDAY && dia != DayOfWeek.SUNDAY;
                DiasLaborables diaLaborable = new DiasLaborables(dia, esLaborable);
                diasLaborablesRepository.save(diaLaborable);
            }
        }
    }
    
    /**
     * Obtiene todos los días laborables
     */
    public List<DiasLaborables> obtenerTodosLosDias() {
        return diasLaborablesRepository.findAll();
    }
    
    /**
     * Obtiene solo los días laborables
     */
    public List<DiasLaborables> obtenerDiasLaborables() {
        return diasLaborablesRepository.findByEsLaborableTrue();
    }
    
    /**
     * Actualiza la configuración de un día de la semana
     */
    public DiasLaborables actualizarDiaLaborable(DayOfWeek diaSemana, boolean esLaborable, String horaInicio, String horaFin) {
        Optional<DiasLaborables> diaExistente = diasLaborablesRepository.findByDiaSemana(diaSemana);
        
        if (diaExistente.isPresent()) {
            DiasLaborables dia = diaExistente.get();
            dia.setEsLaborable(esLaborable);
            dia.setHoraInicio(horaInicio);
            dia.setHoraFin(horaFin);
            return diasLaborablesRepository.save(dia);
        } else {
            DiasLaborables nuevoDia = new DiasLaborables(diaSemana, esLaborable, horaInicio, horaFin);
            return diasLaborablesRepository.save(nuevoDia);
        }
    }
    
    /**
     * Verifica si un día específico es laborable
     */
    public boolean esDiaLaborable(LocalDate fecha) {
        DayOfWeek diaSemana = fecha.getDayOfWeek();
        
        // Verificar si es un día no laborable específico
        if (diasNoLaborablesRepository.existeDiaNoLaborableEnFecha(fecha)) {
            return false;
        }
        
        // Verificar configuración semanal
        Optional<DiasLaborables> diaConfig = diasLaborablesRepository.findByDiaSemana(diaSemana);
        return diaConfig.map(DiasLaborables::isEsLaborable).orElse(false);
    }
    
    /**
     * Obtiene el horario de un día específico
     */
    public Optional<DiasLaborables> obtenerHorarioDia(DayOfWeek diaSemana) {
        return diasLaborablesRepository.findByDiaSemana(diaSemana);
    }
    
    /**
     * Añade un día no laborable específico
     */
    public DiasNoLaborables añadirDiaNoLaborable(LocalDate fecha, String descripcion, String tipo) {
        DiasNoLaborables diaNoLaborable = new DiasNoLaborables(fecha, descripcion, tipo);
        return diasNoLaborablesRepository.save(diaNoLaborable);
    }
    
    /**
     * Obtiene todos los días no laborables activos
     */
    public List<DiasNoLaborables> obtenerDiasNoLaborables() {
        return diasNoLaborablesRepository.findByActivoTrueOrderByFechaAsc();
    }
    
    /**
     * Obtiene días no laborables en un rango de fechas
     */
    public List<DiasNoLaborables> obtenerDiasNoLaborablesEnRango(LocalDate fechaInicio, LocalDate fechaFin) {
        return diasNoLaborablesRepository.findActivosEnRango(fechaInicio, fechaFin);
    }
    
    /**
     * Elimina un día no laborable (marca como inactivo)
     */
    public void eliminarDiaNoLaborable(Long id) {
        Optional<DiasNoLaborables> dia = diasNoLaborablesRepository.findById(id);
        if (dia.isPresent()) {
            DiasNoLaborables diaNoLaborable = dia.get();
            diaNoLaborable.setActivo(false);
            diasNoLaborablesRepository.save(diaNoLaborable);
        }
    }
    
    /**
     * Obtiene información completa de disponibilidad para una fecha
     */
    public String obtenerInformacionDisponibilidad(LocalDate fecha) {
        if (!esDiaLaborable(fecha)) {
            // Verificar si es un día no laborable específico
            Optional<DiasNoLaborables> diaNoLaborable = diasNoLaborablesRepository.findActivoByFecha(fecha);
            if (diaNoLaborable.isPresent()) {
                return "Cerrado: " + diaNoLaborable.get().getDescripcion();
            } else {
                return "Cerrado: No es día laborable";
            }
        }
        
        // Es un día laborable, obtener horario
        Optional<DiasLaborables> horario = diasLaborablesRepository.findByDiaSemana(fecha.getDayOfWeek());
        if (horario.isPresent()) {
            DiasLaborables dia = horario.get();
            return "Abierto: " + dia.getHoraInicio() + " - " + dia.getHoraFin();
        }
        
        return "Horario no configurado";
    }
}
