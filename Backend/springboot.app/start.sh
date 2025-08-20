#!/bin/bash

# ========================================
# SCRIPT DE INICIO OPTIMIZADO PARA RAILWAY
# ========================================

echo "🚀 Iniciando ElemenBarber con optimizaciones de memoria..."

# Configuración de memoria JVM optimizada para Railway
export JAVA_OPTS="-Xmx512m -Xms256m -XX:+UseG1GC -XX:MaxGCPauseMillis=200 -XX:+UseStringDeduplication -XX:+OptimizeStringConcat -XX:+UseCompressedOops -XX:+UseCompressedClassPointers -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"

# Configuración adicional para contenedores
export JAVA_TOOL_OPTIONS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"

# Variables de entorno para optimización
export SPRING_PROFILES_ACTIVE="prod"
export LOGGING_LEVEL_ROOT="WARN"
export LOGGING_LEVEL_COM_POMELO_APP="INFO"

echo "📊 Configuración de memoria:"
echo "   - Heap máximo: 512MB"
echo "   - Heap inicial: 256MB"
echo "   - Garbage Collector: G1GC"
echo "   - RAM máxima: 75% del contenedor"

# Iniciar la aplicación
echo "🎯 Iniciando aplicación..."
java $JAVA_OPTS -jar target/springboot.app-0.0.1-SNAPSHOT.jar
