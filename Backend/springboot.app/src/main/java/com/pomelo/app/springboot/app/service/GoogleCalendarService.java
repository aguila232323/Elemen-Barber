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

    private static final String APPLICATION_NAME = "Elemen Barber";
    private static NetHttpTransport HTTP_TRANSPORT;
    private static final GsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();
    private static boolean HTTP_TRANSPORT_INITIALIZED = false;

    // Mapa de colores para diferentes servicios (más flexible)
    private static final java.util.Map<String, String> SERVICE_COLORS = new java.util.HashMap<>();
    
    // Inicializar colores por defecto
    static {
        // Colores principales
        SERVICE_COLORS.put("corte", "#4285F4");           // Azul
        SERVICE_COLORS.put("barba", "#EA4335");           // Rojo
        SERVICE_COLORS.put("tinte", "#34A853");           // Verde
        SERVICE_COLORS.put("peinado", "#FF6B6B");         // Rosa
        SERVICE_COLORS.put("tratamiento", "#4ECDC4");     // Turquesa
        SERVICE_COLORS.put("afeitado", "#45B7D1");        // Azul claro
        SERVICE_COLORS.put("masaje", "#96CEB4");          // Verde claro
        
        // Variaciones comunes
        SERVICE_COLORS.put("corte de pelo", "#4285F4");
        SERVICE_COLORS.put("corte pelo", "#4285F4");
        SERVICE_COLORS.put("corte + barba", "#FBBC04");
        SERVICE_COLORS.put("corte y barba", "#FBBC04");
        SERVICE_COLORS.put("tratamiento capilar", "#4ECDC4");
        SERVICE_COLORS.put("capilar", "#4ECDC4");
    }

    private final UsuarioRepository usuarioRepository;
    private final com.pomelo.app.springboot.app.repository.ServicioRepository servicioRepository;

    public GoogleCalendarService(UsuarioRepository usuarioRepository, 
                               com.pomelo.app.springboot.app.repository.ServicioRepository servicioRepository) {
        this.usuarioRepository = usuarioRepository;
        this.servicioRepository = servicioRepository;
    }

    /**
     * Obtiene el color para un servicio específico desde la base de datos
     */
    private String getServiceColor(String serviceName) {
        if (serviceName == null || serviceName.trim().isEmpty()) {
            return "#4285F4"; // Color por defecto azul
        }
        
        // Buscar el servicio en la base de datos
        try {
            var servicios = servicioRepository.findAll();
            
            // Buscar por nombre exacto
            for (var servicio : servicios) {
                if (servicio.getNombre().equalsIgnoreCase(serviceName)) {
                    String color = servicio.getColorGoogleCalendar();
                    if (color != null && !color.trim().isEmpty()) {
                        System.out.println("✅ Color obtenido de la DB para '" + serviceName + "': " + color);
                        return color;
                    } else {
                        System.out.println("⚠️ Servicio encontrado pero sin color en DB: '" + serviceName + "'");
                    }
                }
            }
            
            // Si no encuentra por nombre exacto, buscar por coincidencia parcial
            for (var servicio : servicios) {
                if (servicio.getNombre().toLowerCase().contains(serviceName.toLowerCase()) ||
                    serviceName.toLowerCase().contains(servicio.getNombre().toLowerCase())) {
                    String color = servicio.getColorGoogleCalendar();
                    if (color != null && !color.trim().isEmpty()) {
                        System.out.println("✅ Color encontrado por coincidencia parcial para '" + serviceName + "': " + color);
                        return color;
                    }
                }
            }
            
            // Si no encuentra en la DB, usar fallback
            System.out.println("⚠️ Servicio no encontrado en DB, usando fallback para: '" + serviceName + "'");
            return getServiceColorFallback(serviceName);
            
        } catch (Exception e) {
            System.err.println("❌ Error al obtener color de la DB para: '" + serviceName + "' - " + e.getMessage());
            e.printStackTrace();
            return getServiceColorFallback(serviceName);
        }
    }
    
    /**
     * Método fallback para obtener color cuando no se puede acceder a la DB
     */
    private String getServiceColorFallback(String serviceName) {
        // Normalizar el nombre del servicio (minúsculas, sin espacios extra)
        String normalizedName = serviceName.toLowerCase().trim();
        
        // Buscar coincidencia exacta primero
        if (SERVICE_COLORS.containsKey(normalizedName)) {
            System.out.println("🎨 Color encontrado por coincidencia exacta: " + normalizedName);
            return SERVICE_COLORS.get(normalizedName);
        }
        
        // Buscar coincidencia parcial
        for (String key : SERVICE_COLORS.keySet()) {
            if (normalizedName.contains(key) || key.contains(normalizedName)) {
                System.out.println("🎨 Color encontrado por coincidencia parcial: " + key + " para: " + normalizedName);
                return SERVICE_COLORS.get(key);
            }
        }
        
        // Si no encuentra coincidencia, asignar color basado en el primer carácter
        String defaultColor = getDefaultColorByFirstChar(normalizedName);
        System.out.println("🎨 Color por defecto asignado para: " + normalizedName + " -> " + defaultColor);
        return defaultColor;
    }
    
    /**
     * Asigna un color por defecto basado en el primer carácter del servicio
     */
    private String getDefaultColorByFirstChar(String serviceName) {
        if (serviceName.isEmpty()) return "#4285F4";
        
        char firstChar = serviceName.charAt(0);
        switch (firstChar) {
            case 'a': case 'A': return "#45B7D1"; // Azul claro
            case 'b': case 'B': return "#EA4335"; // Rojo
            case 'c': case 'C': return "#4285F4"; // Azul
            case 'd': case 'D': return "#FF9800"; // Naranja
            case 'e': case 'E': return "#4ECDC4"; // Turquesa
            case 'f': case 'F': return "#9C27B0"; // Púrpura
            case 'g': case 'G': return "#34A853"; // Verde
            case 'h': case 'H': return "#FF6B6B"; // Rosa
            case 'i': case 'I': return "#96CEB4"; // Verde claro
            case 'j': case 'J': return "#DDA0DD"; // Púrpura claro
            case 'k': case 'K': return "#FBBC04"; // Amarillo
            case 'l': case 'L': return "#FF5722"; // Naranja rojizo
            case 'm': case 'M': return "#96CEB4"; // Verde claro
            case 'n': case 'N': return "#607D8B"; // Gris azulado
            case 'o': case 'O': return "#DDA0DD"; // Púrpura claro
            case 'p': case 'P': return "#FF6B6B"; // Rosa
            case 'q': case 'Q': return "#795548"; // Marrón
            case 'r': case 'R': return "#EA4335"; // Rojo
            case 's': case 'S': return "#4285F4"; // Azul
            case 't': case 'T': return "#4ECDC4"; // Turquesa
            case 'u': case 'U': return "#9C27B0"; // Púrpura
            case 'v': case 'V': return "#34A853"; // Verde
            case 'w': case 'W': return "#FF9800"; // Naranja
            case 'x': case 'X': return "#607D8B"; // Gris azulado
            case 'y': case 'Y': return "#FBBC04"; // Amarillo
            case 'z': case 'Z': return "#FF5722"; // Naranja rojizo
            default: return "#4285F4"; // Azul por defecto
        }
    }

    /**
     * Convierte un color hexadecimal a un colorId de Google Calendar
     * Google Calendar usa colorId del 1 al 11, cada uno con un color predefinido
     */
    private String getColorId(String hexColor) {
        // Mapa inteligente que convierte colores personalizados a los 11 colores de Google Calendar
        java.util.Map<String, String> colorMap = new java.util.HashMap<>();
        
        // Colores oficiales de Google Calendar (IDs 1-11)
        colorMap.put("#4285F4", "1");   // Azul
        colorMap.put("#EA4335", "2");   // Rojo
        colorMap.put("#FBBC04", "3");   // Amarillo
        colorMap.put("#34A853", "4");   // Verde
        colorMap.put("#FF6B6B", "5");   // Rosa
        colorMap.put("#4ECDC4", "6");   // Turquesa
        colorMap.put("#45B7D1", "7");   // Azul claro
        colorMap.put("#96CEB4", "8");   // Verde claro
        colorMap.put("#DDA0DD", "9");   // Púrpura claro
        colorMap.put("#FF9800", "10");  // Naranja
        colorMap.put("#9C27B0", "11");  // Púrpura
        
        // Mapeo inteligente de colores personalizados a colores de Google Calendar
        // Rosas y magentas → ID 5 (Rosa)
        colorMap.put("#FF69B4", "5");   // Hot Pink
        colorMap.put("#FF1493", "5");   // Deep Pink
        colorMap.put("#FFB6C1", "5");   // Light Pink
        colorMap.put("#FFC0CB", "5");   // Pink
        
        // Violetas y púrpuras → ID 11 (Púrpura)
        colorMap.put("#8A2BE2", "11");  // Blue Violet
        colorMap.put("#9370DB", "11");  // Medium Purple
        colorMap.put("#9932CC", "11");  // Dark Orchid
        colorMap.put("#BA55D3", "11");  // Medium Orchid
        
        // Rojos y naranjas → ID 2 (Rojo) o ID 10 (Naranja)
        colorMap.put("#FF4500", "2");   // Orange Red
        colorMap.put("#FF6347", "2");   // Tomato
        colorMap.put("#DC143C", "2");   // Crimson
        colorMap.put("#FF7F50", "2");   // Coral
        colorMap.put("#FFA500", "10");  // Orange
        colorMap.put("#FF8C00", "10");  // Dark Orange
        
        // Verdes → ID 4 (Verde) o ID 8 (Verde claro)
        colorMap.put("#32CD32", "4");   // Lime Green
        colorMap.put("#98FB98", "8");   // Pale Green
        colorMap.put("#90EE90", "8");   // Light Green
        colorMap.put("#00FF00", "4");   // Lime
        
        // Azules → ID 1 (Azul) o ID 7 (Azul claro)
        colorMap.put("#87CEEB", "7");   // Sky Blue
        colorMap.put("#00BFFF", "7");   // Deep Sky Blue
        colorMap.put("#1E90FF", "1");   // Dodger Blue
        colorMap.put("#4169E1", "1");   // Royal Blue
        
        // Amarillos y dorados → ID 3 (Amarillo)
        colorMap.put("#FFD700", "3");   // Gold
        colorMap.put("#FFFF00", "3");   // Yellow
        colorMap.put("#F0E68C", "3");   // Khaki
        colorMap.put("#FFEFD5", "3");   // Peach Puff
        
        // Turquesas y cian → ID 6 (Turquesa)
        colorMap.put("#00CED1", "6");   // Dark Turquoise
        colorMap.put("#20B2AA", "6");   // Light Sea Green
        colorMap.put("#48D1CC", "6");   // Medium Turquoise
        colorMap.put("#40E0D0", "6");   // Turquoise
        
        // Si el color no está en el mapa, usar el color más cercano basado en el primer carácter
        if (!colorMap.containsKey(hexColor)) {
            String colorId = getClosestGoogleColor(hexColor);
            return colorId;
        }
        
        String colorId = colorMap.get(hexColor);
        return colorId;
    }
    
    /**
     * Encuentra el color de Google Calendar más cercano basado en el color hexadecimal
     */
    private String getClosestGoogleColor(String hexColor) {
        if (hexColor == null || hexColor.length() != 7) {
            return "1"; // Azul por defecto
        }
        
        // Extraer componentes RGB
        int r = Integer.parseInt(hexColor.substring(1, 3), 16);
        int g = Integer.parseInt(hexColor.substring(3, 5), 16);
        int b = Integer.parseInt(hexColor.substring(5, 7), 16);
        
        // Definir los colores de Google Calendar en RGB
        int[][] googleColors = {
            {66, 133, 244},   // ID 1: Azul
            {234, 67, 53},    // ID 2: Rojo
            {251, 188, 4},    // ID 3: Amarillo
            {52, 168, 83},    // ID 4: Verde
            {255, 107, 107},  // ID 5: Rosa
            {78, 205, 196},   // ID 6: Turquesa
            {69, 183, 209},   // ID 7: Azul claro
            {150, 206, 180},  // ID 8: Verde claro
            {221, 160, 221},  // ID 9: Púrpura claro
            {255, 152, 0},    // ID 10: Naranja
            {156, 39, 176}    // ID 11: Púrpura
        };
        
        // Encontrar el color más cercano usando distancia euclidiana
        double minDistance = Double.MAX_VALUE;
        int closestColorId = 1;
        
        for (int i = 0; i < googleColors.length; i++) {
            double distance = Math.sqrt(
                Math.pow(r - googleColors[i][0], 2) +
                Math.pow(g - googleColors[i][1], 2) +
                Math.pow(b - googleColors[i][2], 2)
            );
            
            if (distance < minDistance) {
                minDistance = distance;
                closestColorId = i + 1;
            }
        }
        
        return String.valueOf(closestColorId);
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
        return "GOOGLE_AUTH".equals(usuario.getPassword());
    }

    /**
     * Verifica si un usuario tiene autorización para Google Calendar
     */
    public boolean isCalendarAuthorized(Usuario usuario) {
        boolean hasToken = usuario.getGoogleCalendarToken() != null && !usuario.getGoogleCalendarToken().isEmpty();
        boolean tokenNotExpired = usuario.getGoogleCalendarTokenExpiry() == null || 
                                 usuario.getGoogleCalendarTokenExpiry().isAfter(LocalDateTime.now());
        
        return hasToken && tokenNotExpired;
    }

    /**
     * Guarda los tokens de Google Calendar para un usuario
     */
    public void saveCalendarTokens(Usuario usuario, String accessToken, String refreshToken, LocalDateTime expiry) {
        usuario.setGoogleCalendarToken(accessToken);
        usuario.setGoogleCalendarRefreshToken(refreshToken);
        usuario.setGoogleCalendarTokenExpiry(expiry);
        usuarioRepository.save(usuario);
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
            if (!isGoogleUser(usuario)) {
                return;
            }
            
            if (!isCalendarAuthorized(usuario)) {
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
            event.addProperty("summary", "Cita en Elemen Barber - " + cita.getServicio().getNombre());
            event.addProperty("location", "Elemen Barber");
            event.addProperty("description", "Cita para el servicio: " + cita.getServicio().getNombre() + 
                            "\nComentario: " + (cita.getComentario() != null ? cita.getComentario() : "Sin comentarios"));
            
            // Añadir color al evento
            String serviceColor = getServiceColor(cita.getServicio().getNombre());
            String colorId = getColorId(serviceColor);
            event.addProperty("colorId", colorId);
            System.out.println("🎨 Color asignado para " + cita.getServicio().getNombre() + ": " + serviceColor + " (ID: " + colorId + ")");
            
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
            
            // Crear la petición HTTP
            java.net.http.HttpClient client = java.net.http.HttpClient.newHttpClient();
            java.net.http.HttpRequest request = java.net.http.HttpRequest.newBuilder()
                    .uri(java.net.URI.create("https://www.googleapis.com/calendar/v3/calendars/primary/events"))
                    .header("Authorization", "Bearer " + usuario.getGoogleCalendarToken())
                    .header("Content-Type", "application/json")
                    .POST(java.net.http.HttpRequest.BodyPublishers.ofString(eventJson))
                    .build();
            
            java.net.http.HttpResponse<String> response = client.send(request, java.net.http.HttpResponse.BodyHandlers.ofString());
            
            if (response.statusCode() == 200 || response.statusCode() == 201) {
                System.out.println("✅ Evento creado en Google Calendar para " + usuario.getEmail());
            } else {
                System.err.println("❌ Error al crear evento en Google Calendar: " + response.statusCode());
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
                java.net.URLEncoder.encode("Cita en Elemen Barber", "UTF-8")
            );
            
            // Crear la petición HTTP para buscar eventos
            java.net.http.HttpClient client = java.net.http.HttpClient.newHttpClient();
            java.net.http.HttpRequest searchRequest = java.net.http.HttpRequest.newBuilder()
                    .uri(java.net.URI.create(searchUrl))
                    .header("Authorization", "Bearer " + usuario.getGoogleCalendarToken())
                    .GET()
                    .build();
            
            java.net.http.HttpResponse<String> searchResponse = client.send(searchRequest, java.net.http.HttpResponse.BodyHandlers.ofString());
            
            if (searchResponse.statusCode() == 200) {
                // Parsear la respuesta para encontrar eventos
                JsonObject responseJson = new Gson().fromJson(searchResponse.body(), JsonObject.class);
                if (responseJson.has("items")) {
                    var items = responseJson.getAsJsonArray("items");
                    
                    for (var item : items) {
                        JsonObject event = item.getAsJsonObject();
                        String eventId = event.get("id").getAsString();
                        String summary = event.has("summary") ? event.get("summary").getAsString() : "";
                        
                        // Verificar si es el evento que queremos eliminar
                        if (summary.contains("Cita en Elemen Barber") && 
                            summary.contains(cita.getServicio().getNombre())) {
                            
                            // Crear petición para eliminar el evento
                            String deleteUrl = "https://www.googleapis.com/calendar/v3/calendars/primary/events/" + eventId;
                            java.net.http.HttpRequest deleteRequest = java.net.http.HttpRequest.newBuilder()
                                    .uri(java.net.URI.create(deleteUrl))
                                    .header("Authorization", "Bearer " + usuario.getGoogleCalendarToken())
                                    .DELETE()
                                    .build();
                            
                            java.net.http.HttpResponse<String> deleteResponse = client.send(deleteRequest, java.net.http.HttpResponse.BodyHandlers.ofString());
                            
                            if (deleteResponse.statusCode() == 204) {
                                System.out.println("✅ Evento eliminado de Google Calendar: " + usuario.getEmail());
                            } else {
                                System.err.println("❌ Error al eliminar evento de Google Calendar: " + deleteResponse.statusCode());
                            }
                        }
                    }
                }
            } else {
                System.err.println("❌ Error al buscar eventos en Google Calendar: " + searchResponse.statusCode());
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
            event.addProperty("location", "Elemen Barber");
            event.addProperty("description", 
                "Cliente: " + cliente.getNombre() + "\n" +
                "Email: " + cliente.getEmail() + "\n" +
                "Teléfono: " + (cliente.getTelefono() != null ? cliente.getTelefono() : "No proporcionado") + "\n" +
                "Servicio: " + cita.getServicio().getNombre() + "\n" +
                "Comentario: " + (cita.getComentario() != null ? cita.getComentario() : "Sin comentarios")
            );
            
            // Añadir color al evento del admin
            String serviceColor = getServiceColor(cita.getServicio().getNombre());
            String colorId = getColorId(serviceColor);
            event.addProperty("colorId", colorId);
            System.out.println("🎨 Color asignado para admin - " + cita.getServicio().getNombre() + ": " + serviceColor + " (ID: " + colorId + ")");
            
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
            
            // Crear la petición HTTP
            java.net.http.HttpClient client = java.net.http.HttpClient.newHttpClient();
            java.net.http.HttpRequest request = java.net.http.HttpRequest.newBuilder()
                    .uri(java.net.URI.create("https://www.googleapis.com/calendar/v3/calendars/primary/events"))
                    .header("Authorization", "Bearer " + adminUser.getGoogleCalendarToken())
                    .header("Content-Type", "application/json")
                    .POST(java.net.http.HttpRequest.BodyPublishers.ofString(eventJson))
                    .build();
            
            java.net.http.HttpResponse<String> response = client.send(request, java.net.http.HttpResponse.BodyHandlers.ofString());
            
            if (response.statusCode() == 200 || response.statusCode() == 201) {
                System.out.println("✅ Evento creado en Google Calendar del Admin");
            } else {
                System.err.println("❌ Error al crear evento en Google Calendar del Admin: " + response.statusCode());
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
            // Eliminar evento del calendario del usuario
            deleteCalendarEvent(cita, usuario);
            
            // Eliminar evento del calendario del admin si está habilitado
            if (adminCalendarEnabled) {
                Usuario adminUser = getAdminUser();
                if (adminUser != null && isGoogleUser(adminUser) && isCalendarAuthorized(adminUser)) {
                    deleteCalendarEventForAdmin(cita, adminUser, usuario);
                }
            }
            
        } catch (Exception e) {
            System.err.println("❌ Error al eliminar eventos de Calendar: " + e.getMessage());
        }
    }

    /**
     * Elimina un evento del calendario del admin
     */
    private void deleteCalendarEventForAdmin(Cita cita, Usuario adminUser, Usuario cliente) {
        try {
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
            
            // Crear la petición HTTP para buscar eventos
            java.net.http.HttpClient client = java.net.http.HttpClient.newHttpClient();
            java.net.http.HttpRequest searchRequest = java.net.http.HttpRequest.newBuilder()
                    .uri(java.net.URI.create(searchUrl))
                    .header("Authorization", "Bearer " + adminUser.getGoogleCalendarToken())
                    .GET()
                    .build();
            
            java.net.http.HttpResponse<String> searchResponse = client.send(searchRequest, java.net.http.HttpResponse.BodyHandlers.ofString());
            
            if (searchResponse.statusCode() == 200) {
                // Parsear la respuesta para encontrar eventos
                JsonObject responseJson = new Gson().fromJson(searchResponse.body(), JsonObject.class);
                if (responseJson.has("items")) {
                    var items = responseJson.getAsJsonArray("items");
                    
                    for (var item : items) {
                        JsonObject event = item.getAsJsonObject();
                        String eventId = event.get("id").getAsString();
                        String summary = event.has("summary") ? event.get("summary").getAsString() : "";
                        
                        // Verificar si es el evento que queremos eliminar
                        if (summary.contains("CITA") && 
                            summary.contains(cita.getServicio().getNombre()) &&
                            summary.contains(cliente.getNombre())) {
                            
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