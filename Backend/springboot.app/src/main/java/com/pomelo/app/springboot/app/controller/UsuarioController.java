package com.pomelo.app.springboot.app.controller;

import com.pomelo.app.springboot.app.entity.Usuario;
import com.pomelo.app.springboot.app.service.UsuarioService;
import com.pomelo.app.springboot.app.repository.UsuarioRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final UsuarioRepository usuarioRepository;

    public UsuarioController(UsuarioService usuarioService, UsuarioRepository usuarioRepository) {
        this.usuarioService = usuarioService;
        this.usuarioRepository = usuarioRepository;
    }

    @GetMapping("/perfil")
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
    public ResponseEntity<Map<String, Object>> eliminarCuenta(@AuthenticationPrincipal UserDetails userDetails, @RequestBody Map<String, String> request) {
        try {
            String password = request.get("password");
            
            // Buscar usuario por email para obtener el ID
            Usuario usuario = usuarioService.findByEmail(userDetails.getUsername());
            if (usuario == null) {
                throw new RuntimeException("Usuario no encontrado");
            }
            
            // Verificar si es usuario de Google (tiene contraseña especial)
            boolean isGoogleUser = "GOOGLE_AUTH".equals(usuario.getPassword());
            
            // Debug: imprimir información del usuario
            System.out.println("Debug - Email: " + usuario.getEmail());
            System.out.println("Debug - Password: " + usuario.getPassword());
            System.out.println("Debug - Is Google User: " + isGoogleUser);
            System.out.println("Debug - Provided Password: " + password);
            
            // Si es usuario de Google, permitir eliminación sin contraseña o con contraseña especial
            if (isGoogleUser) {
                if (password == null || password.trim().isEmpty() || "GOOGLE_AUTH_USER".equals(password)) {
                    // Para usuarios de Google, usar contraseña especial
                    System.out.println("Debug - Eliminando usuario de Google");
                    usuarioService.eliminarCuenta(usuario.getId(), "GOOGLE_AUTH");
                } else {
                    throw new RuntimeException("Los usuarios de Google no necesitan ingresar contraseña");
                }
            } else {
                // Para usuarios normales, requerir contraseña
                if (password == null || password.trim().isEmpty()) {
                    throw new RuntimeException("La contraseña es requerida");
                }
                System.out.println("Debug - Eliminando usuario normal");
                usuarioService.eliminarCuenta(usuario.getId(), password);
            }
            
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

    @PutMapping("/avatar")
    public ResponseEntity<Map<String, Object>> actualizarAvatar(@AuthenticationPrincipal UserDetails userDetails, @RequestBody Map<String, String> request) {
        try {
            String avatar = request.get("avatar");
            if (avatar == null || avatar.trim().isEmpty()) {
                throw new RuntimeException("El avatar es requerido");
            }
            
            // Buscar usuario por email para obtener el ID
            Usuario usuario = usuarioService.findByEmail(userDetails.getUsername());
            if (usuario == null) {
                throw new RuntimeException("Usuario no encontrado");
            }
            
            Usuario usuarioActualizado = usuarioService.actualizarAvatar(usuario.getId(), avatar);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Avatar actualizado correctamente");
            response.put("usuario", usuarioActualizado);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", "Error al actualizar el avatar: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PutMapping("/google-picture")
    public ResponseEntity<Map<String, Object>> actualizarGooglePicture(@AuthenticationPrincipal UserDetails userDetails, @RequestBody Map<String, String> request) {
        try {
            // Buscar usuario por email para obtener el ID
            Usuario usuario = usuarioService.findByEmail(userDetails.getUsername());
            if (usuario == null) {
                throw new RuntimeException("Usuario no encontrado");
            }
            
            String googlePictureUrl = request.get("googlePictureUrl");
            if (googlePictureUrl == null || googlePictureUrl.trim().isEmpty()) {
                throw new RuntimeException("URL de imagen de Google requerida");
            }
            
            usuario.setGooglePictureUrl(googlePictureUrl);
            usuarioRepository.save(usuario);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Imagen de Google actualizada correctamente");
            response.put("googlePictureUrl", googlePictureUrl);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", "Error al actualizar la imagen de Google: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Endpoint para obtener usuarios sin email (para recordatorios manuales)
     */
    @GetMapping("/sin-email")
    public ResponseEntity<?> obtenerUsuariosSinEmail(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            // Verificar que el usuario actual sea admin
            Usuario adminUser = usuarioService.findByEmail(userDetails.getUsername());
            if (adminUser == null || !"ADMIN".equals(adminUser.getRol())) {
                return ResponseEntity.status(403).body(Map.of("error", "Solo los administradores pueden acceder a esta información"));
            }

            List<Usuario> usuariosSinEmail = usuarioRepository.findByEmailIsNull();
            
            List<Map<String, Object>> usuariosInfo = usuariosSinEmail.stream()
                .map(usuario -> {
                    Map<String, Object> usuarioInfo = new HashMap<>();
                    usuarioInfo.put("id", usuario.getId());
                    usuarioInfo.put("nombre", usuario.getNombre());
                    usuarioInfo.put("telefono", usuario.getTelefono());
                    usuarioInfo.put("rol", usuario.getRol());
                    return usuarioInfo;
                })
                .collect(java.util.stream.Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("usuarios", usuariosInfo);
            response.put("total", usuariosInfo.size());
            response.put("message", "Usuarios sin email obtenidos correctamente");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al obtener usuarios sin email: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}
