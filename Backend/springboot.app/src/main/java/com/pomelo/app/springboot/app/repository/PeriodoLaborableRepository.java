package com.pomelo.app.springboot.app.repository;

import com.pomelo.app.springboot.app.entity.PeriodoLaborable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PeriodoLaborableRepository extends JpaRepository<PeriodoLaborable, Long> {

    // Buscar períodos activos que incluyan una fecha específica
    @Query("SELECT p FROM PeriodoLaborable p WHERE p.activo = true AND p.fechaInicio <= :fecha AND p.fechaFin >= :fecha")
    List<PeriodoLaborable> findPeriodosActivosPorFecha(@Param("fecha") LocalDate fecha);

    // Buscar todos los períodos activos
    List<PeriodoLaborable> findByActivoTrue();

    // Buscar períodos que se solapen con un rango de fechas
    @Query("SELECT p FROM PeriodoLaborable p WHERE p.activo = true AND " +
           "((p.fechaInicio <= :fechaInicio AND p.fechaFin >= :fechaInicio) OR " +
           "(p.fechaInicio <= :fechaFin AND p.fechaFin >= :fechaFin) OR " +
           "(p.fechaInicio >= :fechaInicio AND p.fechaFin <= :fechaFin))")
    List<PeriodoLaborable> findPeriodosSolapados(@Param("fechaInicio") LocalDate fechaInicio, 
                                                 @Param("fechaFin") LocalDate fechaFin);

    // Buscar períodos por nombre (para validar duplicados)
    List<PeriodoLaborable> findByNombreIgnoreCase(String nombre);
}
