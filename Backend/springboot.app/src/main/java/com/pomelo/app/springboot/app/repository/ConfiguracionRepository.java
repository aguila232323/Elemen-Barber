package com.pomelo.app.springboot.app.repository;

import com.pomelo.app.springboot.app.entity.Configuracion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConfiguracionRepository extends JpaRepository<Configuracion, Long> {
    
    Optional<Configuracion> findByClave(String clave);
    
    boolean existsByClave(String clave);
} 