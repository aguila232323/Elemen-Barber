package com.pomelo.app.springboot.app.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "resenas")
public class Resena {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cita_id", nullable = false)
    private Cita cita;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Usuario cliente;
    
    @Column(nullable = false)
    private Integer calificacion; // 1-5 estrellas
    
    @Column(length = 1000)
    private String comentario;
    
    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion;
    
    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;
    
    // Constructor por defecto
    public Resena() {
        this.fechaCreacion = LocalDateTime.now();
    }
    
    // Constructor con parámetros
    public Resena(Cita cita, Usuario cliente, Integer calificacion, String comentario) {
        this();
        this.cita = cita;
        this.cliente = cliente;
        this.calificacion = calificacion;
        this.comentario = comentario;
    }
    
    // Getters y Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Cita getCita() {
        return cita;
    }
    
    public void setCita(Cita cita) {
        this.cita = cita;
    }
    
    public Usuario getCliente() {
        return cliente;
    }
    
    public void setCliente(Usuario cliente) {
        this.cliente = cliente;
    }
    
    public Integer getCalificacion() {
        return calificacion;
    }
    
    public void setCalificacion(Integer calificacion) {
        this.calificacion = calificacion;
    }
    
    public String getComentario() {
        return comentario;
    }
    
    public void setComentario(String comentario) {
        this.comentario = comentario;
    }
    
    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }
    
    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }
    
    public LocalDateTime getFechaActualizacion() {
        return fechaActualizacion;
    }
    
    public void setFechaActualizacion(LocalDateTime fechaActualizacion) {
        this.fechaActualizacion = fechaActualizacion;
    }
    
    @PreUpdate
    protected void onUpdate() {
        this.fechaActualizacion = LocalDateTime.now();
    }
} 