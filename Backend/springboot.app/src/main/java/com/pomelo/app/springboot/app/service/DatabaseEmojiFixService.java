package com.pomelo.app.springboot.app.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class DatabaseEmojiFixService implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseEmojiFixService.class);

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        logger.info("Verificando configuración de emojis en la base de datos...");
        fixEmojiSupport();
    }

    public void fixEmojiSupport() {
        try {
            // Verificar configuración actual de la base de datos
            String dbCharset = jdbcTemplate.queryForObject(
                "SHOW VARIABLES LIKE 'character_set_database'", 
                (rs, rowNum) -> rs.getString("Value")
            );
            
            String dbCollation = jdbcTemplate.queryForObject(
                "SHOW VARIABLES LIKE 'collation_database'", 
                (rs, rowNum) -> rs.getString("Value")
            );

            logger.info("Configuración actual de la base de datos:");
            logger.info("Character Set: {}", dbCharset);
            logger.info("Collation: {}", dbCollation);

            // Si no está configurado para utf8mb4, aplicar la corrección
            if (!"utf8mb4".equals(dbCharset)) {
                logger.info("Aplicando corrección de configuración UTF-8 MB4...");
                
                // Configurar la base de datos
                jdbcTemplate.execute("ALTER DATABASE EsentialBarber CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
                
                // Configurar la tabla usuario
                jdbcTemplate.execute("ALTER TABLE usuario CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
                jdbcTemplate.execute("ALTER TABLE usuario MODIFY COLUMN avatar VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
                
                // Configurar otras tablas
                jdbcTemplate.execute("ALTER TABLE servicio CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
                jdbcTemplate.execute("ALTER TABLE cita CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
                jdbcTemplate.execute("ALTER TABLE configuracion CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
                jdbcTemplate.execute("ALTER TABLE resena CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
                jdbcTemplate.execute("ALTER TABLE vacaciones CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
                
                logger.info("Configuración UTF-8 MB4 aplicada exitosamente");
            } else {
                logger.info("La base de datos ya está configurada correctamente para UTF-8 MB4");
            }

            // Verificar configuración de la tabla usuario
            String tableCharset = jdbcTemplate.queryForObject(
                "SHOW CREATE TABLE usuario", 
                (rs, rowNum) -> {
                    String createTable = rs.getString("Create Table");
                    if (createTable.contains("utf8mb4")) {
                        return "utf8mb4";
                    } else {
                        return "utf8";
                    }
                }
            );

            logger.info("Configuración de la tabla usuario: {}", tableCharset);

            if (!"utf8mb4".equals(tableCharset)) {
                logger.info("Aplicando corrección específica a la tabla usuario...");
                jdbcTemplate.execute("ALTER TABLE usuario CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
                jdbcTemplate.execute("ALTER TABLE usuario MODIFY COLUMN avatar VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
                logger.info("Corrección aplicada a la tabla usuario");
            }

            logger.info("Verificación de configuración de emojis completada");

        } catch (Exception e) {
            logger.error("Error al verificar/corregir configuración de emojis: {}", e.getMessage());
            // No lanzar la excepción para evitar que la aplicación falle al iniciar
        }
    }
} 