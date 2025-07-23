package com.pomelo.app.springboot.app.dto;

import java.time.LocalDateTime;

public class CitaRequest {
    private Long servicioId;
    private LocalDateTime fecha;
    private String comentario;


    public Long getServicioId() {
        return servicioId;
    }
    public LocalDateTime getFecha() {
        return fecha;
    }
    public String getComentario() {
        return comentario;
    }
}
