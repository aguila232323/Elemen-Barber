package com.pomelo.app.springboot.app.dto;

import java.time.LocalDateTime;

public class CitaRequest {
    private Long servicioId;
    private LocalDateTime fecha;
    private String comentario;
    private Long clienteId; // Campo opcional para admin reservar para otros usuarios

    public Long getServicioId() {
        return servicioId;
    }
    
    public void setServicioId(Long servicioId) {
        this.servicioId = servicioId;
    }
    
    public LocalDateTime getFecha() {
        return fecha;
    }
    
    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }
    
    public String getComentario() {
        return comentario;
    }
    
    public void setComentario(String comentario) {
        this.comentario = comentario;
    }
    
    public Long getClienteId() {
        return clienteId;
    }
    
    public void setClienteId(Long clienteId) {
        this.clienteId = clienteId;
    }
}
