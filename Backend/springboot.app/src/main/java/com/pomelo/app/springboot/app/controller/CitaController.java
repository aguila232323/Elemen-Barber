package com.pomelo.app.springboot.app.controller;

import com.pomelo.app.springboot.app.entity.Cita;
import com.pomelo.app.springboot.app.entity.Usuario;
import com.pomelo.app.springboot.app.entity.Servicio;
import com.pomelo.app.springboot.app.dto.CitaRequest;
import com.pomelo.app.springboot.app.service.CitaService;
import com.pomelo.app.springboot.app.service.UsuarioService;
import com.pomelo.app.springboot.app.service.ServicioService;
import com.pomelo.app.springboot.app.service.ConfiguracionService;
import com.pomelo.app.springboot.app.service.VacacionesService;
import com.pomelo.app.springboot.app.service.EmailService;
import com.pomelo.app.springboot.app.repository.ResenaRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.ArrayList;
import java.time.DayOfWeek;

@RestController
@RequestMapping("/api/citas")
@CrossOrigin(origins = "*")
@Tag(name = "Citas", description = "Endpoints para gestión de citas")
public class CitaController {

    private final CitaService citaService;
    private final UsuarioService usuarioService;
    private final ServicioService servicioService;
    private final ConfiguracionService configuracionService;
    private final VacacionesService vacacionesService;
    private final EmailService emailService;
    private final ResenaRepository resenaRepository;

    public CitaController(CitaService citaService, UsuarioService usuarioService, ServicioService servicioService, ConfiguracionService configuracionService, VacacionesService vacacionesService, EmailService emailService, ResenaRepository resenaRepository) {
        this.citaService = citaService;
        this.usuarioService = usuarioService;
        this.servicioService = servicioService;
        this.configuracionService = configuracionService;
        this.vacacionesService = vacacionesService;
        this.emailService = emailService;
        this.resenaRepository = resenaRepository;
    }

    @PostMapping
    @Operation(summary = "Crear cita", description = "Crea una nueva cita para el usuario autenticado o para un cliente específico si es admin")
    public ResponseEntity<?> crearCita(@RequestBody CitaRequest citaRequest, @AuthenticationPrincipal UserDetails user) {
        try {
            // Obtener el rol del usuario
            String rolUsuario = user.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN")) ? "ADMIN" : "USER";
            
            Usuario cliente;
            
            // Si es admin y se proporciona clienteId, usar ese cliente
            if ("ADMIN".equals(rolUsuario) && citaRequest.getClienteId() != null) {
                cliente = usuarioService.findById(citaRequest.getClienteId());
                if (cliente == null) {
                    throw new RuntimeException("Cliente no encontrado");
                }
            } else {
                // Buscar usuario por email para obtener el ID (comportamiento normal)
                cliente = usuarioService.findByEmail(user.getUsername());
                if (cliente == null) {
                    throw new RuntimeException("Usuario no encontrado");
                }
                
                // Verificar que el usuario no esté baneado (solo para usuarios normales)
                if (Boolean.TRUE.equals(cliente.getBaneado())) {
                    throw new RuntimeException("Tu cuenta ha sido suspendida. No puedes crear citas.");
                }
            }
            
            // Buscar el servicio
            Servicio servicio = servicioService.findById(citaRequest.getServicioId());
            if (servicio == null) {
                throw new RuntimeException("Servicio no encontrado");
            }
            
            // Crear la cita
            Cita cita = new Cita();
            cita.setCliente(cliente);
            cita.setServicio(servicio);
            cita.setFechaHora(citaRequest.getFecha());
            cita.setComentario(citaRequest.getComentario());
            cita.setEstado("pendiente");
            
            Cita nuevaCita = citaService.crearCita(cita, rolUsuario);
            
            // Enviar email de confirmación
            try {
                emailService.enviarConfirmacionCita(nuevaCita);
            } catch (Exception e) {
                System.err.println("Error al enviar email de confirmación: " + e.getMessage());
                // No fallar la creación de la cita si falla el email
            }
            
            return ResponseEntity.ok(nuevaCita);
        } catch (Exception e) {
            Map<String, String> errorResponse = new java.util.HashMap<>();
            errorResponse.put("error", "Error al crear la cita");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/mis-citas")
    @Operation(summary = "Mis citas", description = "Lista las citas del usuario autenticado")
    public ResponseEntity<?> listarCitasUsuario(@AuthenticationPrincipal UserDetails user) {
        try {
            // Buscar usuario por email para obtener el ID
            Usuario usuario = usuarioService.findByEmail(user.getUsername());
            if (usuario == null) {
                throw new RuntimeException("Usuario no encontrado");
            }
            
            // Verificar que el usuario no esté baneado
            if (Boolean.TRUE.equals(usuario.getBaneado())) {
                throw new RuntimeException("Tu cuenta ha sido suspendida. No puedes acceder a tus citas.");
            }
            
            List<Cita> citas = citaService.listarCitasPorUsuario(usuario.getId());
            List<Map<String, Object>> citasConEstado = new ArrayList<>();
            
            // Debug: imprimir información de las citas
            System.out.println("Total de citas encontradas: " + citas.size());
            for (Cita cita : citas) {
                System.out.println("Cita ID: " + cita.getId() + 
                                ", Estado: " + cita.getEstado() + 
                                ", Fecha: " + cita.getFechaHora() + 
                                ", Es pasada: " + (cita.getFechaHora() != null && cita.getFechaHora().isBefore(java.time.LocalDateTime.now())));
            }
            
            for (Cita cita : citas) {
                Map<String, Object> citaMap = new java.util.HashMap<>();
                citaMap.put("id", cita.getId());
                citaMap.put("servicio", Map.of(
                    "nombre", cita.getServicio().getNombre(),
                    "emoji", cita.getServicio().getEmoji()
                ));
                citaMap.put("fechaHora", cita.getFechaHora());
                citaMap.put("comentario", cita.getComentario());
                
                String estado = cita.getEstado();
                // Si la cita está pendiente y ya pasó la fecha, marcarla como completada
                if ("pendiente".equals(estado) && cita.getFechaHora() != null && 
                    cita.getFechaHora().isBefore(java.time.LocalDateTime.now())) {
                    estado = "completada";
                }
                // Si la cita está confirmada y ya pasó la fecha, marcarla como completada
                if ("confirmada".equals(estado) && cita.getFechaHora() != null && 
                    cita.getFechaHora().isBefore(java.time.LocalDateTime.now())) {
                    estado = "completada";
                }
                citaMap.put("estado", estado);
                
                // Verificar si la cita tiene reseña
                boolean tieneResena = resenaRepository.existsByCitaId(cita.getId());
                citaMap.put("reseñada", tieneResena);
                
                citasConEstado.add(citaMap);
            }
            
            return ResponseEntity.ok(citasConEstado);
        } catch (Exception e) {
            Map<String, String> errorResponse = new java.util.HashMap<>();
            errorResponse.put("error", "Error al obtener las citas");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Cancelar cita", description = "Cancela una cita específica")
    public ResponseEntity<?> cancelarCita(@PathVariable Long id, @AuthenticationPrincipal UserDetails user) {
        try {
            // Verificar que el usuario no esté baneado
            Usuario usuario = usuarioService.findByEmail(user.getUsername());
            if (usuario != null && Boolean.TRUE.equals(usuario.getBaneado())) {
                throw new RuntimeException("Tu cuenta ha sido suspendida. No puedes cancelar citas.");
            }
            
            citaService.cancelarCita(id);
            Map<String, String> response = new java.util.HashMap<>();
            response.put("message", "Cita cancelada correctamente");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new java.util.HashMap<>();
            errorResponse.put("error", "Error al cancelar la cita");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Reprogramar cita", description = "Actualiza la fecha y hora de una cita")
    public ResponseEntity<?> reprogramarCita(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request
    ) {
        try {
            String fechaHoraStr = (String) request.get("fechaHora");
            if (fechaHoraStr == null || fechaHoraStr.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "fechaHora requerida (formato ISO yyyy-MM-ddTHH:mm:ss)"));
            }

            java.time.LocalDateTime nuevaFechaHora = java.time.LocalDateTime.parse(fechaHoraStr);

            Cita cita = citaService.listarTodasLasCitas().stream()
                    .filter(c -> c.getId().equals(id))
                    .findFirst()
                    .orElse(null);
            if (cita == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Cita no encontrada"));
            }

            cita.setFechaHora(nuevaFechaHora);
            // Persistir
            com.pomelo.app.springboot.app.entity.Cita guardada = citaService.crearCita(cita, "ADMIN");
            return ResponseEntity.ok(Map.of("message", "Cita reprogramada", "cita", guardada));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error al reprogramar cita: " + e.getMessage()));
        }
    }

    // Para admin
    @GetMapping("/todas")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Todas las citas", description = "Lista todas las citas (solo para administradores)")
    public ResponseEntity<?> listarTodas() {
        try {
            List<Cita> citas = citaService.listarTodasLasCitas();
            List<Map<String, Object>> citasFormateadas = new ArrayList<>();
            
            for (Cita cita : citas) {
                Map<String, Object> citaMap = new java.util.HashMap<>();
                citaMap.put("id", cita.getId());
                citaMap.put("fechaHora", cita.getFechaHora());
                citaMap.put("comentario", cita.getComentario());
                citaMap.put("fija", cita.isFija());
                citaMap.put("periodicidadDias", cita.getPeriodicidadDias());
                citaMap.put("estado", cita.getEstado());
                
                // Servicio
                Map<String, Object> servicioMap = new java.util.HashMap<>();
                servicioMap.put("id", cita.getServicio().getId());
                servicioMap.put("nombre", cita.getServicio().getNombre());
                servicioMap.put("descripcion", cita.getServicio().getDescripcion());
                servicioMap.put("precio", cita.getServicio().getPrecio());
                servicioMap.put("duracionMinutos", cita.getServicio().getDuracionMinutos());
                citaMap.put("servicio", servicioMap);
                
                // Usuario (cliente)
                Map<String, Object> usuarioMap = new java.util.HashMap<>();
                usuarioMap.put("id", cita.getCliente().getId());
                usuarioMap.put("nombre", cita.getCliente().getNombre());
                usuarioMap.put("email", cita.getCliente().getEmail());
                usuarioMap.put("telefono", cita.getCliente().getTelefono());
                citaMap.put("usuario", usuarioMap);
                
                citasFormateadas.add(citaMap);
            }
            
            return ResponseEntity.ok(citasFormateadas);
        } catch (Exception e) {
            Map<String, String> errorResponse = new java.util.HashMap<>();
            errorResponse.put("error", "Error al listar todas las citas");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/fija")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Crear cita fija", description = "Crea una cita fija con periodicidad especificada")
    public ResponseEntity<?> crearCitaFija(@RequestBody Map<String, Object> request, @RequestParam int periodicidadDias) {
        try {
            // Log para debugging
            System.out.println("Request recibido: " + request);
            System.out.println("Periodicidad días: " + periodicidadDias);
            // Extraer datos del request con validaciones
            Object clienteIdObj = request.get("clienteId");
            Object servicioIdObj = request.get("servicioId");
            Object fechaHoraObj = request.get("fechaHora");
            Object comentarioObj = request.get("comentario");
            
            // Validar campos obligatorios
            if (clienteIdObj == null) {
                throw new RuntimeException("clienteId es obligatorio");
            }
            if (servicioIdObj == null) {
                throw new RuntimeException("servicioId es obligatorio");
            }
            if (fechaHoraObj == null) {
                throw new RuntimeException("fechaHora es obligatorio");
            }
            
            Long clienteId = Long.valueOf(clienteIdObj.toString());
            Long servicioId = Long.valueOf(servicioIdObj.toString());
            String fechaHoraStr = fechaHoraObj.toString();
            String comentario = comentarioObj != null ? comentarioObj.toString() : "";
            
            // Buscar cliente y servicio
            Usuario cliente = usuarioService.findById(clienteId);
            if (cliente == null) {
                throw new RuntimeException("Cliente no encontrado");
            }
            
            Servicio servicio = servicioService.findById(servicioId);
            if (servicio == null) {
                throw new RuntimeException("Servicio no encontrado");
            }
            
            // Crear la cita
            Cita cita = new Cita();
            cita.setCliente(cliente);
            cita.setServicio(servicio);
            cita.setFechaHora(java.time.LocalDateTime.parse(fechaHoraStr));
            cita.setComentario(comentario);
            
            Cita nuevaCita = citaService.crearCitaFija(cita, periodicidadDias);
            
            // Enviar email de confirmación para la primera cita de la serie
            try {
                emailService.enviarConfirmacionCita(nuevaCita);
            } catch (Exception e) {
                System.err.println("Error al enviar email de confirmación: " + e.getMessage());
                // No fallar la creación de la cita si falla el email
            }
            
            return ResponseEntity.ok(nuevaCita);
        } catch (Exception e) {
            Map<String, String> errorResponse = new java.util.HashMap<>();
            errorResponse.put("error", "Error al crear cita fija");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @DeleteMapping("/fija/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Borrar cita fija", description = "Borra una cita fija por su ID")
    public ResponseEntity<?> borrarCitaFija(@PathVariable Long id) {
        try {
            citaService.borrarCitaFija(id);
            Map<String, String> response = new java.util.HashMap<>();
            response.put("message", "Cita fija eliminada correctamente");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new java.util.HashMap<>();
            errorResponse.put("error", "Error al borrar cita fija");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // (Constante no usada eliminada)

    @GetMapping("/disponibilidad")
    @Operation(summary = "Disponibilidad de citas", description = "Devuelve los slots libres para un día y duración concreta")
    public ResponseEntity<?> disponibilidad(
        @RequestParam String fecha,
        @RequestParam int duracion, // en minutos
        @RequestParam(required = false) String userRole // "ADMIN" o "USER"
    ) {
        try {
            // Verificar que el usuario no esté baneado (si no es admin)
            if (!"ADMIN".equals(userRole)) {
                // Aquí necesitaríamos obtener el usuario del token JWT
                // Por ahora, confiamos en que el frontend envía el userRole correctamente
                // En una implementación más robusta, extraeríamos el usuario del token
            }
            
            LocalDate dia = LocalDate.parse(fecha, DateTimeFormatter.ISO_DATE);
            LocalDateTime ahora = LocalDateTime.now();
            
            // Obtener tiempo mínimo de reserva
            int tiempoMinimo = configuracionService.obtenerTiempoMinimo();
            
            // Generar todos los slots de inicio cada 45 min
            List<LocalTime[]> tramos = List.of(
                new LocalTime[]{LocalTime.of(9,0), LocalTime.of(15,0)},
                new LocalTime[]{LocalTime.of(16,0), LocalTime.of(21,15)}
            );
            List<LocalTime> slots = new ArrayList<>();
            
            // Añadir slot especial de 8:15 solo para administradores (al principio)
            if ("ADMIN".equals(userRole)) {
                slots.add(LocalTime.of(8, 15));
            }
            
            // Generar slots normales
            for (LocalTime[] tramo : tramos) {
                LocalTime apertura = tramo[0];
                LocalTime cierre = tramo[1];
                for (LocalTime t = apertura; t.compareTo(cierre) < 0; t = t.plusMinutes(45)) {
                    slots.add(t);
                }
            }
            
            // Añadir slot especial de 21:15 solo para administradores (al final)
            if ("ADMIN".equals(userRole)) {
                slots.add(LocalTime.of(21, 15));
            }

            // Obtener citas reservadas para ese día
            List<Cita> citasDia = citaService.listarTodasLasCitas().stream()
                .filter(c -> c.getFechaHora() != null && c.getFechaHora().toLocalDate().equals(dia))
                .collect(Collectors.toList());

            // Para cada slot, comprobar si hay hueco consecutivo suficiente para la duración solicitada
            int slotsNecesarios = (int)Math.ceil(duracion / 45.0);
            List<String> horasLibres = new ArrayList<>();
            for (int i = 0; i <= slots.size() - slotsNecesarios; i++) {
                boolean hueco = true;
                LocalTime slotInicio = slots.get(i);
                LocalTime slotFin = slotInicio.plusMinutes(45 * slotsNecesarios);
                // Ocultar 14:15 en días que no sean sábado (aplica a todos los roles)
                DayOfWeek diaSemanaGeneral = dia.getDayOfWeek();
                if (diaSemanaGeneral != DayOfWeek.SATURDAY && slotInicio.equals(LocalTime.of(14, 15))) {
                    continue;
                }
                
                // Comprobar que el rango completo cabe dentro de algún tramo
                boolean dentroHorario = false;
                for (LocalTime[] tramo : tramos) {
                    if (!slotInicio.isBefore(tramo[0]) && !slotFin.isAfter(tramo[1])) {
                        dentroHorario = true;
                        break;
                    }
                }
                
                // Para administradores, también permitir slots especiales
                if (!dentroHorario && "ADMIN".equals(userRole)) {
                    // Verificar si es un slot especial (8:15 o 21:15)
                    if (slotInicio.equals(LocalTime.of(8, 15)) || slotInicio.equals(LocalTime.of(21, 15))) {
                        dentroHorario = true;
                    }
                }
                
                if (!dentroHorario) continue;
                
                // Comprobar si el día está en vacaciones
                if (vacacionesService.esFechaVacaciones(dia)) {
                    continue; // Saltar este slot si el día está en vacaciones
                }
                
                // Comprobar restricción de tiempo mínimo para usuarios no-admin
                if (!"ADMIN".equals(userRole)) {
                    LocalDateTime fechaHoraSlot = LocalDateTime.of(dia, slotInicio);
                    long horasAntes = java.time.temporal.ChronoUnit.HOURS.between(ahora, fechaHoraSlot);
                    if (horasAntes < tiempoMinimo) {
                        continue; // Saltar este slot si no cumple el tiempo mínimo
                    }
                    
                    // Restricciones de días para usuarios normales
                    DayOfWeek diaSemana = dia.getDayOfWeek();
                    
                    // Lunes y domingo cerrado para usuarios normales
                    if (diaSemana == DayOfWeek.MONDAY || diaSemana == DayOfWeek.SUNDAY) {
                        continue; // Saltar este slot si es lunes o domingo
                    }
                    
                    // Sábado: permitir solo hasta las 15:00 para usuarios normales
                    if (diaSemana == DayOfWeek.SATURDAY && slotInicio.isAfter(LocalTime.of(15, 0))) {
                        continue; // Saltar este slot si es sábado después de las 15:00
                    }
                }
                
                // Comprobar que todos los slots consecutivos están libres
                for (int j = 0; j < slotsNecesarios; j++) {
                    LocalDateTime inicio = LocalDateTime.of(dia, slots.get(i + j));
                    LocalDateTime fin = inicio.plusMinutes(45);
                    boolean solapado = citasDia.stream().anyMatch(cita -> {
                        if (cita.getEstado().equals("cancelada")) return false;
                        LocalDateTime cIni = cita.getFechaHora();
                        int dur = cita.getServicio().getDuracionMinutos();
                        LocalDateTime cFin = cIni.plusMinutes(dur);
                        return !(fin.isBefore(cIni) || inicio.isAfter(cFin.minusMinutes(1)));
                    });
                    if (solapado) { hueco = false; break; }
                }
                if (hueco) {
                    horasLibres.add(slotInicio.toString().substring(0,5));
                }
            }

            Map<String, Object> respuesta = new java.util.HashMap<>();
            respuesta.put("fecha", fecha);
            respuesta.put("horasLibres", horasLibres);
            return ResponseEntity.ok(respuesta);
        } catch (Exception e) {
            Map<String, String> errorResponse = new java.util.HashMap<>();
            errorResponse.put("error", "Error al obtener disponibilidad");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/disponibilidad-mes")
    @Operation(summary = "Disponibilidad mensual de citas", description = "Devuelve la disponibilidad de todos los días de un mes para una duración concreta")
    public ResponseEntity<?> disponibilidadMes(
        @RequestParam int anio,
        @RequestParam int mes, // 1-12
        @RequestParam int duracion, // en minutos
        @RequestParam(required = false) String userRole // "ADMIN" o "USER"
    ) {
        try {
            int diasEnMes = java.time.YearMonth.of(anio, mes).lengthOfMonth();
            List<Cita> todasCitas = citaService.listarTodasLasCitas();
            List<Map<String, Object>> dias = new ArrayList<>();
            LocalDateTime ahora = LocalDateTime.now();
            int tiempoMinimo = configuracionService.obtenerTiempoMinimo();
            
            for (int dia = 1; dia <= diasEnMes; dia++) {
                LocalDate fecha = LocalDate.of(anio, mes, dia);
                // Generar slots igual que en /disponibilidad
                List<LocalTime[]> tramos = List.of(
                    new LocalTime[]{LocalTime.of(9,0), LocalTime.of(15,0)},
                    new LocalTime[]{LocalTime.of(16,0), LocalTime.of(21,15)}
                );
                List<LocalTime> slots = new ArrayList<>();
                
                // Añadir slot especial de 8:15 solo para administradores (al principio)
                if ("ADMIN".equals(userRole)) {
                    slots.add(LocalTime.of(8, 15));
                }
                
                // Generar slots normales
                for (LocalTime[] tramo : tramos) {
                    LocalTime apertura = tramo[0];
                    LocalTime cierre = tramo[1];
                    for (LocalTime t = apertura; t.compareTo(cierre) < 0; t = t.plusMinutes(45)) {
                        slots.add(t);
                    }
                }
                
                // Añadir slot especial de 21:15 solo para administradores (al final)
                if ("ADMIN".equals(userRole)) {
                    slots.add(LocalTime.of(21, 15));
                }

                List<Cita> citasDia = todasCitas.stream()
                    .filter(c -> c.getFechaHora() != null && c.getFechaHora().toLocalDate().equals(fecha))
                    .collect(Collectors.toList());
                int slotsNecesarios = (int)Math.ceil(duracion / 45.0);
                int libres = 0;
                for (int i = 0; i <= slots.size() - slotsNecesarios; i++) {
                    boolean hueco = true;
                    LocalTime slotInicio = slots.get(i);
                    LocalTime slotFin = slotInicio.plusMinutes(45 * slotsNecesarios);
                    // Ocultar 14:15 en días que no sean sábado (aplica a todos los roles)
                    DayOfWeek diaSemanaGeneral = fecha.getDayOfWeek();
                    if (diaSemanaGeneral != DayOfWeek.SATURDAY && slotInicio.equals(LocalTime.of(14, 15))) {
                        continue;
                    }
                    boolean dentroHorario = false;
                    for (LocalTime[] tramo : tramos) {
                        if (!slotInicio.isBefore(tramo[0]) && !slotFin.isAfter(tramo[1])) {
                            dentroHorario = true;
                            break;
                        }
                    }
                    
                    // Para administradores, también permitir slots especiales
                    if (!dentroHorario && "ADMIN".equals(userRole)) {
                        // Verificar si es un slot especial (8:15 o 21:15)
                        if (slotInicio.equals(LocalTime.of(8, 15)) || slotInicio.equals(LocalTime.of(21, 15))) {
                            dentroHorario = true;
                        }
                    }
                    
                    if (!dentroHorario) continue;
                    
                    // Comprobar si el día está en vacaciones
                    if (vacacionesService.esFechaVacaciones(fecha)) {
                        continue; // Saltar este slot si el día está en vacaciones
                    }
                    
                    // Comprobar restricción de tiempo mínimo para usuarios no-admin
                    if (!"ADMIN".equals(userRole)) {
                        LocalDateTime fechaHoraSlot = LocalDateTime.of(fecha, slotInicio);
                        long horasAntes = java.time.temporal.ChronoUnit.HOURS.between(ahora, fechaHoraSlot);
                        if (horasAntes < tiempoMinimo) {
                            continue; // Saltar este slot si no cumple el tiempo mínimo
                        }
                        
                        // Restricciones de días para usuarios normales
                        DayOfWeek diaSemana = fecha.getDayOfWeek();
                        
                        // Lunes y domingo cerrado para usuarios normales
                        if (diaSemana == DayOfWeek.MONDAY || diaSemana == DayOfWeek.SUNDAY) {
                            continue; // Saltar este slot si es lunes o domingo
                        }
                        
                        // Sábado: permitir solo hasta las 15:00 para usuarios normales
                        if (diaSemana == DayOfWeek.SATURDAY && slotInicio.isAfter(LocalTime.of(15, 0))) {
                            continue; // Saltar este slot si es sábado después de las 15:00
                        }
                    }
                    
                    // Comprobar que todos los slots consecutivos están libres
                    for (int j = 0; j < slotsNecesarios; j++) {
                        LocalDateTime inicio = LocalDateTime.of(fecha, slots.get(i + j));
                        LocalDateTime fin = inicio.plusMinutes(45);
                        boolean solapado = citasDia.stream().anyMatch(cita -> {
                            if (cita.getEstado().equals("cancelada")) return false;
                            LocalDateTime cIni = cita.getFechaHora();
                            int dur = cita.getServicio().getDuracionMinutos();
                            LocalDateTime cFin = cIni.plusMinutes(dur);
                            return !(fin.isBefore(cIni) || inicio.isAfter(cFin.minusMinutes(1)));
                        });
                        if (solapado) { hueco = false; break; }
                    }
                    if (hueco) {
                        libres++;
                    }
                }
                Map<String, Object> diaMap = new java.util.HashMap<>();
                diaMap.put("dia", dia);
                diaMap.put("slotsLibres", libres);
                dias.add(diaMap);
            }
            Map<String, Object> response = new java.util.HashMap<>();
            response.put("dias", dias);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new java.util.HashMap<>();
            errorResponse.put("error", "Error al obtener disponibilidad mensual");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}
