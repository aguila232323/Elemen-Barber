package com.pomelo.app.springboot.app.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.core.env.Environment;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.lang.management.OperatingSystemMXBean;

@RestController
@RequestMapping("/health")
@CrossOrigin(origins = "*")
public class HealthController {

    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    @Autowired
    private Environment environment;

    @GetMapping
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("timestamp", LocalDateTime.now());
        health.put("service", "Elemen Barber API");
        health.put("version", "1.0.0");
        
        return ResponseEntity.ok(health);
    }

    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> profileInfo() {
        Map<String, Object> profileInfo = new HashMap<>();
        
        // Obtener perfil activo
        String[] activeProfiles = environment.getActiveProfiles();
        String[] defaultProfiles = environment.getDefaultProfiles();
        
        profileInfo.put("timestamp", LocalDateTime.now());
        profileInfo.put("activeProfiles", activeProfiles.length > 0 ? activeProfiles : new String[]{"default"});
        profileInfo.put("defaultProfiles", defaultProfiles);
        profileInfo.put("environment", environment.getProperty("spring.profiles.active", "No configurado"));
        
        // Información adicional del entorno
        Map<String, String> envInfo = new HashMap<>();
        envInfo.put("server.port", environment.getProperty("server.port", "8080"));
        envInfo.put("spring.application.name", environment.getProperty("spring.application.name", "springboot.app"));
        envInfo.put("spring.jpa.show-sql", environment.getProperty("spring.jpa.show-sql", "false"));
        
        // Configuración de memoria
        MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
        envInfo.put("heap.max", formatBytes(memoryBean.getHeapMemoryUsage().getMax()));
        envInfo.put("heap.used", formatBytes(memoryBean.getHeapMemoryUsage().getUsed()));
        
        profileInfo.put("configuration", envInfo);
        
        // Determinar si es desarrollo o producción
        boolean isProduction = false;
        for (String profile : activeProfiles) {
            if ("prod".equals(profile)) {
                isProduction = true;
                break;
            }
        }
        
        profileInfo.put("environment", isProduction ? "PRODUCCIÓN" : "DESARROLLO");
        profileInfo.put("isProduction", isProduction);
        
        return ResponseEntity.ok(profileInfo);
    }

    @GetMapping("/db")
    public ResponseEntity<Map<String, Object>> databaseHealth() {
        Map<String, Object> dbHealth = new HashMap<>();
        
        try {
            // Verificar conexión a la base de datos
            jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            dbHealth.put("status", "UP");
            dbHealth.put("database", "PostgreSQL");
            dbHealth.put("timestamp", LocalDateTime.now());
        } catch (Exception e) {
            dbHealth.put("status", "DOWN");
            dbHealth.put("error", e.getMessage());
            dbHealth.put("timestamp", LocalDateTime.now());
        }
        
        return ResponseEntity.ok(dbHealth);
    }

    @GetMapping("/system")
    public ResponseEntity<Map<String, Object>> systemHealth() {
        Map<String, Object> systemHealth = new HashMap<>();
        
        // Métricas del sistema
        MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
        OperatingSystemMXBean osBean = ManagementFactory.getOperatingSystemMXBean();
        
        systemHealth.put("status", "UP");
        systemHealth.put("timestamp", LocalDateTime.now());
        systemHealth.put("memory", Map.of(
            "heapUsed", formatBytes(memoryBean.getHeapMemoryUsage().getUsed()),
            "heapMax", formatBytes(memoryBean.getHeapMemoryUsage().getMax()),
            "heapUsage", String.format("%.2f%%", 
                (double) memoryBean.getHeapMemoryUsage().getUsed() / 
                memoryBean.getHeapMemoryUsage().getMax() * 100)
        ));
        systemHealth.put("system", Map.of(
            "os", osBean.getName() + " " + osBean.getVersion(),
            "arch", osBean.getArch(),
            "processors", osBean.getAvailableProcessors(),
            "loadAverage", osBean.getSystemLoadAverage()
        ));
        
        return ResponseEntity.ok(systemHealth);
    }

    @GetMapping("/full")
    public ResponseEntity<Map<String, Object>> fullHealthCheck() {
        Map<String, Object> fullHealth = new HashMap<>();
        
        // Health check completo
        fullHealth.put("status", "UP");
        fullHealth.put("timestamp", LocalDateTime.now());
        fullHealth.put("checks", Map.of(
            "database", checkDatabaseHealth(),
            "system", checkSystemHealth(),
            "application", Map.of("status", "UP")
        ));
        
        // Determinar estado general
        boolean allHealthy = fullHealth.get("checks") instanceof Map &&
                           ((Map<?, ?>) fullHealth.get("checks")).values().stream()
                           .allMatch(check -> check instanceof Map && 
                                   "UP".equals(((Map<?, ?>) check).get("status")));
        
        fullHealth.put("status", allHealthy ? "UP" : "DOWN");
        
        return ResponseEntity.ok(fullHealth);
    }

    private Map<String, Object> checkDatabaseHealth() {
        try {
            jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            return Map.of("status", "UP", "message", "Database connection successful");
        } catch (Exception e) {
            return Map.of("status", "DOWN", "error", e.getMessage());
        }
    }

    private Map<String, Object> checkSystemHealth() {
        try {
            MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
            long heapUsage = memoryBean.getHeapMemoryUsage().getUsed();
            long heapMax = memoryBean.getHeapMemoryUsage().getMax();
            double usagePercent = (double) heapUsage / heapMax * 100;
            
            if (usagePercent > 90) {
                return Map.of("status", "WARNING", "message", "High memory usage: " + 
                            String.format("%.2f%%", usagePercent));
            }
            
            return Map.of("status", "UP", "message", "System resources OK");
        } catch (Exception e) {
            return Map.of("status", "DOWN", "error", e.getMessage());
        }
    }

    private String formatBytes(long bytes) {
        if (bytes < 1024) return bytes + " B";
        int exp = (int) (Math.log(bytes) / Math.log(1024));
        String pre = "KMGTPE".charAt(exp - 1) + "";
        return String.format("%.1f %sB", bytes / Math.pow(1024, exp), pre);
    }
}
