package com.pomelo.app.springboot.app.service;

import com.pomelo.app.springboot.app.entity.DiasLaborables;
import com.pomelo.app.springboot.app.repository.DiasLaborablesRepository;
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
    public DiasLaborables actualizarDiaLaborable(DayOfWeek diaSemana, boolean esLaborable) {
        Optional<DiasLaborables> diaExistente = diasLaborablesRepository.findByDiaSemana(diaSemana);
        
        if (diaExistente.isPresent()) {
            DiasLaborables dia = diaExistente.get();
            dia.setEsLaborable(esLaborable);
            return diasLaborablesRepository.save(dia);
        } else {
            DiasLaborables nuevoDia = new DiasLaborables(diaSemana, esLaborable);
            return diasLaborablesRepository.save(nuevoDia);
        }
    }
    
    /**
     * Verifica si un día específico es laborable
     */
    public boolean esDiaLaborable(LocalDate fecha) {
        DayOfWeek diaSemana = fecha.getDayOfWeek();
        
        // Verificar configuración semanal
        Optional<DiasLaborables> diaConfig = diasLaborablesRepository.findByDiaSemana(diaSemana);
        return diaConfig.map(DiasLaborables::isEsLaborable).orElse(false);
    }
    
    /**
     * Obtiene la configuración de un día específico
     */
    public Optional<DiasLaborables> obtenerDia(DayOfWeek diaSemana) {
        return diasLaborablesRepository.findByDiaSemana(diaSemana);
    }
    
    /**
     * Obtiene información de disponibilidad para una fecha
     */
    public String obtenerInformacionDisponibilidad(LocalDate fecha) {
        if (!esDiaLaborable(fecha)) {
            return "Cerrado: No es día laborable";
        }
        
        return "Abierto: Día laborable";
    }
}
