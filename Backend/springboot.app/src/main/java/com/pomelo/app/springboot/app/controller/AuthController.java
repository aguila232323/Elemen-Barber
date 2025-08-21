package com.pomelo.app.springboot.app.controller;

import com.pomelo.app.springboot.app.dto.LoginRequest;
import com.pomelo.app.springboot.app.dto.RegisterRequest;
import com.pomelo.app.springboot.app.dto.GoogleAuthRequest;
import com.pomelo.app.springboot.app.dto.JwtResponse;
import com.pomelo.app.springboot.app.entity.Usuario;
import com.pomelo.app.springboot.app.service.AuthService;
import com.pomelo.app.springboot.app.service.GoogleAuthService;
import com.pomelo.app.springboot.app.service.GoogleCalendarService;
import com.pomelo.app.springboot.app.service.UsuarioService;
import com.pomelo.app.springboot.app.service.LoginRateLimitService;
import com.pomelo.app.springboot.app.repository.UsuarioRepository;
import com.pomelo.app.springboot.app.config.JwtUtils;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Value;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;
    private final GoogleAuthService googleAuthService;
    private final GoogleCalendarService googleCalendarService;
    private final UsuarioService usuarioService;
    private final LoginRateLimitService loginRateLimitService;
    private final UsuarioRepository usuarioRepository;
    private final JwtUtils jwtUtils;
    
    @Value("${app.google.redirect-uri}")
    private String googleRedirectUri;

    public AuthController(AuthService authService, GoogleAuthService googleAuthService, GoogleCalendarService googleCalendarService, UsuarioService usuarioService, LoginRateLimitService loginRateLimitService, UsuarioRepository usuarioRepository, JwtUtils jwtUtils) {
        this.authService = authService;
        this.googleAuthService = googleAuthService;
        this.googleCalendarService = googleCalendarService;
        this.usuarioService = usuarioService;
        this.loginRateLimitService = loginRateLimitService;
        this.usuarioRepository = usuarioRepository;
        this.jwtUtils = jwtUtils;
    }

    @PostMapping("/register")
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
    public ResponseEntity<?> login(@RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        String clientIp = getClientIpAddress(httpRequest);
        
        // Verificar si la IP está bloqueada
        if (loginRateLimitService.isBlocked(clientIp)) {
            return ResponseEntity.status(429).body(Map.of(
                "error", "Demasiados intentos de login fallidos. Intente más tarde.",
                "remainingTime", "15 minutos"
            ));
        }
        
        try {
            JwtResponse response = authService.login(request);
            
            // Login exitoso - limpiar intentos fallidos
            loginRateLimitService.clearAttempts(clientIp);
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            // Login fallido - registrar intento
            loginRateLimitService.recordFailedAttempt(clientIp);
            
            if (e.getMessage().contains("no está verificada")) {
                return ResponseEntity.status(401).body(Map.of(
                    "error", "EMAIL_NOT_VERIFIED",
                    "message", e.getMessage(),
                    "remainingAttempts", loginRateLimitService.getRemainingAttempts(clientIp)
                ));
            }
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage(),
                "remainingAttempts", loginRateLimitService.getRemainingAttempts(clientIp)
            ));
        } catch (Exception e) {
            // Login fallido - registrar intento
            loginRateLimitService.recordFailedAttempt(clientIp);
            
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Error al iniciar sesión: " + e.getMessage(),
                "remainingAttempts", loginRateLimitService.getRemainingAttempts(clientIp)
            ));
        }
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleAuth(@RequestBody GoogleAuthRequest request) {
        try {
            Map<String, Object> response = googleAuthService.authenticateWithGoogle(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error en autenticación con Google: " + e.getMessage()));
        }
    }

    @PostMapping("/google/complete")
    public ResponseEntity<?> completeGoogleAuth(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String telefono = request.get("telefono");
            
            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email requerido"));
            }
            if (telefono == null || telefono.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Teléfono requerido"));
            }

            // Validación estricta: 9 dígitos (o 11 con 34 / 13 con 0034) y prefijos válidos
            var phoneValidation = new com.pomelo.app.springboot.app.service.PhoneValidationService();
            if (!phoneValidation.validateSpanishPhone(telefono)) {
                return ResponseEntity.badRequest().body(Map.of("error", "El teléfono debe tener 9 dígitos válidos (España) y empezar por 6, 7 o 9"));
            }
            String telefonoNormalizado = phoneValidation.normalizePhoneForStorage(telefono);

            // Buscar usuario y actualizar teléfono
            Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(email);
            if (usuarioOpt.isPresent()) {
                Usuario usuario = usuarioOpt.get();
                usuario.setTelefono(telefonoNormalizado);
                usuarioRepository.save(usuario);
                
                // Generar nuevo JWT token
                String token = jwtUtils.generateJwtToken(usuario.getEmail(), usuario.getNombre());
                return ResponseEntity.ok(new JwtResponse(token));
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Usuario no encontrado"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error al completar registro: " + e.getMessage()));
        }
    }

    @PostMapping("/google/authorize-calendar")
    public ResponseEntity<?> authorizeCalendarDuringRegistration(@RequestBody Map<String, String> request) {
        try {
            System.out.println("🔍 DEBUG: Iniciando autorización de Calendar para: " + request);
            
            String email = request.get("email");
            String code = request.get("code");
            
            System.out.println("📧 Email: " + email);
            System.out.println("🔑 Code: " + (code != null ? code.substring(0, Math.min(10, code.length())) + "..." : "null"));
            
            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email requerido"));
            }
            if (code == null || code.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Código de autorización requerido"));
            }

            // Buscar usuario
            Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(email);
            if (!usuarioOpt.isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Usuario no encontrado"));
            }

            Usuario usuario = usuarioOpt.get();
            
            // Verificar que es un usuario de Google
            if (!"GOOGLE_AUTH".equals(usuario.getPassword())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Este usuario no está autenticado con Google"));
            }

            // Procesar autorización de Calendar usando el servicio existente
            try {
                // Crear credenciales de Google usando el código de autorización
                com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow flow = 
                    new com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow.Builder(
                        new com.google.api.client.http.javanet.NetHttpTransport(),
                        com.google.api.client.json.gson.GsonFactory.getDefaultInstance(),
                        System.getProperty("google.client.id", "${google.client.id}"),
                        System.getProperty("google.client.secret", "${google.client.secret}"),
                        java.util.Arrays.asList("https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/calendar.events"))
                        .setAccessType("offline")
                        .setApprovalPrompt("force")
                        .build();

                // Intercambiar código por tokens
                com.google.api.client.googleapis.auth.oauth2.GoogleTokenResponse tokenResponse = 
                    flow.newTokenRequest(code)
                        .setRedirectUri(googleRedirectUri)
                        .execute();

                // Calcular fecha de expiración
                java.time.LocalDateTime expiry = java.time.LocalDateTime.now().plusSeconds(tokenResponse.getExpiresInSeconds());

                // Guardar tokens en la base de datos
                googleCalendarService.saveCalendarTokens(
                    usuario,
                    tokenResponse.getAccessToken(),
                    tokenResponse.getRefreshToken(),
                    expiry
                );

                return ResponseEntity.ok(Map.of(
                    "message", "Autorización de Google Calendar completada exitosamente",
                    "status", "success",
                    "userEmail", usuario.getEmail()
                ));
            } catch (Exception calendarError) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Error al procesar autorización de Calendar: " + calendarError.getMessage()
                ));
            }

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error al autorizar Google Calendar: " + e.getMessage()));
        }
    }

    @PostMapping("/google/check-calendar-access")
    public ResponseEntity<?> checkCalendarAccess(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String accessToken = request.get("accessToken");
            
            System.out.println("🔍 DEBUG: Verificando acceso a Calendar para: " + email);
            
            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email requerido"));
            }
            if (accessToken == null || accessToken.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Access token requerido"));
            }

            // Buscar usuario
            Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(email);
            if (!usuarioOpt.isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Usuario no encontrado"));
            }

            Usuario usuario = usuarioOpt.get();
            
            // Verificar que es un usuario de Google
            if (!"GOOGLE_AUTH".equals(usuario.getPassword())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Este usuario no está autenticado con Google"));
            }

            try {
                // Intentar acceder a la API de Calendar usando el access token
                String calendarUrl = "https://www.googleapis.com/calendar/v3/users/me/calendarList";
                java.net.http.HttpClient client = java.net.http.HttpClient.newHttpClient();
                java.net.http.HttpRequest calendarRequest = java.net.http.HttpRequest.newBuilder()
                    .uri(java.net.URI.create(calendarUrl))
                    .header("Authorization", "Bearer " + accessToken)
                    .GET()
                    .build();

                java.net.http.HttpResponse<String> response = client.send(calendarRequest, 
                    java.net.http.HttpResponse.BodyHandlers.ofString());

                System.out.println("📡 Respuesta de Google Calendar API: " + response.statusCode());

                if (response.statusCode() == 200) {
                    // El usuario tiene acceso a Calendar, guardar el access token
                    // Calcular expiración (los access tokens de Google suelen durar 1 hora)
                    java.time.LocalDateTime expiry = java.time.LocalDateTime.now().plusHours(1);
                    
                    System.out.println("✅ Verificación exitosa de Calendar para: " + email);
                    System.out.println("   - Status Code: " + response.statusCode());
                    System.out.println("   - Guardando access token...");
                    
                    // Guardar tokens en la base de datos
                    googleCalendarService.saveCalendarTokens(
                        usuario,
                        accessToken,
                        null, // No tenemos refresh token en este flujo
                        expiry
                    );

                    System.out.println("✅ Usuario autorizado para Google Calendar: " + email);
                    
                    return ResponseEntity.ok(Map.of(
                        "message", "Usuario autorizado para Google Calendar",
                        "status", "success",
                        "userEmail", usuario.getEmail(),
                        "hasCalendarAccess", true
                    ));
                } else {
                    System.out.println("❌ Error en verificación de Calendar para: " + email);
                    System.out.println("   - Status Code: " + response.statusCode());
                    System.out.println("   - Response Body: " + response.body());
                    
                    return ResponseEntity.ok(Map.of(
                        "message", "Usuario no tiene acceso a Google Calendar",
                        "status", "no_access",
                        "userEmail", usuario.getEmail(),
                        "hasCalendarAccess", false
                    ));
                }
            } catch (Exception calendarError) {
                System.out.println("❌ Error al verificar acceso a Calendar: " + calendarError.getMessage());
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Error al verificar acceso a Calendar: " + calendarError.getMessage()
                ));
            }

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error al verificar acceso: " + e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
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

    @GetMapping("/debug/user/{email}")
    public ResponseEntity<?> debugUser(@PathVariable String email) {
        try {
            Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(email);
            if (!usuarioOpt.isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Usuario no encontrado"));
            }

            Usuario usuario = usuarioOpt.get();
            
            return ResponseEntity.ok(Map.of(
                "email", usuario.getEmail(),
                "nombre", usuario.getNombre(),
                "password", usuario.getPassword(),
                "googlePictureUrl", usuario.getGooglePictureUrl(),
                "googleCalendarToken", usuario.getGoogleCalendarToken() != null ? "SÍ" : "NO",
                "googleCalendarRefreshToken", usuario.getGoogleCalendarRefreshToken() != null ? "SÍ" : "NO",
                "googleCalendarTokenExpiry", usuario.getGoogleCalendarTokenExpiry(),
                "isGoogleUser", "GOOGLE_AUTH".equals(usuario.getPassword())
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error al debuggear usuario: " + e.getMessage()));
        }
    }

    /**
     * Obtiene la dirección IP real del cliente
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
}
