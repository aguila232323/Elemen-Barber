# ========================================
# DOCKERFILE PARA PRODUCCIÓN
# ========================================

# Etapa de construcción
FROM maven:3.8.4-openjdk-17 AS build

# Copiar código fuente
WORKDIR /app
COPY pom.xml .
COPY src ./src

# Descargar dependencias y construir
RUN mvn clean package -DskipTests

# Etapa de ejecución
FROM openjdk:17-jre-slim

# Variables de entorno por defecto
ENV SPRING_PROFILES_ACTIVE=prod
ENV SERVER_PORT=8080

# Crear usuario no-root
RUN addgroup --system javauser && adduser --system --ingroup javauser javauser

# Crear directorio de trabajo
WORKDIR /app

# Copiar JAR desde la etapa de construcción
COPY --from=build /app/target/springboot.app-0.0.1-SNAPSHOT.jar app.jar

# Cambiar propietario del archivo
RUN chown javauser:javauser app.jar

# Cambiar al usuario no-root
USER javauser

# Exponer puerto
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Crear directorio de logs
RUN mkdir -p /app/logs && chown javauser:javauser /app/logs

# Configurar JVM para producción
ENV JAVA_OPTS="-Xms512m -Xmx1024m -XX:+UseG1GC -XX:+UseStringDeduplication -XX:+OptimizeStringConcat -XX:+UseCompressedOops -XX:+UseCompressedClassPointers -XX:+UnlockExperimentalVMOptions -XX:+UseZGC -XX:+UnlockDiagnosticVMOptions -XX:+LogVMOutput -XX:LogFile=/app/logs/jvm.log"

# Comando de inicio
ENTRYPOINT ["java", "-jar", "app.jar"]
