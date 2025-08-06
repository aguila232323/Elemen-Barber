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
            // Buscar usuario por email para obtener el ID
            Usuario usuario = usuarioService.findByEmail(userDetails.getUsername());
            if (usuario == null) {
                throw new RuntimeException("Usuario no encontrado");
            }
            
            Usuario perfil = usuarioService.obtenerPerfil(usuario.getId());
            return ResponseEntity.ok(perfil);
        } catch (Exception e) {
            throw new RuntimeException("Error al obtener el perfil: " + e.getMessage());
        }
    }

    @PutMapping("/perfil")
    @Operation(summary = "Modificar perfil", description = "Modifica el perfil del usuario autenticado")
    public ResponseEntity<Map<String, Object>> modificarPerfil(@AuthenticationPrincipal UserDetails userDetails, @RequestBody Usuario datosActualizados) {
        try {
            // Buscar usuario por email para obtener el ID
            Usuario usuario = usuarioService.findByEmail(userDetails.getUsername());
            if (usuario == null) {
                throw new RuntimeException("Usuario no encontrado");
            }
            
            Usuario usuarioActualizado = usuarioService.modificarPerfil(usuario.getId(), datosActualizados);
            
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

    @DeleteMapping("/eliminar-cuenta")
    @Operation(summary = "Eliminar cuenta", description = "Elimina la cuenta del usuario autenticado")
    public ResponseEntity<Map<String, Object>> eliminarCuenta(@AuthenticationPrincipal UserDetails userDetails, @RequestBody Map<String, String> request) {
        try {
            String password = request.get("password");
            if (password == null || password.trim().isEmpty()) {
                throw new RuntimeException("La contraseña es requerida");
            }
            
            // Buscar usuario por email para obtener el ID
            Usuario usuario = usuarioService.findByEmail(userDetails.getUsername());
            if (usuario == null) {
                throw new RuntimeException("Usuario no encontrado");
            }
            
            usuarioService.eliminarCuenta(usuario.getId(), password);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Cuenta eliminada correctamente");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", "Error al eliminar la cuenta: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PutMapping("/cambiar-password")
    @Operation(summary = "Cambiar contraseña", description = "Cambia la contraseña del usuario autenticado")
    public ResponseEntity<Map<String, String>> cambiarPassword(@AuthenticationPrincipal UserDetails userDetails, @RequestBody Map<String, String> request) {
        try {
            // Buscar usuario por email para obtener el ID
            Usuario usuario = usuarioService.findByEmail(userDetails.getUsername());
            if (usuario == null) {
                throw new RuntimeException("Usuario no encontrado");
            }
            
            String passwordNueva = request.get("passwordNueva");
            
            if (passwordNueva == null || passwordNueva.trim().isEmpty()) {
                throw new RuntimeException("La nueva contraseña es requerida");
            }
            
            usuarioService.cambiarPassword(usuario.getId(), passwordNueva);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Contraseña actualizada correctamente");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/estado")
    @Operation(summary = "Verificar estado del usuario", description = "Verifica el estado del usuario autenticado")
    public ResponseEntity<?> verificarEstado(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            Usuario usuario = usuarioService.findByEmail(userDetails.getUsername());
            if (usuario == null) {
                throw new RuntimeException("Usuario no encontrado");
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("baneado", Boolean.TRUE.equals(usuario.getBaneado()));
            response.put("emailVerificado", Boolean.TRUE.equals(usuario.getIsEmailVerified()));
            response.put("rol", usuario.getRol());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al verificar estado del usuario");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
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

    @PostMapping("/{id}/banear")
    @Operation(summary = "Banear usuario", description = "Banea un usuario específico (solo para administradores)")
    public ResponseEntity<Map<String, String>> banearUsuario(@PathVariable Long id) {
        try {
            usuarioService.banearUsuario(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Usuario baneado correctamente");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Error al banear usuario: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/{id}/desbanear")
    @Operation(summary = "Desbanear usuario", description = "Desbanea un usuario específico (solo para administradores)")
    public ResponseEntity<Map<String, String>> desbanearUsuario(@PathVariable Long id) {
        try {
            usuarioService.desbanearUsuario(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Usuario desbaneado correctamente");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Error al desbanear usuario: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}
