package com.pomelo.app.springboot.app.service;

import com.pomelo.app.springboot.app.entity.Cita;
import com.pomelo.app.springboot.app.repository.CitaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class RecordatorioResenaService {

    @Autowired
    private CitaRepository citaRepository;


    @Autowired
    private EmailService emailService;

    @Value("${app.frontend.base-url:https://elemenbarber.com}")
    private String frontendBaseUrl;

    // Ejecuta cada hora
    @Scheduled(fixedRate = 3600000)
    public void enviarRecordatoriosResena() {
        try {
            LocalDateTime ahora = LocalDateTime.now();
            List<Cita> candidatas = citaRepository.findCitasPendientesDeResena(ahora);
            System.out.println("⭐ Citas candidatas a recordatorio de reseña: " + candidatas.size());

            for (Cita cita : candidatas) {
                try {
                    String reviewUrl = construirReviewUrl(cita.getId());
                    emailService.enviarRecordatorioResena(
                            cita.getCliente().getEmail(),
                            cita.getCliente().getNombre(),
                            cita.getServicio().getNombre(),
                            reviewUrl
                    );

                    cita.setRecordatorioResenaEnviado(true);
                    cita.setFechaRecordatorioResena(LocalDateTime.now());
                    citaRepository.save(cita);
                } catch (Exception e) {
                    System.err.println("❌ Error enviando recordatorio de reseña para cita ID " + cita.getId() + ": " + e.getMessage());
                    e.printStackTrace();
                }
            }
        } catch (Exception e) {
            System.err.println("❌ Error crítico en RecordatorioResenaService: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private String construirReviewUrl(Long citaId) {
        String base = frontendBaseUrl != null ? frontendBaseUrl : "https://elemenbarber.com";
        return base + "/perfil?reviewCitaId=" + citaId;
    }
}