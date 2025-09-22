package com.pomelo.app.springboot.app.service;

import com.pomelo.app.springboot.app.entity.Cita;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Async;

import jakarta.mail.internet.MimeMessage;
import java.time.format.DateTimeFormatter;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Locale;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    /**
     * Método helper para formatear fechas con zona horaria de Madrid
     */
    private String formatearFechaConZonaHoraria(LocalDateTime fechaHora) {
        try {
            ZoneId zonaMadrid = ZoneId.of("Europe/Madrid");
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("EEEE, d 'de' MMMM 'de' yyyy 'a las' HH:mm", new Locale("es", "ES"))
                .withZone(zonaMadrid);
            return fechaHora.atZone(zonaMadrid).format(formatter);
        } catch (Exception e) {
            // Fallback a formato simple si falla el formateo complejo
            ZoneId zonaMadrid = ZoneId.of("Europe/Madrid");
            return fechaHora.atZone(zonaMadrid).format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
        }
    }

    @Async
    public void enviarConfirmacionCita(Cita cita) {
        try {
            // Verificar si el cliente tiene email
            if (cita.getCliente().getEmail() == null || cita.getCliente().getEmail().trim().isEmpty()) {
                System.out.println("⚠️ Cliente sin email - No se puede enviar confirmación por email");
                System.out.println("👤 Cliente: " + cita.getCliente().getNombre() + " (ID: " + cita.getCliente().getId() + ")");
                System.out.println("📅 Cita confirmada para: " + cita.getFechaHora());
                System.out.println("📋 Servicio: " + cita.getServicio().getNombre());
                System.out.println("ℹ️ La confirmación deberá ser gestionada manualmente por el administrador");
                return; // Salir sin enviar email
            }
            
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(cita.getCliente().getEmail());
            helper.setSubject("✅ Confirmación de Cita - Elemen");
            helper.setFrom("Elemen Barber <elemenbarber@gmail.com>");
            
            // Formatear fecha y hora con zona horaria de Madrid
            String fechaFormateada = formatearFechaConZonaHoraria(cita.getFechaHora());
            
            // Crear contenido HTML del email
            String htmlContent = crearEmailConfirmacionHTML(cita.getCliente().getNombre(), cita.getServicio().getNombre(), 
                                                         fechaFormateada, cita.getServicio().getDuracionMinutos(), 
                                                         cita.getServicio().getPrecio());
            
            helper.setText(htmlContent, true);
            mailSender.send(message);
            System.out.println("✅ Email de confirmación enviado a: " + cita.getCliente().getEmail());
            
        } catch (Exception e) {
            System.err.println("❌ Error al enviar email de confirmación: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Fallo enviando confirmación", e);
        }
    }

    @Async
    public void enviarRecordatorioCita(Cita cita) {
        try {
            System.out.println("📧 INICIANDO ENVÍO DE RECORDATORIO");
            System.out.println("👤 Cliente: " + cita.getCliente().getNombre());
            System.out.println("📧 Email destino: " + cita.getCliente().getEmail());
            System.out.println("📅 Fecha cita: " + cita.getFechaHora());
            System.out.println("📋 Servicio: " + cita.getServicio().getNombre());
            
            // Verificar si el cliente tiene email
            if (cita.getCliente().getEmail() == null || cita.getCliente().getEmail().trim().isEmpty()) {
                System.out.println("⚠️ Cliente sin email - No se puede enviar recordatorio por email");
                System.out.println("👤 Cliente: " + cita.getCliente().getNombre() + " (ID: " + cita.getCliente().getId() + ")");
                System.out.println("📅 Cita programada para: " + cita.getFechaHora());
                System.out.println("📋 Servicio: " + cita.getServicio().getNombre());
                System.out.println("ℹ️ El recordatorio deberá ser gestionado manualmente por el administrador");
                return; // Salir sin enviar email
            }
            
            // Verificar que mailSender esté disponible
            if (mailSender == null) {
                System.err.println("❌ ERROR: JavaMailSender no está disponible");
                throw new RuntimeException("JavaMailSender no está configurado");
            }
            
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(cita.getCliente().getEmail());
            helper.setSubject("⏰ Recordatorio de Cita - Elemen");
            helper.setFrom("Elemen Barber <elemenbarber@gmail.com>");
            
            // Formatear fecha y hora con zona horaria de Madrid
            String fechaFormateada = formatearFechaConZonaHoraria(cita.getFechaHora());
            
            System.out.println("📝 Fecha formateada: " + fechaFormateada);
            
            // Crear contenido HTML del email de recordatorio
            String htmlContent = crearEmailRecordatorioHTML(cita.getCliente().getNombre(), cita.getServicio().getNombre(), 
                                                         fechaFormateada, cita.getServicio().getDuracionMinutos(), 
                                                         cita.getServicio().getPrecio());
            
            System.out.println("📄 Contenido HTML generado correctamente");
            
            helper.setText(htmlContent, true);
            
            System.out.println("📤 Enviando email...");
            mailSender.send(message);
            System.out.println("✅ Email de recordatorio enviado exitosamente a: " + cita.getCliente().getEmail());
            
        } catch (Exception e) {
            System.err.println("❌ Error al enviar email de recordatorio: " + e.getMessage());
            System.err.println("🔍 Detalles del error:");
            e.printStackTrace();
            // Re-lanzar para que la capa superior decida si reintentar o marcar como no reenviar
            throw new RuntimeException("Fallo enviando recordatorio", e);
        }
    }



    @Async
    public void enviarCodigoVerificacion(String emailDestino, String nombreUsuario, String codigoVerificacion) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(emailDestino);
            helper.setSubject("🔐 Código de Verificación - Elemen");
            helper.setFrom("Elemen Barber <elemenbarber@gmail.com>");
            
            String htmlContent = crearEmailVerificacionHTML(nombreUsuario, codigoVerificacion);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            System.out.println("✅ Email de verificación enviado a: " + emailDestino);
            
        } catch (Exception e) {
            System.err.println("❌ Error al enviar email de verificación: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Fallo enviando verificación", e);
        }
    }

    @Async
    public void enviarRecuperacionContrasena(String emailDestino, String nombreUsuario, String resetToken) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(emailDestino);
            helper.setSubject("🔑 Recuperar Contraseña - Elemen");
            helper.setFrom("Elemen Barber <elemenbarber@gmail.com>");
            
            String htmlContent = crearEmailRecuperacionContrasenaHTML(nombreUsuario, resetToken);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            System.out.println("✅ Email de recuperación de contraseña enviado a: " + emailDestino);
            
        } catch (Exception e) {
            System.err.println("❌ Error al enviar email de recuperación de contraseña: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Fallo enviando recuperación", e);
        }
    }

    @Async
    public void enviarNotificacionCitaPeriodica(String emailDestino, String nombreCliente, String nombreServicio, 
                                               String fechaInicio, int periodicidadDias, int citasCreadas, 
                                               int citasOmitidas, int diasVacaciones) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(emailDestino);
            helper.setSubject("🔄 Cita Periódica Creada - Elemen");
            helper.setFrom("Elemen Barber <elemenbarber@gmail.com>");
            
            String htmlContent = crearEmailCitaPeriodicaHTML(nombreCliente, nombreServicio, fechaInicio, 
                                                           periodicidadDias, citasCreadas, citasOmitidas, diasVacaciones);
            
            helper.setText(htmlContent, true);
            mailSender.send(message);
            System.out.println("✅ Email de notificación de cita periódica enviado a: " + emailDestino);
            
        } catch (Exception e) {
            System.err.println("❌ Error al enviar email de notificación de cita periódica: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Fallo enviando notificación periódica", e);
        }
    }

    @Async
    public void enviarRecordatorioResena(String emailDestino, String nombreCliente, String nombreServicio, String reviewUrl) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(emailDestino);
            helper.setSubject("⭐ ¿Nos dejas tu reseña? - Elemen");
            helper.setFrom("Elemen Barber <elemenbarber@gmail.com>");

            String htmlContent = crearEmailRecordatorioResenaHTML(nombreCliente, nombreServicio, reviewUrl);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            System.out.println("✅ Email de recordatorio de reseña enviado a: " + emailDestino);
        } catch (Exception e) {
            System.err.println("❌ Error al enviar email de recordatorio de reseña: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Fallo enviando recordatorio de reseña", e);
        }
    }

    private String crearEmailRecordatorioResenaHTML(String nombreCliente, String nombreServicio, String reviewUrl) {
        return String.format("""
            <!DOCTYPE html>
            <html lang=\"es\">
            <head>
                <meta charset=\"UTF-8\">
                <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
                <title>Tu opinión nos importa</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background:#f4f4f4; margin:0; padding:0; }
                    .container { max-width:600px; margin:20px auto; background:#fff; border-radius:10px; box-shadow:0 4px 6px rgba(0,0,0,0.1); overflow:hidden; }
                    .header { background: linear-gradient(135deg, #2c3e50 0%%, #34495e 50%%, #1a1a1a 100%%); color:#fff; padding:30px; text-align:center; }
                    .content { padding: 30px; }
                    .cta { text-align:center; margin: 30px 0; }
                    .button { display:inline-block; padding:14px 24px; background:#1976d2; color:#fff !important; text-decoration:none; border-radius:8px; font-weight:700; }
                    .note { color:#6c757d; font-size:14px; text-align:center; }
                    .footer { background:#f8f9fa; padding:20px; text-align:center; border-top:1px solid #e9ecef; }
                </style>
            </head>
            <body>
                <div class=\"container\">
                    <div class=\"header\">
                        <img src=\"https://elemenbarber.com/logoElemental.png\" alt=\"Elemen\" style=\"width:80px; border-radius:8px;\">
                        <p>Tu opinión nos ayuda a mejorar</p>
                    </div>
                    <div class=\"content\">
                        <p>Hola %s,</p>
                        <p>Esperamos que hayas disfrutado de tu servicio de <strong>%s</strong>. ¿Podrías dejarnos una reseña? ¡Tardas menos de un minuto!</p>
                        <div class=\"cta\">
                            <a class=\"button\" href=\"%s\">⭐ Dejar reseña</a>
                        </div>
                        <p class=\"note\">Gracias por confiar en nosotros.</p>
                    </div>
                    <div class=\"footer\">
                        <div>+34 683 23 55 47 · elemenbarber@gmail.com</div>
                    </div>
                </div>
            </body>
            </html>
        """, nombreCliente, nombreServicio, reviewUrl);
    }

    private String crearEmailConfirmacionHTML(String nombreCliente, String nombreServicio, String fechaHora, int duracion, double precio) {
        return String.format("""
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Confirmación de Cita</title>
                <style>
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        max-width: 600px;
                        margin: 20px auto;
                        background: white;
                        border-radius: 10px;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        overflow: hidden;
                    }
                    .header {
                        background: linear-gradient(135deg, #2c3e50 0%%, #34495e 50%%, #1a1a1a 100%%);
                        color: white;
                        padding: 30px;
                        text-align: center;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 28px;
                        font-weight: 700;
                        text-transform: uppercase;
                        letter-spacing: 2px;
                    }
                    .header .logo {
                        width: 80px;
                        height: auto;
                        margin-bottom: 15px;
                        border-radius: 8px;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    }
                    .content {
                        padding: 40px 30px;
                    }
                    .greeting {
                        font-size: 20px;
                        color: #2c3e50;
                        margin-bottom: 20px;
                    }
                    .confirmation-message {
                        background: #d4edda;
                        border: 1px solid #c3e6cb;
                        border-radius: 8px;
                        padding: 20px;
                        margin: 20px 0;
                        color: #155724;
                    }
                    .appointment-details {
                        background: #f8f9fa;
                        border-radius: 8px;
                        padding: 30px;
                        margin: 25px 0;
                    }
                    .detail-row {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 15px 0;
                        border-bottom: 1px solid #e9ecef;
                        text-align: center;
                    }
                    .detail-row:last-child {
                        border-bottom: none;
                    }
                    .detail-label {
                        font-weight: 600;
                        color: #495057;
                        flex: 1;
                        text-align: left;
                        padding-right: 20px;
                    }
                    .detail-value {
                        color: #6c757d;
                        text-align: right;
                        flex: 1;
                        font-weight: 500;
                    }
                    .price {
                        font-size: 26px;
                        font-weight: bold;
                        color: #28a745;
                        text-align: center;
                        padding: 5px 0;
                    }
                    .footer {
                        background: #f8f9fa;
                        padding: 25px 30px;
                        text-align: center;
                        border-top: 1px solid #e9ecef;
                    }
                    .contact-info {
                        color: #6c757d;
                        font-size: 14px;
                        margin-top: 15px;
                    }
                    .footer-logo {
                        font-size: 24px;
                        font-weight: 700;
                        margin-bottom: 10px;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <img src="https://elemenbarber.com/logoElemental.png" alt="Elemen" class="logo">
                        <p>Tu cita ha sido confirmada</p>
                    </div>
                    
                    <div class="content">
                        <div class="greeting">Hola %s,</div>
                        
                        <div class="confirmation-message">
                            <strong>✅ Tu cita ha sido confirmada exitosamente</strong>
                        </div>
                        
                        <div class="appointment-details">
                            <h3 style="margin-top: 0; color: #2c3e50; font-weight: 700; font-size: 18px; text-transform: uppercase; letter-spacing: 1px;">Detalles de la cita</h3>
                            <div class="detail-row">
                                <span class="detail-label">Servicio:</span>
                                <span class="detail-value">%s</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Fecha y hora:</span>
                                <span class="detail-value">%s</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Duración:</span>
                                <span class="detail-value">%d minutos</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Precio:</span>
                                <span class="detail-value price">%.2f€</span>
                            </div>
                        </div>
                        
                        <p style="color: #6c757d; font-size: 14px;">
                            Si necesitas modificar o cancelar tu cita, por favor contacta con nosotros.
                        </p>
                    </div>
                    
                    <div class="footer">
                        <p>¡Gracias por elegir nuestros servicios!</p>
                        <div class="contact-info">
                            📞 Contacto: +34 683 23 55 47<br>
                            📧 Email: elemenbarber@gmail.com
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """, nombreCliente, nombreServicio, fechaHora, duracion, precio);
    }

    private String crearEmailRecordatorioHTML(String nombreCliente, String nombreServicio, String fechaHora, int duracion, double precio) {
        return String.format("""
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Recordatorio de Cita</title>
                <style>
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        max-width: 600px;
                        margin: 20px auto;
                        background: white;
                        border-radius: 10px;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        overflow: hidden;
                    }
                    .header {
                        background: linear-gradient(135deg, #2c3e50 0%%, #34495e 50%%, #1a1a1a 100%%);
                        color: white;
                        padding: 30px;
                        text-align: center;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 28px;
                        font-weight: 700;
                        text-transform: uppercase;
                        letter-spacing: 2px;
                    }
                    .header .logo {
                        width: 80px;
                        height: auto;
                        margin-bottom: 15px;
                        border-radius: 8px;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    }
                    .content {
                        padding: 40px 30px;
                    }
                    .greeting {
                        font-size: 20px;
                        color: #2c3e50;
                        margin-bottom: 20px;
                    }
                    .reminder-message {
                        background: #fff3cd;
                        border: 1px solid #ffeaa7;
                        border-radius: 8px;
                        padding: 20px;
                        margin: 20px 0;
                        color: #856404;
                    }
                    .appointment-details {
                        background: #f8f9fa;
                        border-radius: 8px;
                        padding: 30px;
                        margin: 25px 0;
                    }
                    .detail-row {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 15px 0;
                        border-bottom: 1px solid #e9ecef;
                        text-align: center;
                    }
                    .detail-row:last-child {
                        border-bottom: none;
                    }
                    .detail-label {
                        font-weight: 600;
                        color: #495057;
                        flex: 1;
                        text-align: left;
                        padding-right: 20px;
                    }
                    .detail-value {
                        color: #6c757d;
                        text-align: right;
                        flex: 1;
                        font-weight: 500;
                    }
                    .price {
                        font-size: 26px;
                        font-weight: bold;
                        color: #28a745;
                        text-align: center;
                        padding: 5px 0;
                    }
                    .footer {
                        background: #f8f9fa;
                        padding: 25px 30px;
                        text-align: center;
                        border-top: 1px solid #e9ecef;
                    }
                    .contact-info {
                        color: #6c757d;
                        font-size: 14px;
                        margin-top: 15px;
                    }
                    .footer-logo {
                        font-size: 24px;
                        font-weight: 700;
                        margin-bottom: 10px;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <img src="https://elemenbarber.com/logoElemental.png" alt="Elemen" class="logo">
                        <p>Recordatorio de tu cita</p>
                    </div>
                    
                    <div class="content">
                        <div class="greeting">Hola %s,</div>
                        
                        <div class="reminder-message">
                            <strong>⏰ Te recordamos que tienes una cita próximamente</strong>
                        </div>
                        
                        <div class="appointment-details">
                            <h3 style="margin-top: 0; color: #2c3e50; font-weight: 700; font-size: 18px; text-transform: uppercase; letter-spacing: 1px;">Detalles de la cita</h3>
                            <div class="detail-row">
                                <span class="detail-label">Servicio:</span>
                                <span class="detail-value">%s</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Fecha y hora:</span>
                                <span class="detail-value">%s</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Duración:</span>
                                <span class="detail-value">%d minutos</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Precio:</span>
                                <span class="detail-value price">%.2f€</span>
                            </div>
                        </div>
                        
                        <p style="color: #6c757d; font-size: 14px;">
                            <strong>Por favor, asegúrate de llegar 10 minutos antes de tu cita.</strong>
                        </p>
                    </div>
                    
                    <div class="footer">
                        <p>¡Te esperamos!</p>
                        <div class="contact-info">
                            📞 Contacto: +34 683 23 55 47<br>
                            📧 Email: elemenbarber@gmail.com
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """, nombreCliente, nombreServicio, fechaHora, duracion, precio);
    }



    private String crearEmailVerificacionHTML(String nombreUsuario, String codigoVerificacion) {
        return String.format("""
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Verificación de Email</title>
                <style>
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        max-width: 600px;
                        margin: 20px auto;
                        background: white;
                        border-radius: 10px;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        overflow: hidden;
                    }
                    .header {
                        background: linear-gradient(135deg, #2c3e50 0%%, #34495e 50%%, #1a1a1a 100%%);
                        color: white;
                        padding: 30px;
                        text-align: center;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 28px;
                        font-weight: 700;
                        text-transform: uppercase;
                        letter-spacing: 2px;
                    }
                    .header .logo {
                        width: 80px;
                        height: auto;
                        margin-bottom: 15px;
                        border-radius: 8px;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    }
                    .content {
                        padding: 40px 30px;
                    }
                    .greeting {
                        font-size: 20px;
                        color: #2c3e50;
                        margin-bottom: 20px;
                    }
                    .verification-message {
                        background: #e3f2fd;
                        border: 1px solid #bbdefb;
                        border-radius: 8px;
                        padding: 20px;
                        margin: 20px 0;
                        color: #1565c0;
                        text-align: center;
                    }
                    .verification-code {
                        font-size: 32px;
                        font-weight: bold;
                        color: #1976d2;
                        background: #f5f5f5;
                        padding: 15px;
                        border-radius: 8px;
                        margin: 20px 0;
                        letter-spacing: 5px;
                        text-align: center;
                        border: 2px dashed #1976d2;
                    }
                    .warning {
                        background: #fff3e0;
                        border: 1px solid #ffcc02;
                        border-radius: 8px;
                        padding: 15px;
                        margin: 20px 0;
                        color: #e65100;
                        font-size: 14px;
                    }
                    .footer {
                        background: #f8f9fa;
                        padding: 25px 30px;
                        text-align: center;
                        border-top: 1px solid #e9ecef;
                    }
                    .footer-logo {
                        font-size: 24px;
                        font-weight: 700;
                        margin-bottom: 10px;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <img src="https://elemenbarber.com/logoElemental.png" alt="Elemen" class="logo">
                        <p>Verificación de tu cuenta</p>
                    </div>
                    
                    <div class="content">
                        <div class="greeting">Hola %s,</div>
                        
                        <div class="verification-message">
                            <strong>🔐 Verifica tu dirección de email</strong>
                        </div>
                        
                        <p>Para completar tu registro en Elemen, necesitamos verificar tu dirección de email.</p>
                        
                        <p>Tu código de verificación es:</p>
                        
                        <div class="verification-code">%s</div>
                        
                        <div class="warning">
                            <strong>⚠️ Importante:</strong>
                            <ul style="margin: 10px 0; padding-left: 20px;">
                                <li>Este código expira en 10 minutos</li>
                                <li>No compartas este código con nadie</li>
                                <li>Si no solicitaste este código, ignora este email</li>
                            </ul>
                        </div>
                        
                        <p style="color: #6c757d; font-size: 14px;">
                            Si tienes problemas para verificar tu cuenta, contacta con nuestro soporte.
                        </p>
                    </div>
                    
                    <div class="footer">
                        <p>¡Gracias por registrarte!</p>
                        <div class="contact-info">
                            📞 Contacto: +34 683 23 55 47<br>
                            📧 Email: elemenbarber@gmail.com
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """, nombreUsuario, codigoVerificacion);
    }

    private String crearEmailRecuperacionContrasenaHTML(String nombreUsuario, String resetToken) {
        return String.format("""
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Recuperación de Contraseña</title>
                <style>
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        max-width: 600px;
                        margin: 20px auto;
                        background: white;
                        border-radius: 10px;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        overflow: hidden;
                    }
                    .header {
                        background: linear-gradient(135deg, #2c3e50 0%%, #34495e 50%%, #1a1a1a 100%%);
                        color: white;
                        padding: 30px;
                        text-align: center;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 28px;
                        font-weight: 700;
                        text-transform: uppercase;
                        letter-spacing: 2px;
                    }
                    .header .logo {
                        width: 80px;
                        height: auto;
                        margin-bottom: 15px;
                        border-radius: 8px;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    }
                    .content {
                        padding: 40px 30px;
                    }
                    .greeting {
                        font-size: 20px;
                        color: #2c3e50;
                        margin-bottom: 20px;
                    }
                    .reset-password-message {
                        background: #e3f2fd;
                        border: 1px solid #bbdefb;
                        border-radius: 8px;
                        padding: 20px;
                        margin: 20px 0;
                        color: #1565c0;
                        text-align: center;
                    }
                    .reset-password-code {
                        font-size: 32px;
                        font-weight: bold;
                        color: #1976d2;
                        background: #f5f5f5;
                        padding: 15px;
                        border-radius: 8px;
                        margin: 20px 0;
                        letter-spacing: 5px;
                        text-align: center;
                        border: 2px dashed #1976d2;
                    }
                    .warning {
                        background: #fff3e0;
                        border: 1px solid #ffcc02;
                        border-radius: 8px;
                        padding: 15px;
                        margin: 20px 0;
                        color: #e65100;
                        font-size: 14px;
                    }
                    .footer {
                        background: #f8f9fa;
                        padding: 25px 30px;
                        text-align: center;
                        border-top: 1px solid #e9ecef;
                    }
                    .footer-logo {
                        font-size: 24px;
                        font-weight: 700;
                        margin-bottom: 10px;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <img src="https://elemenbarber.com/logoElemental.png" alt="Elemen" class="logo">
                        <p>Recuperación de Contraseña</p>
                    </div>
                    
                    <div class="content">
                        <div class="greeting">Hola %s,</div>
                        
                        <div class="reset-password-message">
                            <strong>🔑 Recupera tu contraseña</strong>
                        </div>
                        
                        <p>Hemos recibido una solicitud para recuperar tu contraseña para tu cuenta de Elemen.</p>
                        
                        <p>Para cambiar tu contraseña, haz clic en el siguiente enlace:</p>
                        
                                                 <div style="text-align: center; margin: 30px 0;">
                             <a href="https://elemenbarber.com/reset-password/%s" 
                                style="display: inline-block; 
                                       background: #1976d2; 
                                       color: white; 
                                       padding: 15px 30px; 
                                       text-decoration: none; 
                                       border-radius: 8px; 
                                       font-weight: bold; 
                                       font-size: 16px;">
                                 🔑 Restablecer Contraseña
                             </a>
                         </div>
                         
                         <p style="color: #666; font-size: 14px; text-align: center;">
                             O copia y pega este enlace en tu navegador:<br>
                             <span style="color: #1976d2; word-break: break-all;">https://elemenbarber.com/reset-password/%s</span>
                         </p>
                        
                        <div class="warning">
                            <strong>⚠️ Importante:</strong>
                            <ul style="margin: 10px 0; padding-left: 20px;">
                                <li>Este enlace expira en 1 hora</li>
                                <li>Si no solicitaste esta recuperación, ignora este email</li>
                            </ul>
                        </div>
                        
                        <p style="color: #6c757d; font-size: 14px;">
                            Si tienes problemas para acceder a tu cuenta, contacta con nuestro soporte.
                        </p>
                    </div>
                    
                    <div class="footer">
                        <p>¡Gracias por ser parte de Elemen!</p>
                        <div class="contact-info">
                            📞 Contacto: +34 683 23 55 47<br>
                            📧 Email: elemenbarber@gmail.com
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """, nombreUsuario, resetToken, resetToken);
    }

    private String crearEmailCitaPeriodicaHTML(String nombreCliente, String nombreServicio, String fechaInicio, 
                                             int periodicidadDias, int citasCreadas, int citasOmitidas, int diasVacaciones) {
        return String.format("""
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Cita Periódica Creada</title>
                <style>
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        max-width: 600px;
                        margin: 20px auto;
                        background: white;
                        border-radius: 10px;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        overflow: hidden;
                    }
                    .header {
                        background: linear-gradient(135deg, #9c27b0 0%%, #7b1fa2 50%%, #4a148c 100%%);
                        color: white;
                        padding: 30px;
                        text-align: center;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 28px;
                        font-weight: 700;
                        text-transform: uppercase;
                        letter-spacing: 2px;
                    }
                    .header .logo {
                        width: 80px;
                        height: auto;
                        margin-bottom: 15px;
                        border-radius: 8px;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    }
                    .content {
                        padding: 40px 30px;
                    }
                    .greeting {
                        font-size: 20px;
                        color: #2c3e50;
                        margin-bottom: 20px;
                    }
                    .success-message {
                        background: #d4edda;
                        border: 1px solid #c3e6cb;
                        border-radius: 8px;
                        padding: 20px;
                        margin: 20px 0;
                        color: #155724;
                    }
                    .periodic-details {
                        background: #f8f9fa;
                        border-radius: 8px;
                        padding: 30px;
                        margin: 25px 0;
                    }
                    .detail-row {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 15px 0;
                        border-bottom: 1px solid #e9ecef;
                        text-align: center;
                    }
                    .detail-row:last-child {
                        border-bottom: none;
                    }
                    .detail-label {
                        font-weight: 600;
                        color: #2c3e50;
                        flex: 1;
                    }
                    .detail-value {
                        font-weight: 700;
                        color: #9c27b0;
                        flex: 1;
                    }
                    .stats-container {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                        gap: 15px;
                        margin: 25px 0;
                    }
                    .stat-card {
                        background: white;
                        border-radius: 8px;
                        padding: 20px;
                        text-align: center;
                        border: 2px solid #e9ecef;
                        transition: all 0.3s ease;
                    }
                    .stat-card:hover {
                        border-color: #9c27b0;
                        transform: translateY(-2px);
                    }
                    .stat-number {
                        font-size: 32px;
                        font-weight: 700;
                        color: #9c27b0;
                        margin-bottom: 5px;
                    }
                    .stat-label {
                        font-size: 14px;
                        color: #666;
                        font-weight: 600;
                    }
                    .info-section {
                        background: #e3f2fd;
                        border: 1px solid #bbdefb;
                        border-radius: 8px;
                        padding: 20px;
                        margin: 20px 0;
                        color: #1565c0;
                    }
                    .warning-section {
                        background: #fff3e0;
                        border: 1px solid #ffcc02;
                        border-radius: 8px;
                        padding: 20px;
                        margin: 20px 0;
                        color: #e65100;
                    }
                    .footer {
                        background: #f8f9fa;
                        padding: 25px 30px;
                        text-align: center;
                        border-top: 1px solid #e9ecef;
                    }
                    .footer-logo {
                        font-size: 24px;
                        font-weight: 700;
                        margin-bottom: 10px;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <img src="https://elemenbarber.com/logoElemental.png" alt="Elemen" class="logo">
                        <p>🔄 Cita Periódica Creada</p>
                    </div>
                    
                    <div class="content">
                        <div class="greeting">¡Hola %s!</div>
                        
                        <div class="success-message">
                            <strong>✅ Tu cita periódica ha sido creada exitosamente</strong>
                        </div>
                        
                        <p>Te confirmamos que hemos creado tu cita periódica con los siguientes detalles:</p>
                        
                        <div class="periodic-details">
                            <div class="detail-row">
                                <span class="detail-label">Servicio:</span>
                                <span class="detail-value">%s</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Fecha de inicio:</span>
                                <span class="detail-value">%s</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Periodicidad:</span>
                                <span class="detail-value">Cada %d días</span>
                            </div>
                        </div>
                        
                        <div class="stats-container">
                            <div class="stat-card">
                                <div class="stat-number">%d</div>
                                <div class="stat-label">Citas Creadas</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-number">%d</div>
                                <div class="stat-label">Citas Omitidas</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-number">%d</div>
                                <div class="stat-label">Días Vacaciones</div>
                            </div>
                        </div>
                        
                        <div class="info-section">
                            <strong>📅 Información importante:</strong>
                            <ul style="margin: 10px 0; padding-left: 20px;">
                                <li>Las citas se crean automáticamente cada %d días</li>
                                <li>Se omiten automáticamente los días de vacaciones</li>
                                <li>Se omiten las fechas donde no hay disponibilidad</li>
                                <li>Recibirás recordatorios por email antes de cada cita</li>
                            </ul>
                        </div>
                        
                        %s
                        
                        <p style="color: #6c757d; font-size: 14px;">
                            Si necesitas modificar o cancelar tu cita periódica, contacta con nosotros.
                        </p>
                    </div>
                    
                    <div class="footer">
                        <p>¡Gracias por confiar en Elemen!</p>
                        <div class="contact-info">
                            📞 Contacto: +34 683 23 55 47<br>
                            📧 Email: elemenbarber@gmail.com
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """, nombreCliente, nombreServicio, fechaInicio, periodicidadDias, 
                 citasCreadas, citasOmitidas, diasVacaciones, periodicidadDias,
                 citasOmitidas > 0 ? """
                        <div class="warning-section">
                            <strong>⚠️ Nota:</strong>
                            <p>Algunas citas no se pudieron crear debido a horarios ocupados. El sistema continuará creando citas en las fechas disponibles.</p>
                        </div>
                        """ : "");
    }

    @Async
    public void enviarCancelacionCita(String emailCliente, String nombreCliente, String nombreServicio, 
                                     LocalDateTime fechaHora, int duracionMinutos, double precio) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(emailCliente);
            helper.setSubject("❌ Cita Cancelada - Elemen");
            helper.setFrom("Elemen Barber <elemenbarber@gmail.com>");
            
            // Formatear fecha y hora con zona horaria de Madrid
            String fechaFormateada = formatearFechaConZonaHoraria(fechaHora);
            
            // Crear contenido HTML del email de cancelación
            String htmlContent = crearEmailCancelacionHTML(nombreCliente, nombreServicio, 
                                                        fechaFormateada, duracionMinutos, precio);
            
            helper.setText(htmlContent, true);
            mailSender.send(message);
            System.out.println("✅ Email de cancelación enviado a: " + emailCliente);
            
        } catch (Exception e) {
            System.err.println("❌ Error al enviar email de cancelación: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Fallo enviando cancelación", e);
        }
    }

    @Async
    public void enviarCancelacionCitaPeriodica(String emailCliente, String nombreCliente, String nombreServicio, 
                                              int periodicidadDias, int totalCitasCanceladas) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(emailCliente);
            helper.setSubject("🔄 Cita Periódica Cancelada - Elemen");
            helper.setFrom("Elemen Barber <elemenbarber@gmail.com>");
            
            // Crear contenido HTML del email de cancelación de cita periódica
            String htmlContent = crearEmailCancelacionPeriodicaHTML(nombreCliente, nombreServicio, 
                                                                  periodicidadDias, totalCitasCanceladas);
            
            helper.setText(htmlContent, true);
            mailSender.send(message);
            System.out.println("✅ Email de cancelación de cita periódica enviado a: " + emailCliente);
            
        } catch (Exception e) {
            System.err.println("❌ Error al enviar email de cancelación de cita periódica: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Fallo enviando cancelación periódica", e);
        }
    }

    private String crearEmailCancelacionHTML(String nombreCliente, String nombreServicio, 
                                           String fechaFormateada, int duracionMinutos, double precio) {
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html>");
        html.append("<html lang=\"es\">");
        html.append("<head>");
        html.append("<meta charset=\"UTF-8\">");
        html.append("<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">");
        html.append("<title>Cita Cancelada - Elemen</title>");
        html.append("<style>");
        html.append("body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }");
        html.append(".container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }");
        html.append(".header { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; text-align: center; padding: 30px 20px; }");
        html.append(".logo { width: 80px; height: 80px; border-radius: 50%; margin-bottom: 15px; }");
        html.append(".header h1 { margin: 0; font-size: 28px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }");
        html.append(".header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.9; }");
        html.append(".content { padding: 40px 30px; }");
        html.append(".greeting { font-size: 20px; font-weight: 600; margin-bottom: 25px; color: #2c3e50; }");
        html.append(".cancellation-message { background: #fff5f5; border: 1px solid #fed7d7; border-radius: 8px; padding: 20px; margin-bottom: 25px; text-align: center; }");
        html.append(".cancellation-message strong { color: #c53030; font-size: 18px; }");
        html.append(".cita-details { background: #f8f9fa; border-radius: 8px; padding: 25px; margin-bottom: 25px; }");
        html.append(".detail-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #e9ecef; }");
        html.append(".detail-row:last-child { border-bottom: none; }");
        html.append(".detail-label { font-weight: 600; color: #495057; min-width: 120px; }");
        html.append(".detail-value { color: #6c757d; text-align: right; }");
        html.append(".price-value { color: #28a745; font-weight: 700; font-size: 18px; }");
        html.append(".info-section { background: #e3f2fd; border: 1px solid #bbdefb; border-radius: 8px; padding: 20px; margin-bottom: 25px; }");
        html.append(".info-section strong { color: #1976d2; display: block; margin-bottom: 10px; }");
        html.append(".info-section ul { margin: 10px 0; padding-left: 20px; }");
        html.append(".info-section li { margin-bottom: 8px; color: #1565c0; }");
        html.append(".footer { background: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #e9ecef; }");
        html.append(".footer-logo { font-size: 24px; font-weight: 700; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px; }");
        html.append(".contact-info { margin-top: 15px; color: #6c757d; font-size: 14px; line-height: 1.5; }");
        html.append("</style>");
        html.append("</head>");
        html.append("<body>");
        html.append("<div class=\"container\">");
        html.append("<div class=\"header\">");
        html.append("<img src=\"https://elemenbarber.com/logoElemental.png\" alt=\"Elemen\" class=\"logo\">");
        html.append("<p>❌ Cita Cancelada</p>");
        html.append("</div>");
        html.append("<div class=\"content\">");
        html.append("<div class=\"greeting\">¡Hola ").append(nombreCliente).append("!</div>");
        html.append("<div class=\"cancellation-message\">");
        html.append("<strong>❌ Tu cita ha sido cancelada</strong>");
        html.append("</div>");
        html.append("<p>Te informamos que tu cita ha sido cancelada. Aquí tienes los detalles de la cita cancelada:</p>");
        html.append("<div class=\"cita-details\">");
        html.append("<div class=\"detail-row\">");
        html.append("<span class=\"detail-label\">Servicio:</span>");
        html.append("<span class=\"detail-value\">").append(nombreServicio).append("</span>");
        html.append("</div>");
        html.append("<div class=\"detail-row\">");
        html.append("<span class=\"detail-label\">Fecha y Hora:</span>");
        html.append("<span class=\"detail-value\">").append(fechaFormateada).append("</span>");
        html.append("</div>");
        html.append("<div class=\"detail-row\">");
        html.append("<span class=\"detail-label\">Duración:</span>");
        html.append("<span class=\"detail-value\">").append(duracionMinutos).append(" minutos</span>");
        html.append("</div>");
        html.append("<div class=\"detail-row\">");
        html.append("<span class=\"detail-label\">Precio:</span>");
        html.append("<span class=\"detail-value price-value\">").append(String.format("%.2f", precio)).append(" euros</span>");
        html.append("</div>");
        html.append("</div>");
        html.append("<div class=\"info-section\">");
        html.append("<strong>📋 Información importante:</strong>");
        html.append("<ul>");
        html.append("<li>Tu cita ha sido cancelada exitosamente</li>");
        html.append("<li>No se te cobrará ningún cargo por la cancelación</li>");
        html.append("<li>Puedes reservar una nueva cita cuando lo desees</li>");
        html.append("<li>Si tienes alguna pregunta, no dudes en contactarnos</li>");
        html.append("</ul>");
        html.append("</div>");
        html.append("<p style=\"color: #6c757d; font-size: 14px;\">");
        html.append("Para reservar una nueva cita, visita nuestra aplicación o contacta con nosotros directamente.");
        html.append("</p>");
        html.append("</div>");
        html.append("<div class=\"footer\">");
        html.append("<p>¡Gracias por tu comprensión!</p>");
        html.append("<div class=\"contact-info\">");
        html.append("📞 Contacto: +34 683 23 55 47<br>");
        html.append("📧 Email: elemenbarber@gmail.com");
        html.append("</div>");
        html.append("</div>");
        html.append("</div>");
        html.append("</body>");
        html.append("</html>");
        
        return html.toString();
    }

    private String crearEmailCancelacionPeriodicaHTML(String nombreCliente, String nombreServicio, 
                                                     int periodicidadDias, int totalCitasCanceladas) {
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html>");
        html.append("<html lang=\"es\">");
        html.append("<head>");
        html.append("<meta charset=\"UTF-8\">");
        html.append("<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">");
        html.append("<title>Cita Periódica Cancelada - Elemen</title>");
        html.append("<style>");
        html.append("body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }");
        html.append(".container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden; }");
        html.append(".header { background: linear-gradient(135deg, #dc3545 0%, #c82333 50%, #a71e2a 100%); color: white; padding: 30px; text-align: center; }");
        html.append(".header h1 { margin: 0; font-size: 28px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; }");
        html.append(".header .logo { width: 80px; height: auto; margin-bottom: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }");
        html.append(".content { padding: 40px 30px; }");
        html.append(".greeting { font-size: 20px; color: #2c3e50; margin-bottom: 20px; }");
        html.append(".cancellation-message { background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 20px; margin: 20px 0; color: #721c24; text-align: center; }");
        html.append(".periodic-details { background: #f8f9fa; border-radius: 8px; padding: 30px; margin: 25px 0; }");
        html.append(".detail-row { display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 1px solid #e9ecef; text-align: center; }");
        html.append(".detail-row:last-child { border-bottom: none; }");
        html.append(".detail-label { font-weight: 600; color: #495057; flex: 1; text-align: left; padding-right: 20px; }");
        html.append(".detail-value { color: #6c757d; text-align: right; flex: 1; font-weight: 500; }");
        html.append(".stats-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin: 25px 0; }");
        html.append(".stat-card { background: white; border-radius: 8px; padding: 20px; text-align: center; border: 2px solid #e9ecef; transition: all 0.3s ease; }");
        html.append(".stat-card:hover { border-color: #dc3545; transform: translateY(-2px); }");
        html.append(".stat-number { font-size: 32px; font-weight: 700; color: #dc3545; margin-bottom: 5px; }");
        html.append(".stat-label { font-size: 14px; color: #666; font-weight: 600; }");
        html.append(".info-section { background: #e3f2fd; border: 1px solid #bbdefb; border-radius: 8px; padding: 20px; margin-bottom: 25px; }");
        html.append(".info-section strong { color: #1976d2; display: block; margin-bottom: 10px; }");
        html.append(".info-section ul { margin: 10px 0; padding-left: 20px; }");
        html.append(".info-section li { margin-bottom: 8px; color: #1565c0; }");
        html.append(".footer { background: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #e9ecef; }");
        html.append(".footer-logo { font-size: 24px; font-weight: 700; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px; }");
        html.append(".contact-info { color: #6c757d; font-size: 14px; margin-top: 15px; }");
        html.append("</style>");
        html.append("</head>");
        html.append("<body>");
        html.append("<div class=\"container\">");
        html.append("<div class=\"header\">");
        html.append("<img src=\"https://elemenbarber.com/logoElemental.png\" alt=\"Elemen\" class=\"logo\">");
        html.append("<p>🔄 Cita Periódica Cancelada</p>");
        html.append("</div>");
        html.append("<div class=\"content\">");
        html.append("<div class=\"greeting\">Hola ").append(nombreCliente).append(",</div>");
        html.append("<div class=\"cancellation-message\"><strong>🔄 Tu cita periódica ha sido cancelada exitosamente</strong></div>");
        html.append("<div class=\"periodic-details\">");
        html.append("<h3 style=\"margin-top: 0; color: #2c3e50; font-weight: 700; font-size: 18px; text-transform: uppercase; letter-spacing: 1px;\">Detalles de la cancelación</h3>");
        html.append("<div class=\"detail-row\"><span class=\"detail-label\">Servicio:</span><span class=\"detail-value\">").append(nombreServicio).append("</span></div>");
        html.append("<div class=\"detail-row\"><span class=\"detail-label\">Periodicidad:</span><span class=\"detail-value\">Cada ").append(periodicidadDias).append(" días</span></div>");
        html.append("</div>");
        html.append("<div class=\"stats-container\">");
        html.append("<div class=\"stat-card\"><div class=\"stat-number\">").append(totalCitasCanceladas).append("</div><div class=\"stat-label\">Citas Canceladas</div></div>");
        html.append("</div>");
        html.append("<div class=\"info-section\"><strong>📋 Información importante:</strong><ul>");
        html.append("<li>Todas las citas periódicas han sido canceladas</li>");
        html.append("<li>No se te cobrará ningún cargo por la cancelación</li>");
        html.append("<li>Puedes crear una nueva cita periódica cuando lo desees</li>");
        html.append("<li>Si tienes alguna pregunta, no dudes en contactarnos</li>");
        html.append("</ul></div>");
        html.append("<p style=\"color: #6c757d; font-size: 14px;\">Para crear una nueva cita periódica, visita nuestra aplicación o contacta con nosotros directamente.</p>");
        html.append("</div>");
        html.append("<div class=\"footer\"><p>¡Gracias por tu comprensión!</p><div class=\"contact-info\">📞 Contacto: +34 683 23 55 47<br>📧 Email: elemenbarber@gmail.com</div></div>");
        html.append("</div>");
        html.append("</body>");
        html.append("</html>");
        return html.toString();
    }
} 