package com.pomelo.app.springboot.app.controller;

import com.pomelo.app.springboot.app.service.RecordatorioService;
import com.pomelo.app.springboot.app.service.EmailService;
import com.pomelo.app.springboot.app.entity.Cita;
import com.pomelo.app.springboot.app.repository.CitaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recordatorios")
@CrossOrigin(origins = "*")
public class RecordatorioController {

    @Autowired
    private RecordatorioService recordatorioService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private CitaRepository citaRepository;

    @Autowired
    private com.pomelo.app.springboot.app.service.RecordatorioResenaService recordatorioResenaService;

    /**
     * Ejecuta manualmente la verificación de recordatorios
     */
    @PostMapping("/ejecutar-verificacion")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> ejecutarVerificacionManual() {
        try {
            System.out.println("🔧 EJECUTANDO VERIFICACIÓN MANUAL DE RECORDATORIOS");
            recordatorioService.enviarRecordatoriosAutomaticos();
            return ResponseEntity.ok().body("Verificación de recordatorios ejecutada manualmente");
        } catch (Exception e) {
            System.err.println("❌ Error al ejecutar verificación manual: " + e.getMessage());
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    /**
     * Envía un recordatorio manual para una cita específica
     */
    @PostMapping("/enviar-manual/{citaId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> enviarRecordatorioManual(@PathVariable Long citaId) {
        try {
            recordatorioService.enviarRecordatorioManual(citaId);
            return ResponseEntity.ok().body("Recordatorio manual enviado para cita ID: " + citaId);
        } catch (Exception e) {
            System.err.println("❌ Error al enviar recordatorio manual: " + e.getMessage());
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }









    /**
     * Ejecuta manualmente el recordatorio de reseñas
     */
    @PostMapping("/reseñas/ejecutar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> ejecutarRecordatorioResenas() {
        try {
            recordatorioResenaService.enviarRecordatoriosResena();
            return ResponseEntity.ok().body("Recordatorio de reseñas ejecutado");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }
} 