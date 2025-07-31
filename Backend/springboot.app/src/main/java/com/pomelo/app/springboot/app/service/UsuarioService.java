package com.pomelo.app.springboot.app.service;

import com.pomelo.app.springboot.app.entity.Usuario;
import com.pomelo.app.springboot.app.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public Usuario obtenerPerfil(Long id) {
        try {
            Optional<Usuario> usuario = usuarioRepository.findById(id);
            if (usuario.isPresent()) {
                return usuario.get();
            } else {
                throw new RuntimeException("Usuario no encontrado con ID: " + id);
            }
        } catch (Exception e) {
            throw new RuntimeException("Error al obtener el perfil: " + e.getMessage(), e);
        }
    }

    public List<Usuario> listarUsuarios() {
        try {
            return usuarioRepository.findAll();
        } catch (Exception e) {
            throw new RuntimeException("Error al listar usuarios: " + e.getMessage(), e);
        }
    }

    public Usuario modificarPerfil(Long id, Usuario usuarioModificado) {
        try {
            Optional<Usuario> usuarioExistente = usuarioRepository.findById(id);
            if (usuarioExistente.isPresent()) {
                Usuario usuario = usuarioExistente.get();
                
                if (usuarioModificado.getNombre() != null) {
                    usuario.setNombre(usuarioModificado.getNombre());
                }
                if (usuarioModificado.getEmail() != null) {
                    usuario.setEmail(usuarioModificado.getEmail());
                }
                if (usuarioModificado.getTelefono() != null) {
                    usuario.setTelefono(usuarioModificado.getTelefono());
                }
                
                return usuarioRepository.save(usuario);
            } else {
                throw new RuntimeException("Usuario no encontrado con ID: " + id);
            }
        } catch (Exception e) {
            throw new RuntimeException("Error al modificar el perfil: " + e.getMessage(), e);
        }
    }

    public void cambiarPassword(Long id, String nuevaPassword) {
        try {
            Optional<Usuario> usuario = usuarioRepository.findById(id);
            if (usuario.isPresent()) {
                Usuario usuarioActual = usuario.get();
                usuarioActual.setPassword(passwordEncoder.encode(nuevaPassword));
                usuarioRepository.save(usuarioActual);
            } else {
                throw new RuntimeException("Usuario no encontrado con ID: " + id);
            }
        } catch (Exception e) {
            throw new RuntimeException("Error al cambiar la contraseña: " + e.getMessage(), e);
        }
    }

    public Usuario findByEmail(String email) {
        try {
            Optional<Usuario> usuario = usuarioRepository.findByEmail(email);
            return usuario.orElse(null);
        } catch (Exception e) {
            throw new RuntimeException("Error al buscar usuario por email: " + e.getMessage(), e);
        }
    }
}