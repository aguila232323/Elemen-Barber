package com.pomelo.app.springboot.app.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "servicio")
public class Servicio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(length = 500)
    private String descripcion;

    @Column(nullable = false)
    private Double precio;

    @Column(nullable = false)
    private Integer duracionMinutos;

    @Column(length = 10)
    private String emoji;

    @Column(length = 200)
    private String textoDescriptivo;

    @Column(length = 7, name = "color_google_calendar")
    private String colorGoogleCalendar;

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

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public Double getPrecio() {
        return precio;
    }

    public void setPrecio(Double precio) {
        this.precio = precio;
    }

    public Integer getDuracionMinutos() {
        return duracionMinutos;
    }

    public void setDuracionMinutos(Integer duracionMinutos) {
        this.duracionMinutos = duracionMinutos;
    }

    public String getEmoji() {
        return emoji;
    }

    public void setEmoji(String emoji) {
        this.emoji = emoji;
    }

    public String getTextoDescriptivo() {
        return textoDescriptivo;
    }

    public void setTextoDescriptivo(String textoDescriptivo) {
        this.textoDescriptivo = textoDescriptivo;
    }

    public String getColorGoogleCalendar() {
        return colorGoogleCalendar;
    }

    public void setColorGoogleCalendar(String colorGoogleCalendar) {
        this.colorGoogleCalendar = colorGoogleCalendar;
    }
}
