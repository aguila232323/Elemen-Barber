package com.pomelo.app.springboot.app.controller;

import com.pomelo.app.springboot.app.dto.CitaRequest;
import com.pomelo.app.springboot.app.entity.Cita;
import com.pomelo.app.springboot.app.service.CitaService;
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

    public CitaController(CitaService citaService) {
        this.citaService = citaService;
    }

    @PostMapping
    @Operation(summary = "Crear cita", description = "Crea una nueva cita para el usuario autenticado")
    public ResponseEntity<?> crearCita(@RequestBody CitaRequest request, @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(citaService.crearCita(user.getUsername(),request));
    }

    @GetMapping("/mis-citas")
    @Operation(summary = "Mis citas", description = "Lista las citas del usuario autenticado")
    public ResponseEntity<?> listarCitasUsuario(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(citaService.listarCitasPorUsuario(user.getUsername()));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Cancelar cita", description = "Cancela una cita específica")
    public ResponseEntity cancelarCita(@PathVariable Long id, @AuthenticationPrincipal UserDetails user) {
        return (ResponseEntity) ResponseEntity.ok();
    }

    // Para admin
    @GetMapping("/todas")
    @Operation(summary = "Todas las citas", description = "Lista todas las citas (solo para administradores)")
    public ResponseEntity<?> listarTodas() {
        return ResponseEntity.ok(citaService.listarTodasLasCitas());
    }

    @PostMapping("/fija/{idCliente}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Crear cita fija", description = "Crea una cita fija para un cliente. Si se indica periodicidadDias > 0, se crean varias citas futuras automáticamente.")
    public ResponseEntity<?> crearCitaFija(@RequestBody Cita cita, @PathVariable Long idCliente) {
        return ResponseEntity.ok(citaService.crearCitaFija(cita, idCliente));
    }

    @DeleteMapping("/fija/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Borrar cita fija", description = "Borra una cita fija por su ID")
    public ResponseEntity<Void> borrarCitaFija(@PathVariable Long id) {
        citaService.borrarCitaFija(id);
        return ResponseEntity.noContent().build();
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
        LocalDate dia = LocalDate.parse(fecha, DateTimeFormatter.ISO_DATE);

        // Generar slots de 45 min desde 09:00 a 14:00 y 16:00 a 21:15
        List<LocalTime> slots = new ArrayList<>();
        LocalTime[] inicios = {LocalTime.of(9,0), LocalTime.of(16,0)};
        LocalTime[] fines = {LocalTime.of(14,0), LocalTime.of(21,15)};
        for (int j = 0; j < inicios.length; j++) {
            for (LocalTime t = inicios[j]; !t.isAfter(fines[j].minusMinutes(duracion-45)); t = t.plusMinutes(45)) {
                slots.add(t);
            }
        }

        // Obtener citas reservadas para ese día
        List<Cita> citasDia = citaService.listarTodasLasCitas().stream()
            .filter(c -> c.getFechaHora() != null && c.getFechaHora().toLocalDate().equals(dia))
            .collect(Collectors.toList());

        // Para cada slot, comprobar si hay hueco suficiente
        List<String> horasLibres = new ArrayList<>();
        for (LocalTime slot : slots) {
            LocalDateTime inicio = LocalDateTime.of(dia, slot);
            LocalDateTime fin = inicio.plusMinutes(duracion);
            boolean solapado = citasDia.stream().anyMatch(cita -> {
                LocalDateTime cIni = cita.getFechaHora();
                int dur = cita.getServicio().getDuracionMinutos();
                LocalDateTime cFin = cIni.plusMinutes(dur);
                return !(fin.isBefore(cIni) || inicio.isAfter(cFin.minusMinutes(1)));
            });
            if (!solapado) {
                horasLibres.add(slot.toString().substring(0,5));
            }
        }

        Map<String, Object> respuesta = new java.util.HashMap<>();
        respuesta.put("fecha", fecha);
        respuesta.put("horasLibres", horasLibres);
        return ResponseEntity.ok(respuesta);
    }
}
