package com.pomelo.app.springboot.app.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Configuration
public class LoggingConfig {

    public static class RequestLoggingFilter extends OncePerRequestFilter {
        
        private static final Logger logger = LoggerFactory.getLogger(RequestLoggingFilter.class);
        
        @Override
        protected void doFilterInternal(HttpServletRequest request, 
                                    HttpServletResponse response, 
                                    FilterChain filterChain) throws ServletException, IOException {
            
            String requestId = UUID.randomUUID().toString();
            String clientIp = getClientIpAddress(request);
            LocalDateTime startTime = LocalDateTime.now();
            
            // Configurar MDC para logging estructurado
            MDC.put("requestId", requestId);
            MDC.put("clientIp", clientIp);
            MDC.put("userAgent", request.getHeader("User-Agent"));
            MDC.put("method", request.getMethod());
            MDC.put("path", request.getRequestURI());
            MDC.put("queryString", request.getQueryString() != null ? request.getQueryString() : "");
            
            try {
                // Log de inicio de request
                logger.info("Request started - {} {} from {}", 
                    request.getMethod(), 
                    request.getRequestURI(), 
                    clientIp);
                
                // Ejecutar request
                filterChain.doFilter(request, response);
                
                // Calcular duración
                long duration = ChronoUnit.MILLIS.between(startTime, LocalDateTime.now());
                
                // Log de fin de request
                MDC.put("status", String.valueOf(response.getStatus()));
                MDC.put("duration", String.valueOf(duration));
                
                if (response.getStatus() >= 400) {
                    logger.warn("Request completed - {} {} - Status: {} - Duration: {}ms", 
                        request.getMethod(), 
                        request.getRequestURI(), 
                        response.getStatus(), 
                        duration);
                } else {
                    logger.info("Request completed - {} {} - Status: {} - Duration: {}ms", 
                        request.getMethod(), 
                        request.getRequestURI(), 
                        response.getStatus(), 
                        duration);
                }
                
            } catch (Exception e) {
                // Log de errores
                long duration = ChronoUnit.MILLIS.between(startTime, LocalDateTime.now());
                MDC.put("error", e.getMessage());
                MDC.put("duration", String.valueOf(duration));
                
                logger.error("Request failed - {} {} - Error: {} - Duration: {}ms", 
                    request.getMethod(), 
                    request.getRequestURI(), 
                    e.getMessage(), 
                    duration, 
                    e);
                
                throw e;
            } finally {
                // Limpiar MDC
                MDC.clear();
            }
        }
        
        private String getClientIpAddress(HttpServletRequest request) {
            String xForwardedFor = request.getHeader("X-Forwarded-For");
            if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
                return xForwardedFor.split(",")[0].trim();
            }
            return request.getRemoteAddr();
        }
    }
}
