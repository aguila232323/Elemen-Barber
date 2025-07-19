package com.pomelo.app.springboot.app.service;

import com.pomelo.app.springboot.app.entity.Usuario;
import com.pomelo.app.springboot.app.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UsuarioService {
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Usuario obtenerPerfil(String email) {
        if (email == null || email.trim().isEmpty()) {
            throw new RuntimeException("Email no puede estar vacío");
        }
        
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con email: " + email));
    }

    public List<Usuario> listarUsuarios() {
        try {
            return usuarioRepository.findAll();
        } catch (Exception e) {
            throw new RuntimeException("Error al listar usuarios: " + e.getMessage());
        }
    }

    public Usuario modificarPerfil(String email, Usuario datosActualizados) {
        if (email == null || email.trim().isEmpty()) {
            throw new RuntimeException("Email no puede estar vacío");
        }
        
        return usuarioRepository.findByEmail(email).map(usuario -> {
            try {
                // Validar datos antes de actualizar
                if (datosActualizados.getNombre() != null && !datosActualizados.getNombre().trim().isEmpty()) {
                    usuario.setNombre(datosActualizados.getNombre().trim());
                }
                
                if (datosActualizados.getTelefono() != null) {
                    usuario.setTelefono(datosActualizados.getTelefono().trim());
                }
                
                // No se modifica el email ni el rol aquí por seguridad
                if (datosActualizados.getPassword() != null && !datosActualizados.getPassword().isEmpty()) {
                    usuario.setPassword(passwordEncoder.encode(datosActualizados.getPassword()));
                }
                
                return usuarioRepository.save(usuario);
            } catch (Exception e) {
                throw new RuntimeException("Error al actualizar el perfil: " + e.getMessage());
            }
        }).orElseThrow(() -> new RuntimeException("Usuario no encontrado con email: " + email));
    }

    public void cambiarPassword(String email, String passwordActual, String passwordNueva) {
        if (email == null || email.trim().isEmpty()) {
            throw new RuntimeException("Email no puede estar vacío");
        }
        
        if (passwordActual == null || passwordActual.trim().isEmpty()) {
            throw new RuntimeException("La contraseña actual es requerida");
        }
        
        if (passwordNueva == null || passwordNueva.trim().isEmpty()) {
            throw new RuntimeException("La nueva contraseña es requerida");
        }
        
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con email: " + email));
        
        // Verificar que la contraseña actual sea correcta
        if (!passwordEncoder.matches(passwordActual, usuario.getPassword())) {
            throw new RuntimeException("La contraseña actual es incorrecta");
        }
        
        // Validar que la nueva contraseña tenga al menos 6 caracteres
        if (passwordNueva.length() < 6) {
            throw new RuntimeException("La nueva contraseña debe tener al menos 6 caracteres");
        }
        
        // Validar que la nueva contraseña sea diferente a la actual
        if (passwordEncoder.matches(passwordNueva, usuario.getPassword())) {
            throw new RuntimeException("La nueva contraseña debe ser diferente a la actual");
        }
        
        try {
            // Encriptar y guardar la nueva contraseña
            usuario.setPassword(passwordEncoder.encode(passwordNueva));
            usuarioRepository.save(usuario);
        } catch (Exception e) {
            throw new RuntimeException("Error al cambiar la contraseña: " + e.getMessage());
        }
    }
}