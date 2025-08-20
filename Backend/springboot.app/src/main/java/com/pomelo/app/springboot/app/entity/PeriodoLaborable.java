package com.pomelo.app.springboot.app.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "periodo_laborable")
public class PeriodoLaborable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin", nullable = false)
    private LocalDate fechaFin;

    @ElementCollection
    @CollectionTable(name = "periodo_laborable_dias", joinColumns = @JoinColumn(name = "periodo_id"))
    @Column(name = "dia_semana", length = 20)
    private List<String> diasLaborables;

    @Column(length = 500)
    private String descripcion;

    @Column(nullable = false)
    private boolean activo = true;

    // Constructores
    public PeriodoLaborable() {}

    public PeriodoLaborable(String nombre, LocalDate fechaInicio, LocalDate fechaFin, List<String> diasLaborables) {
        this.nombre = nombre;
        this.fechaInicio = fechaInicio;
        this.fechaFin = fechaFin;
        this.diasLaborables = diasLaborables;
    }

    public PeriodoLaborable(String nombre, LocalDate fechaInicio, LocalDate fechaFin, List<String> diasLaborables, String descripcion) {
        this.nombre = nombre;
        this.fechaInicio = fechaInicio;
        this.fechaFin = fechaFin;
        this.diasLaborables = diasLaborables;
        this.descripcion = descripcion;
    }

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public LocalDate getFechaInicio() {
        return fechaInicio;
    }

    public void setFechaInicio(LocalDate fechaInicio) {
        this.fechaInicio = fechaInicio;
    }

    public LocalDate getFechaFin() {
        return fechaFin;
    }

    public void setFechaFin(LocalDate fechaFin) {
        this.fechaFin = fechaFin;
    }

    public List<String> getDiasLaborables() {
        return diasLaborables;
    }

    public void setDiasLaborables(List<String> diasLaborables) {
        this.diasLaborables = diasLaborables;
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
}
