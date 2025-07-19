package com.pomelo.app.springboot.app.controller;

import com.pomelo.app.springboot.app.entity.Usuario;
import com.pomelo.app.springboot.app.service.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
@Tag(name = "Usuarios", description = "Gestión de perfiles de usuario")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping("/perfil")
    @Operation(summary = "Obtener perfil", description = "Obtiene el perfil del usuario autenticado")
    public ResponseEntity<Usuario> obtenerPerfil(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(usuarioService.obtenerPerfil(userDetails.getUsername()));
    }

    @PutMapping("/perfil")
    public ResponseEntity<?> modificarPerfil(@AuthenticationPrincipal UserDetails userDetails, @RequestBody Usuario datosActualizados) {
        String email = userDetails.getUsername();
        return ResponseEntity.ok(usuarioService.modificarPerfil(email, datosActualizados));
    }

    // (Opcional) solo para admin
    @GetMapping
    @Operation(summary = "Listar usuarios", description = "Lista todos los usuarios (solo para administradores)")
    public ResponseEntity<?> listarUsuarios() {
        return ResponseEntity.ok(usuarioService.listarUsuarios());
    }
}
