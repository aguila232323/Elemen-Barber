package com.pomelo.app.springboot.app.service;

import com.pomelo.app.springboot.app.entity.Resena;
import com.pomelo.app.springboot.app.entity.Cita;
import com.pomelo.app.springboot.app.entity.Usuario;
import com.pomelo.app.springboot.app.repository.ResenaRepository;
import com.pomelo.app.springboot.app.repository.CitaRepository;
import com.pomelo.app.springboot.app.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;
import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Service
public class ResenaService {

    @Autowired
    private ResenaRepository resenaRepository;
    
    @Autowired
    private CitaRepository citaRepository;
    
    @Autowired
    private UsuarioRepository usuarioRepository;

    // Crear una nueva reseña
    public Resena crearResena(Long citaId, Long clienteId, Integer calificacion, String comentario) {
        // Verificar que la cita existe y pertenece al cliente (con relaciones cargadas)
        Cita cita = citaRepository.findByIdWithRelations(citaId)
            .orElseThrow(() -> new RuntimeException("Cita no encontrada"));
        
        Usuario cliente = usuarioRepository.findById(clienteId)
            .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
        
        // Verificar que la cita pertenece al cliente
        if (!cita.getCliente().getId().equals(clienteId)) {
            throw new RuntimeException("La cita no pertenece a este cliente");
        }
        
        // Verificar que la cita ya pasó (fecha anterior a ahora) o está completada/finalizada
        LocalDateTime ahora = LocalDateTime.now();
        if (cita.getFechaHora().isAfter(ahora) && 
            !"completada".equals(cita.getEstado()) && 
            !"finalizada".equals(cita.getEstado())) {
            throw new RuntimeException("Solo se pueden añadir reseñas a citas que ya han pasado o están completadas");
        }
        
        // Verificar que no existe ya una reseña para esta cita
        if (resenaRepository.existsByCitaId(citaId)) {
            throw new RuntimeException("Ya existe una reseña para esta cita");
        }
        
        // Validar calificación
        if (calificacion == null || calificacion < 1 || calificacion > 5) {
            throw new RuntimeException("La calificación debe estar entre 1 y 5");
        }
        
        // Crear la reseña
        Resena resena = new Resena(cita, cliente, calificacion, comentario);
        return resenaRepository.save(resena);
    }

    // Obtener reseñas de un cliente
    public List<Resena> obtenerResenasCliente(Long clienteId) {
        return resenaRepository.findByClienteIdOrderByFechaCreacionDesc(clienteId);
    }

    // Obtener reseña por cita
    public Optional<Resena> obtenerResenaPorCita(Long citaId) {
        return resenaRepository.findByCitaId(citaId);
    }

    // Obtener todas las reseñas públicas
    public List<Resena> obtenerResenasPublicas() {
        return resenaRepository.findResenasPublicas();
    }

    // Obtener reseñas públicas limitadas
    public List<Resena> obtenerResenasPublicasLimitadas(int limit) {
        List<Resena> todasLasResenas = resenaRepository.findResenasPublicas();
        return todasLasResenas.stream()
            .limit(limit)
            .collect(Collectors.toList());
    }

    // Obtener estadísticas de reseñas
    public Map<String, Object> obtenerEstadisticasResenas() {
        Map<String, Object> estadisticas = new HashMap<>();
        
        Double promedio = resenaRepository.getPromedioCalificaciones();
        Long total = resenaRepository.getTotalResenas();
        
        estadisticas.put("promedioCalificacion", promedio != null ? Math.round(promedio * 10.0) / 10.0 : 0.0);
        estadisticas.put("totalResenas", total != null ? total : 0);
        
        return estadisticas;
    }

    // Actualizar una reseña
    public Resena actualizarResena(Long resenaId, Integer calificacion, String comentario) {
        Resena resena = resenaRepository.findById(resenaId)
            .orElseThrow(() -> new RuntimeException("Reseña no encontrada"));
        
        // Validar calificación
        if (calificacion != null && (calificacion < 1 || calificacion > 5)) {
            throw new RuntimeException("La calificación debe estar entre 1 y 5");
        }
        
        if (calificacion != null) {
            resena.setCalificacion(calificacion);
        }
        
        if (comentario != null) {
            resena.setComentario(comentario);
        }
        
        return resenaRepository.save(resena);
    }

    // Eliminar una reseña
    public void eliminarResena(Long resenaId) {
        if (!resenaRepository.existsById(resenaId)) {
            throw new RuntimeException("Reseña no encontrada");
        }
        resenaRepository.deleteById(resenaId);
    }

    // Verificar si una cita puede tener reseña
    public boolean puedeTenerResena(Long citaId, Long clienteId) {
        Optional<Cita> citaOpt = citaRepository.findByIdWithRelations(citaId);
        if (citaOpt.isEmpty()) {
            return false;
        }
        
        Cita cita = citaOpt.get();
        
        // Verificar que la cita pertenece al cliente
        if (!cita.getCliente().getId().equals(clienteId)) {
            return false;
        }
        
        // Verificar que la cita ya pasó (fecha anterior a ahora) o está completada/finalizada
        LocalDateTime ahora = LocalDateTime.now();
        if (cita.getFechaHora().isAfter(ahora) && 
            !"completada".equals(cita.getEstado()) && 
            !"finalizada".equals(cita.getEstado())) {
            return false;
        }
        
        // Verificar que no existe ya una reseña
        return !resenaRepository.existsByCitaId(citaId);
    }
} 