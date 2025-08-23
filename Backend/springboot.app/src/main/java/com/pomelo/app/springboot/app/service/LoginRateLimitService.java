package com.pomelo.app.springboot.app.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Service
public class LoginRateLimitService {

    @Value("${app.rate-limit.max-login-attempts:10}")
    private int maxLoginAttempts;

    private final Map<String, LoginAttemptCounter> loginAttempts = new ConcurrentHashMap<>();

    /**
     * Registra un intento de login fallido
     */
    public void recordFailedAttempt(String clientIp) {
        LoginAttemptCounter counter = loginAttempts.computeIfAbsent(clientIp, k -> new LoginAttemptCounter());
        
        // Resetear contador si han pasado 15 minutos
        if (ChronoUnit.MINUTES.between(counter.lastAttempt, LocalDateTime.now()) >= 15) {
            counter.attempts = 0;
        }
        
        counter.attempts++;
        counter.lastAttempt = LocalDateTime.now();
        
        System.out.println("🚫 Login fallido registrado para IP: " + clientIp + " (intento " + counter.attempts + "/" + maxLoginAttempts + ")");
    }

    /**
     * Verifica si una IP está bloqueada por demasiados intentos fallidos
     */
    public boolean isBlocked(String clientIp) {
        LoginAttemptCounter counter = loginAttempts.get(clientIp);
        
        if (counter == null) {
            return false;
        }
        
        // Resetear contador si han pasado 15 minutos
        if (ChronoUnit.MINUTES.between(counter.lastAttempt, LocalDateTime.now()) >= 15) {
            loginAttempts.remove(clientIp);
            return false;
        }
        
        boolean blocked = counter.attempts >= maxLoginAttempts;
        
        if (blocked) {
            System.out.println("🚫 IP bloqueada por demasiados intentos: " + clientIp);
        }
        
        return blocked;
    }

    /**
     * Obtiene el número de intentos restantes para una IP
     */
    public int getRemainingAttempts(String clientIp) {
        LoginAttemptCounter counter = loginAttempts.get(clientIp);
        
        if (counter == null) {
            return maxLoginAttempts;
        }
        
        // Resetear contador si han pasado 15 minutos
        if (ChronoUnit.MINUTES.between(counter.lastAttempt, LocalDateTime.now()) >= 15) {
            loginAttempts.remove(clientIp);
            return maxLoginAttempts;
        }
        
        return Math.max(0, maxLoginAttempts - counter.attempts);
    }

    /**
     * Limpia los intentos de una IP (útil para logins exitosos)
     */
    public void clearAttempts(String clientIp) {
        loginAttempts.remove(clientIp);
        System.out.println("✅ Intentos de login limpiados para IP: " + clientIp);
    }

    private static class LoginAttemptCounter {
        int attempts = 0;
        LocalDateTime lastAttempt = LocalDateTime.now();
    }
}
