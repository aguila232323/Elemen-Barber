package com.pomelo.app.springboot.app.controller;

import com.pomelo.app.springboot.app.entity.Portfolio;
import com.pomelo.app.springboot.app.service.PortfolioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/portfolio")
@CrossOrigin(origins = "*")
@Tag(name = "Portfolio", description = "Endpoints para gestionar las fotos del portfolio")
public class PortfolioController {

    private final PortfolioService portfolioService;

    @Autowired
    public PortfolioController(PortfolioService portfolioService) {
        this.portfolioService = portfolioService;
    }

    /**
     * Obtiene todas las fotos activas del portfolio (público)
     */
    @GetMapping("/fotos")
    @Operation(summary = "Obtener fotos del portfolio", description = "Obtiene todas las fotos activas del portfolio")
    public ResponseEntity<?> obtenerFotos() {
        try {
            List<Portfolio> fotos = portfolioService.obtenerFotosActivas();
            return ResponseEntity.ok(fotos);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al obtener las fotos del portfolio");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Obtiene todas las fotos del portfolio (solo para administradores)
     */
    @GetMapping("/admin/todas")
    @Operation(summary = "Todas las fotos del portfolio", description = "Obtiene todas las fotos del portfolio (solo para administradores)")
    public ResponseEntity<?> obtenerTodasLasFotos() {
        try {
            List<Portfolio> fotos = portfolioService.obtenerTodasLasFotos();
            return ResponseEntity.ok(fotos);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al obtener las fotos del portfolio");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Añade una nueva foto al portfolio (solo para administradores)
     */
    @PostMapping("/admin/añadir")
    @Operation(summary = "Añadir foto al portfolio", description = "Añade una nueva foto al portfolio (solo para administradores)")
    public ResponseEntity<?> añadirFoto(@RequestBody Map<String, String> request) {
        try {
            String nombre = request.get("nombre");
            String imagenBase64 = request.get("imagenBase64");
            String urlInstagram = request.get("urlInstagram");

            if (nombre == null || imagenBase64 == null) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Datos incompletos");
                errorResponse.put("message", "El nombre y la imagen son obligatorios");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            Portfolio nuevaFoto = portfolioService.añadirFoto(nombre, imagenBase64, urlInstagram != null ? urlInstagram : "");
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Foto añadida correctamente");
            response.put("foto", nuevaFoto);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al añadir la foto");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Elimina una foto del portfolio (solo para administradores)
     */
    @DeleteMapping("/admin/eliminar/{id}")
    @Operation(summary = "Eliminar foto del portfolio", description = "Elimina una foto del portfolio (solo para administradores)")
    public ResponseEntity<?> eliminarFoto(@PathVariable Long id) {
        try {
            boolean eliminado = portfolioService.eliminarFoto(id);
            
            if (eliminado) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Foto eliminada correctamente");
                return ResponseEntity.ok(response);
            } else {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Foto no encontrada");
                errorResponse.put("message", "No se encontró la foto con el ID especificado");
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al eliminar la foto");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Elimina permanentemente una foto del portfolio (solo para administradores)
     */
    @DeleteMapping("/admin/eliminar-permanente/{id}")
    @Operation(summary = "Eliminar foto permanentemente", description = "Elimina permanentemente una foto del portfolio (solo para administradores)")
    public ResponseEntity<?> eliminarFotoPermanente(@PathVariable Long id) {
        try {
            boolean eliminado = portfolioService.eliminarFotoPermanente(id);
            
            if (eliminado) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Foto eliminada permanentemente");
                return ResponseEntity.ok(response);
            } else {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Foto no encontrada");
                errorResponse.put("message", "No se encontró la foto con el ID especificado");
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al eliminar la foto");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Actualiza una foto del portfolio (solo para administradores)
     */
    @PutMapping("/admin/actualizar/{id}")
    @Operation(summary = "Actualizar foto del portfolio", description = "Actualiza una foto del portfolio (solo para administradores)")
    public ResponseEntity<?> actualizarFoto(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            String nombre = request.get("nombre");
            String urlInstagram = request.get("urlInstagram");

            if (nombre == null) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Datos incompletos");
                errorResponse.put("message", "El nombre es obligatorio");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            var fotoActualizada = portfolioService.actualizarFoto(id, nombre, urlInstagram != null ? urlInstagram : "");
            
            if (fotoActualizada.isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Foto actualizada correctamente");
                response.put("foto", fotoActualizada.get());
                return ResponseEntity.ok(response);
            } else {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Foto no encontrada");
                errorResponse.put("message", "No se encontró la foto con el ID especificado");
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al actualizar la foto");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Obtiene estadísticas del portfolio (solo para administradores)
     */
    @GetMapping("/admin/estadisticas")
    @Operation(summary = "Estadísticas del portfolio", description = "Obtiene estadísticas del portfolio (solo para administradores)")
    public ResponseEntity<?> obtenerEstadisticas() {
        try {
            long totalFotos = portfolioService.contarFotosActivas();
            List<Portfolio> todasLasFotos = portfolioService.obtenerTodasLasFotos();
            
            Map<String, Object> estadisticas = new HashMap<>();
            estadisticas.put("totalFotosActivas", totalFotos);
            estadisticas.put("totalFotos", todasLasFotos.size());
            estadisticas.put("fotosInactivas", todasLasFotos.size() - totalFotos);
            
            return ResponseEntity.ok(estadisticas);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al obtener las estadísticas");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
} 