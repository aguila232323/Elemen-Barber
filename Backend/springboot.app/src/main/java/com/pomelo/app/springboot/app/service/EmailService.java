package com.pomelo.app.springboot.app.service;

import com.pomelo.app.springboot.app.entity.Cita;
import com.pomelo.app.springboot.app.entity.Usuario;
import com.pomelo.app.springboot.app.entity.Servicio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Async;

import jakarta.mail.internet.MimeMessage;
import jakarta.mail.MessagingException;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Async
    public void enviarConfirmacionCita(Cita cita) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(cita.getCliente().getEmail());
            helper.setSubject("✅ Confirmación de Cita - Elemen");
            helper.setFrom("Elemen Barber <elemenbarber@gmail.com>");
            
            // Formatear fecha y hora de forma segura
            String fechaFormateada;
            try {
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("EEEE, d 'de' MMMM 'de' yyyy 'a las' HH:mm", new Locale("es", "ES"));
                fechaFormateada = cita.getFechaHora().format(formatter);
            } catch (Exception e) {
                // Fallback a formato simple si falla el formateo complejo
                fechaFormateada = cita.getFechaHora().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
            }
            
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
        }
    }

    @Async
    public void enviarRecordatorioCita(Cita cita) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(cita.getCliente().getEmail());
            helper.setSubject("⏰ Recordatorio de Cita - Elemen");
            helper.setFrom("Elemen Barber <elemenbarber@gmail.com>");
            
            // Formatear fecha y hora de forma segura
            String fechaFormateada;
            try {
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("EEEE, d 'de' MMMM 'de' yyyy 'a las' HH:mm", new Locale("es", "ES"));
                fechaFormateada = cita.getFechaHora().format(formatter);
            } catch (Exception e) {
                // Fallback a formato simple si falla el formateo complejo
                fechaFormateada = cita.getFechaHora().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
            }
            
            // Crear contenido HTML del email de recordatorio
            String htmlContent = crearEmailRecordatorioHTML(cita.getCliente().getNombre(), cita.getServicio().getNombre(), 
                                                         fechaFormateada, cita.getServicio().getDuracionMinutos(), 
                                                         cita.getServicio().getPrecio());
            
            helper.setText(htmlContent, true);
            mailSender.send(message);
            System.out.println("✅ Email de recordatorio enviado a: " + cita.getCliente().getEmail());
            
        } catch (Exception e) {
            System.err.println("❌ Error al enviar email de recordatorio: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Async
    public void enviarEmailPrueba(String emailDestino) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(emailDestino);
            helper.setSubject("🧪 Prueba de Email - Elemen");
            helper.setFrom("Elemen Barber <elemenbarber@gmail.com>");
            
            String htmlContent = crearEmailPruebaHTML();
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            System.out.println("✅ Email de prueba enviado a: " + emailDestino);
            
        } catch (MessagingException e) {
            System.err.println("❌ Error al enviar email de prueba: " + e.getMessage());
            throw new RuntimeException("Error al enviar email de prueba", e);
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
        }
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
                        <img src="https://esentialbarber.com/logoElemental.png" alt="Elemen" class="logo">
                        <h1>Elemen</h1>
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
                        <div class="footer-logo">Elemen</div>
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
                        <img src="https://esentialbarber.com/logoElemental.png" alt="Elemen" class="logo">
                        <h1>Elemen</h1>
                        <p>Recordatorio de tu cita</p>
                    </div>
                    
                    <div class="content">
                        <div class="greeting">Hola %s,</div>
                        
                        <div class="reminder-message">
                            <strong>⏰ Te recordamos que tienes una cita programada para mañana</strong>
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
                        <div class="footer-logo">Elemen</div>
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

    private String crearEmailPruebaHTML() {
        return """
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Prueba de Email</title>
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
                    .success-message {
                        background: #d4edda;
                        border: 1px solid #c3e6cb;
                        border-radius: 8px;
                        padding: 20px;
                        margin: 20px 0;
                        color: #155724;
                        text-align: center;
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
                        <img src="https://esentialbarber.com/logoElemental.png" alt="Elemen" class="logo">
                        <h1>Elemen</h1>
                        <p>Prueba de Email</p>
                    </div>
                    
                    <div class="content">
                        <div class="success-message">
                            <strong>✅ ¡Sistema de correo funcionando correctamente!</strong>
                        </div>
                        
                        <p>Este es un email de prueba para verificar que el sistema de correo funciona correctamente.</p>
                        
                        <p>Si recibes este email, significa que:</p>
                        <ul>
                            <li>✅ La configuración SMTP está funcionando</li>
                            <li>✅ Los emails se envían correctamente</li>
                            <li>✅ El formato HTML se renderiza bien</li>
                            <li>✅ El sistema está listo para producción</li>
                        </ul>
                    </div>
                    
                    <div class="footer">
                        <div class="footer-logo">Elemen</div>
                        <p>¡Gracias por probar nuestro sistema!</p>
                    </div>
                </div>
            </body>
            </html>
            """;
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
                        <img src="https://esentialbarber.com/logoElemental.png" alt="Elemen" class="logo">
                        <h1>Elemen</h1>
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
                        <div class="footer-logo">Elemen</div>
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
                        <img src="https://esentialbarber.com/logoElemental.png" alt="Elemen" class="logo">
                        <h1>Elemen</h1>
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
                            <a href="http://localhost:3000/reset-password/%s" 
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
                            <span style="color: #1976d2; word-break: break-all;">http://localhost:3000/reset-password/%s</span>
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
                        <div class="footer-logo">Elemen</div>
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
                        <img src="https://esentialbarber.com/logoElemental.png" alt="Elemen" class="logo">
                        <h1>Elemen</h1>
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
                        <div class="footer-logo">Elemen</div>
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
} 