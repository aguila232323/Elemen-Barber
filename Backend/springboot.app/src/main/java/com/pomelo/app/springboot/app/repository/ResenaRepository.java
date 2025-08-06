package com.pomelo.app.springboot.app.repository;

import com.pomelo.app.springboot.app.entity.Resena;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResenaRepository extends JpaRepository<Resena, Long> {
    
    // Buscar reseñas por cliente
    List<Resena> findByClienteIdOrderByFechaCreacionDesc(Long clienteId);
    
    // Buscar reseña por cita
    Optional<Resena> findByCitaId(Long citaId);
    
    // Verificar si existe una reseña para una cita
    boolean existsByCitaId(Long citaId);
    
    // Obtener todas las reseñas ordenadas por fecha de creación (más recientes primero)
    List<Resena> findAllByOrderByFechaCreacionDesc();
    
    // Obtener reseñas públicas (para mostrar en la página principal)
    @Query("SELECT r FROM Resena r WHERE r.comentario IS NOT NULL AND r.comentario != '' ORDER BY r.fechaCreacion DESC")
    List<Resena> findResenasPublicas();
    
    // Calcular promedio de calificaciones
    @Query("SELECT AVG(r.calificacion) FROM Resena r")
    Double getPromedioCalificaciones();
    
    // Contar total de reseñas
    @Query("SELECT COUNT(r) FROM Resena r")
    Long getTotalResenas();
    
    // Obtener reseñas con límite para la página principal
    @Query("SELECT r FROM Resena r WHERE r.comentario IS NOT NULL AND r.comentario != '' ORDER BY r.fechaCreacion DESC LIMIT :limit")
    List<Resena> findResenasPublicasLimitadas(@Param("limit") int limit);
} 