package com.pomelo.app.springboot.app.repository;

import com.pomelo.app.springboot.app.entity.DiasLaborables;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Optional;

@Repository
public interface DiasLaborablesRepository extends JpaRepository<DiasLaborables, Long> {
    
    Optional<DiasLaborables> findByDiaSemana(DayOfWeek diaSemana);
    
    List<DiasLaborables> findByEsLaborableTrue();
    
    List<DiasLaborables> findByEsLaborableFalse();
    
    @Query("SELECT d FROM DiasLaborables d WHERE d.diaSemana = :diaSemana AND d.esLaborable = true")
    Optional<DiasLaborables> findLaborableByDiaSemana(@Param("diaSemana") DayOfWeek diaSemana);
}
