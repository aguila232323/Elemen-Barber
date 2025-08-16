package com.pomelo.app.springboot.app.service;

import com.pomelo.app.springboot.app.entity.Cita;
import com.pomelo.app.springboot.app.entity.Servicio;
import com.pomelo.app.springboot.app.entity.Usuario;
import com.pomelo.app.springboot.app.repository.CitaRepository;
import com.pomelo.app.springboot.app.repository.ServicioRepository;
import com.pomelo.app.springboot.app.repository.UsuarioRepository;
import com.pomelo.app.springboot.app.service.ConfiguracionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CitaService {

    @Autowired
    private CitaRepository citaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private ServicioRepository servicioRepository;

    @Autowired
    private ConfiguracionService configuracionService;

    @Autowired
    private VacacionesService vacacionesService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private GoogleCalendarService googleCalendarService;

    public Cita crearCita(Cita cita, String rolUsuario) {
        // Validar tiempo mínimo de reserva para usuarios no admin
        if (!"ADMIN".equals(rolUsuario)) {
            LocalDateTime ahora = LocalDateTime.now();
            LocalDateTime fechaCita = cita.getFechaHora();
            long horasAntes = ChronoUnit.HOURS.between(ahora, fechaCita);
            
            int tiempoMinimo = configuracionService.obtenerTiempoMinimo();
            if (horasAntes < tiempoMinimo) {
                throw new RuntimeException("Debes reservar con al menos " + tiempoMinimo + " horas de antelación");
            }
        }
        
        // Validar que no sea un día de vacaciones
        LocalDate fechaCita = cita.getFechaHora().toLocalDate();
        if (vacacionesService.esFechaVacaciones(fechaCita)) {
            throw new RuntimeException("No se pueden crear citas en días de vacaciones");
        }
        
        // Verificar disponibilidad
        if (!verificarDisponibilidad(cita)) {
            throw new RuntimeException("No hay disponibilidad para la fecha y hora seleccionada");
        }
        
        cita.setEstado("confirmada");
        Cita citaGuardada = citaRepository.save(cita);
        
        // Intentar crear eventos en Google Calendar para usuarios de Google y admin
        try {
            System.out.println("🎯 Intentando crear eventos en Google Calendar...");
            
            // Recargar el usuario desde la base de datos para obtener los tokens más recientes
            Usuario usuarioActualizado = usuarioRepository.findByEmail(citaGuardada.getCliente().getEmail()).orElse(citaGuardada.getCliente());
            
            googleCalendarService.createCalendarEventsForUserAndAdmin(citaGuardada, usuarioActualizado);
            System.out.println("✅ Eventos de Google Calendar creados exitosamente");
        } catch (Exception e) {
            // No fallar la creación de la cita si falla el Google Calendar
            System.err.println("❌ Error al crear eventos en Google Calendar: " + e.getMessage());
            System.err.println("⚠️ La cita se creó correctamente, pero falló la integración con Google Calendar");
            // No hacer e.printStackTrace() para evitar logs muy largos
        } catch (Error e) {
            // Capturar también errores de inicialización de clases
            System.err.println("❌ Error de inicialización en Google Calendar: " + e.getMessage());
            System.err.println("⚠️ La cita se creó correctamente, pero falló la integración con Google Calendar");
        }
        
        return citaGuardada;
    }

    public List<Cita> obtenerCitasPorUsuario(Long usuarioId) {
        try {
            Usuario usuario = usuarioRepository.findById(usuarioId)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            return citaRepository.findByCliente(usuario);
        } catch (Exception e) {
            throw new RuntimeException("Error al obtener citas del usuario: " + e.getMessage(), e);
        }
    }

    public List<Cita> listarCitasPorUsuario(Long usuarioId) {
        try {
            Usuario usuario = usuarioRepository.findById(usuarioId)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            // Obtener todas las citas del usuario, incluyendo las completadas
            return citaRepository.findByClienteOrderByFechaHoraDesc(usuario);
        } catch (Exception e) {
            throw new RuntimeException("Error al listar citas del usuario: " + e.getMessage(), e);
        }
    }

    public void cancelarCita(Long citaId) {
        try {
            Cita cita = citaRepository.findById(citaId)
                    .orElseThrow(() -> new RuntimeException("Cita no encontrada"));

            if (cita.getFechaHora().isBefore(LocalDateTime.now())) {
                throw new RuntimeException("No se pueden cancelar citas pasadas");
            }

            // Validar que la cancelación sea al menos 2 horas antes de la cita
            LocalDateTime ahora = LocalDateTime.now();
            LocalDateTime fechaCita = cita.getFechaHora();
            long horasAntes = java.time.temporal.ChronoUnit.HOURS.between(ahora, fechaCita);
            
            if (horasAntes < 2) {
                throw new RuntimeException("No se pueden cancelar citas con menos de 2 horas de antelación");
            }

            // Si es una cita periódica, borrar todas las citas periódicas del usuario
            if (cita.isFija() && cita.getPeriodicidadDias() != null && cita.getPeriodicidadDias() > 0) {
                List<Cita> citasPeriodicas = citaRepository.findCitasFijasByCliente(cita.getCliente());
                
                // Intentar eliminar eventos de Google Calendar para todas las citas periódicas
                for (Cita citaPeriodica : citasPeriodicas) {
                    try {
                        googleCalendarService.deleteCalendarEventsForUserAndAdmin(citaPeriodica, citaPeriodica.getCliente());
                    } catch (Exception e) {
                        System.err.println("Error al eliminar eventos de Google Calendar: " + e.getMessage());
                    }
                }
                
                // Enviar email de cancelación específico para citas periódicas
                try {
                    emailService.enviarCancelacionCitaPeriodica(
                        cita.getCliente().getEmail(),
                        cita.getCliente().getNombre(),
                        cita.getServicio().getNombre(),
                        cita.getPeriodicidadDias(),
                        citasPeriodicas.size()
                    );
                    System.out.println("✅ Email de cancelación de cita periódica enviado a: " + cita.getCliente().getEmail());
                } catch (Exception e) {
                    System.err.println("❌ Error al enviar email de cancelación de cita periódica: " + e.getMessage());
                    // No fallar la cancelación si falla el email
                }
                
                citaRepository.deleteAll(citasPeriodicas);
            } else {
                // Si no es periódica, solo cambiar el estado
                cita.setEstado("cancelada");
                citaRepository.save(cita);
                
                // Enviar email de cancelación al cliente
                try {
                    emailService.enviarCancelacionCita(
                        cita.getCliente().getEmail(),
                        cita.getCliente().getNombre(),
                        cita.getServicio().getNombre(),
                        cita.getFechaHora(),
                        cita.getServicio().getDuracionMinutos(),
                        cita.getServicio().getPrecio()
                    );
                    System.out.println("✅ Email de cancelación enviado a: " + cita.getCliente().getEmail());
                } catch (Exception e) {
                    System.err.println("❌ Error al enviar email de cancelación: " + e.getMessage());
                    // No fallar la cancelación si falla el email
                }
                
                // Intentar eliminar eventos de Google Calendar
                try {
                    googleCalendarService.deleteCalendarEventsForUserAndAdmin(cita, cita.getCliente());
                } catch (Exception e) {
                    System.err.println("Error al eliminar eventos de Google Calendar: " + e.getMessage());
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Error al cancelar la cita: " + e.getMessage(), e);
        }
    }

    public Cita crearCitaFija(Cita cita, int periodicidadDias) {
        try {
            // Validar que no sea un día de vacaciones para la cita inicial
            LocalDate fechaCita = cita.getFechaHora().toLocalDate();
            if (vacacionesService.esFechaVacaciones(fechaCita)) {
                throw new RuntimeException("No se pueden crear citas en días de vacaciones");
            }
            
            // Verificar disponibilidad para la cita inicial
            boolean citaInicialDisponible = verificarDisponibilidad(cita);
            
            Cita citaGuardada = null;
            int citasCreadas = 0;
            int citasOmitidas = 0;
            int diasVacaciones = 0;
            
            // Crear la cita inicial solo si está disponible
            if (citaInicialDisponible) {
                cita.setFija(true);
                cita.setPeriodicidadDias(periodicidadDias);
                citaGuardada = citaRepository.save(cita);
                citasCreadas++;
                System.out.println("✅ Cita inicial creada: " + cita.getFechaHora());
            } else {
                citasOmitidas++;
                System.out.println("⚠️  Cita inicial omitida (horario ocupado): " + cita.getFechaHora());
            }
            
            // Crear citas adicionales para los próximos 6 meses (aproximadamente 26 semanas)
            LocalDateTime fechaActual = cita.getFechaHora();
            
            System.out.println("Creando citas periódicas cada " + periodicidadDias + " días...");
            
            for (int i = 1; i <= 26; i++) {
                LocalDateTime nuevaFecha = fechaActual.plusDays(periodicidadDias * i);
                
                // Solo crear citas futuras
                if (nuevaFecha.isAfter(LocalDateTime.now())) {
                    // Verificar si es día de vacaciones
                    LocalDate fechaNuevaCita = nuevaFecha.toLocalDate();
                    if (vacacionesService.esFechaVacaciones(fechaNuevaCita)) {
                        diasVacaciones++;
                        System.out.println("Omitiendo día de vacaciones: " + nuevaFecha.toLocalDate());
                        continue; // Saltar días de vacaciones
                    }
                    
                    // Crear cita temporal para verificar disponibilidad
                    Cita citaTemporal = new Cita();
                    citaTemporal.setCliente(cita.getCliente());
                    citaTemporal.setServicio(cita.getServicio());
                    citaTemporal.setFechaHora(nuevaFecha);
                    citaTemporal.setComentario(cita.getComentario());
                    citaTemporal.setFija(true);
                    citaTemporal.setPeriodicidadDias(periodicidadDias);
                    citaTemporal.setEstado(cita.getEstado());
                    
                    // Verificar disponibilidad para esta fecha específica
                    if (verificarDisponibilidad(citaTemporal)) {
                        citaRepository.save(citaTemporal);
                        citasCreadas++;
                        System.out.println("Cita periódica creada: " + nuevaFecha);
                    } else {
                        citasOmitidas++;
                        System.out.println("Omitiendo fecha ocupada: " + nuevaFecha + " - Horario no disponible");
                    }
                }
            }
            
            // Log de información detallada sobre las citas creadas
            System.out.println("=== RESUMEN DE CITAS PERIÓDICAS ===");
            System.out.println("✅ Citas creadas exitosamente: " + citasCreadas);
            if (citasOmitidas > 0) {
                System.out.println("⚠️  Citas omitidas (horarios ocupados): " + citasOmitidas);
            }
            if (diasVacaciones > 0) {
                System.out.println("🏖️  Días de vacaciones omitidos: " + diasVacaciones);
            }
            System.out.println("📅 Periodicidad: cada " + periodicidadDias + " días");
            System.out.println("=====================================");
            
            // Si no se creó ninguna cita, lanzar excepción
            if (citasCreadas == 0) {
                throw new RuntimeException("No se pudo crear ninguna cita periódica. Todas las fechas están ocupadas o son días de vacaciones.");
            }
            
            // Si no se creó la cita inicial, devolver la primera cita creada
            if (citaGuardada == null) {
                // Buscar la primera cita creada en el bucle
                List<Cita> citasCreadasEnBD = citaRepository.findCitasFijasByCliente(cita.getCliente());
                if (!citasCreadasEnBD.isEmpty()) {
                    citaGuardada = citasCreadasEnBD.get(0);
                }
            }
            
            // Enviar email de notificación de cita periódica
            if (citaGuardada != null) {
                try {
                    String fechaInicioFormateada = cita.getFechaHora().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
                    emailService.enviarNotificacionCitaPeriodica(
                        cita.getCliente().getEmail(),
                        cita.getCliente().getNombre(),
                        cita.getServicio().getNombre(),
                        fechaInicioFormateada,
                        periodicidadDias,
                        citasCreadas,
                        citasOmitidas,
                        diasVacaciones
                    );
                    System.out.println("✅ Email de notificación de cita periódica enviado a: " + cita.getCliente().getEmail());
                } catch (Exception e) {
                    System.err.println("❌ Error al enviar email de notificación: " + e.getMessage());
                    // No lanzar excepción para no interrumpir el proceso de creación
                }
            }
            
            return citaGuardada;
        } catch (Exception e) {
            throw new RuntimeException("Error al crear cita fija: " + e.getMessage(), e);
        }
    }

    public void borrarCitaFija(Long citaId) {
        try {
            Cita cita = citaRepository.findById(citaId)
                    .orElseThrow(() -> new RuntimeException("Cita no encontrada"));

            if (!cita.isFija()) {
                throw new RuntimeException("La cita no es fija");
            }

            citaRepository.delete(cita);
        } catch (Exception e) {
            throw new RuntimeException("Error al borrar cita fija: " + e.getMessage(), e);
        }
    }

    public List<Cita> disponibilidad(LocalDate fecha) {
        try {
            return citaRepository.findByFechaHora(fecha);
        } catch (Exception e) {
            throw new RuntimeException("Error al obtener disponibilidad: " + e.getMessage(), e);
        }
    }

    public List<Cita> disponibilidadMes(LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        try {
            return citaRepository.findByFechaHoraBetween(fechaInicio, fechaFin);
        } catch (Exception e) {
            throw new RuntimeException("Error al obtener disponibilidad del mes: " + e.getMessage(), e);
        }
    }

    public List<Cita> listarTodasLasCitas() {
        try {
            // Filtrar citas canceladas para que no aparezcan en el calendario del admin
            return citaRepository.findAll().stream()
                .filter(cita -> !"cancelada".equals(cita.getEstado()))
                .collect(java.util.stream.Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Error al listar todas las citas: " + e.getMessage(), e);
        }
    }

    private boolean verificarDisponibilidad(Cita cita) {
        try {
            Servicio servicio = servicioRepository.findById(cita.getServicio().getId())
                    .orElseThrow(() -> new RuntimeException("Servicio no encontrado"));

            LocalDateTime inicio = cita.getFechaHora();
            LocalDateTime fin = inicio.plusMinutes(servicio.getDuracionMinutos());

            // Buscar citas que se solapen con el horario solicitado
            // Usar un rango más amplio para asegurar que no se pierdan conflictos
            LocalDateTime inicioBusqueda = inicio.minusMinutes(servicio.getDuracionMinutos());
            LocalDateTime finBusqueda = fin.plusMinutes(servicio.getDuracionMinutos());
            
            List<Cita> citasExistentes = citaRepository.findByFechaHoraBetween(inicioBusqueda, finBusqueda);

            for (Cita citaExistente : citasExistentes) {
                // Solo considerar citas que no estén canceladas
                if (!"cancelada".equals(citaExistente.getEstado())) {
                    LocalDateTime inicioExistente = citaExistente.getFechaHora();
                    LocalDateTime finExistente = citaExistente.getFechaHora().plusMinutes(citaExistente.getServicio().getDuracionMinutos());

                    // Verificar si hay solapamiento
                    // Dos citas se solapan si:
                    // 1. El inicio de la nueva cita es antes del fin de la existente Y
                    // 2. El fin de la nueva cita es después del inicio de la existente
                    if (inicio.isBefore(finExistente) && fin.isAfter(inicioExistente)) {
                        System.out.println("❌ CONFLICTO: Cita existente #" + citaExistente.getId() + 
                                         " (" + citaExistente.getCliente().getNombre() + " - " + citaExistente.getServicio().getNombre() + ")" +
                                         " de " + inicioExistente.format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")) + 
                                         " a " + finExistente.format(java.time.format.DateTimeFormatter.ofPattern("HH:mm")) + 
                                         " | Nueva cita: " + inicio.format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")) + 
                                         " a " + fin.format(java.time.format.DateTimeFormatter.ofPattern("HH:mm")));
                        return false; // No hay disponibilidad
                    }
                }
            }
            return true; // Hay disponibilidad
        } catch (Exception e) {
            throw new RuntimeException("Error al verificar disponibilidad: " + e.getMessage(), e);
        }
    }
}
