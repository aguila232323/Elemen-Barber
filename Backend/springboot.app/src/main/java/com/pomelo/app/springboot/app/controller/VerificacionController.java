package com.pomelo.app.springboot.app.controller;

import com.pomelo.app.springboot.app.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/verificacion")
@CrossOrigin(origins = "*")
public class VerificacionController {

    @Autowired
    private UsuarioService usuarioService;

    @PostMapping("/enviar-codigo")
    public ResponseEntity<?> enviarCodigoVerificacion(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email requerido"));
            }

            usuarioService.enviarCodigoVerificacion(email);
            return ResponseEntity.ok(Map.of("message", "Código de verificación enviado correctamente"));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error al enviar código: " + e.getMessage()));
        }
    }

    @PostMapping("/reenviar-codigo")
    public ResponseEntity<?> reenviarCodigoVerificacion(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email requerido"));
            }

            // Verificar si el usuario existe y no está verificado
            var usuario = usuarioService.findByEmail(email);
            if (usuario == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Usuario no encontrado"));
            }

            if (Boolean.TRUE.equals(usuario.getIsEmailVerified())) {
                return ResponseEntity.badRequest().body(Map.of("error", "El usuario ya está verificado"));
            }

            usuarioService.enviarCodigoVerificacion(email);
            return ResponseEntity.ok(Map.of("message", "Código de verificación reenviado correctamente"));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error al reenviar código: " + e.getMessage()));
        }
    }

    @PostMapping("/reenviar-simple")
    public ResponseEntity<?> reenviarCodigoSimple(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email requerido"));
            }

            // Enviar código sin validaciones estrictas
            usuarioService.enviarCodigoVerificacion(email);
            return ResponseEntity.ok(Map.of("message", "Código de verificación enviado correctamente"));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error al enviar código: " + e.getMessage()));
        }
    }

    @PostMapping("/verificar-codigo")
    public ResponseEntity<?> verificarCodigo(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String codigo = request.get("codigo");
            
            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email requerido"));
            }
            if (codigo == null || codigo.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Código requerido"));
            }

            boolean esValido = usuarioService.verificarCodigo(email, codigo);
            
            if (esValido) {
                return ResponseEntity.ok(Map.of("message", "Email verificado correctamente"));
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Código inválido o expirado"));
            }
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error al verificar código: " + e.getMessage()));
        }
    }

    @GetMapping("/estado/{email}")
    public ResponseEntity<?> verificarEstadoEmail(@PathVariable String email) {
        try {
            boolean esVerificado = usuarioService.isEmailVerificado(email);
            return ResponseEntity.ok(Map.of("verificado", esVerificado));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error al verificar estado: " + e.getMessage()));
        }
    }

    @GetMapping("/status/{email}")
    public ResponseEntity<?> obtenerEstadoVerificacion(@PathVariable String email) {
        try {
            java.util.Map<String, Object> status = usuarioService.getVerificationStatus(email);
            return ResponseEntity.ok(status);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error al obtener estado: " + e.getMessage()));
        }
    }
} 