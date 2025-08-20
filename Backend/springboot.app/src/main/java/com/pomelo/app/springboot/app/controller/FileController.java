package com.pomelo.app.springboot.app.controller;

import com.pomelo.app.springboot.app.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Path;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "*")
public class FileController {

    private final FileStorageService fileStorageService;

    @Autowired
    public FileController(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    /**
     * Sirve un archivo desde el sistema de archivos
     */
    @GetMapping("/{fileName:.+}")
    public ResponseEntity<Resource> serveFile(@PathVariable String fileName) {
        try {
            Path filePath = fileStorageService.getFilePath(fileName);
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .contentType(MediaType.IMAGE_JPEG) // Ajustar según el tipo de archivo
                    .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Sube un archivo usando MultipartFile
     */
    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            System.out.println("📁 Iniciando subida de archivo: " + file.getOriginalFilename());
            System.out.println("📁 Tamaño del archivo: " + file.getSize() + " bytes");
            System.out.println("📁 Tipo de contenido: " + file.getContentType());
            
            String fileName = fileStorageService.storeFile(file);
            
            System.out.println("✅ Archivo subido exitosamente: " + fileName);
            return ResponseEntity.ok().body(new UploadResponse(fileName, "Archivo subido correctamente"));
        } catch (IOException e) {
            System.err.println("❌ Error al subir archivo: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(new ErrorResponse("Error al subir archivo: " + e.getMessage()));
        } catch (Exception e) {
            System.err.println("❌ Error inesperado al subir archivo: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(new ErrorResponse("Error interno del servidor: " + e.getMessage()));
        }
    }

    /**
     * Sube una imagen desde Base64
     */
    @PostMapping("/upload-base64")
    public ResponseEntity<?> uploadBase64Image(@RequestBody Base64UploadRequest request) {
        try {
            String fileName = fileStorageService.storeBase64Image(request.getBase64Data(), request.getFileName());
            
            return ResponseEntity.ok().body(new UploadResponse(fileName, "Imagen subida correctamente"));
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Error al subir imagen: " + e.getMessage()));
        }
    }

    /**
     * Elimina un archivo
     */
    @DeleteMapping("/{fileName:.+}")
    public ResponseEntity<?> deleteFile(@PathVariable String fileName) {
        boolean deleted = fileStorageService.deleteFile(fileName);
        
        if (deleted) {
            return ResponseEntity.ok().body(new MessageResponse("Archivo eliminado correctamente"));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Clases de respuesta
    public static class UploadResponse {
        private String fileName;
        private String message;

        public UploadResponse(String fileName, String message) {
            this.fileName = fileName;
            this.message = message;
        }

        public String getFileName() { return fileName; }
        public void setFileName(String fileName) { this.fileName = fileName; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }

    public static class Base64UploadRequest {
        private String base64Data;
        private String fileName;

        public String getBase64Data() { return base64Data; }
        public void setBase64Data(String base64Data) { this.base64Data = base64Data; }
        public String getFileName() { return fileName; }
        public void setFileName(String fileName) { this.fileName = fileName; }
    }

    public static class ErrorResponse {
        private String error;

        public ErrorResponse(String error) {
            this.error = error;
        }

        public String getError() { return error; }
        public void setError(String error) { this.error = error; }
    }

    public static class MessageResponse {
        private String message;

        public MessageResponse(String message) {
            this.message = message;
        }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
}
