package com.pomelo.app.springboot.app.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.model.Event;
import com.google.api.services.calendar.model.EventDateTime;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.pomelo.app.springboot.app.entity.Cita;
import com.pomelo.app.springboot.app.entity.Usuario;
import com.pomelo.app.springboot.app.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Date;

@Service
public class GoogleCalendarService {

    @Value("${google.client.id}")
    private String googleClientId;

    @Value("${google.client.secret}")
    private String googleClientSecret;

    @Value("${admin.email:elemenbarber@gmail.com}")
    private String adminEmail;

    @Value("${admin.google.calendar.enabled:true}")
    private boolean adminCalendarEnabled;

    private static final String APPLICATION_NAME = "Esential Barber";
    private static NetHttpTransport HTTP_TRANSPORT;
    private static final GsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();
    private static boolean HTTP_TRANSPORT_INITIALIZED = false;

    private final UsuarioRepository usuarioRepository;

    public GoogleCalendarService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    private synchronized NetHttpTransport getHttpTransport() {
        if (!HTTP_TRANSPORT_INITIALIZED) {
            try {
                System.out.println("🔧 Iniciando Google HTTP Transport...");
                HTTP_TRANSPORT = GoogleNetHttpTransport.newTrustedTransport();
                System.out.println("✅ Google HTTP Transport inicializado correctamente");
                HTTP_TRANSPORT_INITIALIZED = true;
            } catch (GeneralSecurityException e) {
                System.err.println("❌ Error de seguridad inicializando Google HTTP Transport: " + e.getMessage());
                e.printStackTrace();
                HTTP_TRANSPORT = null;
                HTTP_TRANSPORT_INITIALIZED = true;
            } catch (IOException e) {
                System.err.println("❌ Error de I/O inicializando Google HTTP Transport: " + e.getMessage());
                e.printStackTrace();
                HTTP_TRANSPORT = null;
                HTTP_TRANSPORT_INITIALIZED = true;
            } catch (Exception e) {
                System.err.println("❌ Error inesperado inicializando Google HTTP Transport: " + e.getMessage());
                e.printStackTrace();
                HTTP_TRANSPORT = null;
                HTTP_TRANSPORT_INITIALIZED = true;
            }
        }
        return HTTP_TRANSPORT;
    }

    /**
     * Verifica si un usuario es un usuario de Google (tiene contraseña GOOGLE_AUTH)
     */
    public boolean isGoogleUser(Usuario usuario) {
        boolean isGoogle = "GOOGLE_AUTH".equals(usuario.getPassword());
        System.out.println("🔍 DEBUG isGoogleUser para " + usuario.getEmail() + ":");
        System.out.println("   - Password: " + usuario.getPassword());
        System.out.println("   - isGoogle: " + isGoogle);
        return isGoogle;
    }

    /**
     * Verifica si un usuario tiene autorización para Google Calendar
     */
    public boolean isCalendarAuthorized(Usuario usuario) {
        boolean hasToken = usuario.getGoogleCalendarToken() != null && !usuario.getGoogleCalendarToken().isEmpty();
        boolean hasRefreshToken = usuario.getGoogleCalendarRefreshToken() != null && !usuario.getGoogleCalendarRefreshToken().isEmpty();
        boolean tokenNotExpired = usuario.getGoogleCalendarTokenExpiry() == null || 
                                 usuario.getGoogleCalendarTokenExpiry().isAfter(LocalDateTime.now());
        
        System.out.println("🔍 DEBUG isCalendarAuthorized para " + usuario.getEmail() + ":");
        System.out.println("   - Google Calendar Token: " + (usuario.getGoogleCalendarToken() != null ? "SÍ" : "NO"));
        System.out.println("   - Google Calendar Refresh Token: " + (usuario.getGoogleCalendarRefreshToken() != null ? "SÍ" : "NO"));
        System.out.println("   - Token Expiry: " + usuario.getGoogleCalendarTokenExpiry());
        System.out.println("   - Current Time: " + LocalDateTime.now());
        System.out.println("   - Token Not Expired: " + tokenNotExpired);
        System.out.println("   - Has Token: " + hasToken);
        System.out.println("   - Has Refresh Token: " + hasRefreshToken);
        System.out.println("   - Is Authorized: " + (hasToken && tokenNotExpired));
        
        return hasToken && tokenNotExpired;
    }

    /**
     * Guarda los tokens de Google Calendar para un usuario
     */
    public void saveCalendarTokens(Usuario usuario, String accessToken, String refreshToken, LocalDateTime expiry) {
        System.out.println("💾 Guardando tokens de Calendar para usuario: " + usuario.getEmail());
        System.out.println("   - Access Token: " + (accessToken != null ? "SÍ" : "NO"));
        System.out.println("   - Refresh Token: " + (refreshToken != null ? "SÍ" : "NO"));
        System.out.println("   - Expiry: " + expiry);
        
        usuario.setGoogleCalendarToken(accessToken);
        usuario.setGoogleCalendarRefreshToken(refreshToken);
        usuario.setGoogleCalendarTokenExpiry(expiry);
        usuarioRepository.save(usuario);
        
        System.out.println("✅ Tokens guardados correctamente");
    }

    /**
     * Obtiene credenciales de Google para un usuario
     */
    private GoogleCredential getCredentials(Usuario usuario) {
        if (!isCalendarAuthorized(usuario)) {
            throw new RuntimeException("Usuario no autorizado para Google Calendar");
        }

        NetHttpTransport transport = getHttpTransport();
        if (transport == null) {
            throw new RuntimeException("No se pudo inicializar el HTTP Transport para Google Calendar");
        }

        return new GoogleCredential.Builder()
                .setTransport(transport)
                .setJsonFactory(JSON_FACTORY)
                .build()
                .setAccessToken(usuario.getGoogleCalendarToken())
                .setRefreshToken(usuario.getGoogleCalendarRefreshToken());
    }

    /**
     * Crea un evento en el Google Calendar del usuario usando HTTP directo
     */
    public void createCalendarEvent(Cita cita, Usuario usuario) {
        try {
            System.out.println("🎯 Intentando crear evento en Calendar para usuario: " + usuario.getEmail());
            System.out.println("   - Nombre: " + usuario.getNombre());
            System.out.println("   - Password: " + usuario.getPassword());
            System.out.println("   - Google Picture URL: " + usuario.getGooglePictureUrl());
            System.out.println("   - Google Calendar Token: " + (usuario.getGoogleCalendarToken() != null ? "SÍ" : "NO"));
            System.out.println("   - Google Calendar Refresh Token: " + (usuario.getGoogleCalendarRefreshToken() != null ? "SÍ" : "NO"));
            System.out.println("   - Token Expiry: " + usuario.getGoogleCalendarTokenExpiry());
            
            if (!isGoogleUser(usuario)) {
                System.out.println("❌ Usuario no es de Google, saltando creación de evento en Calendar");
                return;
            }

            System.out.println("✅ Usuario es de Google, verificando autorización de Calendar...");
            
            if (!isCalendarAuthorized(usuario)) {
                System.out.println("❌ Usuario no autorizado para Google Calendar: " + usuario.getEmail());
                return;
            }

            // Intentar crear evento usando HTTP directo
            createCalendarEventWithHttp(cita, usuario);

        } catch (Exception e) {
            System.err.println("❌ Error general en createCalendarEvent: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Crea un evento usando HTTP directo a la API de Google Calendar
     */
    private void createCalendarEventWithHttp(Cita cita, Usuario usuario) {
        try {
            System.out.println("🔧 Creando evento usando HTTP directo...");
            
            // Crear el JSON del evento
            LocalDateTime fechaHora = cita.getFechaHora();
            ZonedDateTime zonedDateTime = fechaHora.atZone(ZoneId.of("Europe/Madrid"));
            int duracionMinutos = cita.getServicio().getDuracionMinutos();
            ZonedDateTime endDateTime = zonedDateTime.plusMinutes(duracionMinutos);
            
            JsonObject event = new JsonObject();
            event.addProperty("summary", "Cita en Esential Barber - " + cita.getServicio().getNombre());
            event.addProperty("location", "Esential Barber");
            event.addProperty("description", "Cita para el servicio: " + cita.getServicio().getNombre() + 
                            "\nComentario: " + (cita.getComentario() != null ? cita.getComentario() : "Sin comentarios"));
            
            // Configurar fecha y hora de inicio
            JsonObject start = new JsonObject();
            start.addProperty("dateTime", zonedDateTime.format(java.time.format.DateTimeFormatter.ISO_OFFSET_DATE_TIME));
            start.addProperty("timeZone", "Europe/Madrid");
            event.add("start", start);
            
            // Configurar fecha y hora de fin
            JsonObject end = new JsonObject();
            end.addProperty("dateTime", endDateTime.format(java.time.format.DateTimeFormatter.ISO_OFFSET_DATE_TIME));
            end.addProperty("timeZone", "Europe/Madrid");
            event.add("end", end);
            
            String eventJson = new Gson().toJson(event);
            System.out.println("📝 JSON del evento: " + eventJson);
            
            // Crear la petición HTTP
            java.net.http.HttpClient client = java.net.http.HttpClient.newHttpClient();
            java.net.http.HttpRequest request = java.net.http.HttpRequest.newBuilder()
                    .uri(java.net.URI.create("https://www.googleapis.com/calendar/v3/calendars/primary/events"))
                    .header("Authorization", "Bearer " + usuario.getGoogleCalendarToken())
                    .header("Content-Type", "application/json")
                    .POST(java.net.http.HttpRequest.BodyPublishers.ofString(eventJson))
                    .build();
            
            System.out.println("📡 Enviando petición HTTP a Google Calendar API...");
            java.net.http.HttpResponse<String> response = client.send(request, java.net.http.HttpResponse.BodyHandlers.ofString());
            
            System.out.println("📊 Respuesta del servidor:");
            System.out.println("   - Status Code: " + response.statusCode());
            System.out.println("   - Response Body: " + response.body());
            
            if (response.statusCode() == 200 || response.statusCode() == 201) {
                System.out.println("✅ Evento creado exitosamente en Google Calendar");
                System.out.println("   Usuario: " + usuario.getEmail());
                System.out.println("   Cita: " + cita.getServicio().getNombre() + " - " + cita.getFechaHora());
            } else {
                System.err.println("❌ Error al crear evento en Google Calendar");
                System.err.println("   Status Code: " + response.statusCode());
                System.err.println("   Response: " + response.body());
            }
            
        } catch (Exception e) {
            System.err.println("❌ Error al crear evento con HTTP directo: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Elimina un evento del Google Calendar del usuario usando HTTP directo
     */
    public void deleteCalendarEvent(Cita cita, Usuario usuario) {
        try {
            System.out.println("🗑️ Intentando eliminar evento de Calendar para usuario: " + usuario.getEmail());
            
            if (!isGoogleUser(usuario)) {
                System.out.println("❌ Usuario no es de Google, saltando eliminación de evento en Calendar");
                return;
            }

            if (!isCalendarAuthorized(usuario)) {
                System.out.println("❌ Usuario no autorizado para Google Calendar: " + usuario.getEmail());
                return;
            }

            // Intentar eliminar evento usando HTTP directo
            deleteCalendarEventWithHttp(cita, usuario);

        } catch (Exception e) {
            System.err.println("❌ Error general en deleteCalendarEvent: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Elimina un evento usando HTTP directo a la API de Google Calendar
     */
    private void deleteCalendarEventWithHttp(Cita cita, Usuario usuario) {
        try {
            System.out.println("🔧 Eliminando evento usando HTTP directo...");
            
            // Buscar eventos que coincidan con la fecha y hora de la cita
            LocalDateTime fechaHora = cita.getFechaHora();
            ZonedDateTime zonedDateTime = fechaHora.atZone(ZoneId.of("Europe/Madrid"));
            int duracionMinutos = cita.getServicio().getDuracionMinutos();
            ZonedDateTime endDateTime = zonedDateTime.plusMinutes(duracionMinutos);
            
            // Formatear fechas para la búsqueda
            String timeMin = zonedDateTime.format(java.time.format.DateTimeFormatter.ISO_OFFSET_DATE_TIME);
            String timeMax = endDateTime.format(java.time.format.DateTimeFormatter.ISO_OFFSET_DATE_TIME);
            
            // URL para buscar eventos
            String searchUrl = String.format(
                "https://www.googleapis.com/calendar/v3/calendars/primary/events?" +
                "timeMin=%s&timeMax=%s&q=%s",
                java.net.URLEncoder.encode(timeMin, "UTF-8"),
                java.net.URLEncoder.encode(timeMax, "UTF-8"),
                java.net.URLEncoder.encode("Cita en Esential Barber", "UTF-8")
            );
            
            System.out.println("🔍 Buscando eventos en Google Calendar...");
            System.out.println("   - URL: " + searchUrl);
            
            // Crear la petición HTTP para buscar eventos
            java.net.http.HttpClient client = java.net.http.HttpClient.newHttpClient();
            java.net.http.HttpRequest searchRequest = java.net.http.HttpRequest.newBuilder()
                    .uri(java.net.URI.create(searchUrl))
                    .header("Authorization", "Bearer " + usuario.getGoogleCalendarToken())
                    .GET()
                    .build();
            
            java.net.http.HttpResponse<String> searchResponse = client.send(searchRequest, java.net.http.HttpResponse.BodyHandlers.ofString());
            
            System.out.println("📊 Respuesta de búsqueda:");
            System.out.println("   - Status Code: " + searchResponse.statusCode());
            System.out.println("   - Response Body: " + searchResponse.body());
            
            if (searchResponse.statusCode() == 200) {
                // Parsear la respuesta para encontrar eventos
                JsonObject responseJson = new Gson().fromJson(searchResponse.body(), JsonObject.class);
                if (responseJson.has("items")) {
                    var items = responseJson.getAsJsonArray("items");
                    System.out.println("🔍 Encontrados " + items.size() + " eventos");
                    
                    for (var item : items) {
                        JsonObject event = item.getAsJsonObject();
                        String eventId = event.get("id").getAsString();
                        String summary = event.has("summary") ? event.get("summary").getAsString() : "";
                        
                        System.out.println("   - Event ID: " + eventId);
                        System.out.println("   - Summary: " + summary);
                        
                        // Verificar si es el evento que queremos eliminar
                        if (summary.contains("Cita en Esential Barber") && 
                            summary.contains(cita.getServicio().getNombre())) {
                            
                            System.out.println("🗑️ Eliminando evento: " + eventId);
                            
                            // Crear petición para eliminar el evento
                            String deleteUrl = "https://www.googleapis.com/calendar/v3/calendars/primary/events/" + eventId;
                            java.net.http.HttpRequest deleteRequest = java.net.http.HttpRequest.newBuilder()
                                    .uri(java.net.URI.create(deleteUrl))
                                    .header("Authorization", "Bearer " + usuario.getGoogleCalendarToken())
                                    .DELETE()
                                    .build();
                            
                            java.net.http.HttpResponse<String> deleteResponse = client.send(deleteRequest, java.net.http.HttpResponse.BodyHandlers.ofString());
                            
                            System.out.println("📊 Respuesta de eliminación:");
                            System.out.println("   - Status Code: " + deleteResponse.statusCode());
                            
                            if (deleteResponse.statusCode() == 204) {
                                System.out.println("✅ Evento eliminado exitosamente de Google Calendar");
                                System.out.println("   Usuario: " + usuario.getEmail());
                                System.out.println("   Cita: " + cita.getServicio().getNombre() + " - " + cita.getFechaHora());
                                System.out.println("   Event ID: " + eventId);
                            } else {
                                System.err.println("❌ Error al eliminar evento de Google Calendar");
                                System.err.println("   Status Code: " + deleteResponse.statusCode());
                                System.err.println("   Response: " + deleteResponse.body());
                            }
                        }
                    }
                } else {
                    System.out.println("ℹ️ No se encontraron eventos para eliminar");
                }
            } else {
                System.err.println("❌ Error al buscar eventos en Google Calendar");
                System.err.println("   Status Code: " + searchResponse.statusCode());
                System.err.println("   Response: " + searchResponse.body());
            }
            
        } catch (Exception e) {
            System.err.println("❌ Error al eliminar evento con HTTP directo: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Obtiene el usuario admin para Google Calendar
     */
    private Usuario getAdminUser() {
        return usuarioRepository.findByEmail(adminEmail).orElse(null);
    }

    /**
     * Crea eventos tanto en el calendario del usuario como en el del admin
     */
    public void createCalendarEventsForUserAndAdmin(Cita cita, Usuario usuario) {
        try {
            System.out.println("🎯 Creando eventos en Calendar para usuario y admin...");
            
            // Crear evento en el calendario del usuario
            createCalendarEvent(cita, usuario);
            
            // Crear evento en el calendario del admin si está habilitado
            if (adminCalendarEnabled) {
                Usuario adminUser = getAdminUser();
                if (adminUser != null && isGoogleUser(adminUser) && isCalendarAuthorized(adminUser)) {
                    System.out.println("👨‍💼 Creando evento en calendario del admin...");
                    createCalendarEventForAdmin(cita, adminUser, usuario);
                } else {
                    System.out.println("⚠️ Admin no configurado para Google Calendar o no autorizado");
                }
            } else {
                System.out.println("ℹ️ Calendario del admin deshabilitado");
            }
            
        } catch (Exception e) {
            System.err.println("❌ Error al crear eventos en Calendar: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Crea un evento en el calendario del admin con información del cliente
     */
    private void createCalendarEventForAdmin(Cita cita, Usuario adminUser, Usuario cliente) {
        try {
            System.out.println("🔧 Creando evento para admin usando HTTP directo...");
            
            // Crear el JSON del evento con información del cliente
            LocalDateTime fechaHora = cita.getFechaHora();
            ZonedDateTime zonedDateTime = fechaHora.atZone(ZoneId.of("Europe/Madrid"));
            int duracionMinutos = cita.getServicio().getDuracionMinutos();
            ZonedDateTime endDateTime = zonedDateTime.plusMinutes(duracionMinutos);
            
            JsonObject event = new JsonObject();
            event.addProperty("summary", "📅 CITA - " + cita.getServicio().getNombre() + " - " + cliente.getNombre());
            event.addProperty("location", "Esential Barber");
            event.addProperty("description", 
                "Cliente: " + cliente.getNombre() + "\n" +
                "Email: " + cliente.getEmail() + "\n" +
                "Teléfono: " + (cliente.getTelefono() != null ? cliente.getTelefono() : "No proporcionado") + "\n" +
                "Servicio: " + cita.getServicio().getNombre() + "\n" +
                "Comentario: " + (cita.getComentario() != null ? cita.getComentario() : "Sin comentarios")
            );
            
            // Configurar fecha y hora de inicio
            JsonObject start = new JsonObject();
            start.addProperty("dateTime", zonedDateTime.format(java.time.format.DateTimeFormatter.ISO_OFFSET_DATE_TIME));
            start.addProperty("timeZone", "Europe/Madrid");
            event.add("start", start);
            
            // Configurar fecha y hora de fin
            JsonObject end = new JsonObject();
            end.addProperty("dateTime", endDateTime.format(java.time.format.DateTimeFormatter.ISO_OFFSET_DATE_TIME));
            end.addProperty("timeZone", "Europe/Madrid");
            event.add("end", end);
            
            String eventJson = new Gson().toJson(event);
            System.out.println("📝 JSON del evento para admin: " + eventJson);
            
            // Crear la petición HTTP
            java.net.http.HttpClient client = java.net.http.HttpClient.newHttpClient();
            java.net.http.HttpRequest request = java.net.http.HttpRequest.newBuilder()
                    .uri(java.net.URI.create("https://www.googleapis.com/calendar/v3/calendars/primary/events"))
                    .header("Authorization", "Bearer " + adminUser.getGoogleCalendarToken())
                    .header("Content-Type", "application/json")
                    .POST(java.net.http.HttpRequest.BodyPublishers.ofString(eventJson))
                    .build();
            
            System.out.println("📡 Enviando petición HTTP a Google Calendar API (Admin)...");
            java.net.http.HttpResponse<String> response = client.send(request, java.net.http.HttpResponse.BodyHandlers.ofString());
            
            System.out.println("📊 Respuesta del servidor (Admin):");
            System.out.println("   - Status Code: " + response.statusCode());
            System.out.println("   - Response Body: " + response.body());
            
            if (response.statusCode() == 200 || response.statusCode() == 201) {
                System.out.println("✅ Evento creado exitosamente en Google Calendar del Admin");
                System.out.println("   Admin: " + adminUser.getEmail());
                System.out.println("   Cliente: " + cliente.getEmail());
                System.out.println("   Cita: " + cita.getServicio().getNombre() + " - " + cita.getFechaHora());
            } else {
                System.err.println("❌ Error al crear evento en Google Calendar del Admin");
                System.err.println("   Status Code: " + response.statusCode());
                System.err.println("   Response: " + response.body());
            }
            
        } catch (Exception e) {
            System.err.println("❌ Error al crear evento para admin con HTTP directo: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Elimina eventos tanto del calendario del usuario como del admin
     */
    public void deleteCalendarEventsForUserAndAdmin(Cita cita, Usuario usuario) {
        try {
            System.out.println("🗑️ Eliminando eventos de Calendar para usuario y admin...");
            
            // Eliminar evento del calendario del usuario
            deleteCalendarEvent(cita, usuario);
            
            // Eliminar evento del calendario del admin si está habilitado
            if (adminCalendarEnabled) {
                Usuario adminUser = getAdminUser();
                if (adminUser != null && isGoogleUser(adminUser) && isCalendarAuthorized(adminUser)) {
                    System.out.println("👨‍💼 Eliminando evento del calendario del admin...");
                    deleteCalendarEventForAdmin(cita, adminUser, usuario);
                } else {
                    System.out.println("⚠️ Admin no configurado para Google Calendar o no autorizado");
                }
            } else {
                System.out.println("ℹ️ Calendario del admin deshabilitado");
            }
            
        } catch (Exception e) {
            System.err.println("❌ Error al eliminar eventos de Calendar: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Elimina un evento del calendario del admin
     */
    private void deleteCalendarEventForAdmin(Cita cita, Usuario adminUser, Usuario cliente) {
        try {
            System.out.println("🔧 Eliminando evento del admin usando HTTP directo...");
            
            // Buscar eventos que coincidan con la fecha y hora de la cita
            LocalDateTime fechaHora = cita.getFechaHora();
            ZonedDateTime zonedDateTime = fechaHora.atZone(ZoneId.of("Europe/Madrid"));
            int duracionMinutos = cita.getServicio().getDuracionMinutos();
            ZonedDateTime endDateTime = zonedDateTime.plusMinutes(duracionMinutos);
            
            // Formatear fechas para la búsqueda
            String timeMin = zonedDateTime.format(java.time.format.DateTimeFormatter.ISO_OFFSET_DATE_TIME);
            String timeMax = endDateTime.format(java.time.format.DateTimeFormatter.ISO_OFFSET_DATE_TIME);
            
            // URL para buscar eventos (buscar por el nombre del cliente)
            String searchUrl = String.format(
                "https://www.googleapis.com/calendar/v3/calendars/primary/events?" +
                "timeMin=%s&timeMax=%s&q=%s",
                java.net.URLEncoder.encode(timeMin, "UTF-8"),
                java.net.URLEncoder.encode(timeMax, "UTF-8"),
                java.net.URLEncoder.encode(cliente.getNombre(), "UTF-8")
            );
            
            System.out.println("🔍 Buscando eventos del admin en Google Calendar...");
            System.out.println("   - URL: " + searchUrl);
            
            // Crear la petición HTTP para buscar eventos
            java.net.http.HttpClient client = java.net.http.HttpClient.newHttpClient();
            java.net.http.HttpRequest searchRequest = java.net.http.HttpRequest.newBuilder()
                    .uri(java.net.URI.create(searchUrl))
                    .header("Authorization", "Bearer " + adminUser.getGoogleCalendarToken())
                    .GET()
                    .build();
            
            java.net.http.HttpResponse<String> searchResponse = client.send(searchRequest, java.net.http.HttpResponse.BodyHandlers.ofString());
            
            System.out.println("📊 Respuesta de búsqueda (Admin):");
            System.out.println("   - Status Code: " + searchResponse.statusCode());
            System.out.println("   - Response Body: " + searchResponse.body());
            
            if (searchResponse.statusCode() == 200) {
                // Parsear la respuesta para encontrar eventos
                JsonObject responseJson = new Gson().fromJson(searchResponse.body(), JsonObject.class);
                if (responseJson.has("items")) {
                    var items = responseJson.getAsJsonArray("items");
                    System.out.println("🔍 Encontrados " + items.size() + " eventos del admin");
                    
                    for (var item : items) {
                        JsonObject event = item.getAsJsonObject();
                        String eventId = event.get("id").getAsString();
                        String summary = event.has("summary") ? event.get("summary").getAsString() : "";
                        
                        System.out.println("   - Event ID: " + eventId);
                        System.out.println("   - Summary: " + summary);
                        
                        // Verificar si es el evento que queremos eliminar
                        if (summary.contains("CITA") && 
                            summary.contains(cita.getServicio().getNombre()) &&
                            summary.contains(cliente.getNombre())) {
                            
                            System.out.println("🗑️ Eliminando evento del admin: " + eventId);
                            
                            // Crear petición para eliminar el evento
                            String deleteUrl = "https://www.googleapis.com/calendar/v3/calendars/primary/events/" + eventId;
                            java.net.http.HttpRequest deleteRequest = java.net.http.HttpRequest.newBuilder()
                                    .uri(java.net.URI.create(deleteUrl))
                                    .header("Authorization", "Bearer " + adminUser.getGoogleCalendarToken())
                                    .DELETE()
                                    .build();
                            
                            java.net.http.HttpResponse<String> deleteResponse = client.send(deleteRequest, java.net.http.HttpResponse.BodyHandlers.ofString());
                            
                            System.out.println("📊 Respuesta de eliminación (Admin):");
                            System.out.println("   - Status Code: " + deleteResponse.statusCode());
                            
                            if (deleteResponse.statusCode() == 204) {
                                System.out.println("✅ Evento eliminado exitosamente del Google Calendar del Admin");
                                System.out.println("   Admin: " + adminUser.getEmail());
                                System.out.println("   Cliente: " + cliente.getEmail());
                                System.out.println("   Cita: " + cita.getServicio().getNombre() + " - " + cita.getFechaHora());
                                System.out.println("   Event ID: " + eventId);
                            } else {
                                System.err.println("❌ Error al eliminar evento del Google Calendar del Admin");
                                System.err.println("   Status Code: " + deleteResponse.statusCode());
                                System.err.println("   Response: " + deleteResponse.body());
                            }
                        }
                    }
                } else {
                    System.out.println("ℹ️ No se encontraron eventos del admin para eliminar");
                }
            } else {
                System.err.println("❌ Error al buscar eventos del admin en Google Calendar");
                System.err.println("   Status Code: " + searchResponse.statusCode());
                System.err.println("   Response: " + searchResponse.body());
            }
            
        } catch (Exception e) {
            System.err.println("❌ Error al eliminar evento del admin con HTTP directo: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Revoca la autorización de Google Calendar para un usuario
     */
    public void revokeCalendarAuthorization(Usuario usuario) {
        usuario.setGoogleCalendarToken(null);
        usuario.setGoogleCalendarRefreshToken(null);
        usuario.setGoogleCalendarTokenExpiry(null);
        usuarioRepository.save(usuario);
        System.out.println("Autorización de Google Calendar revocada para: " + usuario.getEmail());
    }
} 