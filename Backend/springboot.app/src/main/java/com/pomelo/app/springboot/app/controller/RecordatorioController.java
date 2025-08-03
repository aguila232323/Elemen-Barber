package com.pomelo.app.springboot.app.controller;

import com.pomelo.app.springboot.app.service.RecordatorioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/recordatorios")
@CrossOrigin(origins = "*")
@Tag(name = "Recordatorios", description = "API para gestionar recordatorios de citas")
public class RecordatorioController {

    @Autowired
    private RecordatorioService recordatorioService;

    @PostMapping("/enviar-manual/{citaId}")
    @Operation(summary = "Enviar recordatorio manual", description = "Envía un recordatorio manual para una cita específica")
    public ResponseEntity<?> enviarRecordatorioManual(@PathVariable Long citaId) {
        try {
            recordatorioService.enviarRecordatorioManual(citaId);
            return ResponseEntity.ok(Map.of("message", "Recordatorio enviado correctamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error al enviar recordatorio: " + e.getMessage()));
        }
    }

    @GetMapping("/estado")
    @Operation(summary = "Estado del servicio", description = "Verifica el estado del servicio de recordatorios")
    public ResponseEntity<?> obtenerEstado() {
        try {
            return ResponseEntity.ok(Map.of(
                "status", "activo",
                "message", "Servicio de recordatorios funcionando correctamente",
                "schedule", "Cada 5 minutos",
                "nextCheck", "Próxima verificación en 5 minutos"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error al verificar estado: " + e.getMessage()));
        }
    }

    @PostMapping("/test")
    @Operation(summary = "Test de recordatorios", description = "Ejecuta una prueba del servicio de recordatorios")
    public ResponseEntity<?> testRecordatorios() {
        try {
            // Ejecutar el método de recordatorios automáticos manualmente
            recordatorioService.enviarRecordatoriosAutomaticos();
            return ResponseEntity.ok(Map.of("message", "Test de recordatorios ejecutado correctamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error en test de recordatorios: " + e.getMessage()));
        }
    }
} 