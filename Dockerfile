# ========================================
# DOCKERFILE PARA PRODUCCIÓN EN RAILWAY
# ========================================

# Etapa de construcción
FROM maven:3.8.4-openjdk-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Etapa de ejecución
FROM eclipse-temurin:17-jre-jammy

# Variables de entorno
ENV SPRING_PROFILES_ACTIVE=prod
ENV JAVA_OPTS="-Xms512m -Xmx1024m -XX:+UseG1GC -XX:+UseStringDeduplication -XX:+OptimizeStringConcat -XX:+UseCompressedOops -XX:+UseCompressedClassPointers"

# Usuario no root
RUN addgroup --system javauser && adduser --system --ingroup javauser javauser

WORKDIR /app
COPY --from=build /app/target/springboot.app-0.0.1-SNAPSHOT.jar app.jar
RUN chown javauser:javauser app.jar
USER javauser

# Exponer puerto (Railway lo asigna, pero esto es referencia)
EXPOSE 8080

# Directorio de logs
RUN mkdir -p /app/logs && chown javauser:javauser /app/logs

# Healthcheck (ajustado para Spring Boot Actuator)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# Comando de inicio
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
