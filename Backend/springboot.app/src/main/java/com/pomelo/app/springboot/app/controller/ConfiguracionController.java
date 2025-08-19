package com.pomelo.app.springboot.app.controller;

import com.pomelo.app.springboot.app.service.ConfiguracionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/configuracion")
@CrossOrigin(origins = "*")
public class ConfiguracionController {
    
    @Autowired
    private ConfiguracionService configuracionService;
    
    @PostMapping("/tiempo-minimo")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> configurarTiempoMinimo(@RequestBody Map<String, Object> request) {
        try {
            Integer horasMinimas = (Integer) request.get("horasMinimas");
            
            if (horasMinimas == null || horasMinimas < 1 || horasMinimas > 168) {
                return ResponseEntity.badRequest().body(Map.of("error", "Las horas mínimas deben estar entre 1 y 168"));
            }
            
            configuracionService.configurarTiempoMinimo(horasMinimas);
            
            Map<String, Object> response = new HashMap<>();
            response.put("mensaje", "Tiempo mínimo configurado correctamente");
            response.put("horasMinimas", horasMinimas);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Error al configurar tiempo mínimo: " + e.getMessage()));
        }
    }
    
    @GetMapping("/tiempo-minimo")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> obtenerTiempoMinimo() {
        try {
            int tiempoMinimo = configuracionService.obtenerTiempoMinimo();
            
            Map<String, Object> response = new HashMap<>();
            response.put("horasMinimas", tiempoMinimo);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Error al obtener tiempo mínimo: " + e.getMessage()));
        }
    }
} 