package com.pomelo.app.springboot.app.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "portfolio")
public class Portfolio {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "nombre", nullable = false)
    private String nombre;
    
    @Column(name = "imagen_base64", columnDefinition = "TEXT")
    private String imagenBase64;
    
    @Column(name = "url_instagram")
    private String urlInstagram;
    
    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;
    
    @Column(name = "activo")
    private Boolean activo = true;
    
    // Constructor por defecto
    public Portfolio() {
        this.fechaCreacion = LocalDateTime.now();
    }
    
    // Constructor con parámetros
    public Portfolio(String nombre, String imagenBase64, String urlInstagram) {
        this.nombre = nombre;
        this.imagenBase64 = imagenBase64;
        this.urlInstagram = urlInstagram;
        this.fechaCreacion = LocalDateTime.now();
        this.activo = true;
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
    
    public String getImagenBase64() {
        return imagenBase64;
    }
    
    public void setImagenBase64(String imagenBase64) {
        this.imagenBase64 = imagenBase64;
    }
    
    public String getUrlInstagram() {
        return urlInstagram;
    }
    
    public void setUrlInstagram(String urlInstagram) {
        this.urlInstagram = urlInstagram;
    }
    
    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }
    
    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }
    
    public Boolean getActivo() {
        return activo;
    }
    
    public void setActivo(Boolean activo) {
        this.activo = activo;
    }
} 