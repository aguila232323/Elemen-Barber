package com.pomelo.app.springboot.app.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
public class Cita {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime fechaHora;

    private boolean confirmada;

    private String comentario;

    private boolean fija = false;

    private int periodicidadDias = 0; // 0 = no repetitiva

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario cliente;

    @ManyToOne
    @JoinColumn(name = "servicio_id")
    private Servicio servicio;

    public void setUsuario(Usuario usuario) {
        cliente = usuario;
    }


    public void setServicio(Servicio servicioNuevo) {
        servicio = servicioNuevo;
    }

    public void setFechaHora(LocalDateTime fecha) {
        fechaHora = fecha;
    }

    public Usuario getUsuario() {
        return cliente;
    }

    public boolean isFija() {
        return fija;
    }

    public void setFija(boolean fija) {
        this.fija = fija;
    }

    public boolean isConfirmada() {
        return confirmada;
    }

    public void setConfirmada(boolean confirmada) {
        this.confirmada = confirmada;
    }

    public int getPeriodicidadDias() {
        return periodicidadDias;
    }

    public void setPeriodicidadDias(int periodicidadDias) {
        this.periodicidadDias = periodicidadDias;
    }

    public LocalDateTime getFechaHora() {
        return fechaHora;
    }

    public void setComentario(String comentario) {
        this.comentario = comentario;
    }

    public String getComentario() {
        return comentario;
    }

    public Servicio getServicio() {
        return servicio;
    }
}
