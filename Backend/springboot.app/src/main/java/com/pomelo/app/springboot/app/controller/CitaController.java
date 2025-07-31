package com.pomelo.app.springboot.app.controller;

import com.pomelo.app.springboot.app.entity.Cita;
import com.pomelo.app.springboot.app.entity.Usuario;
import com.pomelo.app.springboot.app.entity.Servicio;
import com.pomelo.app.springboot.app.dto.CitaRequest;
import com.pomelo.app.springboot.app.service.CitaService;
import com.pomelo.app.springboot.app.service.UsuarioService;
import com.pomelo.app.springboot.app.service.ServicioService;
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
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/citas")
@CrossOrigin(origins = "*")
@Tag(name = "Citas", description = "Endpoints para gestión de citas")
public class CitaController {

    private final CitaService citaService;
    private final UsuarioService usuarioService;
    private final ServicioService servicioService;

    public CitaController(CitaService citaService, UsuarioService usuarioService, ServicioService servicioService) {
        this.citaService = citaService;
        this.usuarioService = usuarioService;
        this.servicioService = servicioService;
    }

    @PostMapping
    @Operation(summary = "Crear cita", description = "Crea una nueva cita para el usuario autenticado")
    public ResponseEntity<?> crearCita(@RequestBody CitaRequest citaRequest, @AuthenticationPrincipal UserDetails user) {
        try {
            // Buscar usuario por email para obtener el ID
            Usuario usuario = usuarioService.findByEmail(user.getUsername());
            if (usuario == null) {
                throw new RuntimeException("Usuario no encontrado");
            }
            
            // Buscar el servicio
            Servicio servicio = servicioService.findById(citaRequest.getServicioId());
            if (servicio == null) {
                throw new RuntimeException("Servicio no encontrado");
            }
            
            // Crear la cita
            Cita cita = new Cita();
            cita.setCliente(usuario);
            cita.setServicio(servicio);
            cita.setFechaHora(citaRequest.getFecha());
            cita.setComentario(citaRequest.getComentario());
            cita.setEstado("pendiente");
            
            Cita nuevaCita = citaService.crearCita(cita);
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
            
            List<Cita> citas = citaService.listarCitasPorUsuario(usuario.getId());
            List<Map<String, Object>> citasConEstado = new ArrayList<>();
            
            for (Cita cita : citas) {
                Map<String, Object> citaMap = new java.util.HashMap<>();
                citaMap.put("id", cita.getId());
                citaMap.put("servicio", Map.of("nombre", cita.getServicio().getNombre()));
                citaMap.put("fechaHora", cita.getFechaHora());
                citaMap.put("comentario", cita.getComentario());
                
                String estado = cita.getEstado();
                if ("pendiente".equals(estado) && cita.getFechaHora() != null && 
                    cita.getFechaHora().isBefore(java.time.LocalDateTime.now())) {
                    estado = "finalizada";
                }
                citaMap.put("estado", estado);
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

    // Para admin
    @GetMapping("/todas")
    @Operation(summary = "Todas las citas", description = "Lista todas las citas (solo para administradores)")
    public ResponseEntity<?> listarTodas() {
        try {
            return ResponseEntity.ok(citaService.listarTodasLasCitas());
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
    public ResponseEntity<?> crearCitaFija(@RequestBody Cita cita, @RequestParam int periodicidadDias) {
        try {
            Cita nuevaCita = citaService.crearCitaFija(cita, periodicidadDias);
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

    // Horario estándar: martes a sábado, 9-14 y 16-21:15 (citas cada hora)
    private static final List<String> HORAS_TRABAJO = Arrays.asList(
        "09:00", "10:00", "11:00", "12:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"
    );

    @GetMapping("/disponibilidad")
    @Operation(summary = "Disponibilidad de citas", description = "Devuelve los slots libres para un día y duración concreta")
    public ResponseEntity<?> disponibilidad(
        @RequestParam String fecha,
        @RequestParam int duracion // en minutos
    ) {
        try {
            LocalDate dia = LocalDate.parse(fecha, DateTimeFormatter.ISO_DATE);

            // Generar todos los slots de inicio cada 45 min
            List<LocalTime[]> tramos = List.of(
                new LocalTime[]{LocalTime.of(9,0), LocalTime.of(14,0)},
                new LocalTime[]{LocalTime.of(16,0), LocalTime.of(21,15)}
            );
            List<LocalTime> slots = new ArrayList<>();
            for (LocalTime[] tramo : tramos) {
                LocalTime apertura = tramo[0];
                LocalTime cierre = tramo[1];
                for (LocalTime t = apertura; t.compareTo(cierre) < 0; t = t.plusMinutes(45)) {
                    slots.add(t);
                }
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
                // Comprobar que el rango completo cabe dentro de algún tramo
                boolean dentroHorario = false;
                for (LocalTime[] tramo : tramos) {
                    if (!slotInicio.isBefore(tramo[0]) && !slotFin.isAfter(tramo[1])) {
                        dentroHorario = true;
                        break;
                    }
                }
                if (!dentroHorario) continue;
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
        @RequestParam int duracion // en minutos
    ) {
        try {
            int diasEnMes = java.time.YearMonth.of(anio, mes).lengthOfMonth();
            List<Cita> todasCitas = citaService.listarTodasLasCitas();
            List<Map<String, Object>> dias = new ArrayList<>();
            
            for (int dia = 1; dia <= diasEnMes; dia++) {
                LocalDate fecha = LocalDate.of(anio, mes, dia);
                // Generar slots igual que en /disponibilidad
                List<LocalTime[]> tramos = List.of(
                    new LocalTime[]{LocalTime.of(9,0), LocalTime.of(14,0)},
                    new LocalTime[]{LocalTime.of(16,0), LocalTime.of(21,15)}
                );
                List<LocalTime> slots = new ArrayList<>();
                for (LocalTime[] tramo : tramos) {
                    LocalTime apertura = tramo[0];
                    LocalTime cierre = tramo[1];
                    for (LocalTime t = apertura; t.compareTo(cierre) < 0; t = t.plusMinutes(45)) {
                        slots.add(t);
                    }
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
                    boolean dentroHorario = false;
                    for (LocalTime[] tramo : tramos) {
                        if (!slotInicio.isBefore(tramo[0]) && !slotFin.isAfter(tramo[1])) {
                            dentroHorario = true;
                            break;
                        }
                    }
                    if (!dentroHorario) continue;
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
            return ResponseEntity.ok(dias);
        } catch (Exception e) {
            Map<String, String> errorResponse = new java.util.HashMap<>();
            errorResponse.put("error", "Error al obtener disponibilidad mensual");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}
