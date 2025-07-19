package com.pomelo.app.springboot.app.controller;

import com.pomelo.app.springboot.app.entity.Usuario;
import com.pomelo.app.springboot.app.service.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
@Tag(name = "Usuarios", description = "Gestión de perfiles de usuario")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping("/perfil")
    @Operation(summary = "Obtener perfil", description = "Obtiene el perfil del usuario autenticado")
    public ResponseEntity<Usuario> obtenerPerfil(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            Usuario perfil = usuarioService.obtenerPerfil(userDetails.getUsername());
            return ResponseEntity.ok(perfil);
        } catch (Exception e) {
            throw new RuntimeException("Error al obtener el perfil: " + e.getMessage());
        }
    }

    @PutMapping("/perfil")
    @Operation(summary = "Modificar perfil", description = "Modifica el perfil del usuario autenticado")
    public ResponseEntity<Map<String, Object>> modificarPerfil(@AuthenticationPrincipal UserDetails userDetails, @RequestBody Usuario datosActualizados) {
        try {
            String email = userDetails.getUsername();
            Usuario usuarioActualizado = usuarioService.modificarPerfil(email, datosActualizados);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Perfil actualizado correctamente");
            response.put("usuario", usuarioActualizado);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", "Error al actualizar el perfil: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PutMapping("/cambiar-password")
    @Operation(summary = "Cambiar contraseña", description = "Cambia la contraseña del usuario autenticado")
    public ResponseEntity<Map<String, String>> cambiarPassword(@AuthenticationPrincipal UserDetails userDetails, @RequestBody Map<String, String> request) {
        String email = userDetails.getUsername();
        String passwordActual = request.get("passwordActual");
        String passwordNueva = request.get("passwordNueva");
        
        Map<String, String> response = new HashMap<>();
        
        if (passwordActual == null || passwordNueva == null) {
            response.put("message", "Contraseña actual y nueva contraseña son requeridas");
            return ResponseEntity.badRequest().body(response);
        }
        
        try {
            usuarioService.cambiarPassword(email, passwordActual, passwordNueva);
            response.put("message", "Contraseña actualizada correctamente");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // (Opcional) solo para admin
    @GetMapping
    @Operation(summary = "Listar usuarios", description = "Lista todos los usuarios (solo para administradores)")
    public ResponseEntity<?> listarUsuarios() {
        try {
            return ResponseEntity.ok(usuarioService.listarUsuarios());
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Error al listar usuarios: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}
