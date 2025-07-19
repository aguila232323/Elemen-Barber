package com.pomelo.app.springboot.app.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Tag(name = "Pruebas", description = "Endpoints de prueba para verificar el funcionamiento")
public class TestController {

    @GetMapping("/test")
    @Operation(summary = "Endpoint de prueba", description = "Verifica que la aplicación está funcionando correctamente")
    public String test() {
        return "¡La aplicación está funcionando correctamente!";
    }

    @GetMapping("/")
    @Operation(summary = "Página de inicio", description = "Mensaje de bienvenida de la aplicación")
    public String home() {
        return "Bienvenido a la aplicación de peluquería";
    }
} 