package com.pomelo.app.springboot.app.controller;

import com.pomelo.app.springboot.app.entity.DiasLaborables;
import com.pomelo.app.springboot.app.entity.DiasNoLaborables;
import com.pomelo.app.springboot.app.service.DiasLaborablesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dias-laborables")
@CrossOrigin(origins = "*")
public class DiasLaborablesController {
    
    @Autowired
    private DiasLaborablesService diasLaborablesService;
    
    /**
     * Obtiene todos los días laborables (público)
     */
    @GetMapping("/horario")
    public ResponseEntity<?> obtenerHorario() {
        try {
            List<DiasLaborables> dias = diasLaborablesService.obtenerTodosLosDias();
            return ResponseEntity.ok(dias);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al obtener el horario");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Verifica si una fecha específica es laborable (público)
     */
    @GetMapping("/verificar/{fecha}")
    public ResponseEntity<?> verificarDiaLaborable(@PathVariable String fecha) {
        try {
            LocalDate fechaLocal = LocalDate.parse(fecha);
            boolean esLaborable = diasLaborablesService.esDiaLaborable(fechaLocal);
            String informacion = diasLaborablesService.obtenerInformacionDisponibilidad(fechaLocal);
            
            Map<String, Object> respuesta = new HashMap<>();
            respuesta.put("fecha", fecha);
            respuesta.put("esLaborable", esLaborable);
            respuesta.put("informacion", informacion);
            
            return ResponseEntity.ok(respuesta);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al verificar fecha");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Obtiene días no laborables en un rango (público)
     */
    @GetMapping("/no-laborables")
    public ResponseEntity<?> obtenerDiasNoLaborables(
            @RequestParam(required = false) String fechaInicio,
            @RequestParam(required = false) String fechaFin) {
        try {
            List<DiasNoLaborables> diasNoLaborables;
            
            if (fechaInicio != null && fechaFin != null) {
                LocalDate inicio = LocalDate.parse(fechaInicio);
                LocalDate fin = LocalDate.parse(fechaFin);
                diasNoLaborables = diasLaborablesService.obtenerDiasNoLaborablesEnRango(inicio, fin);
            } else {
                diasNoLaborables = diasLaborablesService.obtenerDiasNoLaborables();
            }
            
            return ResponseEntity.ok(diasNoLaborables);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al obtener días no laborables");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Actualiza la configuración de un día de la semana (solo admin)
     */
    @PutMapping("/admin/dia-semana")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> actualizarDiaSemana(@RequestBody Map<String, Object> request) {
        try {
            String diaSemanaStr = (String) request.get("diaSemana");
            Boolean esLaborable = (Boolean) request.get("esLaborable");
            String horaInicio = (String) request.get("horaInicio");
            String horaFin = (String) request.get("horaFin");
            
            if (diaSemanaStr == null || esLaborable == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Datos incompletos");
                error.put("message", "diaSemana y esLaborable son obligatorios");
                return ResponseEntity.badRequest().body(error);
            }
            
            DayOfWeek diaSemana = DayOfWeek.valueOf(diaSemanaStr.toUpperCase());
            DiasLaborables diaActualizado = diasLaborablesService.actualizarDiaLaborable(
                diaSemana, esLaborable, horaInicio, horaFin);
            
            return ResponseEntity.ok(diaActualizado);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al actualizar día");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Añade un día no laborable específico (solo admin)
     */
    @PostMapping("/admin/no-laborable")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> añadirDiaNoLaborable(@RequestBody Map<String, Object> request) {
        try {
            String fechaStr = (String) request.get("fecha");
            String descripcion = (String) request.get("descripcion");
            String tipo = (String) request.get("tipo");
            
            if (fechaStr == null || descripcion == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Datos incompletos");
                error.put("message", "fecha y descripcion son obligatorios");
                return ResponseEntity.badRequest().body(error);
            }
            
            LocalDate fecha = LocalDate.parse(fechaStr);
            DiasNoLaborables diaNoLaborable = diasLaborablesService.añadirDiaNoLaborable(
                fecha, descripcion, tipo != null ? tipo : "FESTIVO");
            
            return ResponseEntity.ok(diaNoLaborable);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al añadir día no laborable");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Elimina un día no laborable (solo admin)
     */
    @DeleteMapping("/admin/no-laborable/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> eliminarDiaNoLaborable(@PathVariable Long id) {
        try {
            diasLaborablesService.eliminarDiaNoLaborable(id);
            
            Map<String, String> respuesta = new HashMap<>();
            respuesta.put("message", "Día no laborable eliminado correctamente");
            return ResponseEntity.ok(respuesta);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al eliminar día no laborable");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Inicializa los días laborables por defecto (solo admin)
     */
    @PostMapping("/admin/inicializar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> inicializarDiasLaborables() {
        try {
            diasLaborablesService.inicializarDiasLaborables();
            
            Map<String, String> respuesta = new HashMap<>();
            respuesta.put("message", "Días laborables inicializados correctamente");
            return ResponseEntity.ok(respuesta);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al inicializar días laborables");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
