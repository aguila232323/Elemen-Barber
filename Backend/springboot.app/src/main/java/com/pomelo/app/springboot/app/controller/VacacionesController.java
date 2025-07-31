package com.pomelo.app.springboot.app.controller;

import com.pomelo.app.springboot.app.entity.Vacaciones;
import com.pomelo.app.springboot.app.service.VacacionesService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vacaciones")
@CrossOrigin(origins = "*")
@Tag(name = "Vacaciones", description = "Endpoints para gestión de períodos de vacaciones")
public class VacacionesController {
    
    @Autowired
    private VacacionesService vacacionesService;
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> crearVacaciones(@RequestBody Map<String, Object> request) {
        try {
            String fechaInicioStr = (String) request.get("fechaInicio");
            String fechaFinStr = (String) request.get("fechaFin");
            String descripcion = (String) request.get("descripcion");
            
            if (fechaInicioStr == null || fechaFinStr == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Las fechas de inicio y fin son obligatorias"));
            }
            
            LocalDate fechaInicio = LocalDate.parse(fechaInicioStr);
            LocalDate fechaFin = LocalDate.parse(fechaFinStr);
            
            if (fechaInicio.isAfter(fechaFin)) {
                return ResponseEntity.badRequest().body(Map.of("error", "La fecha de inicio no puede ser posterior a la fecha de fin"));
            }
            
            Vacaciones vacaciones = vacacionesService.crearVacaciones(fechaInicio, fechaFin, descripcion);
            
            // Obtener información sobre citas canceladas
            Map<String, Object> response = new HashMap<>();
            response.put("vacaciones", vacaciones);
            response.put("mensaje", "Vacaciones creadas correctamente. Las citas que coincidían con este período han sido canceladas automáticamente.");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error al crear vacaciones: " + e.getMessage()));
        }
    }
    
    @GetMapping
    public ResponseEntity<?> listarVacaciones() {
        try {
            List<Vacaciones> vacaciones = vacacionesService.listarVacacionesActivas();
            return ResponseEntity.ok(vacaciones);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error al listar vacaciones: " + e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> eliminarVacaciones(@PathVariable Long id) {
        try {
            vacacionesService.eliminarVacaciones(id);
            return ResponseEntity.ok(Map.of("mensaje", "Vacaciones eliminadas correctamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error al eliminar vacaciones: " + e.getMessage()));
        }
    }
    
    @GetMapping("/verificar/{fecha}")
    public ResponseEntity<?> verificarFechaVacaciones(@PathVariable String fecha) {
        try {
            LocalDate fechaVerificar = LocalDate.parse(fecha);
            boolean esVacaciones = vacacionesService.esFechaVacaciones(fechaVerificar);
            return ResponseEntity.ok(Map.of("esVacaciones", esVacaciones));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error al verificar fecha: " + e.getMessage()));
        }
    }
} 