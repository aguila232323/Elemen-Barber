package com.pomelo.app.springboot.app.service;

import com.pomelo.app.springboot.app.dto.*;
import com.pomelo.app.springboot.app.entity.Usuario;
import com.pomelo.app.springboot.app.repository.UsuarioRepository;
import com.pomelo.app.springboot.app.dto.JwtResponse;
import com.pomelo.app.springboot.app.config.JwtUtils;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authManager;
    private final JwtUtils jwtUtils;

    public AuthService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder,
                       AuthenticationManager authManager, JwtUtils jwtUtils) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.authManager = authManager;
        this.jwtUtils = jwtUtils;
    }

    public Usuario register(RegisterRequest request) {
        Usuario usuario = new Usuario();
        usuario.setNombre(request.getNombre());
        usuario.setEmail(request.getEmail());
        usuario.setPassword(passwordEncoder.encode(request.getPassword()));
        usuario.setTelefono(request.getTelefono());
        usuario.setRol("CLIENTE");
        return usuarioRepository.save(usuario);
    }

    public JwtResponse login(LoginRequest request) {
        authManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        // Si la autenticación es correcta, obtener el usuario y verificar que esté verificado
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        // Verificar que el usuario no esté baneado
        if (Boolean.TRUE.equals(usuario.getBaneado())) {
            throw new RuntimeException("Tu cuenta ha sido suspendida. Contacta con el administrador para más información.");
        }
        
        // Verificar que el email esté verificado (solo si tiene email)
        if (usuario.getEmail() != null && !Boolean.TRUE.equals(usuario.getIsEmailVerified())) {
            throw new RuntimeException("Tu cuenta no está verificada. Por favor, verifica tu correo electrónico antes de iniciar sesión.");
        }
        
        String token = jwtUtils.generateJwtToken(request.getEmail(), usuario.getNombre());
        return new JwtResponse(token);
    }

    public Usuario createUserByAdmin(CreateUserRequest request) {
        // Validar que el nombre sea obligatorio
        if (request.getNombre() == null || request.getNombre().trim().isEmpty()) {
            throw new RuntimeException("El nombre es obligatorio");
        }

        // Si se proporciona email, verificar que sea único
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            if (usuarioRepository.findByEmail(request.getEmail()).isPresent()) {
                throw new RuntimeException("Ya existe un usuario con este email");
            }
        }

        Usuario usuario = new Usuario();
        usuario.setNombre(request.getNombre().trim());
        
        // Email opcional
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            usuario.setEmail(request.getEmail().trim());
            usuario.setIsEmailVerified(false); // Por defecto no verificado
        } else {
            usuario.setEmail(null);
            usuario.setIsEmailVerified(true); // Si no hay email, se considera "verificado"
        }
        
        // Teléfono opcional
        if (request.getTelefono() != null && !request.getTelefono().trim().isEmpty()) {
            usuario.setTelefono(request.getTelefono().trim());
        } else {
            usuario.setTelefono(null);
        }
        
        // Contraseña opcional - si no se proporciona, generar una aleatoria
        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            usuario.setPassword(passwordEncoder.encode(request.getPassword()));
        } else {
            // Generar contraseña aleatoria de 8 caracteres
            String randomPassword = generateRandomPassword();
            usuario.setPassword(passwordEncoder.encode(randomPassword));
        }
        
        // SEGURIDAD: Siempre crear como CLIENTE para evitar brechas de seguridad
        usuario.setRol("CLIENTE");
        
        return usuarioRepository.save(usuario);
    }

    private String generateRandomPassword() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder sb = new StringBuilder();
        java.util.Random random = new java.util.Random();
        for (int i = 0; i < 8; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }
}
