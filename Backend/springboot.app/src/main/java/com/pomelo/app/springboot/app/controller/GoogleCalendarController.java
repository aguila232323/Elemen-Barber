package com.pomelo.app.springboot.app.controller;

import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleTokenResponse;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.pomelo.app.springboot.app.service.GoogleCalendarService;
import com.pomelo.app.springboot.app.service.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Map;

@RestController
@RequestMapping("/api/google-calendar")
@CrossOrigin(origins = "*")
@Tag(name = "Google Calendar", description = "Endpoints para integración con Google Calendar")
public class GoogleCalendarController {

    private final GoogleCalendarService googleCalendarService;
    private final UsuarioService usuarioService;

    @Value("${google.client.id}")
    private String googleClientId;

    @Value("${google.client.secret}")
    private String googleClientSecret;

    private static final NetHttpTransport HTTP_TRANSPORT = new NetHttpTransport();
    private static final GsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();

    public GoogleCalendarController(GoogleCalendarService googleCalendarService, UsuarioService usuarioService) {
        this.googleCalendarService = googleCalendarService;
        this.usuarioService = usuarioService;
    }

    @GetMapping("/auth-url")
    @Operation(summary = "Obtener URL de autorización", description = "Obtiene la URL para autorizar acceso al Google Calendar")
    public ResponseEntity<?> getAuthUrl(@AuthenticationPrincipal UserDetails user) {
        try {
            // Verificar si el usuario es un usuario de Google
            var usuario = usuarioService.findByEmail(user.getUsername());
            if (usuario == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Usuario no encontrado"));
            }

            if (!googleCalendarService.isGoogleUser(usuario)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Este usuario no está autenticado con Google"));
            }

            // Crear el flujo de autorización OAuth2
            GoogleAuthorizationCodeFlow flow = new GoogleAuthorizationCodeFlow.Builder(
                    HTTP_TRANSPORT, JSON_FACTORY, googleClientId, googleClientSecret,
                    Arrays.asList("https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/calendar.events"))
                    .setAccessType("offline")
                    .setApprovalPrompt("force")
                    .build();

            String authorizationUrl = flow.newAuthorizationUrl()
                    .setRedirectUri("http://localhost:3000/auth/google/callback")
                    .build();

            return ResponseEntity.ok(Map.of(
                "authorizationUrl", authorizationUrl,
                "isGoogleUser", true
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error: " + e.getMessage()));
        }
    }

    @PostMapping("/callback")
    @Operation(summary = "Manejar callback de autorización", description = "Procesa la respuesta de autorización de Google")
    public ResponseEntity<?> handleCallback(@RequestBody Map<String, String> request) {
        try {
            String code = request.get("code");
            String email = request.get("email");

            if (code == null || code.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Código de autorización requerido"));
            }

            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email requerido"));
            }

            // Obtener el usuario
            var usuario = usuarioService.findByEmail(email);
            if (usuario == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Usuario no encontrado"));
            }

            if (!googleCalendarService.isGoogleUser(usuario)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Este usuario no está autenticado con Google"));
            }

            // Crear el flujo de autorización
            GoogleAuthorizationCodeFlow flow = new GoogleAuthorizationCodeFlow.Builder(
                    HTTP_TRANSPORT, JSON_FACTORY, googleClientId, googleClientSecret,
                    Arrays.asList("https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/calendar.events"))
                    .setAccessType("offline")
                    .setApprovalPrompt("force")
                    .build();

            // Intercambiar código por tokens
            GoogleTokenResponse tokenResponse = flow.newTokenRequest(code)
                    .setRedirectUri("http://localhost:3000/auth/google/callback")
                    .execute();

            // Calcular fecha de expiración
            LocalDateTime expiry = LocalDateTime.now().plusSeconds(tokenResponse.getExpiresInSeconds());

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

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error al procesar autorización: " + e.getMessage()));
        }
    }

    @PostMapping("/authorize")
    @Operation(summary = "Autorizar acceso", description = "Autoriza el acceso al Google Calendar del usuario")
    public ResponseEntity<?> authorizeCalendar(@AuthenticationPrincipal UserDetails user) {
        try {
            var usuario = usuarioService.findByEmail(user.getUsername());
            if (usuario == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Usuario no encontrado"));
            }

            if (!googleCalendarService.isGoogleUser(usuario)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Este usuario no está autenticado con Google"));
            }

            // Crear el flujo de autorización
            GoogleAuthorizationCodeFlow flow = new GoogleAuthorizationCodeFlow.Builder(
                    HTTP_TRANSPORT, JSON_FACTORY, googleClientId, googleClientSecret,
                    Arrays.asList("https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/calendar.events"))
                    .setAccessType("offline")
                    .setApprovalPrompt("force")
                    .build();

            String authorizationUrl = flow.newAuthorizationUrl()
                    .setRedirectUri("http://localhost:3000/auth/google/callback")
                    .build();

            return ResponseEntity.ok(Map.of(
                "message", "Autorización de Google Calendar solicitada",
                "status", "authorization_required",
                "authorizationUrl", authorizationUrl,
                "userEmail", usuario.getEmail()
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error: " + e.getMessage()));
        }
    }

    @GetMapping("/status")
    @Operation(summary = "Estado de autorización", description = "Verifica el estado de autorización del Google Calendar")
    public ResponseEntity<?> getAuthStatus(@AuthenticationPrincipal UserDetails user) {
        try {
            var usuario = usuarioService.findByEmail(user.getUsername());
            if (usuario == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Usuario no encontrado"));
            }

            boolean isGoogleUser = googleCalendarService.isGoogleUser(usuario);
            boolean isCalendarAuthorized = googleCalendarService.isCalendarAuthorized(usuario);
            
            return ResponseEntity.ok(Map.of(
                "isGoogleUser", isGoogleUser,
                "userEmail", usuario.getEmail(),
                "googlePictureUrl", usuario.getGooglePictureUrl(),
                "calendarAuthorized", isCalendarAuthorized,
                "message", isGoogleUser ? 
                    (isCalendarAuthorized ? 
                        "Usuario autorizado para Google Calendar. Las citas se añadirán automáticamente." :
                        "Usuario autenticado con Google. Necesita autorizar acceso al calendario.") :
                    "Usuario no autenticado con Google"
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error: " + e.getMessage()));
        }
    }

    @PostMapping("/revoke")
    @Operation(summary = "Revocar autorización", description = "Revoca el acceso al Google Calendar del usuario")
    public ResponseEntity<?> revokeAuthorization(@AuthenticationPrincipal UserDetails user) {
        try {
            var usuario = usuarioService.findByEmail(user.getUsername());
            if (usuario == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Usuario no encontrado"));
            }

            googleCalendarService.revokeCalendarAuthorization(usuario);

            return ResponseEntity.ok(Map.of(
                "message", "Autorización de Google Calendar revocada exitosamente",
                "status", "revoked",
                "userEmail", usuario.getEmail()
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error: " + e.getMessage()));
        }
    }
} 