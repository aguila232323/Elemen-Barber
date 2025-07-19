package com.pomelo.app.springboot.app.dto;

import java.time.LocalDateTime;

public class CitaRequest {
    private Long servicioId;
    private LocalDateTime fecha;


    public Long getServicioId() {
        return servicioId;
    }
    public LocalDateTime getFecha() {
        return fecha;
    }
}
