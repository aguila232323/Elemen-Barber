package com.pomelo.app.springboot.app.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "configuracion")
public class Configuracion {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "clave", unique = true, nullable = false)
    private String clave;
    
    @Column(name = "valor", nullable = false)
    private String valor;
    
    @Column(name = "descripcion")
    private String descripcion;
    
    // Constructores
    public Configuracion() {}
    
    public Configuracion(String clave, String valor, String descripcion) {
        this.clave = clave;
        this.valor = valor;
        this.descripcion = descripcion;
    }
    
    // Getters y Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getClave() {
        return clave;
    }
    
    public void setClave(String clave) {
        this.clave = clave;
    }
    
    public String getValor() {
        return valor;
    }
    
    public void setValor(String valor) {
        this.valor = valor;
    }
    
    public String getDescripcion() {
        return descripcion;
    }
    
    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }
} 