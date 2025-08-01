package com.pomelo.app.springboot.app.controller;

import com.pomelo.app.springboot.app.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "*")
public class TestController {

    @Autowired
    private EmailService emailService;

    @GetMapping
    public String test() {
        return "API funcionando correctamente";
    }

    @PostMapping("/email")
    public ResponseEntity<?> testEmail(@RequestBody Map<String, String> request) {
        try {
            String emailDestino = request.get("email");
            if (emailDestino == null || emailDestino.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email requerido"));
            }

            // Crear un email de prueba
            emailService.enviarEmailPrueba(emailDestino);
            
            return ResponseEntity.ok(Map.of("message", "Email de prueba enviado correctamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error al enviar email: " + e.getMessage()));
        }
    }
} 