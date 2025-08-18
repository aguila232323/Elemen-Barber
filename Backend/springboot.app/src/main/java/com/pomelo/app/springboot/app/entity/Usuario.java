package com.pomelo.app.springboot.app.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "usuario")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(unique = true, nullable = false, length = 100)
    private String email;

    @Column(length = 20)
    private String telefono;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(nullable = false, length = 20)
    private String rol = "CLIENTE"; // CLIENTE o ADMIN

    @Column(length = 6)
    private String verificationCode;

    @Column(nullable = false)
    private Boolean isEmailVerified = false;

    @Column
    private java.time.LocalDateTime verificationCodeExpiry;

    @Column(nullable = false)
    private Integer verificationAttempts = 0;

    @Column
    private java.time.LocalDateTime lockoutUntil;

    @Column(length = 255)
    private String resetPasswordToken;

    @Column
    private java.time.LocalDateTime resetPasswordExpiry;

    @Column(nullable = false)
    private Boolean baneado = false;

    @Column(name = "google_picture_url", length = 500)
    private String googlePictureUrl;

    @Column(name = "avatar", length = 10)
    private String avatar;

    // Campos para Google Calendar OAuth2
    @Column(name = "google_calendar_token", length = 1000)
    private String googleCalendarToken;

    @Column(name = "google_calendar_refresh_token", length = 1000)
    private String googleCalendarRefreshToken;

    @Column(name = "google_calendar_token_expiry")
    private java.time.LocalDateTime googleCalendarTokenExpiry;

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

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getVerificationCode() {
        return verificationCode;
    }

    public void setVerificationCode(String verificationCode) {
        this.verificationCode = verificationCode;
    }

    public Boolean getIsEmailVerified() {
        return isEmailVerified;
    }

    public void setIsEmailVerified(Boolean isEmailVerified) {
        this.isEmailVerified = isEmailVerified;
    }

    public java.time.LocalDateTime getVerificationCodeExpiry() {
        return verificationCodeExpiry;
    }

    public void setVerificationCodeExpiry(java.time.LocalDateTime verificationCodeExpiry) {
        this.verificationCodeExpiry = verificationCodeExpiry;
    }

    public Integer getVerificationAttempts() {
        return verificationAttempts;
    }

    public void setVerificationAttempts(Integer verificationAttempts) {
        this.verificationAttempts = verificationAttempts;
    }

    public java.time.LocalDateTime getLockoutUntil() {
        return lockoutUntil;
    }

    public void setLockoutUntil(java.time.LocalDateTime lockoutUntil) {
        this.lockoutUntil = lockoutUntil;
    }

    public String getResetPasswordToken() {
        return resetPasswordToken;
    }

    public void setResetPasswordToken(String resetPasswordToken) {
        this.resetPasswordToken = resetPasswordToken;
    }

    public java.time.LocalDateTime getResetPasswordExpiry() {
        return resetPasswordExpiry;
    }

    public void setResetPasswordExpiry(java.time.LocalDateTime resetPasswordExpiry) {
        this.resetPasswordExpiry = resetPasswordExpiry;
    }

    public Boolean getBaneado() {
        return baneado;
    }

    public void setBaneado(Boolean baneado) {
        this.baneado = baneado;
    }

    public String getGooglePictureUrl() {
        return googlePictureUrl;
    }

    public void setGooglePictureUrl(String googlePictureUrl) {
        this.googlePictureUrl = googlePictureUrl;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    // Getters y setters para Google Calendar OAuth2
    public String getGoogleCalendarToken() {
        return googleCalendarToken;
    }

    public void setGoogleCalendarToken(String googleCalendarToken) {
        this.googleCalendarToken = googleCalendarToken;
    }

    public String getGoogleCalendarRefreshToken() {
        return googleCalendarRefreshToken;
    }

    public void setGoogleCalendarRefreshToken(String googleCalendarRefreshToken) {
        this.googleCalendarRefreshToken = googleCalendarRefreshToken;
    }

    public java.time.LocalDateTime getGoogleCalendarTokenExpiry() {
        return googleCalendarTokenExpiry;
    }

    public void setGoogleCalendarTokenExpiry(java.time.LocalDateTime googleCalendarTokenExpiry) {
        this.googleCalendarTokenExpiry = googleCalendarTokenExpiry;
    }
}
