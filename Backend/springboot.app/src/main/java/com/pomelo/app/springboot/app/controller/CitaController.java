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
    }
}
