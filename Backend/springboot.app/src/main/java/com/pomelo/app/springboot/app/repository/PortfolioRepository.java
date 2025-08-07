package com.pomelo.app.springboot.app.repository;

import com.pomelo.app.springboot.app.entity.Portfolio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PortfolioRepository extends JpaRepository<Portfolio, Long> {
    
    /**
     * Obtiene todas las fotos del portfolio ordenadas por fecha de creación (más recientes primero)
     */
    List<Portfolio> findAllByOrderByFechaCreacionDesc();
    
    /**
     * Obtiene todas las fotos activas del portfolio ordenadas por fecha de creación
     */
    List<Portfolio> findByActivoTrueOrderByFechaCreacionDesc();
    
    /**
     * Cuenta el número total de fotos activas
     */
    long countByActivoTrue();
} 