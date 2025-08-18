# ========================================
# DOCKERFILE PARA PRODUCCIÓN - ELEMEN BARBER
# ========================================

# Etapa de construcción
FROM maven:3.8.4-openjdk-17 AS build
WORKDIR /app
COPY springboot.app/pom.xml .
COPY springboot.app/src ./src
COPY springboot.app/libs ./libs
RUN mvn clean package -DskipTests

# Etapa de ejecución
FROM eclipse-temurin:17-jre-jammy

# Variables de entorno optimizadas para producción
ENV SPRING_PROFILES_ACTIVE=prod
ENV JAVA_OPTS="-Xmx2g -Xms1g -XX:+UseG1GC -XX:MaxGCPauseMillis=200 -XX:+UseStringDeduplication -XX:+OptimizeStringConcat -XX:+UseCompressedOops -XX:+UseCompressedClassPointers -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"
ENV JAVA_TOOL_OPTIONS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"

# Usuario no root
RUN addgroup --system javauser && adduser --system --ingroup javauser javauser

WORKDIR /app
COPY --from=build /app/target/springboot.app-0.0.1-SNAPSHOT.jar app.jar

# Directorio de logs (crear before changing user)
RUN mkdir -p /app/logs && chown javauser:javauser app.jar && chown javauser:javauser /app/logs
USER javauser

# Exponer puerto
EXPOSE 8080

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Comando de inicio
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
