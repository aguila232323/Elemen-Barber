package com.pomelo.app.springboot.app.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.pomelo.app.springboot.app.dto.GoogleAuthRequest;
import com.pomelo.app.springboot.app.dto.JwtResponse;
import com.pomelo.app.springboot.app.entity.Usuario;
import com.pomelo.app.springboot.app.repository.UsuarioRepository;
import com.pomelo.app.springboot.app.config.JwtUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class GoogleAuthService {

    @Value("${google.client.id}")
    private String googleClientId;

    private final UsuarioRepository usuarioRepository;
    private final JwtUtils jwtUtils;

    public GoogleAuthService(UsuarioRepository usuarioRepository, JwtUtils jwtUtils) {
        this.usuarioRepository = usuarioRepository;
        this.jwtUtils = jwtUtils;
    }

    public Map<String, Object> authenticateWithGoogle(GoogleAuthRequest request) throws Exception {
        // Por ahora, confiamos en la información enviada por el frontend
        // ya que el frontend obtiene esta información directamente de Google
        String email = request.getEmail();
        String name = request.getName();
        String picture = request.getPicture();
        String telefono = request.getTelefono();

        if (email == null || email.isEmpty()) {
            throw new RuntimeException("Email requerido para autenticación con Google");
        }

        // Buscar usuario existente
        Optional<Usuario> existingUser = usuarioRepository.findByEmail(email);
        
        if (existingUser.isPresent()) {
            // Usuario existe, verificar si tiene teléfono
            Usuario usuario = existingUser.get();
            
            // Verificar que el usuario no esté baneado
            if (Boolean.TRUE.equals(usuario.getBaneado())) {
                throw new RuntimeException("Tu cuenta ha sido suspendida. Contacta con el administrador para más información.");
            }
            
            // Actualizar teléfono si no lo tiene y viene de Google
            if ((usuario.getTelefono() == null || usuario.getTelefono().isEmpty()) && telefono != null && !telefono.isEmpty()) {
                usuario.setTelefono(telefono);
                usuarioRepository.save(usuario);
            }
            
            String token = jwtUtils.generateJwtToken(usuario.getEmail(), usuario.getNombre());
            
            // Si el usuario no tiene teléfono, indicar que necesita proporcionarlo
            if (usuario.getTelefono() == null || usuario.getTelefono().isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("requiresPhone", true);
                response.put("email", email);
                return response;
            }
            
            return Map.of("token", token);
        } else {
            // Crear nuevo usuario
            Usuario newUser = new Usuario();
            newUser.setEmail(email);
            newUser.setNombre(name != null ? name : email.split("@")[0]);
            newUser.setPassword("GOOGLE_AUTH"); // Contraseña especial para usuarios de Google
            newUser.setRol("CLIENTE");
            newUser.setIsEmailVerified(true); // Usuarios de Google ya están verificados
            newUser.setTelefono(telefono); // Guardar el teléfono si está disponible

            Usuario savedUser = usuarioRepository.save(newUser);
            String token = jwtUtils.generateJwtToken(savedUser.getEmail(), savedUser.getNombre());
            
            // Si el nuevo usuario no tiene teléfono, indicar que necesita proporcionarlo
            if (savedUser.getTelefono() == null || savedUser.getTelefono().isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("requiresPhone", true);
                response.put("email", email);
                return response;
            }
            
            return Map.of("token", token);
        }
    }
} 