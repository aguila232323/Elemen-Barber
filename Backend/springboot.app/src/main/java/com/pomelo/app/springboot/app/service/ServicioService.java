package com.pomelo.app.springboot.app.service;

import com.pomelo.app.springboot.app.entity.Servicio;
import com.pomelo.app.springboot.app.repository.ServicioRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ServicioService {
    private final ServicioRepository servicioRepository;

    public ServicioService(ServicioRepository servicioRepository) {
        this.servicioRepository = servicioRepository;
    }

    public List<Servicio> listarServicios() {
        return servicioRepository.findAll();
    }

    public Servicio findById(Long id) {
        return servicioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Servicio no encontrado"));
    }

    public Servicio crearServicio(Servicio servicio) {
        return servicioRepository.save(servicio);
    }

    public void eliminarServicio(Long id) {
        servicioRepository.deleteById(id);
    }

    public Servicio modificarServicio(Long id, Servicio servicioActualizado) {
        return servicioRepository.findById(id).map(servicio -> {
            servicio.setNombre(servicioActualizado.getNombre());
            servicio.setDescripcion(servicioActualizado.getDescripcion());
            servicio.setPrecio(servicioActualizado.getPrecio());
            servicio.setDuracionMinutos(servicioActualizado.getDuracionMinutos());
            return servicioRepository.save(servicio);
        }).orElseThrow(() -> new RuntimeException("Servicio no encontrado"));
    }
}
