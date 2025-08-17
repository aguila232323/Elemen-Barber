package com.pomelo.app.springboot.app.controller;

import com.pomelo.app.springboot.app.entity.Portfolio;
import com.pomelo.app.springboot.app.service.PortfolioService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/portfolio")
@CrossOrigin(origins = "*")
public class PortfolioController {

    private final PortfolioService portfolioService;

    @Autowired
    public PortfolioController(PortfolioService portfolioService) {
        this.portfolioService = portfolioService;
    }

    /**
     * Endpoint de diagnóstico para verificar el estado de la BD
     */
    @GetMapping("/diagnostico")
    public ResponseEntity<?> diagnostico() {
        try {
            List<Portfolio> todasLasFotos = portfolioService.obtenerTodasLasFotos();
            
            Map<String, Object> response = new HashMap<>();
            response.put("totalFotos", todasLasFotos.size());
            response.put("fotosActivas", portfolioService.contarFotosActivas());
            response.put("timestamp", java.time.LocalDateTime.now());
            
            // Verificar estructura de la primera foto si existe
            if (!todasLasFotos.isEmpty()) {
                Portfolio primeraFoto = todasLasFotos.get(0);
                Map<String, Object> fotoInfo = new HashMap<>();
                fotoInfo.put("id", primeraFoto.getId());
                fotoInfo.put("nombre", primeraFoto.getNombre());
                fotoInfo.put("tieneImagenUrl", primeraFoto.getImagenUrl() != null);
                fotoInfo.put("activo", primeraFoto.getActivo());
                response.put("primeraFoto", fotoInfo);
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error en diagnóstico");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Obtiene fotos optimizadas para móviles (máximo 5 fotos)
     */
    @GetMapping("/fotos-mobile")
    public ResponseEntity<?> obtenerFotosMobile() {
        try {
            List<Portfolio> fotos = portfolioService.obtenerFotosActivas();
            
            // Limitamos a 5 fotos para móviles
            if (fotos.size() > 5) {
                fotos = fotos.subList(0, 5);
            }
            
            return ResponseEntity.ok(fotos);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al obtener las fotos del portfolio");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Obtiene todas las fotos activas del portfolio (público)
     */
    @GetMapping("/fotos")
    public ResponseEntity<?> obtenerFotos() {
        try {
            List<Portfolio> fotos = portfolioService.obtenerFotosActivas();
            
            // Optimización: limitar a 10 fotos más recientes para móviles
            if (fotos.size() > 10) {
                fotos = fotos.subList(0, 10);
            }
            
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
    public ResponseEntity<?> añadirFoto(@RequestBody Map<String, String> request) {
        try {
            String nombre = request.get("nombre");
            String imagenUrl = request.get("imagenUrl");
            String urlInstagram = request.get("urlInstagram");

            if (nombre == null || imagenUrl == null) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Datos incompletos");
                errorResponse.put("message", "El nombre y la URL de la imagen son obligatorios");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            Portfolio nuevaFoto = portfolioService.añadirFoto(nombre, imagenUrl, urlInstagram != null ? urlInstagram : "");
            
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