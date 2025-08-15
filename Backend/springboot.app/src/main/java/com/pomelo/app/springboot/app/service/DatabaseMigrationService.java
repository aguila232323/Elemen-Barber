package com.pomelo.app.springboot.app.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;

@Service
public class DatabaseMigrationService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostConstruct
    @Transactional
    public void migrateDatabase() {
        try {
            // Verificar si las columnas ya existen
            boolean resetTokenExists = columnExists("reset_password_token");
            boolean resetExpiryExists = columnExists("reset_password_expiry");

            if (!resetTokenExists) {
                System.out.println("🔄 Agregando columna reset_password_token...");
                jdbcTemplate.execute("ALTER TABLE usuario ADD COLUMN reset_password_token VARCHAR(255) NULL");
                System.out.println("✅ Columna reset_password_token agregada exitosamente");
            } else {
                System.out.println("✅ Columna reset_password_token ya existe");
            }

            if (!resetExpiryExists) {
                System.out.println("🔄 Agregando columna reset_password_expiry...");
                jdbcTemplate.execute("ALTER TABLE usuario ADD COLUMN reset_password_expiry TIMESTAMP NULL");
                System.out.println("✅ Columna reset_password_expiry agregada exitosamente");
            } else {
                System.out.println("✅ Columna reset_password_expiry ya existe");
            }

            // Crear índice si no existe
            try {
                System.out.println("🔄 Creando índice para reset_password_token...");
                jdbcTemplate.execute("CREATE INDEX idx_reset_password_token ON usuario(reset_password_token)");
                System.out.println("✅ Índice creado exitosamente");
            } catch (Exception e) {
                System.out.println("ℹ️ Índice ya existe o no se pudo crear: " + e.getMessage());
            }

            // Eliminar campo confirmada de la tabla cita si existe
            boolean confirmadaExists = citaColumnExists("confirmada");
            
            if (confirmadaExists) {
                System.out.println("🔄 Eliminando columna confirmada de la tabla cita...");
                jdbcTemplate.execute("ALTER TABLE cita DROP COLUMN confirmada");
                System.out.println("✅ Columna confirmada eliminada exitosamente");
                System.out.println("📝 Nota: El estado de las citas ahora se maneja únicamente con el campo 'estado'");
            } else {
                System.out.println("✅ La columna confirmada ya no existe en la tabla cita");
            }

            System.out.println("🎉 Migración de base de datos completada exitosamente");

        } catch (Exception e) {
            System.err.println("❌ Error durante la migración: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private boolean columnExists(String columnName) {
        try {
            String sql = "SELECT COUNT(*) FROM information_schema.columns " +
                        "WHERE table_schema = 'public' " +
                        "AND table_name = 'usuario' " +
                        "AND column_name = ?";
            
            int count = jdbcTemplate.queryForObject(sql, Integer.class, columnName);
            return count > 0;
        } catch (Exception e) {
            System.err.println("Error verificando columna " + columnName + ": " + e.getMessage());
            return false;
        }
    }

    private boolean citaColumnExists(String columnName) {
        try {
            String sql = "SELECT COUNT(*) FROM information_schema.columns " +
                        "WHERE table_schema = 'public' " +
                        "AND table_name = 'cita' " +
                        "AND column_name = ?";
            
            int count = jdbcTemplate.queryForObject(sql, Integer.class, columnName);
            return count > 0;
        } catch (Exception e) {
            System.err.println("Error verificando columna " + columnName + " en tabla cita: " + e.getMessage());
            return false;
        }
    }
} 