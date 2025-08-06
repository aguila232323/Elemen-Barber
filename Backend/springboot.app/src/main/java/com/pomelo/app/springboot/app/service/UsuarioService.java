package com.pomelo.app.springboot.app.service;

import com.pomelo.app.springboot.app.entity.Usuario;
import com.pomelo.app.springboot.app.entity.Cita;
import com.pomelo.app.springboot.app.repository.UsuarioRepository;
import com.pomelo.app.springboot.app.repository.CitaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.time.LocalDateTime;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private CitaRepository citaRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PhoneValidationService phoneValidationService;

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
                
                // El email no se puede modificar por seguridad
                // Los cambios de email requieren verificación adicional
                // if (usuarioModificado.getEmail() != null) {
                //     usuario.setEmail(usuarioModificado.getEmail());
                // }
                if (usuarioModificado.getTelefono() != null) {
                    // Validar teléfono
                    String phoneError = phoneValidationService.getPhoneErrorMessage(usuarioModificado.getTelefono());
                    if (phoneError != null) {
                        throw new RuntimeException(phoneError);
                    }
                    
                    // Normalizar teléfono para almacenamiento
                    String normalizedPhone = phoneValidationService.normalizePhoneForStorage(usuarioModificado.getTelefono());
                    usuario.setTelefono(normalizedPhone);
                }
                
                return usuarioRepository.save(usuario);
            } else {
                throw new RuntimeException("Usuario no encontrado con ID: " + id);
            }
        } catch (Exception e) {
            throw new RuntimeException("Error al modificar el perfil: " + e.getMessage(), e);
        }
    }

    public void eliminarCuenta(Long id, String password) {
        try {
            Optional<Usuario> usuarioExistente = usuarioRepository.findById(id);
            if (!usuarioExistente.isPresent()) {
                throw new RuntimeException("Usuario no encontrado con ID: " + id);
            }
            
            Usuario usuario = usuarioExistente.get();
            
            // Verificar contraseña
            if (!passwordEncoder.matches(password, usuario.getPassword())) {
                throw new RuntimeException("Contraseña incorrecta");
            }
            
            // Eliminar todas las citas del usuario
            List<Cita> citasUsuario = citaRepository.findByCliente(usuario);
            if (!citasUsuario.isEmpty()) {
                citaRepository.deleteAll(citasUsuario);
            }
            
            // Eliminar el usuario
            usuarioRepository.delete(usuario);
            
        } catch (Exception e) {
            throw new RuntimeException("Error al eliminar la cuenta: " + e.getMessage(), e);
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

    public Usuario findById(Long id) {
        try {
            Optional<Usuario> usuario = usuarioRepository.findById(id);
            return usuario.orElse(null);
        } catch (Exception e) {
            throw new RuntimeException("Error al buscar usuario por ID: " + e.getMessage(), e);
        }
    }

    public String generarCodigoVerificacion() {
        Random random = new Random();
        StringBuilder codigo = new StringBuilder();
        for (int i = 0; i < 6; i++) {
            codigo.append(random.nextInt(10));
        }
        return codigo.toString();
    }

    public void enviarCodigoVerificacion(String email) {
        try {
            Usuario usuario = findByEmail(email);
            if (usuario == null) {
                throw new RuntimeException("Usuario no encontrado con email: " + email);
            }

            // Verificar si el usuario está bloqueado
            if (usuario.getLockoutUntil() != null && LocalDateTime.now().isBefore(usuario.getLockoutUntil())) {
                long minutosRestantes = java.time.Duration.between(LocalDateTime.now(), usuario.getLockoutUntil()).toMinutes();
                throw new RuntimeException("Cuenta bloqueada temporalmente. Intenta de nuevo en " + minutosRestantes + " minutos.");
            }

            String codigoVerificacion = generarCodigoVerificacion();
            LocalDateTime expiracion = LocalDateTime.now().plusMinutes(10);

            usuario.setVerificationCode(codigoVerificacion);
            usuario.setVerificationCodeExpiry(expiracion);
            usuario.setIsEmailVerified(false);
            usuario.setVerificationAttempts(0); // Resetear intentos al enviar nuevo código
            usuario.setLockoutUntil(null); // Resetear bloqueo

            usuarioRepository.save(usuario);

            // Enviar email con el código
            emailService.enviarCodigoVerificacion(email, usuario.getNombre(), codigoVerificacion);
            
        } catch (Exception e) {
            throw new RuntimeException("Error al enviar código de verificación: " + e.getMessage(), e);
        }
    }

    public boolean verificarCodigo(String email, String codigo) {
        try {
            Usuario usuario = findByEmail(email);
            if (usuario == null) {
                return false;
            }

            // Verificar si el usuario está bloqueado
            if (usuario.getLockoutUntil() != null && LocalDateTime.now().isBefore(usuario.getLockoutUntil())) {
                long minutosRestantes = java.time.Duration.between(LocalDateTime.now(), usuario.getLockoutUntil()).toMinutes();
                throw new RuntimeException("Cuenta bloqueada temporalmente. Intenta de nuevo en " + minutosRestantes + " minutos.");
            }

            // Verificar que el código coincida y no haya expirado
            if (codigo.equals(usuario.getVerificationCode()) && 
                usuario.getVerificationCodeExpiry() != null &&
                LocalDateTime.now().isBefore(usuario.getVerificationCodeExpiry())) {
                
                // ACTIVAR EL USUARIO - Ahora puede iniciar sesión
                usuario.setIsEmailVerified(true);
                usuario.setVerificationCode(null);
                usuario.setVerificationCodeExpiry(null);
                usuario.setVerificationAttempts(0); // Resetear intentos al verificar correctamente
                usuario.setLockoutUntil(null); // Resetear bloqueo
                usuarioRepository.save(usuario);
                
                return true;
            } else {
                // Incrementar intentos fallidos
                int intentosActuales = usuario.getVerificationAttempts() != null ? usuario.getVerificationAttempts() : 0;
                usuario.setVerificationAttempts(intentosActuales + 1);
                
                // Bloquear después de 5 intentos fallidos por 15 minutos
                if (intentosActuales + 1 >= 5) {
                    usuario.setLockoutUntil(LocalDateTime.now().plusMinutes(15));
                    usuarioRepository.save(usuario);
                    throw new RuntimeException("Demasiados intentos fallidos. Tu cuenta ha sido bloqueada por 15 minutos.");
                }
                
                usuarioRepository.save(usuario);
                return false;
            }
        } catch (Exception e) {
            throw new RuntimeException("Error al verificar código: " + e.getMessage(), e);
        }
    }

    public boolean isEmailVerificado(String email) {
        try {
            Usuario usuario = findByEmail(email);
            return usuario != null && Boolean.TRUE.equals(usuario.getIsEmailVerified());
        } catch (Exception e) {
            throw new RuntimeException("Error al verificar estado del email: " + e.getMessage(), e);
        }
    }

    public java.util.Map<String, Object> getVerificationStatus(String email) {
        try {
            Usuario usuario = findByEmail(email);
            if (usuario == null) {
                throw new RuntimeException("Usuario no encontrado");
            }

            java.util.Map<String, Object> status = new java.util.HashMap<>();
            status.put("attempts", usuario.getVerificationAttempts());
            status.put("isLocked", usuario.getLockoutUntil() != null && LocalDateTime.now().isBefore(usuario.getLockoutUntil()));
            
            if (usuario.getLockoutUntil() != null && LocalDateTime.now().isBefore(usuario.getLockoutUntil())) {
                long minutosRestantes = java.time.Duration.between(LocalDateTime.now(), usuario.getLockoutUntil()).toMinutes();
                status.put("lockoutMinutesRemaining", minutosRestantes);
            } else {
                status.put("lockoutMinutesRemaining", 0);
            }

            return status;
        } catch (Exception e) {
            throw new RuntimeException("Error al obtener estado de verificación: " + e.getMessage(), e);
        }
    }

    public void enviarRecuperacionContrasena(String email) {
        try {
            Usuario usuario = findByEmail(email);
            if (usuario == null) {
                throw new RuntimeException("Usuario no encontrado");
            }

            // Generar token de recuperación único
            String resetToken = generarTokenRecuperacion();
            
            // Guardar token y fecha de expiración (24 horas)
            usuario.setResetPasswordToken(resetToken);
            usuario.setResetPasswordExpiry(LocalDateTime.now().plusHours(24));
            usuarioRepository.save(usuario);

            // Enviar email con enlace de recuperación
            emailService.enviarRecuperacionContrasena(email, usuario.getNombre(), resetToken);
            
        } catch (Exception e) {
            throw new RuntimeException("Error al enviar recuperación de contraseña: " + e.getMessage(), e);
        }
    }

    private String generarTokenRecuperacion() {
        String caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder token = new StringBuilder();
        Random random = new Random();
        
        for (int i = 0; i < 32; i++) {
            token.append(caracteres.charAt(random.nextInt(caracteres.length())));
        }
        
        return token.toString();
    }

    public boolean validarTokenRecuperacion(String token) {
        try {
            // Buscar usuario con el token
            Optional<Usuario> usuario = usuarioRepository.findByResetPasswordToken(token);
            if (usuario.isPresent()) {
                Usuario user = usuario.get();
                
                // Verificar que el token no haya expirado
                if (user.getResetPasswordExpiry() != null && 
                    LocalDateTime.now().isBefore(user.getResetPasswordExpiry())) {
                    return true;
                } else {
                    // Token expirado, limpiarlo
                    user.setResetPasswordToken(null);
                    user.setResetPasswordExpiry(null);
                    usuarioRepository.save(user);
                    return false;
                }
            }
            return false;
        } catch (Exception e) {
            throw new RuntimeException("Error al validar token de recuperación: " + e.getMessage(), e);
        }
    }

    public boolean restablecerContrasena(String token, String nuevaPassword) {
        try {
            // Buscar usuario con el token
            Optional<Usuario> usuario = usuarioRepository.findByResetPasswordToken(token);
            if (usuario.isPresent()) {
                Usuario user = usuario.get();
                
                // Verificar que el token no haya expirado
                if (user.getResetPasswordExpiry() != null && 
                    LocalDateTime.now().isBefore(user.getResetPasswordExpiry())) {
                    
                    // Cambiar contraseña
                    user.setPassword(passwordEncoder.encode(nuevaPassword));
                    
                    // Limpiar token de recuperación
                    user.setResetPasswordToken(null);
                    user.setResetPasswordExpiry(null);
                    
                    usuarioRepository.save(user);
                    return true;
                } else {
                    // Token expirado, limpiarlo
                    user.setResetPasswordToken(null);
                    user.setResetPasswordExpiry(null);
                    usuarioRepository.save(user);
                    return false;
                }
            }
            return false;
        } catch (Exception e) {
            throw new RuntimeException("Error al restablecer contraseña: " + e.getMessage(), e);
        }
    }

    /**
     * Limpia usuarios no verificados que tienen más de 24 horas
     * Este método se puede ejecutar periódicamente para limpiar la base de datos
     */
    public void limpiarUsuariosNoVerificados() {
        try {
            LocalDateTime hace24Horas = LocalDateTime.now().minusHours(24);
            // Nota: Este método requiere agregar el método correspondiente en UsuarioRepository
            // List<Usuario> usuariosNoVerificados = usuarioRepository.findByIsEmailVerifiedFalseAndCreatedAtBefore(hace24Horas);
            
            // Por ahora, solo un log informativo
            System.out.println("Método de limpieza de usuarios no verificados disponible");
        } catch (Exception e) {
            System.err.println("Error al limpiar usuarios no verificados: " + e.getMessage());
        }
    }

    /**
     * Banea un usuario específico
     */
    public void banearUsuario(Long id) {
        try {
            Optional<Usuario> usuario = usuarioRepository.findById(id);
            if (usuario.isPresent()) {
                Usuario user = usuario.get();
                user.setBaneado(true);
                usuarioRepository.save(user);
            } else {
                throw new RuntimeException("Usuario no encontrado con ID: " + id);
            }
        } catch (Exception e) {
            throw new RuntimeException("Error al banear usuario: " + e.getMessage(), e);
        }
    }

    /**
     * Desbanea un usuario específico
     */
    public void desbanearUsuario(Long id) {
        try {
            Optional<Usuario> usuario = usuarioRepository.findById(id);
            if (usuario.isPresent()) {
                Usuario user = usuario.get();
                user.setBaneado(false);
                usuarioRepository.save(user);
            } else {
                throw new RuntimeException("Usuario no encontrado con ID: " + id);
            }
        } catch (Exception e) {
            throw new RuntimeException("Error al desbanear usuario: " + e.getMessage(), e);
        }
    }

    /**
     * Actualiza el avatar de un usuario específico
     */
    public Usuario actualizarAvatar(Long id, String avatar) {
        try {
            Optional<Usuario> usuario = usuarioRepository.findById(id);
            if (usuario.isPresent()) {
                Usuario user = usuario.get();
                user.setAvatar(avatar);
                return usuarioRepository.save(user);
            } else {
                throw new RuntimeException("Usuario no encontrado con ID: " + id);
            }
        } catch (Exception e) {
            throw new RuntimeException("Error al actualizar avatar: " + e.getMessage(), e);
        }
    }
}