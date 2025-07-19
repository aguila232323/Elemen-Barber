package com.pomelo.app.springboot.app.service;

import com.pomelo.app.springboot.app.dto.CitaRequest;
import com.pomelo.app.springboot.app.entity.Cita;
import com.pomelo.app.springboot.app.entity.Servicio;
import com.pomelo.app.springboot.app.entity.Usuario;
import com.pomelo.app.springboot.app.repository.CitaRepository;
import com.pomelo.app.springboot.app.repository.ServicioRepository;
import com.pomelo.app.springboot.app.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CitaService {

    private final CitaRepository citaRepository;
    private final UsuarioRepository usuarioRepository;
    private final ServicioRepository servicioRepository;

    public CitaService(CitaRepository citaRepository,
                       UsuarioRepository usuarioRepository,
                       ServicioRepository servicioRepository) {
        this.citaRepository = citaRepository;
        this.usuarioRepository = usuarioRepository;
        this.servicioRepository = servicioRepository;
    }

    public Cita crearCita(String emailUsuario, CitaRequest citaRequest) {
        // Buscar usuario por email
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Buscar servicio por id
        Servicio servicio = servicioRepository.findById(citaRequest.getServicioId())
                .orElseThrow(() -> new RuntimeException("Servicio no encontrado"));

        // Crear y guardar la cita
        Cita cita = new Cita();
        cita.setUsuario(usuario);
        cita.setServicio(servicio);
        cita.setFechaHora(citaRequest.getFecha());

        return citaRepository.save(cita);
    }

    public List<Cita> obtenerCitasPorUsuario(String emailUsuario) {
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return citaRepository.findByCliente(usuario);
    }

    public List<Cita> listarTodasLasCitas() {
        return citaRepository.findAll();
    }

    public List<Cita> listarCitasPorUsuario(String username) {
        Usuario usuario = usuarioRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return citaRepository.findByCliente(usuario);
    }


    public void cancelarCita(Long id, String username) {
        Cita cita = citaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cita no encontrada"));

        // Validar que la cita pertenece al usuario que la quiere cancelar
        if (!cita.getUsuario().getEmail().equals(username)) {
            throw new RuntimeException("No tienes permiso para cancelar esta cita");
        }

        citaRepository.delete(cita);
    }

    public List<Cita> crearCitaFija(Cita cita, Long idCliente) {
        cita.setFija(true);
        cita.setConfirmada(true);
        cita.setUsuario(usuarioRepository.findById(idCliente).orElseThrow(() -> new RuntimeException("Cliente no encontrado")));
        int repeticiones = 6; // Número de repeticiones automáticas
        List<Cita> citasCreadas = new ArrayList<>();
        if (cita.getPeriodicidadDias() > 0) {
            LocalDateTime fecha = cita.getFechaHora();
            for (int i = 0; i < repeticiones; i++) {
                Cita nuevaCita = new Cita();
                nuevaCita.setFija(true);
                nuevaCita.setConfirmada(true);
                nuevaCita.setUsuario(cita.getUsuario());
                nuevaCita.setServicio(cita.getServicio());
                nuevaCita.setComentario(cita.getComentario());
                nuevaCita.setFechaHora(fecha.plusDays((long) i * cita.getPeriodicidadDias()));
                nuevaCita.setPeriodicidadDias(cita.getPeriodicidadDias());
                citasCreadas.add(citaRepository.save(nuevaCita));
            }
        } else {
            citasCreadas.add(citaRepository.save(cita));
        }
        return citasCreadas;
    }

    public void borrarCitaFija(Long id) {
        Optional<Cita> cita = citaRepository.findById(id);
        if (cita.isPresent() && cita.get().isFija()) {
            citaRepository.deleteById(id);
        } else {
            throw new RuntimeException("Cita fija no encontrada");
        }
    }
}
