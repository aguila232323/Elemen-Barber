package com.pomelo.app.springboot.app.controller;

import com.pomelo.app.springboot.app.dto.LoginRequest;
import com.pomelo.app.springboot.app.dto.RegisterRequest;
import com.pomelo.app.springboot.app.dto.JwtResponse;
import com.pomelo.app.springboot.app.entity.Usuario;
import com.pomelo.app.springboot.app.service.AuthService;
import com.pomelo.app.springboot.app.service.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
@Tag(name = "Autenticación", description = "Endpoints para registro y login de usuarios")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @Autowired
    private UsuarioService usuarioService;

    @PostMapping("/register")
    @Operation(summary = "Registrar nuevo usuario", description = "Crea una nueva cuenta de usuario y envía código de verificación")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            // Primero registrar el usuario
            Usuario usuario = authService.register(request);
            
            // Enviar código de verificación
            usuarioService.enviarCodigoVerificacion(request.getEmail());
            
            return ResponseEntity.ok(Map.of(
                "message", "Usuario registrado correctamente. Se ha enviado un código de verificación a tu email.",
                "requiresVerification", true,
                "usuario", usuario
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error en el registro: " + e.getMessage()));
        }
    }

    @PostMapping("/completar-registro")
    @Operation(summary = "Completar registro", description = "Completa el registro verificando el código de email")
    public ResponseEntity<?> completarRegistro(@RequestBody Map<String, String> request) {
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
                return ResponseEntity.ok(Map.of("message", "Registro completado correctamente"));
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Código inválido o expirado"));
            }
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error al completar registro: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    @Operation(summary = "Iniciar sesión", description = "Autentica un usuario existente")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            JwtResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("no está verificada")) {
                return ResponseEntity.status(401).body(Map.of(
                    "error", "EMAIL_NOT_VERIFIED",
                    "message", e.getMessage()
                ));
            }
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error al iniciar sesión: " + e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Recuperar contraseña", description = "Envía un enlace de recuperación de contraseña al email")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            
            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email requerido"));
            }

            // Verificar si el usuario existe
            Usuario usuario = usuarioService.findByEmail(email);
            if (usuario == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "No existe una cuenta con este email"));
            }

            // Generar token de recuperación y enviar email
            usuarioService.enviarRecuperacionContrasena(email);
            
            return ResponseEntity.ok(Map.of("message", "Se ha enviado un enlace de recuperación a tu correo electrónico"));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error al procesar la solicitud: " + e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Restablecer contraseña", description = "Restablece la contraseña usando el token de recuperación")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        try {
            String token = request.get("token");
            String newPassword = request.get("newPassword");
            
            if (token == null || token.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Token requerido"));
            }
            if (newPassword == null || newPassword.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Nueva contraseña requerida"));
            }

            // Validar y restablecer contraseña
            boolean success = usuarioService.restablecerContrasena(token, newPassword);
            
            if (success) {
                return ResponseEntity.ok(Map.of("message", "Contraseña restablecida exitosamente"));
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Token inválido o expirado"));
            }
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error al restablecer contraseña: " + e.getMessage()));
        }
    }

    @GetMapping("/validate-reset-token/{token}")
    @Operation(summary = "Validar token de recuperación", description = "Verifica si un token de recuperación es válido")
    public ResponseEntity<?> validateResetToken(@PathVariable String token) {
        try {
            boolean isValid = usuarioService.validarTokenRecuperacion(token);
            
            if (isValid) {
                return ResponseEntity.ok(Map.of("valid", true, "message", "Token válido"));
            } else {
                return ResponseEntity.badRequest().body(Map.of("valid", false, "error", "Token inválido o expirado"));
            }
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("valid", false, "error", "Error al validar token: " + e.getMessage()));
        }
    }
}
