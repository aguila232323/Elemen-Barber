package com.pomelo.app.springboot.app.service;

import com.pomelo.app.springboot.app.entity.Portfolio;
import com.pomelo.app.springboot.app.repository.PortfolioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class PortfolioService {
    
    private final PortfolioRepository portfolioRepository;
    
    @Autowired
    public PortfolioService(PortfolioRepository portfolioRepository) {
        this.portfolioRepository = portfolioRepository;
    }
    
    /**
     * Obtiene todas las fotos del portfolio (para administradores)
     */
    public List<Portfolio> obtenerTodasLasFotos() {
        return portfolioRepository.findAllByOrderByFechaCreacionDesc();
    }
    
    /**
     * Obtiene todas las fotos activas del portfolio (para usuarios públicos)
     */
    public List<Portfolio> obtenerFotosActivas() {
        return portfolioRepository.findByActivoTrueOrderByFechaCreacionDesc();
    }
    
    /**
     * Añade una nueva foto al portfolio
     */
    public Portfolio añadirFoto(String nombre, String imagenBase64, String urlInstagram) {
        Portfolio nuevaFoto = new Portfolio(nombre, imagenBase64, urlInstagram);
        return portfolioRepository.save(nuevaFoto);
    }
    
    /**
     * Elimina una foto del portfolio (marca como inactiva)
     */
    public boolean eliminarFoto(Long id) {
        Optional<Portfolio> foto = portfolioRepository.findById(id);
        if (foto.isPresent()) {
            Portfolio fotoEncontrada = foto.get();
            fotoEncontrada.setActivo(false);
            portfolioRepository.save(fotoEncontrada);
            return true;
        }
        return false;
    }
    
    /**
     * Elimina permanentemente una foto del portfolio
     */
    public boolean eliminarFotoPermanente(Long id) {
        if (portfolioRepository.existsById(id)) {
            portfolioRepository.deleteById(id);
            return true;
        }
        return false;
    }
    
    /**
     * Actualiza una foto del portfolio
     */
    public Optional<Portfolio> actualizarFoto(Long id, String nombre, String urlInstagram) {
        Optional<Portfolio> foto = portfolioRepository.findById(id);
        if (foto.isPresent()) {
            Portfolio fotoEncontrada = foto.get();
            fotoEncontrada.setNombre(nombre);
            fotoEncontrada.setUrlInstagram(urlInstagram);
            return Optional.of(portfolioRepository.save(fotoEncontrada));
        }
        return Optional.empty();
    }
    
    /**
     * Obtiene una foto específica por ID
     */
    public Optional<Portfolio> obtenerFotoPorId(Long id) {
        return portfolioRepository.findById(id);
    }
    
    /**
     * Cuenta el número total de fotos activas
     */
    public long contarFotosActivas() {
        return portfolioRepository.countByActivoTrue();
    }
} 