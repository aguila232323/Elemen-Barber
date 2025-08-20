package com.pomelo.app.springboot.app.entity;

import jakarta.persistence.*;
import java.time.DayOfWeek;
import java.time.LocalDate;

@Entity
@Table(name = "dias_laborables")
public class DiasLaborables {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "dia_semana", nullable = false)
    private DayOfWeek diaSemana;
    
    @Column(name = "es_laborable", nullable = false)
    private boolean esLaborable = true;
    
    @Column(name = "descripcion")
    private String descripcion;
    
    public DiasLaborables() {}
    
    public DiasLaborables(DayOfWeek diaSemana, boolean esLaborable) {
        this.diaSemana = diaSemana;
        this.esLaborable = esLaborable;
    }
    

    
    // Getters y Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public DayOfWeek getDiaSemana() {
        return diaSemana;
    }
    
    public void setDiaSemana(DayOfWeek diaSemana) {
        this.diaSemana = diaSemana;
    }
    
    public boolean isEsLaborable() {
        return esLaborable;
    }
    
    public void setEsLaborable(boolean esLaborable) {
        this.esLaborable = esLaborable;
    }
    

    
    public String getDescripcion() {
        return descripcion;
    }
    
    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }
}
