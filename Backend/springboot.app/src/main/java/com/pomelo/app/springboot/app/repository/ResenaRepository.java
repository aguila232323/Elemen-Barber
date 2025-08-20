package com.pomelo.app.springboot.app.repository;

import com.pomelo.app.springboot.app.entity.Resena;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResenaRepository extends JpaRepository<Resena, Long> {
    
    // ========================================
    // CONSULTAS OPTIMIZADAS CON PAGINACIÓN
    // ========================================
    
    // Buscar reseñas por cliente con paginación
    @Query("SELECT r FROM Resena r JOIN FETCH r.cliente WHERE r.cliente.id = :clienteId ORDER BY r.fechaCreacion DESC")
    Page<Resena> findByClienteIdWithRelations(@Param("clienteId") Long clienteId, Pageable pageable);
    
    // Buscar reseña por cita con relaciones
    @Query("SELECT r FROM Resena r JOIN FETCH r.cliente JOIN FETCH r.cita WHERE r.cita.id = :citaId")
    Optional<Resena> findByCitaIdWithRelations(@Param("citaId") Long citaId);
    
    // Verificar si existe una reseña para una cita
    boolean existsByCitaId(Long citaId);
    
    // Obtener reseñas públicas con paginación (para mostrar en la página principal)
    @Query("SELECT r FROM Resena r JOIN FETCH r.cliente WHERE r.comentario IS NOT NULL AND r.comentario != '' ORDER BY r.fechaCreacion DESC")
    Page<Resena> findResenasPublicas(@Param("pageable") Pageable pageable);
    
    // Obtener reseñas públicas limitadas (para widgets)
    @Query("SELECT r FROM Resena r JOIN FETCH r.cliente WHERE r.comentario IS NOT NULL AND r.comentario != '' ORDER BY r.fechaCreacion DESC")
    List<Resena> findResenasPublicasLimitadas(@Param("limit") int limit);
    
    // ========================================
    // CONSULTAS DE ESTADÍSTICAS OPTIMIZADAS
    // ========================================
    
    // Calcular promedio de calificaciones
    @Query("SELECT AVG(r.calificacion) FROM Resena r")
    Double getPromedioCalificaciones();
    
    // Contar total de reseñas
    @Query("SELECT COUNT(r) FROM Resena r")
    Long getTotalResenas();
    
    // Estadísticas por calificación
    @Query("SELECT r.calificacion, COUNT(r) FROM Resena r GROUP BY r.calificacion ORDER BY r.calificacion DESC")
    List<Object[]> getEstadisticasPorCalificacion();
    
    // Promedio de calificaciones por mes
    @Query("SELECT YEAR(r.fechaCreacion), MONTH(r.fechaCreacion), AVG(r.calificacion) " +
           "FROM Resena r GROUP BY YEAR(r.fechaCreacion), MONTH(r.fechaCreacion) " +
           "ORDER BY YEAR(r.fechaCreacion) DESC, MONTH(r.fechaCreacion) DESC")
    List<Object[]> getPromedioCalificacionesPorMes();
    
    // ========================================
    // CONSULTAS DE BÚSQUEDA AVANZADA
    // ========================================
    
    // Buscar reseñas por rango de calificación
    @Query("SELECT r FROM Resena r JOIN FETCH r.cliente WHERE r.calificacion BETWEEN :minCalificacion AND :maxCalificacion ORDER BY r.fechaCreacion DESC")
    Page<Resena> findByCalificacionBetween(@Param("minCalificacion") Integer minCalificacion, 
                                          @Param("maxCalificacion") Integer maxCalificacion, 
                                          Pageable pageable);
    
    // Buscar reseñas por texto en comentario
    @Query("SELECT r FROM Resena r JOIN FETCH r.cliente WHERE LOWER(r.comentario) LIKE LOWER(CONCAT('%', :texto, '%')) ORDER BY r.fechaCreacion DESC")
    Page<Resena> findByComentarioContaining(@Param("texto") String texto, Pageable pageable);
    
    // ========================================
    // MÉTODOS COMPATIBILIDAD (DEPRECATED)
    // ========================================
    
    @Deprecated
    List<Resena> findByClienteIdOrderByFechaCreacionDesc(Long clienteId);
    
    @Deprecated
    Optional<Resena> findByCitaId(Long citaId);
    
    @Deprecated
    List<Resena> findAllByOrderByFechaCreacionDesc();
} 