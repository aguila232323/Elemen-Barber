package com.pomelo.app.springboot.app.service;

import com.pomelo.app.springboot.app.entity.Usuario;
import com.pomelo.app.springboot.app.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UsuarioService {
    private final UsuarioRepository usuarioRepository;

    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public Usuario obtenerPerfil(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    public List<Usuario> listarUsuarios() {
        return usuarioRepository.findAll();
    }

    public Usuario modificarPerfil(String email, Usuario datosActualizados) {
        return usuarioRepository.findByEmail(email).map(usuario -> {
            usuario.setNombre(datosActualizados.getNombre());
            usuario.setTelefono(datosActualizados.getTelefono());
            // No se modifica el email ni el rol aquí por seguridad
            if (datosActualizados.getPassword() != null && !datosActualizados.getPassword().isEmpty()) {
                usuario.setPassword(datosActualizados.getPassword()); // Debería ir codificado si se cambia
            }
            return usuarioRepository.save(usuario);
        }).orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }
}