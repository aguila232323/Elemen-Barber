package com.pomelo.app.springboot.app.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${app.file.upload-dir:/tmp/uploads}")
    private String uploadDir;

    @Value("${app.file.max-size:5242880}") // 5MB por defecto
    private long maxFileSize;

    /**
     * Almacena un archivo en el sistema de archivos
     */
    public String storeFile(MultipartFile file) throws IOException {
        System.out.println("📁 FileStorageService: Iniciando almacenamiento de archivo");
        System.out.println("📁 Directorio de upload: " + uploadDir);
        
        // Validar archivo
        validateFile(file);
        System.out.println("✅ Validación de archivo completada");

        // Crear directorio si no existe
        Path uploadPath = Paths.get(uploadDir);
        System.out.println("📁 Ruta de upload: " + uploadPath.toAbsolutePath());
        
        if (!Files.exists(uploadPath)) {
            System.out.println("📁 Creando directorio de upload...");
            Files.createDirectories(uploadPath);
            System.out.println("✅ Directorio creado exitosamente");
        } else {
            System.out.println("✅ Directorio de upload ya existe");
        }

        // Generar nombre único para el archivo
        String fileName = generateUniqueFileName(file.getOriginalFilename());
        Path filePath = uploadPath.resolve(fileName);
        System.out.println("📁 Ruta completa del archivo: " + filePath.toAbsolutePath());

        // Guardar archivo
        System.out.println("📁 Guardando archivo...");
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        System.out.println("✅ Archivo guardado exitosamente");

        return fileName;
    }

    /**
     * Almacena una imagen desde Base64
     */
    public String storeBase64Image(String base64Data, String originalFileName) throws IOException {
        // Remover el prefijo data:image/...;base64,
        String base64Image = base64Data.replaceAll("^data:image/[^;]*;base64,?", "");

        // Decodificar Base64
        byte[] imageBytes = java.util.Base64.getDecoder().decode(base64Image);

        // Crear directorio si no existe
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generar nombre único
        String fileName = generateUniqueFileName(originalFileName);
        Path filePath = uploadPath.resolve(fileName);

        // Guardar archivo
        Files.write(filePath, imageBytes);

        return fileName;
    }

    /**
     * Elimina un archivo del sistema
     */
    public boolean deleteFile(String fileName) {
        try {
            Path filePath = Paths.get(uploadDir).resolve(fileName);
            return Files.deleteIfExists(filePath);
        } catch (IOException e) {
            return false;
        }
    }

    /**
     * Obtiene la ruta completa de un archivo
     */
    public Path getFilePath(String fileName) {
        return Paths.get(uploadDir).resolve(fileName);
    }

    /**
     * Verifica si un archivo existe
     */
    public boolean fileExists(String fileName) {
        Path filePath = Paths.get(uploadDir).resolve(fileName);
        return Files.exists(filePath);
    }

    /**
     * Valida un archivo antes de almacenarlo
     */
    private void validateFile(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IOException("El archivo está vacío");
        }

        if (file.getSize() > maxFileSize) {
            throw new IOException("El archivo es demasiado grande. Máximo " + (maxFileSize / 1024 / 1024) + "MB");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IOException("Solo se permiten archivos de imagen");
        }
    }

    /**
     * Genera un nombre único para el archivo
     */
    private String generateUniqueFileName(String originalFileName) {
        String extension = "";
        if (originalFileName != null && originalFileName.contains(".")) {
            extension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }
        return UUID.randomUUID().toString() + extension;
    }
}
