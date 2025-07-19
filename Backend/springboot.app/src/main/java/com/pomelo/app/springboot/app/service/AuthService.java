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
        usuario.setRol("CLIENTE");
        return usuarioRepository.save(usuario);
    }

    public JwtResponse login(LoginRequest request) {
        authManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        // Si la autenticación es correcta, obtener el usuario y generar el token JWT
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        String token = jwtUtils.generateJwtToken(request.getEmail(), usuario.getNombre());
        return new JwtResponse(token);
    }
}
