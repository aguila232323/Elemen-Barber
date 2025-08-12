package com.pomelo.app.springboot.app.repository;

import com.pomelo.app.springboot.app.entity.Cita;
import com.pomelo.app.springboot.app.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CitaRepository extends JpaRepository<Cita, Long> {
    
    // ========================================
    // CONSULTAS OPTIMIZADAS CON PAGINACIÓN
    // ========================================
    
    // Consultas básicas optimizadas
    @Query("SELECT c FROM Cita c JOIN FETCH c.cliente JOIN FETCH c.servicio WHERE c.cliente = :cliente ORDER BY c.fechaHora DESC")
    Page<Cita> findByClienteWithRelations(@Param("cliente") Usuario cliente, Pageable pageable);
    
    @Query("SELECT c FROM Cita c JOIN FETCH c.cliente JOIN FETCH c.servicio WHERE c.cliente = :cliente AND c.fechaHora > :fechaInicio ORDER BY c.fechaHora DESC")
    Page<Cita> findByClienteAndFechaHoraAfterWithRelations(@Param("cliente") Usuario cliente, @Param("fechaInicio") LocalDateTime fechaInicio, Pageable pageable);
    
    // Consultas con relaciones cargadas para evitar N+1
    @Query("SELECT c FROM Cita c JOIN FETCH c.cliente JOIN FETCH c.servicio WHERE c.id = :id")
    Optional<Cita> findByIdWithRelations(@Param("id") Long id);
    
    @Query("SELECT c FROM Cita c JOIN FETCH c.cliente JOIN FETCH c.servicio WHERE c.fechaHora BETWEEN :fechaInicio AND :fechaFin ORDER BY c.fechaHora ASC")
    Page<Cita> findByFechaHoraBetweenWithRelations(@Param("fechaInicio") LocalDateTime fechaInicio, @Param("fechaFin") LocalDateTime fechaFin, Pageable pageable);
    
    // Consultas de disponibilidad optimizadas
    @Query("SELECT c FROM Cita c WHERE c.fechaHora BETWEEN :fechaInicio AND :fechaFin AND c.estado IN ('confirmada', 'pendiente') ORDER BY c.fechaHora ASC")
    List<Cita> findCitasOcupadas(@Param("fechaInicio") LocalDateTime fechaInicio, @Param("fechaFin") LocalDateTime fechaFin);
    
    // Consultas de estadísticas optimizadas
    @Query("SELECT COUNT(c) FROM Cita c WHERE c.cliente = :cliente AND c.estado = :estado")
    long countByClienteAndEstado(@Param("cliente") Usuario cliente, @Param("estado") String estado);
    
    @Query("SELECT c FROM Cita c WHERE c.cliente = :cliente AND c.fija = true AND c.periodicidadDias IS NOT NULL")
    List<Cita> findCitasFijasByCliente(@Param("cliente") Usuario cliente);
    
    // Consultas de recordatorios optimizadas (batch processing)
    @Query("SELECT c FROM Cita c JOIN FETCH c.cliente JOIN FETCH c.servicio " +
           "WHERE c.fechaHora BETWEEN :fechaInicio AND :fechaFin " +
           "AND c.estado IN ('confirmada', 'pendiente') " +
           "AND c.recordatorioCitaEnviado = false " +
           "ORDER BY c.fechaHora ASC")
    List<Cita> findCitasProximas(@Param("fechaInicio") LocalDateTime fechaInicio, @Param("fechaFin") LocalDateTime fechaFin);

    // Consultas de reseñas optimizadas
    @Query("SELECT c FROM Cita c JOIN FETCH c.cliente JOIN FETCH c.servicio " +
           "WHERE c.fechaHora < :ahora " +
           "AND c.estado != 'cancelada' " +
           "AND c.recordatorioResenaEnviado = false " +
           "AND NOT EXISTS (SELECT r.id FROM Resena r WHERE r.cita = c) " +
           "ORDER BY c.fechaHora DESC")
    List<Cita> findCitasPendientesDeResena(@Param("ahora") LocalDateTime ahora);
    
    // Consultas de disponibilidad por servicio
    @Query("SELECT c FROM Cita c WHERE c.servicio.id = :servicioId " +
           "AND c.fechaHora BETWEEN :fechaInicio AND :fechaFin " +
           "AND c.estado IN ('confirmada', 'pendiente') " +
           "ORDER BY c.fechaHora ASC")
    List<Cita> findCitasOcupadasByServicio(@Param("servicioId") Long servicioId, 
                                          @Param("fechaInicio") LocalDateTime fechaInicio, 
                                          @Param("fechaFin") LocalDateTime fechaFin);
    
    // Consultas de citas por fecha específica
    @Query("SELECT c FROM Cita c JOIN FETCH c.cliente JOIN FETCH c.servicio " +
           "WHERE DATE(c.fechaHora) = :fecha ORDER BY c.fechaHora ASC")
    List<Cita> findByFechaWithRelations(@Param("fecha") LocalDate fecha);
    
    // Consultas de citas canceladas
    @Query("SELECT c FROM Cita c WHERE c.fechaHora BETWEEN :fechaInicio AND :fechaFin AND c.estado = 'cancelada'")
    List<Cita> findByFechaHoraBetweenAndEstadoNot(@Param("fechaInicio") LocalDateTime fechaInicio, 
                                                   @Param("fechaFin") LocalDateTime fechaFin, 
                                                   @Param("estado") String estado);
    
    // ========================================
    // CONSULTAS DE ESTADÍSTICAS OPTIMIZADAS
    // ========================================
    
    @Query("SELECT c.estado, COUNT(c) FROM Cita c WHERE c.fechaHora >= :fechaInicio GROUP BY c.estado")
    List<Object[]> countByEstadoAndFechaAfter(@Param("fechaInicio") LocalDateTime fechaInicio);
    
    @Query("SELECT c.servicio.nombre, COUNT(c) FROM Cita c WHERE c.fechaHora >= :fechaInicio GROUP BY c.servicio.nombre")
    List<Object[]> countByServicioAndFechaAfter(@Param("fechaInicio") LocalDateTime fechaInicio);
    
    // ========================================
    // CONSULTAS DE LIMPIEZA Y MANTENIMIENTO
    // ========================================
    
    @Query("SELECT c FROM Cita c WHERE c.fechaHora < :fechaLimite AND c.estado = 'completada'")
    List<Cita> findCitasCompletadasAntiguas(@Param("fechaLimite") LocalDateTime fechaLimite);
    
    // ========================================
    // MÉTODOS COMPATIBILIDAD (DEPRECATED)
    // ========================================
    
    @Deprecated
    List<Cita> findByCliente(Usuario cliente);
    
    @Deprecated
    List<Cita> findByClienteOrderByFechaHoraDesc(Usuario cliente);
    
    @Deprecated
    List<Cita> findByClienteAndFechaHoraAfter(Usuario cliente, LocalDateTime fechaInicio);
    
    @Deprecated
    List<Cita> findByFechaHoraBetween(LocalDateTime fechaInicio, LocalDateTime fechaFin);
    
    @Deprecated
    List<Cita> findByFechaHora(LocalDate fecha);
}