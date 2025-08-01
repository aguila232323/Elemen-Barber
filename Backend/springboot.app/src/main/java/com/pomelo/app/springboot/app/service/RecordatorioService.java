package com.pomelo.app.springboot.app.service;

import com.pomelo.app.springboot.app.entity.Cita;
import com.pomelo.app.springboot.app.repository.CitaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class RecordatorioService {

    @Autowired
    private CitaRepository citaRepository;

    @Autowired
    private EmailService emailService;

    /**
     * Verifica y envía recordatorios de citas cada 5 minutos
     * Busca citas que están programadas para dentro de 1 hora
     */
    @Scheduled(fixedRate = 300000) // 5 minutos = 300,000 ms
    public void enviarRecordatoriosAutomaticos() {
        try {
            LocalDateTime ahora = LocalDateTime.now();
            LocalDateTime unaHoraDespues = ahora.plusHours(1);
            
            // Buscar citas que están programadas para dentro de 1 hora
            List<Cita> citasProximas = citaRepository.findCitasProximas(ahora, unaHoraDespues);
            
            System.out.println("🔍 Verificando recordatorios automáticos...");
            System.out.println("📅 Citas encontradas para recordatorio: " + citasProximas.size());
            
            for (Cita cita : citasProximas) {
                try {
                    // Verificar que la cita no haya sido cancelada
                    if ("CONFIRMADA".equals(cita.getEstado()) || "PENDIENTE".equals(cita.getEstado())) {
                        System.out.println("📧 Enviando recordatorio para cita ID: " + cita.getId());
                        emailService.enviarRecordatorioCita(cita);
                        
                        // Marcar que se envió el recordatorio (opcional)
                        // cita.setRecordatorioEnviado(true);
                        // citaRepository.save(cita);
                    }
                } catch (Exception e) {
                    System.err.println("❌ Error al enviar recordatorio para cita ID " + cita.getId() + ": " + e.getMessage());
                }
            }
            
        } catch (Exception e) {
            System.err.println("❌ Error en el servicio de recordatorios automáticos: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Método para enviar recordatorio manual (para pruebas)
     */
    public void enviarRecordatorioManual(Long citaId) {
        try {
            Cita cita = citaRepository.findById(citaId).orElse(null);
            if (cita != null) {
                emailService.enviarRecordatorioCita(cita);
                System.out.println("✅ Recordatorio manual enviado para cita ID: " + citaId);
            } else {
                System.err.println("❌ Cita no encontrada con ID: " + citaId);
            }
        } catch (Exception e) {
            System.err.println("❌ Error al enviar recordatorio manual: " + e.getMessage());
        }
    }
} 