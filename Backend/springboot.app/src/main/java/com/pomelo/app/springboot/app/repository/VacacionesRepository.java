package com.pomelo.app.springboot.app.repository;

import com.pomelo.app.springboot.app.entity.Vacaciones;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface VacacionesRepository extends JpaRepository<Vacaciones, Long> {
    
    // Buscar vacaciones activas que se solapan con un rango de fechas
    @Query("SELECT v FROM Vacaciones v WHERE v.activo = true AND " +
           "((v.fechaInicio <= :fechaFin AND v.fechaFin >= :fechaInicio) OR " +
           "(v.fechaInicio <= :fechaInicio AND v.fechaFin >= :fechaInicio) OR " +
           "(v.fechaInicio <= :fechaFin AND v.fechaFin >= :fechaFin))")
    List<Vacaciones> findVacacionesActivasEnRango(@Param("fechaInicio") LocalDate fechaInicio, 
                                                  @Param("fechaFin") LocalDate fechaFin);
    
    // Buscar todas las vacaciones activas
    List<Vacaciones> findByActivoTrue();
    
    // Verificar si una fecha específica está en vacaciones
    @Query("SELECT COUNT(v) > 0 FROM Vacaciones v WHERE v.activo = true AND :fecha BETWEEN v.fechaInicio AND v.fechaFin")
    boolean existeVacacionEnFecha(@Param("fecha") LocalDate fecha);
} 