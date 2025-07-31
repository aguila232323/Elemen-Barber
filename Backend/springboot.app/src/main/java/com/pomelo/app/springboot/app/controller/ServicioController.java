package com.pomelo.app.springboot.app.controller;

import com.pomelo.app.springboot.app.entity.Servicio;
import com.pomelo.app.springboot.app.service.ServicioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/servicios")
@CrossOrigin(origins = "*")
@Tag(name = "Servicios", description = "Endpoints para gestión de servicios")
public class ServicioController {
    private final ServicioService servicioService;

    public ServicioController(ServicioService servicioService) {
        this.servicioService = servicioService;
    }

    @GetMapping
    @Operation(summary = "Listar servicios", description = "Devuelve la lista de todos los servicios disponibles")
    public ResponseEntity<List<Servicio>> listarServicios() {
        try {
            return ResponseEntity.ok(servicioService.listarServicios());
        } catch (Exception e) {
            throw new RuntimeException("Error al listar servicios: " + e.getMessage(), e);
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Añadir servicio", description = "Crea un nuevo servicio")
    public ResponseEntity<?> crearServicio(@RequestBody Servicio servicio) {
        try {
            Servicio nuevoServicio = servicioService.crearServicio(servicio);
            return ResponseEntity.ok(nuevoServicio);
        } catch (Exception e) {
            Map<String, String> errorResponse = new java.util.HashMap<>();
            errorResponse.put("error", "Error al crear servicio");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Eliminar servicio", description = "Elimina un servicio por su ID")
    public ResponseEntity<?> eliminarServicio(@PathVariable Long id) {
        try {
            servicioService.eliminarServicio(id);
            Map<String, String> response = new java.util.HashMap<>();
            response.put("message", "Servicio eliminado correctamente");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new java.util.HashMap<>();
            errorResponse.put("error", "Error al eliminar servicio");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Modificar servicio", description = "Modifica un servicio existente")
    public ResponseEntity<?> modificarServicio(@PathVariable Long id, @RequestBody Servicio servicio) {
        try {
            Servicio servicioModificado = servicioService.modificarServicio(id, servicio);
            return ResponseEntity.ok(servicioModificado);
        } catch (Exception e) {
            Map<String, String> errorResponse = new java.util.HashMap<>();
            errorResponse.put("error", "Error al modificar servicio");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
} 