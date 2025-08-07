package com.pomelo.app.springboot.app.controller;

import com.pomelo.app.springboot.app.entity.Resena;
import com.pomelo.app.springboot.app.service.ResenaService;
import com.pomelo.app.springboot.app.service.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMethod;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/resenas")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"}, allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
@Tag(name = "Reseñas", description = "Endpoints para gestión de reseñas")
public class ResenaController {

    @Autowired
    private ResenaService resenaService;
    
    @Autowired
    private UsuarioService usuarioService;

    @PostMapping
    @Operation(summary = "Crear reseña", description = "Crea una nueva reseña para una cita completada")
    public ResponseEntity<?> crearResena(
            @RequestBody Map<String, Object> request,
            @AuthenticationPrincipal UserDetails user) {
        try {
            // Obtener el usuario autenticado
            var usuario = usuarioService.findByEmail(user.getUsername());
            if (usuario == null) {
                throw new RuntimeException("Usuario no encontrado");
            }
            
            Long citaId = Long.valueOf(request.get("citaId").toString());
            Integer calificacion = Integer.valueOf(request.get("calificacion").toString());
            String comentario = (String) request.get("comentario");
            
            Resena resena = resenaService.crearResena(citaId, usuario.getId(), calificacion, comentario);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Reseña creada exitosamente");
            response.put("resena", resena);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al crear la reseña");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/mis-resenas")
    @Operation(summary = "Mis reseñas", description = "Obtiene las reseñas del usuario autenticado")
    public ResponseEntity<?> obtenerMisResenas(@AuthenticationPrincipal UserDetails user) {
        try {
            var usuario = usuarioService.findByEmail(user.getUsername());
            if (usuario == null) {
                throw new RuntimeException("Usuario no encontrado");
            }
            
            List<Resena> resenas = resenaService.obtenerResenasCliente(usuario.getId());
            return ResponseEntity.ok(resenas);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al obtener las reseñas");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/todas")
    @Operation(summary = "Todas las reseñas", description = "Obtiene todas las reseñas (solo para administradores)")
    public ResponseEntity<?> obtenerTodasLasResenas() {
        try {
            List<Resena> resenas = resenaService.obtenerTodasLasResenas();
            
            // Formatear las reseñas para el frontend
            List<Map<String, Object>> resenasFormateadas = new ArrayList<>();
            for (Resena resena : resenas) {
                Map<String, Object> resenaMap = new HashMap<>();
                resenaMap.put("id", resena.getId());
                resenaMap.put("calificacion", resena.getCalificacion());
                resenaMap.put("comentario", resena.getComentario());
                resenaMap.put("fechaCreacion", resena.getFechaCreacion());
                
                // Información del cliente
                if (resena.getCliente() != null) {
                    Map<String, Object> clienteMap = new HashMap<>();
                    clienteMap.put("id", resena.getCliente().getId());
                    clienteMap.put("nombre", resena.getCliente().getNombre());
                    clienteMap.put("email", resena.getCliente().getEmail());
                    resenaMap.put("usuario", clienteMap);
                }
                
                resenasFormateadas.add(resenaMap);
            }
            
            return ResponseEntity.ok(resenasFormateadas);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al obtener las reseñas");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/publicas")
    @Operation(summary = "Reseñas públicas", description = "Obtiene las reseñas públicas para mostrar en la página principal")
    public ResponseEntity<?> obtenerResenasPublicas() {
        try {
            List<Resena> resenas = resenaService.obtenerResenasPublicasLimitadas(6);
            Map<String, Object> estadisticas = resenaService.obtenerEstadisticasResenas();
            
            // Formatear las reseñas para el frontend
            List<Map<String, Object>> resenasFormateadas = new ArrayList<>();
            for (Resena resena : resenas) {
                Map<String, Object> resenaMap = new HashMap<>();
                resenaMap.put("id", resena.getId());
                resenaMap.put("calificacion", resena.getCalificacion());
                resenaMap.put("comentario", resena.getComentario());
                resenaMap.put("fechaCreacion", resena.getFechaCreacion());
                
                // Información del cliente (solo nombre)
                if (resena.getCliente() != null) {
                    Map<String, Object> clienteMap = new HashMap<>();
                    clienteMap.put("nombre", resena.getCliente().getNombre());
                    
                    // Priorizar foto de Google, si no hay, usar avatar genérico
                    String avatar;
                    if (resena.getCliente().getGooglePictureUrl() != null && !resena.getCliente().getGooglePictureUrl().isEmpty()) {
                        avatar = resena.getCliente().getGooglePictureUrl();
                    } else {
                        avatar = generarAvatar(resena.getCliente().getNombre());
                    }
                    clienteMap.put("avatar", avatar);
                    clienteMap.put("isGooglePicture", resena.getCliente().getGooglePictureUrl() != null && !resena.getCliente().getGooglePictureUrl().isEmpty());
                    resenaMap.put("cliente", clienteMap);
                }
                
                resenasFormateadas.add(resenaMap);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("resenas", resenasFormateadas);
            response.put("estadisticas", estadisticas);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al obtener las reseñas públicas");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/puede-resenar/{citaId}")
    @Operation(summary = "Verificar si puede reseñar", description = "Verifica si una cita puede tener reseña")
    public ResponseEntity<?> puedeResenar(@PathVariable Long citaId, @AuthenticationPrincipal UserDetails user) {
        try {
            var usuario = usuarioService.findByEmail(user.getUsername());
            if (usuario == null) {
                throw new RuntimeException("Usuario no encontrado");
            }
            
            boolean puedeResenar = resenaService.puedeTenerResena(citaId, usuario.getId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("puedeResenar", puedeResenar);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al verificar si puede reseñar");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/por-cita/{citaId}")
    @Operation(summary = "Obtener reseña por cita", description = "Obtiene la reseña de una cita específica")
    public ResponseEntity<?> obtenerResenaPorCita(@PathVariable Long citaId, @AuthenticationPrincipal UserDetails user) {
        try {
            var usuario = usuarioService.findByEmail(user.getUsername());
            if (usuario == null) {
                throw new RuntimeException("Usuario no encontrado");
            }
            
            var resena = resenaService.obtenerResenaPorCita(citaId);
            
            Map<String, Object> response = new HashMap<>();
            if (resena.isPresent()) {
                response.put("existe", true);
                response.put("resena", resena.get());
            } else {
                response.put("existe", false);
                response.put("resena", null);
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al obtener la reseña");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PutMapping("/{resenaId}")
    @Operation(summary = "Actualizar reseña", description = "Actualiza una reseña existente")
    public ResponseEntity<?> actualizarResena(
            @PathVariable Long resenaId,
            @RequestBody Map<String, Object> request,
            @AuthenticationPrincipal UserDetails user) {
        try {
            var usuario = usuarioService.findByEmail(user.getUsername());
            if (usuario == null) {
                throw new RuntimeException("Usuario no encontrado");
            }
            
            Integer calificacion = request.get("calificacion") != null ? 
                Integer.valueOf(request.get("calificacion").toString()) : null;
            String comentario = (String) request.get("comentario");
            
            Resena resena = resenaService.actualizarResena(resenaId, calificacion, comentario);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Reseña actualizada exitosamente");
            response.put("resena", resena);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al actualizar la reseña");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @DeleteMapping("/{resenaId}")
    @Operation(summary = "Eliminar reseña", description = "Elimina una reseña")
    public ResponseEntity<?> eliminarResena(@PathVariable Long resenaId, @AuthenticationPrincipal UserDetails user) {
        try {
            var usuario = usuarioService.findByEmail(user.getUsername());
            if (usuario == null) {
                throw new RuntimeException("Usuario no encontrado");
            }
            
            resenaService.eliminarResena(resenaId);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Reseña eliminada exitosamente");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al eliminar la reseña");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // Endpoint de debug temporal
    @GetMapping("/debug/cita/{citaId}")
    @Operation(summary = "Debug cita", description = "Información de debug para una cita")
    public ResponseEntity<?> debugCita(@PathVariable Long citaId, @AuthenticationPrincipal UserDetails user) {
        try {
            var usuario = usuarioService.findByEmail(user.getUsername());
            if (usuario == null) {
                throw new RuntimeException("Usuario no encontrado");
            }
            
            boolean puedeResenar = resenaService.puedeTenerResena(citaId, usuario.getId());
            var resena = resenaService.obtenerResenaPorCita(citaId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("citaId", citaId);
            response.put("usuarioId", usuario.getId());
            response.put("puedeResenar", puedeResenar);
            response.put("tieneResena", resena.isPresent());
            response.put("resena", resena.orElse(null));
            response.put("timestamp", LocalDateTime.now().toString());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error en debug");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    // Método para generar avatar genérico basado en el nombre
    private String generarAvatar(String nombre) {
        if (nombre == null || nombre.trim().isEmpty()) {
            return "👤"; // Avatar genérico por defecto
        }
        
        // Array de emojis para avatares
        String[] avatares = {
            "👨‍💼", "👩‍💼", "👨‍🦱", "👩‍🦰", "👨‍🦳", "👩‍🦳", 
            "👨‍🦲", "👩‍🦲", "👨‍🦰", "👩‍🦱", "👨‍🦯", "👩‍🦯",
            "👨‍⚕️", "👩‍⚕️", "👨‍🎓", "👩‍🎓", "👨‍🏫", "👩‍🏫",
            "👨‍💻", "👩‍💻", "👨‍🔧", "👩‍🔧", "👨‍🚀", "👩‍🚀"
        };
        
        // Generar un índice basado en el hash del nombre
        int hash = Math.abs(nombre.hashCode());
        int index = hash % avatares.length;
        
        return avatares[index];
    }
} 