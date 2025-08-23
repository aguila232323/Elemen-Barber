package com.pomelo.app.springboot.app.repository;

import com.pomelo.app.springboot.app.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByEmail(String email);
    Optional<Usuario> findByResetPasswordToken(String token);
    List<Usuario> findByEmailIsNull();
}
