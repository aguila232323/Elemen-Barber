package com.pomelo.app.springboot.app.service;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import com.pomelo.app.springboot.app.entity.Cita;
import com.pomelo.app.springboot.app.entity.Resena;
import com.pomelo.app.springboot.app.entity.Servicio;
import com.pomelo.app.springboot.app.entity.Usuario;
import com.pomelo.app.springboot.app.repository.CitaRepository;
import com.pomelo.app.springboot.app.repository.ResenaRepository;
import com.pomelo.app.springboot.app.repository.ServicioRepository;
import com.pomelo.app.springboot.app.repository.UsuarioRepository;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class CacheService {

    @Autowired
    private CitaRepository citaRepository;
    
    @Autowired
    private ResenaRepository resenaRepository;
    
    @Autowired
    private ServicioRepository servicioRepository;
    
    @Autowired
    private UsuarioRepository usuarioRepository;

    // ========================================
    // CACHE DE SERVICIOS (cambian poco)
    // ========================================
    
    @Cacheable(value = "servicios", key = "'all'")
    public List<Servicio> getAllServicios() {
        return servicioRepository.findAll();
    }
    
    @Cacheable(value = "servicios", key = "#id")
    public Optional<Servicio> getServicioById(Long id) {
        return servicioRepository.findById(id);
    }
    
    @CacheEvict(value = "servicios", allEntries = true)
    public void evictServiciosCache() {
        // Método para limpiar cache cuando se modifica un servicio
    }

    // ========================================
    // CACHE DE RESEÑAS PÚBLICAS
    // ========================================
    
    @Cacheable(value = "resenas", key = "'publicas_limitadas'")
    public List<Resena> getResenasPublicasLimitadas() {
        return resenaRepository.findResenasPublicasLimitadas(10);
    }
    
    @Cacheable(value = "resenas", key = "'publicas_page_' + #page + '_' + #size")
    public Page<Resena> getResenasPublicas(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return resenaRepository.findResenasPublicas(pageable);
    }
    
    @Cacheable(value = "resenas", key = "'stats_promedio'")
    public Double getPromedioCalificaciones() {
        return resenaRepository.getPromedioCalificaciones();
    }
    
    @Cacheable(value = "resenas", key = "'stats_total'")
    public Long getTotalResenas() {
        return resenaRepository.getTotalResenas();
    }
    
    @CacheEvict(value = "resenas", allEntries = true)
    public void evictResenasCache() {
        // Método para limpiar cache cuando se modifica una reseña
    }

    // ========================================
    // CACHE DE CONSULTAS DE DISPONIBILIDAD
    // ========================================
    
    @Cacheable(value = "disponibilidad", key = "'citas_ocupadas_' + #fechaInicio + '_' + #fechaFin")
    public List<Cita> getCitasOcupadas(LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        return citaRepository.findCitasOcupadas(fechaInicio, fechaFin);
    }
    
    @Cacheable(value = "disponibilidad", key = "'citas_por_servicio_' + #servicioId + '_' + #fechaInicio + '_' + #fechaFin")
    public List<Cita> getCitasOcupadasByServicio(Long servicioId, LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        return citaRepository.findCitasOcupadasByServicio(servicioId, fechaInicio, fechaFin);
    }
    
    @CacheEvict(value = "disponibilidad", allEntries = true)
    public void evictDisponibilidadCache() {
        // Método para limpiar cache cuando se modifica una cita
    }

    // ========================================
    // CACHE DE CONSULTAS DE USUARIO
    // ========================================
    
    @Cacheable(value = "usuarios", key = "'by_email_' + #email")
    public Optional<Usuario> getUsuarioByEmail(String email) {
        return usuarioRepository.findByEmail(email);
    }
    
    @Cacheable(value = "usuarios", key = "'by_id_' + #id")
    public Optional<Usuario> getUsuarioById(Long id) {
        return usuarioRepository.findById(id);
    }
    
    @CacheEvict(value = "usuarios", key = "'by_email_' + #email")
    public void evictUsuarioByEmailCache(String email) {
        // Método para limpiar cache específico de un usuario
    }
    
    @CacheEvict(value = "usuarios", key = "'by_id_' + #id")
    public void evictUsuarioByIdCache(Long id) {
        // Método para limpiar cache específico de un usuario
    }

    // ========================================
    // CACHE DE CONSULTAS DE CITAS
    // ========================================
    
    @Cacheable(value = "citas", key = "'by_usuario_' + #usuarioId + '_page_' + #page + '_' + #size")
    public Page<Cita> getCitasByUsuario(Long usuarioId, int page, int size) {
        Usuario usuario = usuarioRepository.findById(usuarioId).orElse(null);
        if (usuario == null) {
            return Page.empty(PageRequest.of(page, size));
        }
        Pageable pageable = PageRequest.of(page, size);
        return citaRepository.findByClienteWithRelations(usuario, pageable);
    }
    
    @Cacheable(value = "citas", key = "'by_id_with_relations_' + #id")
    public Optional<Cita> getCitaByIdWithRelations(Long id) {
        return citaRepository.findByIdWithRelations(id);
    }
    
    @CacheEvict(value = "citas", allEntries = true)
    public void evictCitasCache() {
        // Método para limpiar cache cuando se modifica una cita
    }

    // ========================================
    // CACHE DE ESTADÍSTICAS
    // ========================================
    
    @Cacheable(value = "estadisticas", key = "'citas_por_estado_' + #fechaInicio")
    public List<Object[]> getCitasPorEstado(LocalDateTime fechaInicio) {
        return citaRepository.countByEstadoAndFechaAfter(fechaInicio);
    }
    
    @Cacheable(value = "estadisticas", key = "'citas_por_servicio_' + #fechaInicio")
    public List<Object[]> getCitasPorServicio(LocalDateTime fechaInicio) {
        return citaRepository.countByServicioAndFechaAfter(fechaInicio);
    }
    
    @Cacheable(value = "estadisticas", key = "'resenas_por_calificacion'")
    public List<Object[]> getResenasPorCalificacion() {
        return resenaRepository.getEstadisticasPorCalificacion();
    }
    
    @CacheEvict(value = "estadisticas", allEntries = true)
    public void evictEstadisticasCache() {
        // Método para limpiar cache de estadísticas
    }

    // ========================================
    // MÉTODOS DE LIMPIEZA DE CACHE
    // ========================================
    
    @CacheEvict(value = {"servicios", "resenas", "disponibilidad", "usuarios", "citas", "estadisticas"}, allEntries = true)
    public void evictAllCaches() {
        // Método para limpiar todos los caches (útil para mantenimiento)
    }
    
    // ========================================
    // CACHE DE CONFIGURACIÓN
    // ========================================
    
    @Cacheable(value = "configuracion", key = "'tiempo_minimo'")
    public Integer getTiempoMinimoReserva() {
        // Aquí deberías obtener el valor de tu servicio de configuración
        return 24; // Valor por defecto
    }
    
    @CacheEvict(value = "configuracion", allEntries = true)
    public void evictConfiguracionCache() {
        // Método para limpiar cache de configuración
    }
}
