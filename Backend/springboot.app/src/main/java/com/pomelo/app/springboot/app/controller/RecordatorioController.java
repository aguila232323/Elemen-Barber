package com.pomelo.app.springboot.app.controller;

import com.pomelo.app.springboot.app.service.RecordatorioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/recordatorios")
public class RecordatorioController {

    @Autowired
    private RecordatorioService recordatorioService;

    /**
     * Enviar recordatorio manual para una cita específica
     */
    @PostMapping("/enviar/{citaId}")
    public ResponseEntity<?> enviarRecordatorioManual(@PathVariable Long citaId) {
        try {
            recordatorioService.enviarRecordatorioManual(citaId);
            return ResponseEntity.ok(Map.of(
                "message", "Recordatorio enviado exitosamente para la cita ID: " + citaId,
                "status", "success"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Error al enviar recordatorio: " + e.getMessage(),
                "status", "error"
            ));
        }
    }

    /**
     * Ejecutar verificación manual de recordatorios automáticos
     */
    @PostMapping("/ejecutar-automaticos")
    public ResponseEntity<?> ejecutarRecordatoriosAutomaticos() {
        try {
            recordatorioService.enviarRecordatoriosAutomaticos();
            return ResponseEntity.ok(Map.of(
                "message", "Verificación de recordatorios automáticos ejecutada",
                "status", "success"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Error al ejecutar recordatorios automáticos: " + e.getMessage(),
                "status", "error"
            ));
        }
    }
} 