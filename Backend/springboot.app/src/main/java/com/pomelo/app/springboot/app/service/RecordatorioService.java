package com.pomelo.app.springboot.app.service;

import com.pomelo.app.springboot.app.entity.Cita;
import com.pomelo.app.springboot.app.repository.CitaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class RecordatorioService {

    @Autowired
    private CitaRepository citaRepository;

    @Autowired
    private EmailService emailService;

    private boolean esEstadoElegible(String estado) {
        return estado != null && (estado.equalsIgnoreCase("confirmada") || estado.equalsIgnoreCase("pendiente"));
    }

    /**
     * Verifica y envía recordatorios de citas cada 5 minutos
     * Busca citas que están programadas para dentro de 1 hora
     */
    @Scheduled(fixedRate = 300000) // 5 minutos = 300,000 ms
    public void enviarRecordatoriosAutomaticos() {
        try {
            LocalDateTime ahora = LocalDateTime.now();
            LocalDateTime unaHoraDespues = ahora.plusHours(1);
            
            // Formatear fechas para logging
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
            String ahoraFormateado = ahora.format(formatter);
            String unaHoraFormateado = unaHoraDespues.format(formatter);
            
            System.out.println("=".repeat(80));
            System.out.println("🔍 VERIFICANDO RECORDATORIOS AUTOMÁTICOS");
            System.out.println("⏰ Hora actual: " + ahoraFormateado);
            System.out.println("⏰ Buscando citas hasta: " + unaHoraFormateado);
            System.out.println("📧 EmailService disponible: " + (emailService != null ? "✅" : "❌"));
            System.out.println("📅 CitaRepository disponible: " + (citaRepository != null ? "✅" : "❌"));
            System.out.println("=".repeat(80));
            
            // Buscar citas que están programadas para dentro de 1 hora
            List<Cita> citasProximas = citaRepository.findCitasProximas(ahora, unaHoraDespues);
            
            System.out.println("📅 Citas encontradas para recordatorio: " + citasProximas.size());
            
            if (citasProximas.isEmpty()) {
                System.out.println("ℹ️ No hay citas próximas que requieran recordatorio");
                System.out.println("🔍 Verificando todas las citas confirmadas...");
                
                // Buscar algunas citas confirmadas para debug (sin tocar relaciones perezosas)
                List<Cita> todasLasCitas = citaRepository.findAll();
                System.out.println("📊 Total de citas en la base de datos: " + todasLasCitas.size());
                
                long citasConfirmadas = todasLasCitas.stream()
                    .filter(cita -> esEstadoElegible(cita.getEstado()))
                    .count();
                System.out.println("✅ Citas confirmadas/pendientes: " + citasConfirmadas);
                
                // Mostrar algunas citas para debug
                todasLasCitas.stream()
                    .filter(cita -> esEstadoElegible(cita.getEstado()))
                    .limit(5)
                    .forEach(cita -> {
                        String clienteInfo;
                        try {
                            // Evitar inicializar perezosos, mostrar solo IDs si no están cargados
                            clienteInfo = cita.getCliente() != null ? ("ClienteID=" + cita.getCliente().getId()) : "Cliente=null";
                        } catch (Exception ex) {
                            clienteInfo = "Cliente(lazy)";
                        }
                        System.out.println("📋 Cita ID: " + cita.getId() +
                                " | Fecha: " + cita.getFechaHora().format(formatter) +
                                " | Estado: " + cita.getEstado() +
                                " | " + clienteInfo);
                    });
            } else {
                for (Cita cita : citasProximas) {
                    try {
                        if (esEstadoElegible(cita.getEstado())) {
                            System.out.println("📧 Enviando recordatorio para cita ID: " + cita.getId());
                            // cliente y servicio vienen join-fetch, es seguro acceder
                            System.out.println("👤 Cliente: " + cita.getCliente().getNombre());
                            System.out.println("📅 Fecha: " + cita.getFechaHora().format(formatter));
                            System.out.println("📧 Email: " + cita.getCliente().getEmail());
                            System.out.println("📋 Estado: " + cita.getEstado());
                            
                            emailService.enviarRecordatorioCita(cita);
                            
                            System.out.println("✅ Recordatorio enviado exitosamente");
                            System.out.println("-".repeat(40));
                        } else {
                            System.out.println("⚠️ Cita ID " + cita.getId() + " no elegible (estado: " + cita.getEstado() + ")");
                        }
                    } catch (Exception e) {
                        System.err.println("❌ Error al enviar recordatorio para cita ID " + cita.getId() + ": " + e.getMessage());
                        e.printStackTrace();
                    }
                }
            }
            
            System.out.println("=".repeat(80));
            System.out.println("✅ Verificación de recordatorios completada");
            System.out.println("⏰ Próxima verificación en 5 minutos");
            System.out.println("=".repeat(80));
            
        } catch (Exception e) {
            System.err.println("❌ Error crítico en el servicio de recordatorios automáticos: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Método para enviar recordatorio manual (para pruebas)
     */
    public void enviarRecordatorioManual(Long citaId) {
        try {
            System.out.println("🔧 ENVIANDO RECORDATORIO MANUAL");
            System.out.println("📋 Cita ID: " + citaId);
            
            Cita cita = citaRepository.findById(citaId).orElse(null);
            if (cita != null) {
                System.out.println("👤 Cliente: " + cita.getCliente().getNombre());
                System.out.println("📅 Fecha: " + cita.getFechaHora().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
                System.out.println("📧 Email: " + cita.getCliente().getEmail());
                System.out.println("📋 Estado: " + cita.getEstado());
                
                emailService.enviarRecordatorioCita(cita);
                System.out.println("✅ Recordatorio manual enviado exitosamente para cita ID: " + citaId);
            } else {
                System.err.println("❌ Cita no encontrada con ID: " + citaId);
                throw new RuntimeException("Cita no encontrada con ID: " + citaId);
            }
        } catch (Exception e) {
            System.err.println("❌ Error al enviar recordatorio manual: " + e.getMessage());
            throw new RuntimeException("Error al enviar recordatorio manual", e);
        }
    }
} 