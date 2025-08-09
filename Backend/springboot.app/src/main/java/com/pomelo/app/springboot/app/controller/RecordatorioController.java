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
     * Envía un email de prueba
     */
    @PostMapping("/enviar-prueba")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> enviarEmailPrueba(@RequestParam String email) {
        try {
            System.out.println("🧪 ENVIANDO EMAIL DE PRUEBA A: " + email);
            emailService.enviarEmailPrueba(email);
            return ResponseEntity.ok().body("Email de prueba enviado a: " + email);
        } catch (Exception e) {
            System.err.println("❌ Error al enviar email de prueba: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    /**
     * Prueba la configuración de email
     */
    @GetMapping("/test-email-config")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> testEmailConfig() {
        try {
            return ResponseEntity.ok().body(Map.of(
                "host", "smtp.gmail.com",
                "port", 587,
                "username", "elemenbarber@gmail.com",
                "auth", true,
                "starttls", true,
                "debug", true,
                "timeout", 5000,
                "connectionTimeout", 5000,
                "writeTimeout", 5000
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    /**
     * Obtiene las citas próximas (para debugging)
     */
    @GetMapping("/citas-proximas")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> obtenerCitasProximas() {
        try {
            LocalDateTime ahora = LocalDateTime.now();
            LocalDateTime unaHoraDespues = ahora.plusHours(1);
            
            List<Cita> citasProximas = citaRepository.findCitasProximas(ahora, unaHoraDespues);
            
            return ResponseEntity.ok().body(Map.of(
                "horaActual", ahora.toString(),
                "horaLimite", unaHoraDespues.toString(),
                "citasEncontradas", citasProximas.size(),
                "citas", citasProximas.stream().map(cita -> Map.of(
                    "id", cita.getId(),
                    "cliente", cita.getCliente().getNombre(),
                    "email", cita.getCliente().getEmail(),
                    "servicio", cita.getServicio().getNombre(),
                    "fechaHora", cita.getFechaHora().toString(),
                    "estado", cita.getEstado()
                )).toList()
            ));
        } catch (Exception e) {
            System.err.println("❌ Error al obtener citas próximas: " + e.getMessage());
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    /**
     * Obtiene el estado del sistema de recordatorios
     */
    @GetMapping("/estado")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> obtenerEstadoSistema() {
        try {
            return ResponseEntity.ok().body(Map.of(
                "sistemaActivo", true,
                "schedulingHabilitado", true,
                "intervaloVerificacion", "5 minutos",
                "horaActual", LocalDateTime.now().toString(),
                "proximaVerificacion", LocalDateTime.now().plusMinutes(5).toString()
            ));
        } catch (Exception e) {
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