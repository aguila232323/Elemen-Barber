package com.pomelo.app.springboot.app.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.util.Arrays;

@Configuration
@EnableCaching
@Profile("prod")
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        ConcurrentMapCacheManager cacheManager = new ConcurrentMapCacheManager();
        
        // Configurar caches específicos
        cacheManager.setCacheNames(Arrays.asList(
            "servicios",           // Cache para servicios (cambian poco)
            "configuracion",       // Cache para configuración
            "vacaciones",          // Cache para vacaciones
            "portfolio",           // Cache para portfolio
            "resenas",             // Cache para reseñas públicas
            "disponibilidad"       // Cache para disponibilidad (con TTL corto)
        ));
        
        return cacheManager;
    }
}
