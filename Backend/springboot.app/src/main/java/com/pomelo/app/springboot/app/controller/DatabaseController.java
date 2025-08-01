package com.pomelo.app.springboot.app.controller;

import com.pomelo.app.springboot.app.service.DatabaseMigrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/database")
public class DatabaseController {

    @Autowired
    private DatabaseMigrationService databaseMigrationService;

    @PostMapping("/migrate")
    public ResponseEntity<?> migrateDatabase() {
        try {
            databaseMigrationService.migrateDatabase();
            return ResponseEntity.ok(Map.of(
                "message", "Migración de base de datos completada exitosamente",
                "status", "success"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Error durante la migración: " + e.getMessage(),
                "status", "error"
            ));
        }
    }
} 