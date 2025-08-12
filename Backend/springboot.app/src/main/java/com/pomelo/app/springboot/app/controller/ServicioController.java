package com.pomelo.app.springboot.app.controller;

import com.pomelo.app.springboot.app.entity.Servicio;
import com.pomelo.app.springboot.app.service.ServicioService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.HashMap;

@RestController
@RequestMapping("/api/servicios")
@CrossOrigin(origins = "*")
public class ServicioController {
    private final ServicioService servicioService;

    public ServicioController(ServicioService servicioService) {
        this.servicioService = servicioService;
    }

    @GetMapping
    public ResponseEntity<List<Servicio>> listarServicios() {
        try {
            return ResponseEntity.ok(servicioService.listarServicios());
        } catch (Exception e) {
            throw new RuntimeException("Error al listar servicios: " + e.getMessage(), e);
        }
    }

    @GetMapping("/con-colores")
    public ResponseEntity<List<Map<String, Object>>> listarServiciosConColores() {
        try {
            List<Servicio> servicios = servicioService.listarServicios();
            List<Map<String, Object>> serviciosConColores = new ArrayList<>();
            
            for (Servicio servicio : servicios) {
                Map<String, Object> servicioConColor = new HashMap<>();
                servicioConColor.put("id", servicio.getId());
                servicioConColor.put("nombre", servicio.getNombre());
                servicioConColor.put("descripcion", servicio.getDescripcion());
                servicioConColor.put("precio", servicio.getPrecio());
                servicioConColor.put("duracionMinutos", servicio.getDuracionMinutos());
                servicioConColor.put("emoji", servicio.getEmoji());
                servicioConColor.put("textoDescriptivo", servicio.getTextoDescriptivo());
                
                // Obtener el color desde la base de datos
                String colorAsignado = servicio.getColorGoogleCalendar();
                if (colorAsignado == null || colorAsignado.trim().isEmpty()) {
                    colorAsignado = "#4285F4"; // Color por defecto
                }
                servicioConColor.put("colorGoogleCalendar", colorAsignado);
                
                serviciosConColores.add(servicioConColor);
            }
            
            return ResponseEntity.ok(serviciosConColores);
        } catch (Exception e) {
            throw new RuntimeException("Error al listar servicios con colores: " + e.getMessage(), e);
        }
    }
    
    /**
     * Método auxiliar para obtener el color de un servicio (simula la lógica del GoogleCalendarService)
     */
    private String getColorForService(String serviceName) {
        if (serviceName == null || serviceName.trim().isEmpty()) {
            return "#4285F4"; // Color por defecto azul
        }
        
        // Normalizar el nombre del servicio (minúsculas, sin espacios extra)
        String normalizedName = serviceName.toLowerCase().trim();
        
        // Mapa de colores (mismo que en GoogleCalendarService)
        Map<String, String> serviceColors = new HashMap<>();
        serviceColors.put("corte", "#4285F4");
        serviceColors.put("barba", "#EA4335");
        serviceColors.put("tinte", "#34A853");
        serviceColors.put("peinado", "#FF6B6B");
        serviceColors.put("tratamiento", "#4ECDC4");
        serviceColors.put("afeitado", "#45B7D1");
        serviceColors.put("masaje", "#96CEB4");
        serviceColors.put("corte de pelo", "#4285F4");
        serviceColors.put("corte pelo", "#4285F4");
        serviceColors.put("corte + barba", "#FBBC04");
        serviceColors.put("corte y barba", "#FBBC04");
        serviceColors.put("tratamiento capilar", "#4ECDC4");
        serviceColors.put("capilar", "#4ECDC4");
        
        // Buscar coincidencia exacta primero
        if (serviceColors.containsKey(normalizedName)) {
            return serviceColors.get(normalizedName);
        }
        
        // Buscar coincidencia parcial
        for (String key : serviceColors.keySet()) {
            if (normalizedName.contains(key) || key.contains(normalizedName)) {
                return serviceColors.get(key);
            }
        }
        
        // Si no encuentra coincidencia, asignar color basado en el primer carácter
        return getDefaultColorByFirstChar(normalizedName);
    }
    
    private String getDefaultColorByFirstChar(String serviceName) {
        if (serviceName.isEmpty()) return "#4285F4";
        
        char firstChar = serviceName.charAt(0);
        switch (firstChar) {
            case 'a': case 'A': return "#45B7D1";
            case 'b': case 'B': return "#EA4335";
            case 'c': case 'C': return "#4285F4";
            case 'd': case 'D': return "#FF9800";
            case 'e': case 'E': return "#4ECDC4";
            case 'f': case 'F': return "#9C27B0";
            case 'g': case 'G': return "#34A853";
            case 'h': case 'H': return "#FF6B6B";
            case 'i': case 'I': return "#96CEB4";
            case 'j': case 'J': return "#DDA0DD";
            case 'k': case 'K': return "#FBBC04";
            case 'l': case 'L': return "#FF5722";
            case 'm': case 'M': return "#96CEB4";
            case 'n': case 'N': return "#607D8B";
            case 'o': case 'O': return "#DDA0DD";
            case 'p': case 'P': return "#FF6B6B";
            case 'q': case 'Q': return "#795548";
            case 'r': case 'R': return "#EA4335";
            case 's': case 'S': return "#4285F4";
            case 't': case 'T': return "#4ECDC4";
            case 'u': case 'U': return "#9C27B0";
            case 'v': case 'V': return "#34A853";
            case 'w': case 'W': return "#FF9800";
            case 'x': case 'X': return "#607D8B";
            case 'y': case 'Y': return "#FBBC04";
            case 'z': case 'Z': return "#FF5722";
            default: return "#4285F4";
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
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

    @PutMapping("/{id}/color")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> actualizarColorServicio(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            String color = request.get("color");
            if (color == null || color.trim().isEmpty()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "El color es obligatorio");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            // Validar formato de color hexadecimal
            if (!color.matches("^#[0-9A-Fa-f]{6}$")) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "El color debe ser un código hexadecimal válido (ej: #4285F4)");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            Servicio servicio = servicioService.findById(id);
            servicio.setColorGoogleCalendar(color);
            servicioService.modificarServicio(id, servicio);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Color actualizado correctamente");
            response.put("servicio", servicio);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al actualizar color del servicio");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
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