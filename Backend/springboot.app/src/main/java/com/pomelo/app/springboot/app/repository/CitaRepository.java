package com.pomelo.app.springboot.app.repository;

import com.pomelo.app.springboot.app.entity.Cita;
import com.pomelo.app.springboot.app.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CitaRepository extends JpaRepository<Cita, Long> {
    List<Cita> findByCliente(Usuario cliente);
    List<Cita> findByClienteOrderByFechaHoraDesc(Usuario cliente);
    List<Cita> findByClienteAndFechaHoraAfter(Usuario cliente, LocalDateTime fechaInicio);
    
    // Método para obtener cita con relaciones cargadas
    @Query("SELECT c FROM Cita c JOIN FETCH c.cliente JOIN FETCH c.servicio WHERE c.id = :id")
    Optional<Cita> findByIdWithRelations(@Param("id") Long id);
    List<Cita> findByFechaHoraBetween(LocalDateTime fechaInicio, LocalDateTime fechaFin);
    List<Cita> findByFechaHora(LocalDate fecha);
    long countByClienteAndEstado(Usuario cliente, String estado);
    List<Cita> findByClienteAndFijaTrueAndPeriodicidadDiasIsNotNull(Usuario cliente);
    
    @Query("SELECT c FROM Cita c WHERE c.fechaHora BETWEEN :fechaInicio AND :fechaFin AND c.estado != :estado")
    List<Cita> findByFechaHoraBetweenAndEstadoNot(@Param("fechaInicio") LocalDateTime fechaInicio, 
                                                   @Param("fechaFin") LocalDateTime fechaFin, 
                                                   @Param("estado") String estado);
    
    /**
     * Busca citas próximas con relaciones cargadas para evitar LazyInitialization
     */
    @Query("SELECT c FROM Cita c " +
           "JOIN FETCH c.cliente cl " +
           "JOIN FETCH c.servicio s " +
           "WHERE c.fechaHora BETWEEN :fechaInicio AND :fechaFin " +
           "AND LOWER(c.estado) IN ('confirmada', 'pendiente') " +
           "ORDER BY c.fechaHora ASC")
    List<Cita> findCitasProximas(@Param("fechaInicio") LocalDateTime fechaInicio, 
                                  @Param("fechaFin") LocalDateTime fechaFin);

    /**
     * Citas cuya hora ya pasó, sin reseña y sin recordatorio de reseña enviado
     */
    @Query("SELECT c FROM Cita c " +
           "JOIN FETCH c.cliente cl " +
           "JOIN FETCH c.servicio s " +
           "WHERE c.fechaHora < :ahora " +
           "AND LOWER(c.estado) != 'cancelada' " +
           "AND c.recordatorioResenaEnviado = false " +
           "AND NOT EXISTS (SELECT r.id FROM Resena r WHERE r.cita = c) " +
           "ORDER BY c.fechaHora DESC")
    List<Cita> findCitasPendientesDeResena(@Param("ahora") LocalDateTime ahora);
}