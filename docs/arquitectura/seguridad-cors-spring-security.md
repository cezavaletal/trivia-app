# Guía de Implementación: Seguridad, JWT y CORS para Spring Boot 3.x

> **Autor:** Ingeniero DevSecOps Senior  
> **Destinatario:** Subagente `experto-backend`  
> **Proyecto:** Trivia Platform (Fase 2)  
> **Fecha:** Noviembre 2026  

---

## 1. Principios y Directivas DevSecOps

1. **Cero Credenciales Hardcodeadas:** Ninguna contraseña, usuario, clave secreta o URL de infraestructura debe residir en código fuente Java ni ser commiteada en Git. Todos los valores sensibles se inyectan a través de variables de entorno definidas en `.env` (siguiendo el estándar de Twelve-Factor App).
2. **Defensa en Profundidad:** La seguridad no recae en un único punto. La base de datos corre en contenedor aislado en una red privada `trivia-network`, y la API expone únicamente los orígenes autorizados mediante filtros CORS centralizados en el `SecurityFilterChain`.
3. **Stateless Authentication:** La API REST no guarda sesiones HTTP en el servidor (`SessionCreationPolicy.STATELESS`). Cada petición protegida debe incluir el header `Authorization: Bearer <token>`.
4. **Respeto Estricto a la Configuración Centralizada:** No dispersar anotaciones `@CrossOrigin` en controladores; centralizar toda la política de CORS en un único bean `CorsConfigurationSource` acoplado al filtro de Spring Security.

---

## 2. Variables de Entorno y Mapeo en Spring Boot

El archivo `.env` en la raíz define:

```properties
# Base de Datos
DB_HOST=localhost
DB_PORT=5432
POSTGRES_DB=trivia_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# JWT
JWT_SECRET=5f8c1dd032184ce5823e007ec8df6b0ece95dda9809f4793a57168b33d5b6ab1
JWT_EXPIRATION_MS=86400000

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:4200
CORS_ALLOWED_METHODS=GET,POST,PUT,DELETE,OPTIONS
CORS_ALLOWED_HEADERS=Authorization,Content-Type,Accept,Origin,X-Requested-With
CORS_ALLOW_CREDENTIALS=true
CORS_MAX_AGE=3600
```

### Mapeo en `application.yml` / `application.properties`

```yaml
spring:
  datasource:
    url: jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${POSTGRES_DB:trivia_db}
    username: ${POSTGRES_USER:postgres}
    password: ${POSTGRES_PASSWORD:postgres}
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: validate
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect

security:
  jwt:
    secret: ${JWT_SECRET}
    expiration-ms: ${JWT_EXPIRATION_MS:86400000}
  cors:
    allowed-origins: ${CORS_ALLOWED_ORIGINS:http://localhost:4200}
    allowed-methods: ${CORS_ALLOWED_METHODS:GET,POST,PUT,DELETE,OPTIONS}
    allowed-headers: ${CORS_ALLOWED_HEADERS:Authorization,Content-Type,Accept,Origin,X-Requested-With}
    allow-credentials: ${CORS_ALLOW_CREDENTIALS:true}
    max-age: ${CORS_MAX_AGE:3600}
```

---

## 3. Implementación Recomendada: CORS Bean

Para garantizar que las peticiones `OPTIONS` (preflight) desde Angular (`http://localhost:4200`) sean procesadas antes que cualquier filtro de autenticación y no devuelvan `401 Unauthorized` ni `403 Forbidden`:

```java
package com.trivia.infrastructure.security;

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
        
        // Mapeo seguro de orígenes (soporta lista separada por comas)
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
        
        // Exponer encabezados relevantes si es necesario
        configuration.setExposedHeaders(List.of("Authorization", "Link", "X-Total-Count"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }
}
```

---

## 4. Implementación Recomendada: Spring Security Filter Chain

En Spring Boot 3 / Spring Security 6:

```java
package com.trivia.infrastructure.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfiguration {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;
    private final CorsConfigurationSource corsConfigurationSource;
    private final JwtAuthenticationEntryPoint unauthorizedHandler;
    private final CustomAccessDeniedHandler accessDeniedHandler;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 1. Integración de CORS centralizado
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            
            // 2. Deshabilitar CSRF para arquitectura REST Stateless con Bearer Token
            .csrf(AbstractHttpConfigurer::disable)
            
            // 3. Manejo de excepciones con respuestas JSON Problem Details
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint(unauthorizedHandler)
                .accessDeniedHandler(accessDeniedHandler)
            )
            
            // 4. Configuración de sesión STATELESS (sin cookies de sesión jsessionid)
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            
            // 5. Reglas de autorización de endpoints
            .authorizeHttpRequests(auth -> auth
                // Preflight requests siempre permitidas
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                
                // Endpoints de autenticación públicos
                .requestMatchers("/api/v1/auth/**", "/api/auth/**").permitAll()
                
                // Documentación OpenAPI / Swagger
                .requestMatchers(
                    "/v3/api-docs/**",
                    "/swagger-ui/**",
                    "/swagger-ui.html"
                ).permitAll()
                
                // Healthcheck de Actuator (si se usa)
                .requestMatchers("/actuator/health").permitAll()
                
                // Cualquier otro endpoint requiere autenticación
                .anyRequest().authenticated()
            )
            
            // 6. Proveedor de autenticación y Filtro JWT
            .authenticationProvider(authenticationProvider)
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
```

---

## 5. Implementación del Servicio y Filtro JWT

### Clave de Firma (HMAC-SHA256)
- La clave `JWT_SECRET` es de 256 bits (64 caracteres hexadecimales).
- Para inicializarla con `io.jsonwebtoken`:

```java
@Component
public class JwtService {

    @Value("${security.jwt.secret}")
    private String jwtSecret;

    @Value("${security.jwt.expiration-ms:86400000}")
    private long jwtExpirationMs;

    private SecretKey getSigningKey() {
        // Soporta decodificación si viene en Hexadecimal o en texto plano UTF-8 de 32+ bytes
        byte[] keyBytes;
        if (jwtSecret.matches("^[0-9a-fA-F]{64}$")) {
            // Hexadecimal
            keyBytes = HexFormat.of().parseHex(jwtSecret);
        } else {
            keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }
    
    // ... Métodos para generar token, extraer username (subject), validar expiración y firma
}
```

---

## 6. Operación de Contenedores y Healthcheck

Para levantar el entorno de persistencia local:

```bash
# Iniciar base de datos en segundo plano
docker compose up -d

# Verificar estado y healthcheck
docker compose ps

# Ver logs del contenedor
docker compose logs -f postgres

# Detener el servicio
docker compose down
```

El volumen `trivia_postgres_data` persistirá todos los datos, mientras que `db/schema.sql` se ejecuta automáticamente la primera vez que se crea el volumen gracias al montaje `:ro` en `/docker-entrypoint-initdb.d/01-schema.sql`.
