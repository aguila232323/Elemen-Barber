package com.pomelo.app.springboot.app.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;

@Service
public class CitaMigrationService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostConstruct
    @Transactional
    public void migrateCitaTable() {
        try {
            // Verificar si la columna confirmada existe
            boolean confirmadaExists = columnExists("confirmada");

            if (confirmadaExists) {
                System.out.println("🔄 Eliminando columna confirmada de la tabla cita...");
                jdbcTemplate.execute("ALTER TABLE cita DROP COLUMN confirmada");
                System.out.println("✅ Columna confirmada eliminada exitosamente");
                System.out.println("📝 Nota: El estado de las citas ahora se maneja únicamente con el campo 'estado'");
            } else {
                System.out.println("✅ La columna confirmada ya no existe en la tabla cita");
            }

            System.out.println("🎉 Migración de tabla cita completada exitosamente");

        } catch (Exception e) {
            System.err.println("❌ Error durante la migración de tabla cita: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private boolean columnExists(String columnName) {
        try {
            String sql = "SELECT COUNT(*) FROM information_schema.columns " +
                        "WHERE table_schema = 'EsentialBarber' " +
                        "AND table_name = 'cita' " +
                        "AND column_name = ?";

            int count = jdbcTemplate.queryForObject(sql, Integer.class, columnName);
            return count > 0;
        } catch (Exception e) {
            System.err.println("Error verificando columna " + columnName + ": " + e.getMessage());
            return false;
        }
    }
} 