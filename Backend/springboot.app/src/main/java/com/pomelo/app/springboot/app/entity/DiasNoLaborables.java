package com.pomelo.app.springboot.app.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "dias_no_laborables")
public class DiasNoLaborables {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "fecha", nullable = false)
    private LocalDate fecha;
    
    @Column(name = "descripcion")
    private String descripcion;
    
    @Column(name = "activo", nullable = false)
    private boolean activo = true;
    
    @Column(name = "tipo")
    private String tipo = "FESTIVO"; // FESTIVO, DIA_ESPECIAL, MANTENIMIENTO, etc.
    
    public DiasNoLaborables() {}
    
    public DiasNoLaborables(LocalDate fecha, String descripcion) {
        this.fecha = fecha;
        this.descripcion = descripcion;
    }
    
    public DiasNoLaborables(LocalDate fecha, String descripcion, String tipo) {
        this.fecha = fecha;
        this.descripcion = descripcion;
        this.tipo = tipo;
    }
    
    // Getters y Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public LocalDate getFecha() {
        return fecha;
    }
    
    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }
    
    public String getDescripcion() {
        return descripcion;
    }
    
    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }
    
    public boolean isActivo() {
        return activo;
    }
    
    public void setActivo(boolean activo) {
        this.activo = activo;
    }
    
    public String getTipo() {
        return tipo;
    }
    
    public void setTipo(String tipo) {
        this.tipo = tipo;
    }
}
