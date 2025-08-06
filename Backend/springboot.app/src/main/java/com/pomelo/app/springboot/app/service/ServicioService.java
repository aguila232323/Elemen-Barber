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
        try {
            return servicioRepository.findAll();
        } catch (Exception e) {
            throw new RuntimeException("Error al listar servicios: " + e.getMessage(), e);
        }
    }

    public Servicio findById(Long id) {
        try {
            return servicioRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Servicio no encontrado"));
        } catch (Exception e) {
            throw new RuntimeException("Error al buscar servicio: " + e.getMessage(), e);
        }
    }

    public Servicio crearServicio(Servicio servicio) {
        try {
            if (servicio.getNombre() == null || servicio.getNombre().trim().isEmpty()) {
                throw new RuntimeException("El nombre del servicio es obligatorio");
            }
            if (servicio.getPrecio() <= 0) {
                throw new RuntimeException("El precio debe ser mayor a 0");
            }
            if (servicio.getDuracionMinutos() <= 0) {
                throw new RuntimeException("La duración debe ser mayor a 0");
            }
            return servicioRepository.save(servicio);
        } catch (Exception e) {
            throw new RuntimeException("Error al crear servicio: " + e.getMessage(), e);
        }
    }

    public void eliminarServicio(Long id) {
        try {
            if (!servicioRepository.existsById(id)) {
                throw new RuntimeException("Servicio no encontrado");
            }
            servicioRepository.deleteById(id);
        } catch (Exception e) {
            throw new RuntimeException("Error al eliminar servicio: " + e.getMessage(), e);
        }
    }

    public Servicio modificarServicio(Long id, Servicio servicioActualizado) {
        try {
            return servicioRepository.findById(id).map(servicio -> {
                if (servicioActualizado.getNombre() != null && !servicioActualizado.getNombre().trim().isEmpty()) {
                    servicio.setNombre(servicioActualizado.getNombre());
                }
                if (servicioActualizado.getDescripcion() != null) {
                    servicio.setDescripcion(servicioActualizado.getDescripcion());
                }
                if (servicioActualizado.getPrecio() > 0) {
                    servicio.setPrecio(servicioActualizado.getPrecio());
                }
                if (servicioActualizado.getDuracionMinutos() > 0) {
                    servicio.setDuracionMinutos(servicioActualizado.getDuracionMinutos());
                }
                // Actualizar emoji
                if (servicioActualizado.getEmoji() != null) {
                    servicio.setEmoji(servicioActualizado.getEmoji());
                }
                // Actualizar texto descriptivo
                if (servicioActualizado.getTextoDescriptivo() != null) {
                    servicio.setTextoDescriptivo(servicioActualizado.getTextoDescriptivo());
                }
                return servicioRepository.save(servicio);
            }).orElseThrow(() -> new RuntimeException("Servicio no encontrado"));
        } catch (Exception e) {
            throw new RuntimeException("Error al modificar servicio: " + e.getMessage(), e);
        }
    }
}
