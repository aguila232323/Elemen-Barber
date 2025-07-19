package com.pomelo.app.springboot.app.repository;

import com.pomelo.app.springboot.app.entity.Servicio;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServicioRepository extends JpaRepository<Servicio, Long> {
}