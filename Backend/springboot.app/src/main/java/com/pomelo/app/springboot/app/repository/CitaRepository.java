package com.pomelo.app.springboot.app.repository;

import com.pomelo.app.springboot.app.entity.Cita;
import com.pomelo.app.springboot.app.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface CitaRepository extends JpaRepository<Cita, Long> {
    List<Cita> findByCliente(Usuario cliente);
    List<Cita> findByClienteAndFechaHoraAfter(Usuario cliente, LocalDateTime fechaInicio);
    List<Cita> findByFechaHoraBetween(LocalDateTime fechaInicio, LocalDateTime fechaFin);
    List<Cita> findByFechaHora(LocalDate fecha);
    long countByClienteAndEstado(Usuario cliente, String estado);
}