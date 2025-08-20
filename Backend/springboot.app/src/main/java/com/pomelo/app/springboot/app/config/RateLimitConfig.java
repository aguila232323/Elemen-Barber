package com.pomelo.app.springboot.app.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Configuration
public class RateLimitConfig {

    @Value("${app.rate-limit.max-requests-per-minute:60}")
    private int maxRequestsPerMinute;

    @Value("${app.rate-limit.max-login-attempts:5}")
    private int maxLoginAttempts;

    private final Map<String, RequestCounter> requestCounters = new ConcurrentHashMap<>();
    private final Map<String, LoginAttemptCounter> loginAttempts = new ConcurrentHashMap<>();

    @Bean
    public OncePerRequestFilter rateLimitFilter() {
        return new OncePerRequestFilter() {
            @Override
            protected void doFilterInternal(HttpServletRequest request, 
                                        HttpServletResponse response, 
                                        FilterChain filterChain) throws ServletException, IOException {
                
                String clientIp = getClientIpAddress(request);
                String requestPath = request.getRequestURI();
                
                // Rate limiting para endpoints de login
                if (requestPath.contains("/api/auth/login") || requestPath.contains("/api/auth/google")) {
                    if (isLoginRateLimited(clientIp)) {
                        response.setStatus(429); // Too Many Requests
                        response.getWriter().write("{\"error\":\"Demasiados intentos de login. Intente más tarde.\"}");
                        return;
                    }
                }
                
                // Rate limiting general
                if (isGeneralRateLimited(clientIp)) {
                    response.setStatus(429); // Too Many Requests
                    response.getWriter().write("{\"error\":\"Demasiadas solicitudes. Intente más tarde.\"}");
                    return;
                }
                
                filterChain.doFilter(request, response);
            }
        };
    }

    private boolean isLoginRateLimited(String clientIp) {
        LoginAttemptCounter counter = loginAttempts.computeIfAbsent(clientIp, k -> new LoginAttemptCounter());
        
        if (ChronoUnit.MINUTES.between(counter.lastAttempt, LocalDateTime.now()) >= 15) {
            counter.attempts = 0;
            counter.lastAttempt = LocalDateTime.now();
        }
        
        if (counter.attempts >= maxLoginAttempts) {
            return true;
        }
        
        counter.attempts++;
        counter.lastAttempt = LocalDateTime.now();
        return false;
    }

    private boolean isGeneralRateLimited(String clientIp) {
        RequestCounter counter = requestCounters.computeIfAbsent(clientIp, k -> new RequestCounter());
        
        if (ChronoUnit.MINUTES.between(counter.lastRequest, LocalDateTime.now()) >= 1) {
            counter.requests = 0;
            counter.lastRequest = LocalDateTime.now();
        }
        
        if (counter.requests >= maxRequestsPerMinute) {
            return true;
        }
        
        counter.requests++;
        counter.lastRequest = LocalDateTime.now();
        return false;
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private static class RequestCounter {
        int requests = 0;
        LocalDateTime lastRequest = LocalDateTime.now();
    }

    private static class LoginAttemptCounter {
        int attempts = 0;
        LocalDateTime lastAttempt = LocalDateTime.now();
    }
}
