package com.pomelo.app.springboot.app.service;

import com.pomelo.app.springboot.app.entity.DiasLaborables;
import com.pomelo.app.springboot.app.entity.PeriodoLaborable;
import com.pomelo.app.springboot.app.entity.Cita;
import com.pomelo.app.springboot.app.repository.DiasLaborablesRepository;
import com.pomelo.app.springboot.app.repository.CitaRepository;
import com.pomelo.app.springboot.app.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
public class DiasLaborablesService {
    
    @Autowired
    private DiasLaborablesRepository diasLaborablesRepository;
    
    @Autowired
    private PeriodoLaborableService periodoLaborableService;
    
    @Autowired
    private CitaRepository citaRepository;
    
    @Autowired
    private GoogleCalendarService googleCalendarService;
    
    @Autowired
    private EmailService emailService;
    
    /**
     * Inicializa los días laborables por defecto (Lunes a Viernes)
     */
    public void inicializarDiasLaborables() {
        // Verificar si ya existen registros
        if (diasLaborablesRepository.count() == 0) {
            // Crear configuración por defecto: Lunes a Viernes laborables
            for (DayOfWeek dia : DayOfWeek.values()) {
                boolean esLaborable = dia != DayOfWeek.SATURDAY && dia != DayOfWeek.SUNDAY;
                DiasLaborables diaLaborable = new DiasLaborables(dia, esLaborable);
                diasLaborablesRepository.save(diaLaborable);
            }
        }
    }
    
    /**
     * Obtiene todos los días laborables
     */
    public List<DiasLaborables> obtenerTodosLosDias() {
        return diasLaborablesRepository.findAll();
    }
    
    /**
     * Obtiene solo los días laborables
     */
    public List<DiasLaborables> obtenerDiasLaborables() {
        return diasLaborablesRepository.findByEsLaborableTrue();
    }
    
    /**
     * Actualiza la configuración de un día de la semana
     */
    public DiasLaborables actualizarDiaLaborable(DayOfWeek diaSemana, boolean esLaborable) {
        Optional<DiasLaborables> diaExistente = diasLaborablesRepository.findByDiaSemana(diaSemana);
        
        boolean eraLaborableAnteriormente = false;
        
        if (diaExistente.isPresent()) {
            DiasLaborables dia = diaExistente.get();
            eraLaborableAnteriormente = dia.isEsLaborable();
            dia.setEsLaborable(esLaborable);
            DiasLaborables diaGuardado = diasLaborablesRepository.save(dia);
            
            // Si el día cambió de laborable a no laborable, cancelar citas futuras
            if (eraLaborableAnteriormente && !esLaborable) {
                cancelarCitasEnDiaNoLaborable(diaSemana);
            }
            
            return diaGuardado;
        } else {
            DiasLaborables nuevoDia = new DiasLaborables(diaSemana, esLaborable);
            DiasLaborables diaGuardado = diasLaborablesRepository.save(nuevoDia);
            
            // Si se está creando como no laborable, verificar si hay citas futuras
            if (!esLaborable) {
                cancelarCitasEnDiaNoLaborable(diaSemana);
            }
            
            return diaGuardado;
        }
    }
    
    /**
     * Cancela las citas futuras en un día que ya no es laborable
     */
    private void cancelarCitasEnDiaNoLaborable(DayOfWeek diaSemana) {
        System.out.println("🔍 Verificando cancelación automática para día semanal: " + diaSemana);
        
        // Buscar citas futuras en este día de la semana que no estén canceladas
        LocalDate fechaActual = LocalDate.now();
        LocalDate fechaLimite = fechaActual.plusYears(1); // Buscar hasta un año en el futuro
        
        List<Cita> citasAAfectar = citaRepository.findByFechaHoraBetweenAndEstadoNot(
            fechaActual.atStartOfDay(),
            fechaLimite.atTime(23, 59, 59),
            "cancelada"
        );
        
        System.out.println("   Citas futuras encontradas: " + citasAAfectar.size());
        
        int citasCanceladas = 0;
        for (Cita cita : citasAAfectar) {
            LocalDate fechaCita = cita.getFechaHora().toLocalDate();
            DayOfWeek diaSemanaCita = fechaCita.getDayOfWeek();
            
            System.out.println("   Verificando cita ID " + cita.getId() + " - Fecha: " + fechaCita + " - Día: " + diaSemanaCita);
            
            // Si la cita está en el día que ya no es laborable, cancelarla
            if (diaSemanaCita == diaSemana) {
                cita.setEstado("cancelada");
                cita.setComentario("Cita cancelada automáticamente: " + diaSemana.toString().toLowerCase() + " marcado como no laborable en horario semanal");
                citaRepository.save(cita);
                
                // Enviar email de cancelación al cliente
                try {
                    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
                    String fechaHoraFormateada = cita.getFechaHora().format(formatter);
                    String diaSemanaStr = diaSemana.toString().toLowerCase();
                    
                    String asunto = "Cita Cancelada - Elemen Barber Studio";
                    String mensaje = String.format(
                        "Hola %s,\n\n" +
                        "Tu cita programada para el %s (%s) ha sido cancelada automáticamente " +
                        "debido a que el %s ha sido marcado como día no laborable en nuestro horario semanal.\n\n" +
                        "Detalles de la cita cancelada:\n" +
                        "- Servicio: %s\n" +
                        "- Fecha y hora: %s\n" +
                        "- Precio: %s€\n\n" +
                        "Por favor, reserva una nueva cita en un día disponible a través de nuestro calendario online.\n\n" +
                        "Disculpa las molestias ocasionadas.\n\n" +
                        "Saludos,\n" +
                        "Equipo de Elemen Barber Studio",
                        cita.getCliente().getNombre(),
                        fechaHoraFormateada,
                        diaSemanaStr,
                        diaSemanaStr,
                        cita.getServicio().getNombre(),
                        fechaHoraFormateada,
                        cita.getServicio().getPrecio()
                    );
                    
                                         emailService.enviarCancelacionCita(
                         cita.getCliente().getEmail(),
                         cita.getCliente().getNombre(),
                         cita.getServicio().getNombre(),
                         cita.getFechaHora(),
                         cita.getServicio().getDuracionMinutos(),
                         cita.getServicio().getPrecio()
                     );
                    System.out.println("📧 Email de cancelación enviado a: " + cita.getCliente().getEmail());
                } catch (Exception e) {
                    System.err.println("❌ Error al enviar email de cancelación para cita ID " + cita.getId() + ": " + e.getMessage());
                }
                
                // Eliminar eventos de Google Calendar
                try {
                    googleCalendarService.deleteCalendarEventsForUserAndAdmin(cita, cita.getCliente());
                    System.out.println("🗑️ Eventos de Google Calendar eliminados para cita ID: " + cita.getId());
                } catch (Exception e) {
                    System.err.println("❌ Error al eliminar eventos de Google Calendar para cita ID " + cita.getId() + ": " + e.getMessage());
                }
                
                citasCanceladas++;
            }
        }
        
        if (citasCanceladas > 0) {
            System.out.println("⚠️ Se han cancelado " + citasCanceladas + " citas futuras debido a que " + diaSemana.toString().toLowerCase() + " ya no es laborable");
        }
    }
    
    /**
     * Verifica si un día específico es laborable
     * Ahora prioriza los períodos laborables sobre la configuración semanal
     */
    public boolean esDiaLaborable(LocalDate fecha) {
        // Primero verificar si hay períodos laborables activos para esta fecha
        List<PeriodoLaborable> periodosActivos = periodoLaborableService.obtenerPeriodosActivosPorFecha(fecha);
        
        if (!periodosActivos.isEmpty()) {
            // Si hay períodos activos para esta fecha, usar EXCLUSIVAMENTE la lógica de períodos
            // No considerar la configuración semanal en absoluto
            return periodoLaborableService.esFechaLaborable(fecha);
        }
        
        // Si no hay períodos activos para esta fecha, usar la configuración semanal tradicional
        DayOfWeek diaSemana = fecha.getDayOfWeek();
        Optional<DiasLaborables> diaConfig = diasLaborablesRepository.findByDiaSemana(diaSemana);
        return diaConfig.map(DiasLaborables::isEsLaborable).orElse(false);
    }
    
    /**
     * Obtiene la configuración de un día específico
     */
    public Optional<DiasLaborables> obtenerDia(DayOfWeek diaSemana) {
        return diasLaborablesRepository.findByDiaSemana(diaSemana);
    }
    
    /**
     * Obtiene información de disponibilidad para una fecha
     */
    public String obtenerInformacionDisponibilidad(LocalDate fecha) {
        // Primero verificar períodos laborables
        String infoPeriodo = periodoLaborableService.obtenerInformacionDisponibilidad(fecha);
        
        if (infoPeriodo.startsWith("Abierto:")) {
            return infoPeriodo; // Usar información del período
        }
        
        // Si no hay períodos activos, usar configuración semanal
        if (esDiaLaborable(fecha)) {
            return "Abierto: Día laborable (configuración semanal)";
        } else {
            return "Cerrado: No es día laborable (configuración semanal)";
        }
    }
}
