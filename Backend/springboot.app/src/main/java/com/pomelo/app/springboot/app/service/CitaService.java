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
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Set;
import java.util.HashSet;
import java.util.stream.Collectors;

@Service
public class CitaService {
    
    // Set para rastrear usuarios que ya recibieron correo de cancelación de cita periódica
    private final Set<String> usuariosConCorreoCancelacionEnviado = new HashSet<>();

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
    private DiasLaborablesService diasLaborablesService;

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
        
        // Validar que sea un día laborable (solo para usuarios no admin)
        if (!"ADMIN".equals(rolUsuario) && !diasLaborablesService.esDiaLaborable(fechaCita)) {
            throw new RuntimeException("No se pueden crear citas en días no laborables");
        }
        
        // Verificar disponibilidad
        if (!verificarDisponibilidad(cita)) {
            throw new RuntimeException("No hay disponibilidad para la fecha y hora seleccionada");
        }
        
        cita.setEstado("confirmada");
        Cita citaGuardada = citaRepository.save(cita);
        
        // Solo crear eventos en Google Calendar si NO es una cita periódica
        if (!cita.isFija() || cita.getPeriodicidadDias() == null || cita.getPeriodicidadDias() <= 0) {
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
            } catch (Error e) {
                // Capturar también errores de inicialización de clases
                System.err.println("❌ Error de inicialización en Google Calendar: " + e.getMessage());
                System.err.println("⚠️ La cita se creó correctamente, pero falló la integración con Google Calendar");
            }
        } else {
            System.out.println("ℹ️ Cita periódica creada - No se añade a Google Calendar para optimizar rendimiento");
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

    @Transactional
    public void cancelarCita(Long citaId) {
        try {
            Cita cita = citaRepository.findById(citaId)
                    .orElseThrow(() -> new RuntimeException("Cita no encontrada"));
            
            // Si es una cita periódica, verificar si ya fue procesada
            if (cita.isFija() && cita.getPeriodicidadDias() != null && cita.getPeriodicidadDias() > 0) {
                // Verificar si esta cita específica ya fue cancelada
                if ("cancelada".equals(cita.getEstado())) {
                    System.out.println("⏭️ Cita periódica ID " + citaId + " ya fue cancelada anteriormente");
                    throw new RuntimeException("Esta cita periódica ya fue cancelada anteriormente");
                }
                
                // Verificar si ya se envió un correo de cancelación para este cliente recientemente
                // Buscar citas periódicas del mismo cliente que aún no estén canceladas
                List<Cita> citasPeriodicasActivas = citaRepository.findCitasFijasByCliente(cita.getCliente())
                    .stream()
                    .filter(c -> !"cancelada".equals(c.getEstado()))
                    .toList();
                
                if (citasPeriodicasActivas.isEmpty()) {
                    System.out.println("⏭️ No hay citas periódicas activas para cancelar");
                    throw new RuntimeException("No hay citas periódicas activas para cancelar");
                }
            }

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
                // Obtener todas las citas periódicas del usuario
                List<Cita> citasPeriodicas = citaRepository.findCitasFijasByCliente(cita.getCliente());
                
                if (citasPeriodicas.isEmpty()) {
                    System.out.println("⏭️ No hay citas periódicas activas para cancelar");
                    throw new RuntimeException("No hay citas periódicas activas para cancelar");
                }
                
                // Eliminar duplicados por ID para evitar eliminaciones múltiples
                List<Cita> citasUnicas = citasPeriodicas.stream()
                    .collect(java.util.stream.Collectors.toMap(
                        Cita::getId,
                        c -> c,
                        (existing, replacement) -> existing
                    ))
                    .values()
                    .stream()
                    .toList();
                
                System.out.println("🔄 Cancelando " + citasUnicas.size() + " citas periódicas únicas para " + cita.getCliente().getNombre());
                System.out.println("📋 IDs de citas periódicas a eliminar: " + citasUnicas.stream().map(Cita::getId).toList());
                
                // Las citas periódicas NO se añaden a Google Calendar, por lo que no hay eventos que eliminar
                System.out.println("ℹ️ Las citas periódicas no están en Google Calendar - No hay eventos que eliminar");
                
                // Enviar email de cancelación específico para citas periódicas (solo una vez)
                try {
                    String emailUsuario = cita.getCliente().getEmail();
                    
                    // Verificar si ya se envió un correo de cancelación a este usuario recientemente
                    synchronized (usuariosConCorreoCancelacionEnviado) {
                        if (usuariosConCorreoCancelacionEnviado.contains(emailUsuario)) {
                            System.out.println("⏭️ Ya se envió un correo de cancelación a " + emailUsuario + " recientemente, saltando...");
                        } else {
                            emailService.enviarCancelacionCitaPeriodica(
                                emailUsuario,
                                cita.getCliente().getNombre(),
                                cita.getServicio().getNombre(),
                                cita.getPeriodicidadDias(),
                                citasUnicas.size()
                            );
                            System.out.println("✅ Email de cancelación de cita periódica enviado a: " + emailUsuario);
                            
                            // Agregar al set y programar su eliminación después de 5 minutos
                            usuariosConCorreoCancelacionEnviado.add(emailUsuario);
                            new java.util.Timer().schedule(new java.util.TimerTask() {
                                @Override
                                public void run() {
                                    synchronized (usuariosConCorreoCancelacionEnviado) {
                                        usuariosConCorreoCancelacionEnviado.remove(emailUsuario);
                                        System.out.println("🔄 Removido bloqueo de correo para: " + emailUsuario);
                                    }
                                }
                            }, 5 * 60 * 1000); // 5 minutos
                        }
                    }
                } catch (Exception e) {
                    System.err.println("❌ Error al enviar email de cancelación de cita periódica: " + e.getMessage());
                }
                
                // Eliminar todas las citas en una sola operación para mejor rendimiento
                List<Long> idsAEliminar = citasUnicas.stream().map(Cita::getId).toList();
                
                // Eliminar en lote usando deleteAllById
                citaRepository.deleteAllById(idsAEliminar);
                
                System.out.println("✅ " + idsAEliminar.size() + " citas periódicas eliminadas de la base de datos en una sola operación");
                System.out.println("✅ Verificación: Todas las citas periódicas han sido eliminadas correctamente");
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
            
            // Crear citas adicionales para los próximos 12 meses (aproximadamente 52 semanas)
            LocalDateTime fechaActual = cita.getFechaHora();
            
            System.out.println("Creando citas periódicas cada " + periodicidadDias + " días...");
            
            for (int i = 1; i <= 52; i++) {
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

            // Si es una cita periódica, eliminar todas las citas periódicas del usuario
            if (cita.isFija() && cita.getPeriodicidadDias() != null && cita.getPeriodicidadDias() > 0) {
                List<Cita> citasPeriodicas = citaRepository.findCitasFijasByCliente(cita.getCliente());
                
                System.out.println("🗑️ Eliminando " + citasPeriodicas.size() + " citas periódicas para " + cita.getCliente().getNombre());
                
                // Enviar email de cancelación específico para citas periódicas
                try {
                    String emailUsuario = cita.getCliente().getEmail();
                    
                    // Verificar si ya se envió un correo de cancelación a este usuario recientemente
                    synchronized (usuariosConCorreoCancelacionEnviado) {
                        if (usuariosConCorreoCancelacionEnviado.contains(emailUsuario)) {
                            System.out.println("⏭️ Ya se envió un correo de cancelación a " + emailUsuario + " recientemente, saltando...");
                        } else {
                            emailService.enviarCancelacionCitaPeriodica(
                                emailUsuario,
                                cita.getCliente().getNombre(),
                                cita.getServicio().getNombre(),
                                cita.getPeriodicidadDias(),
                                citasPeriodicas.size()
                            );
                            System.out.println("✅ Email de cancelación de cita periódica enviado a: " + emailUsuario);
                            
                            // Agregar al set y programar su eliminación después de 5 minutos
                            usuariosConCorreoCancelacionEnviado.add(emailUsuario);
                            new java.util.Timer().schedule(new java.util.TimerTask() {
                                @Override
                                public void run() {
                                    synchronized (usuariosConCorreoCancelacionEnviado) {
                                        usuariosConCorreoCancelacionEnviado.remove(emailUsuario);
                                        System.out.println("🔄 Removido bloqueo de correo para: " + emailUsuario);
                                    }
                                }
                            }, 5 * 60 * 1000); // 5 minutos
                        }
                    }
                } catch (Exception e) {
                    System.err.println("❌ Error al enviar email de cancelación de cita periódica: " + e.getMessage());
                }
                
                // Eliminar todas las citas periódicas
                for (Cita citaPeriodica : citasPeriodicas) {
                    try {
                        citaRepository.delete(citaPeriodica);
                        System.out.println("🗑️ Cita periódica eliminada ID: " + citaPeriodica.getId());
                    } catch (Exception e) {
                        System.err.println("❌ Error al eliminar cita periódica ID " + citaPeriodica.getId() + ": " + e.getMessage());
                    }
                }
                
                System.out.println("✅ Todas las citas periódicas han sido eliminadas correctamente");
            } else {
                // Si no es periódica, solo eliminar la cita individual
                citaRepository.delete(cita);
                System.out.println("🗑️ Cita individual eliminada ID: " + cita.getId());
            }
        } catch (Exception e) {
            throw new RuntimeException("Error al borrar cita fija: " + e.getMessage(), e);
        }
    }

    public void eliminarCita(Long id) {
        try {
            // Buscar la cita por ID
            Cita cita = citaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cita no encontrada con ID: " + id));
            
            System.out.println("🗑️ Eliminando cita ID: " + id + " - Cliente: " + cita.getCliente().getNombre());
            
            // Eliminar la cita directamente de la base de datos
            citaRepository.delete(cita);
            
            System.out.println("✅ Cita eliminada correctamente ID: " + id);
        } catch (Exception e) {
            throw new RuntimeException("Error al eliminar cita: " + e.getMessage(), e);
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
            // Usar un rango más preciso para evitar falsos conflictos
            // Solo buscar en el rango exacto de la cita más un pequeño margen de seguridad
            LocalDateTime inicioBusqueda = inicio.minusMinutes(5); // Margen de 5 minutos
            LocalDateTime finBusqueda = fin.plusMinutes(5); // Margen de 5 minutos
            
            List<Cita> citasExistentes = citaRepository.findByFechaHoraBetween(inicioBusqueda, finBusqueda);

            for (Cita citaExistente : citasExistentes) {
                // Solo considerar citas que no estén canceladas
                if (!"cancelada".equals(citaExistente.getEstado())) {
                    LocalDateTime inicioExistente = citaExistente.getFechaHora();
                    LocalDateTime finExistente = citaExistente.getFechaHora().plusMinutes(citaExistente.getServicio().getDuracionMinutos());

                    // Verificar si hay solapamiento real
                    // Dos citas se solapan si hay un tiempo en común entre ambas
                    // Permitir que las citas se toquen exactamente (una termina cuando otra empieza)
                    boolean haySolapamiento = inicio.isBefore(finExistente) && fin.isAfter(inicioExistente);
                    
                    if (haySolapamiento) {
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
