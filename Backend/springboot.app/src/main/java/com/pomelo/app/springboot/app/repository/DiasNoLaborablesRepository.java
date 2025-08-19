package com.pomelo.app.springboot.app.repository;

import com.pomelo.app.springboot.app.entity.DiasNoLaborables;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DiasNoLaborablesRepository extends JpaRepository<DiasNoLaborables, Long> {
    
    Optional<DiasNoLaborables> findByFecha(LocalDate fecha);
    
    List<DiasNoLaborables> findByActivoTrue();
    
    List<DiasNoLaborables> findByActivoTrueOrderByFechaAsc();
    
    @Query("SELECT d FROM DiasNoLaborables d WHERE d.fecha = :fecha AND d.activo = true")
    Optional<DiasNoLaborables> findActivoByFecha(@Param("fecha") LocalDate fecha);
    
    @Query("SELECT d FROM DiasNoLaborables d WHERE d.fecha BETWEEN :fechaInicio AND :fechaFin AND d.activo = true ORDER BY d.fecha ASC")
    List<DiasNoLaborables> findActivosEnRango(@Param("fechaInicio") LocalDate fechaInicio, @Param("fechaFin") LocalDate fechaFin);
    
    @Query("SELECT COUNT(d) > 0 FROM DiasNoLaborables d WHERE d.fecha = :fecha AND d.activo = true")
    boolean existeDiaNoLaborableEnFecha(@Param("fecha") LocalDate fecha);
}
