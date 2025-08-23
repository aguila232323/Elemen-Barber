package com.pomelo.app.springboot.app.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import com.pomelo.app.springboot.app.config.JwtFilter;
import org.springframework.http.HttpMethod;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.filter.OncePerRequestFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtFilter jwtFilter;
    private final CorsConfigurationSource corsConfigurationSource;
    private final OncePerRequestFilter securityHeadersFilter;
    private final OncePerRequestFilter rateLimitFilter;
    private final JwtExceptionHandlerFilter jwtExceptionHandlerFilter;

    public SecurityConfig(JwtFilter jwtFilter, 
                         CorsConfigurationSource corsConfigurationSource,
                         OncePerRequestFilter securityHeadersFilter,
                         OncePerRequestFilter rateLimitFilter,
                         JwtExceptionHandlerFilter jwtExceptionHandlerFilter) {
        this.jwtFilter = jwtFilter;
        this.corsConfigurationSource = corsConfigurationSource;
        this.securityHeadersFilter = securityHeadersFilter;
        this.rateLimitFilter = rateLimitFilter;
        this.jwtExceptionHandlerFilter = jwtExceptionHandlerFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            .addFilterBefore(jwtExceptionHandlerFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(securityHeadersFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(rateLimitFilter, UsernamePasswordAuthenticationFilter.class)
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() // Permitir preflight CORS
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/verificacion/**").permitAll() // Permitir endpoints de verificación
                .requestMatchers("/h2-console/**").permitAll()

                .requestMatchers("/api/servicios").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/servicios").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/servicios/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/servicios/**").hasRole("ADMIN")
                .requestMatchers("/api/citas/disponibilidad").permitAll()
                .requestMatchers("/api/citas/disponibilidad-mes").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/citas").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/citas/mis-citas").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/citas/todas").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/citas/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/usuarios").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/configuracion/tiempo-minimo").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/configuracion/tiempo-minimo").hasRole("ADMIN")
                .requestMatchers("/api/vacaciones").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/vacaciones").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/vacaciones/**").hasRole("ADMIN")
                .requestMatchers("/api/vacaciones/verificar/**").permitAll()
                .requestMatchers("/api/resenas/publicas").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/resenas/todas").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/resenas/**").hasRole("ADMIN")
                .requestMatchers("/api/portfolio/fotos").permitAll()
                .requestMatchers("/api/portfolio/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/dias-laborables/horario").permitAll() // Horario público
                .requestMatchers("/api/dias-laborables/verificar/**").permitAll() // Verificar fecha pública
                .requestMatchers("/api/dias-laborables/no-laborables").permitAll() // Días no laborables públicos
                .requestMatchers("/api/dias-laborables/admin/**").hasRole("ADMIN") // Admin para gestionar
                .requestMatchers(HttpMethod.GET, "/api/files/**").permitAll() // Permitir solo GET (servir archivos)
                .requestMatchers(HttpMethod.POST, "/api/files/**").hasRole("ADMIN") // Solo admin puede subir
                .requestMatchers(HttpMethod.DELETE, "/api/files/**").hasRole("ADMIN") // Solo admin puede eliminar
                .anyRequest().authenticated()
            )
            .headers(headers -> headers.frameOptions().disable())
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}
