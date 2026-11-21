# ==============================================================================
# Build Stage: Compilación y Empaquetado
# ==============================================================================
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder

WORKDIR /build

# Optimización de capas: Descarga de dependencias en caché
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copia del código fuente y empaquetado del JAR ejecutable
COPY src ./src
RUN mvn clean package -DskipTests -B

# ==============================================================================
# Runtime Stage: Imagen mínima para producción
# ==============================================================================
FROM eclipse-temurin:21-jre-alpine AS runner

WORKDIR /app

# DevSecOps: Crear grupo y usuario sin privilegios root
RUN addgroup -S spring && adduser -S spring -G spring

# Copiar artefacto compilado desde el builder con ownership adecuado
COPY --from=builder --chown=spring:spring /build/target/*.jar app.jar

# Cambiar a usuario no root
USER spring:spring

# Exposición del puerto de servicio
EXPOSE 8080

# Flags optimizados para contenedores JVM (cgroups, RAM y entropía)
ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
