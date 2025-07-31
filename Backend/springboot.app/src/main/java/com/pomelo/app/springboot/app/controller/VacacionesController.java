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
    @Operation(summary = "Crear período de vacaciones", description = "Crea un nuevo período de vacaciones")
    public ResponseEntity<?> crearVacaciones(@RequestBody Map<String, Object> request) {
        try {
            String fechaInicioStr = (String) request.get("fechaInicio");
            String fechaFinStr = (String) request.get("fechaFin");
            String descripcion = (String) request.get("descripcion");
            
            if (fechaInicioStr == null || fechaFinStr == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Las fechas de inicio y fin son obligatorias"));
            }
            
            LocalDate fechaInicio = LocalDate.parse(fechaInicioStr, DateTimeFormatter.ISO_DATE);
            LocalDate fechaFin = LocalDate.parse(fechaFinStr, DateTimeFormatter.ISO_DATE);
            
            Vacaciones vacaciones = vacacionesService.crearVacaciones(fechaInicio, fechaFin, descripcion);
            
            Map<String, Object> response = new HashMap<>();
            response.put("mensaje", "Período de vacaciones creado correctamente");
            response.put("vacaciones", vacaciones);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al crear vacaciones");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    @GetMapping
    @Operation(summary = "Listar vacaciones activas", description = "Lista todos los períodos de vacaciones activos")
    public ResponseEntity<?> listarVacaciones() {
        try {
            List<Vacaciones> vacaciones = vacacionesService.listarVacacionesActivas();
            return ResponseEntity.ok(vacaciones);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al listar vacaciones");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Eliminar vacaciones", description = "Elimina un período de vacaciones específico")
    public ResponseEntity<?> eliminarVacaciones(@PathVariable Long id) {
        try {
            vacacionesService.eliminarVacaciones(id);
            
            Map<String, String> response = new HashMap<>();
            response.put("mensaje", "Período de vacaciones eliminado correctamente");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al eliminar vacaciones");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    @GetMapping("/verificar/{fecha}")
    @Operation(summary = "Verificar si una fecha está en vacaciones", description = "Verifica si una fecha específica está dentro de un período de vacaciones")
    public ResponseEntity<?> verificarFechaVacaciones(@PathVariable String fecha) {
        try {
            LocalDate fechaVerificar = LocalDate.parse(fecha, DateTimeFormatter.ISO_DATE);
            boolean esVacaciones = vacacionesService.esFechaVacaciones(fechaVerificar);
            
            Map<String, Object> response = new HashMap<>();
            response.put("fecha", fecha);
            response.put("esVacaciones", esVacaciones);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al verificar fecha de vacaciones");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
} 