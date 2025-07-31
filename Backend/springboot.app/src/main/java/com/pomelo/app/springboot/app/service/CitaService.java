package com.pomelo.app.springboot.app.service;

import com.pomelo.app.springboot.app.entity.Cita;
import com.pomelo.app.springboot.app.entity.Servicio;
import com.pomelo.app.springboot.app.entity.Usuario;
import com.pomelo.app.springboot.app.repository.CitaRepository;
import com.pomelo.app.springboot.app.repository.ServicioRepository;
import com.pomelo.app.springboot.app.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class CitaService {

    @Autowired
    private CitaRepository citaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private ServicioRepository servicioRepository;

    public Cita crearCita(Cita cita) {
        try {
            // Validar que la fecha sea futura
            if (cita.getFechaHora().isBefore(LocalDateTime.now())) {
                throw new RuntimeException("No se pueden crear citas en el pasado");
            }

            // Verificar disponibilidad
            verificarDisponibilidad(cita.getFechaHora(), cita.getServicio().getId());

            return citaRepository.save(cita);
        } catch (Exception e) {
            throw new RuntimeException("Error al crear la cita: " + e.getMessage(), e);
        }
    }

    public List<Cita> obtenerCitasPorUsuario(Long usuarioId) {
        try {
            Usuario usuario = usuarioRepository.findById(usuarioId)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            return citaRepository.findByCliente(usuario);
        } catch (Exception e) {
            throw new RuntimeException("Error al obtener citas del usuario: " + e.getMessage(), e);
        }
    }

    public List<Cita> listarCitasPorUsuario(Long usuarioId) {
        try {
            Usuario usuario = usuarioRepository.findById(usuarioId)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            return citaRepository.findByClienteAndFechaHoraAfter(usuario, LocalDateTime.now());
        } catch (Exception e) {
            throw new RuntimeException("Error al listar citas del usuario: " + e.getMessage(), e);
        }
    }

    public void cancelarCita(Long citaId) {
        try {
            Cita cita = citaRepository.findById(citaId)
                    .orElseThrow(() -> new RuntimeException("Cita no encontrada"));

            if (cita.getFechaHora().isBefore(LocalDateTime.now())) {
                throw new RuntimeException("No se pueden cancelar citas pasadas");
            }

            cita.setEstado("cancelada");
            citaRepository.save(cita);
        } catch (Exception e) {
            throw new RuntimeException("Error al cancelar la cita: " + e.getMessage(), e);
        }
    }

    public Cita crearCitaFija(Cita cita, int periodicidadDias) {
        try {
            cita.setFija(true);
            cita.setPeriodicidadDias(periodicidadDias);
            return citaRepository.save(cita);
        } catch (Exception e) {
            throw new RuntimeException("Error al crear cita fija: " + e.getMessage(), e);
        }
    }

    public void borrarCitaFija(Long citaId) {
        try {
            Cita cita = citaRepository.findById(citaId)
                    .orElseThrow(() -> new RuntimeException("Cita no encontrada"));

            if (!cita.isFija()) {
                throw new RuntimeException("La cita no es fija");
            }

            citaRepository.delete(cita);
        } catch (Exception e) {
            throw new RuntimeException("Error al borrar cita fija: " + e.getMessage(), e);
        }
    }

    public List<Cita> disponibilidad(LocalDate fecha) {
        try {
            return citaRepository.findByFechaHora(fecha);
        } catch (Exception e) {
            throw new RuntimeException("Error al obtener disponibilidad: " + e.getMessage(), e);
        }
    }

    public List<Cita> disponibilidadMes(LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        try {
            return citaRepository.findByFechaHoraBetween(fechaInicio, fechaFin);
        } catch (Exception e) {
            throw new RuntimeException("Error al obtener disponibilidad del mes: " + e.getMessage(), e);
        }
    }

    public List<Cita> listarTodasLasCitas() {
        try {
            return citaRepository.findAll();
        } catch (Exception e) {
            throw new RuntimeException("Error al listar todas las citas: " + e.getMessage(), e);
        }
    }

    private void verificarDisponibilidad(LocalDateTime fechaHora, Long servicioId) {
        try {
            Servicio servicio = servicioRepository.findById(servicioId)
                    .orElseThrow(() -> new RuntimeException("Servicio no encontrado"));

            LocalDateTime inicio = fechaHora;
            LocalDateTime fin = fechaHora.plusMinutes(servicio.getDuracionMinutos());

            // Buscar citas que se solapen con el horario solicitado
            List<Cita> citasExistentes = citaRepository.findByFechaHoraBetween(
                inicio.minusMinutes(servicio.getDuracionMinutos()), 
                fin.plusMinutes(servicio.getDuracionMinutos())
            );

            for (Cita cita : citasExistentes) {
                if (!cita.getEstado().equals("cancelada")) {
                    LocalDateTime inicioExistente = cita.getFechaHora();
                    LocalDateTime finExistente = cita.getFechaHora().plusMinutes(cita.getServicio().getDuracionMinutos());

                    // Verificar si hay solapamiento
                    if (inicio.isBefore(finExistente) && fin.isAfter(inicioExistente)) {
                        throw new RuntimeException("Ya existe una cita en ese horario");
                    }
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Error al verificar disponibilidad: " + e.getMessage(), e);
        }
    }
}
