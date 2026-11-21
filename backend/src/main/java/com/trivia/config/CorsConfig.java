package com.trivia.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    @Value("${security.cors.allowed-origins:http://localhost:4200}")
    private String allowedOrigins;

    @Value("${security.cors.allowed-methods:GET,POST,PUT,DELETE,OPTIONS}")
    private String allowedMethods;

    @Value("${security.cors.allowed-headers:Authorization,Content-Type,Accept,Origin,X-Requested-With}")
    private String allowedHeaders;

    @Value("${security.cors.allow-credentials:true}")
    private boolean allowCredentials;

    @Value("${security.cors.max-age:3600}")
    private long maxAge;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        List<String> origins = Arrays.stream(allowedOrigins.split(","))
            .map(String::trim)
            .toList();
        configuration.setAllowedOrigins(origins);

        List<String> methods = Arrays.stream(allowedMethods.split(","))
            .map(String::trim)
            .toList();
        configuration.setAllowedMethods(methods);

        List<String> headers = Arrays.stream(allowedHeaders.split(","))
            .map(String::trim)
            .toList();
        configuration.setAllowedHeaders(headers);

        configuration.setAllowCredentials(allowCredentials);
        configuration.setMaxAge(maxAge);

        configuration.setExposedHeaders(List.of("Authorization", "Link", "X-Total-Count"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
