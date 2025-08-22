package com.pomelo.app.springboot.app.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtExceptionHandlerFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            filterChain.doFilter(request, response);
        } catch (Exception e) {
            // Capturar excepciones JWT específicas y manejarlas silenciosamente
            if (isJwtException(e)) {
                // Log silencioso - comportamiento esperado
                logger.debug("JWT exception handled silently: " + e.getMessage());
                
                // Responder con 401 Unauthorized sin loggear como error
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"Token inválido\",\"message\":\"El token de autenticación no es válido o ha expirado\"}");
            } else {
                // Re-lanzar excepciones que no son JWT
                throw e;
            }
        }
    }

    private boolean isJwtException(Exception e) {
        String exceptionName = e.getClass().getSimpleName();
        return exceptionName.contains("Jwt") || 
               exceptionName.contains("Expired") ||
               exceptionName.contains("Malformed") ||
               exceptionName.contains("Unsupported");
    }
}
