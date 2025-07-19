package com.pomelo.app.springboot.app.entity;

import jakarta.persistence.*;

@Entity
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;

    @Column(unique = true)
    private String email;

    private String telefono;

    private String password;

    private String rol = "CLIENTE"; // CLIENTE o ADMIN

    public String getEmail(){
        return email;
    }

    public String getPassword() {
        return password;
    }

    public String getRol() {
        return rol;
    }

    public void setRol(String rolNuevo) {
        rol = rolNuevo;
    }

    public void setPassword(String encode) {
        password = encode;
    }

    public void setEmail(String emailNuevo) {
        email = emailNuevo;
    }
    
    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }
}
