package com.pomelo.app.springboot.app.controller;

import com.pomelo.app.springboot.app.entity.PeriodoLaborable;
import com.pomelo.app.springboot.app.service.PeriodoLaborableService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/periodos-laborables")
@CrossOrigin(origins = "*")
public class PeriodoLaborableController {

    @Autowired
    private PeriodoLaborableService periodoLaborableService;

    /**
     * Obtener todos los períodos laborables (solo admin)
     */
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PeriodoLaborable>> obtenerPeriodos() {
        try {
            List<PeriodoLaborable> periodos = periodoLaborableService.obtenerPeriodosActivos();
            return ResponseEntity.ok(periodos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Crear un nuevo período laborable (solo admin)
     */
    @PostMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> crearPeriodo(@RequestBody Map<String, Object> request) {
        try {
            PeriodoLaborable periodo = new PeriodoLaborable();
            periodo.setNombre((String) request.get("nombre"));
            periodo.setFechaInicio(LocalDate.parse((String) request.get("fechaInicio")));
            periodo.setFechaFin(LocalDate.parse((String) request.get("fechaFin")));
            periodo.setDiasLaborables((List<String>) request.get("diasLaborables"));
            
            if (request.containsKey("descripcion")) {
                periodo.setDescripcion((String) request.get("descripcion"));
            }

            PeriodoLaborable periodoCreado = periodoLaborableService.crearPeriodo(periodo);
            return ResponseEntity.ok(periodoCreado);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Eliminar un período laborable (solo admin)
     */
    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> eliminarPeriodo(@PathVariable Long id) {
        try {
            periodoLaborableService.eliminarPeriodo(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Actualizar un período laborable (solo admin)
     */
    @PutMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> actualizarPeriodo(@PathVariable Long id, @RequestBody PeriodoLaborable periodo) {
        try {
            PeriodoLaborable periodoActualizado = periodoLaborableService.actualizarPeriodo(id, periodo);
            return ResponseEntity.ok(periodoActualizado);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Verificar si una fecha es laborable (público)
     */
    @GetMapping("/verificar/{fecha}")
    public ResponseEntity<Map<String, Object>> verificarFechaLaborable(@PathVariable String fecha) {
        try {
            LocalDate fechaVerificar = LocalDate.parse(fecha);
            boolean esLaborable = periodoLaborableService.esFechaLaborable(fechaVerificar);
            String informacion = periodoLaborableService.obtenerInformacionDisponibilidad(fechaVerificar);

            Map<String, Object> response = new HashMap<>();
            response.put("fecha", fecha);
            response.put("esLaborable", esLaborable);
            response.put("informacion", informacion);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al verificar la fecha");
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Obtener información de disponibilidad para un rango de fechas (público)
     */
    @GetMapping("/disponibilidad")
    public ResponseEntity<Map<String, Object>> obtenerDisponibilidad(
            @RequestParam String fechaInicio,
            @RequestParam String fechaFin) {
        try {
            LocalDate inicio = LocalDate.parse(fechaInicio);
            LocalDate fin = LocalDate.parse(fechaFin);
            
            Map<String, Object> response = new HashMap<>();
            Map<String, Object> fechasInfo = new HashMap<>();

            LocalDate fechaActual = inicio;
            while (!fechaActual.isAfter(fin)) {
                boolean esLaborable = periodoLaborableService.esFechaLaborable(fechaActual);
                String informacion = periodoLaborableService.obtenerInformacionDisponibilidad(fechaActual);
                
                Map<String, Object> fechaInfo = new HashMap<>();
                fechaInfo.put("esLaborable", esLaborable);
                fechaInfo.put("informacion", informacion);
                
                fechasInfo.put(fechaActual.toString(), fechaInfo);
                fechaActual = fechaActual.plusDays(1);
            }

            response.put("fechaInicio", fechaInicio);
            response.put("fechaFin", fechaFin);
            response.put("fechas", fechasInfo);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al obtener la disponibilidad");
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}
