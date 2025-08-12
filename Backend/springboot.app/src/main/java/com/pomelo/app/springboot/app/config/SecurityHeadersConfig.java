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

@Configuration
public class SecurityHeadersConfig {

    @Value("${app.security.hsts.max-age:31536000}")
    private long hstsMaxAge;

    @Value("${app.security.csp.default-src:default-src 'self'}")
    private String cspDefaultSrc;

    @Bean
    public OncePerRequestFilter securityHeadersFilter() {
        return new OncePerRequestFilter() {
            @Override
            protected void doFilterInternal(HttpServletRequest request, 
                                        HttpServletResponse response, 
                                        FilterChain filterChain) throws ServletException, IOException {
                
                // Headers de seguridad HTTP
                response.setHeader("Strict-Transport-Security", "max-age=" + hstsMaxAge + "; includeSubDomains");
                response.setHeader("X-Content-Type-Options", "nosniff");
                response.setHeader("X-Frame-Options", "DENY");
                response.setHeader("X-XSS-Protection", "1; mode=block");
                response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
                response.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
                
                // Content Security Policy
                String csp = cspDefaultSrc + "; " +
                           "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com; " +
                           "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
                           "font-src 'self' https://fonts.gstatic.com; " +
                           "img-src 'self' data: https:; " +
                           "connect-src 'self' https://accounts.google.com https://www.googleapis.com; " +
                           "frame-src 'self' https://accounts.google.com;";
                
                response.setHeader("Content-Security-Policy", csp);
                
                // Headers adicionales de seguridad
                response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
                response.setHeader("Pragma", "no-cache");
                response.setHeader("Expires", "0");
                
                filterChain.doFilter(request, response);
            }
        };
    }
}
