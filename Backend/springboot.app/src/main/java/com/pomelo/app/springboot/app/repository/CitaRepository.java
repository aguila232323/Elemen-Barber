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

@Repository
public interface CitaRepository extends JpaRepository<Cita, Long> {
    List<Cita> findByCliente(Usuario cliente);
    List<Cita> findByClienteAndFechaHoraAfter(Usuario cliente, LocalDateTime fechaInicio);
    List<Cita> findByFechaHoraBetween(LocalDateTime fechaInicio, LocalDateTime fechaFin);
    List<Cita> findByFechaHora(LocalDate fecha);
    long countByClienteAndEstado(Usuario cliente, String estado);
    List<Cita> findByClienteAndFijaTrueAndPeriodicidadDiasIsNotNull(Usuario cliente);
    
    @Query("SELECT c FROM Cita c WHERE c.fechaHora BETWEEN :fechaInicio AND :fechaFin AND c.estado != :estado")
    List<Cita> findByFechaHoraBetweenAndEstadoNot(@Param("fechaInicio") LocalDateTime fechaInicio, 
                                                   @Param("fechaFin") LocalDateTime fechaFin, 
                                                   @Param("estado") String estado);
    
    /**
     * Busca citas que están programadas para dentro de 1 hora
     * Excluye citas canceladas
     */
    @Query("SELECT c FROM Cita c WHERE c.fechaHora BETWEEN :fechaInicio AND :fechaFin " +
           "AND c.estado IN ('CONFIRMADA', 'PENDIENTE') " +
           "ORDER BY c.fechaHora ASC")
    List<Cita> findCitasProximas(@Param("fechaInicio") LocalDateTime fechaInicio, 
                                  @Param("fechaFin") LocalDateTime fechaFin);
}