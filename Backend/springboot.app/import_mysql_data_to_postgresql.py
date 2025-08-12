#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para importar datos de MySQL a PostgreSQL
"""

import re
import subprocess
import sys

def clean_mysql_data(input_file, output_file):
    """Limpia el archivo de datos de MySQL para PostgreSQL"""
    
    print(f"Limpiando datos de MySQL: {input_file}")
    
    try:
        with open(input_file, 'r', encoding='latin-1') as f:
            content = f.read()
    except UnicodeDecodeError:
        try:
            with open(input_file, 'r', encoding='utf-8') as f:
                content = f.read()
        except UnicodeDecodeError:
            print("Error: No se pudo leer el archivo con ninguna codificación")
            return False
    
    # Remover comentarios y comandos específicos de MySQL
    content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
    content = re.sub(r'--.*?\n', '\n', content)
    content = re.sub(r'SET.*?;', '', content)
    content = re.sub(r'LOCK TABLES.*?;', '', content)
    content = re.sub(r'UNLOCK TABLES;', '', content)
    
    # Convertir backticks a comillas dobles
    content = re.sub(r'`(\w+)`', r'"\1"', content)
    
    # Remover líneas vacías múltiples
    content = re.sub(r'\n\s*\n', '\n\n', content)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ Datos limpiados guardados en: {output_file}")
    return True

def import_to_postgresql(sql_file):
    """Importa los datos a PostgreSQL"""
    
    print(f"Importando datos a PostgreSQL desde: {sql_file}")
    
    # Comando para importar a PostgreSQL
    cmd = [
        'docker', 'exec', '-i', 'postgresSQL2',
        'psql', '-U', 'postgres', '-d', 'ElemenBarber', '-f', '-'
    ]
    
    try:
        with open(sql_file, 'r', encoding='utf-8') as f:
            result = subprocess.run(cmd, input=f.read(), text=True, capture_output=True)
        
        if result.returncode == 0:
            print("✅ Importación exitosa!")
            print("Salida:", result.stdout)
        else:
            print("❌ Error durante la importación:")
            print("Error:", result.stderr)
            return False
            
    except Exception as e:
        print(f"❌ Error ejecutando comando: {e}")
        return False
    
    return True

if __name__ == "__main__":
    input_file = "mysql_data_only.sql"
    cleaned_file = "postgresql_clean_data.sql"
    
    print("🚀 Iniciando migración de datos MySQL a PostgreSQL...")
    
    # Paso 1: Limpiar datos
    if not clean_mysql_data(input_file, cleaned_file):
        sys.exit(1)
    
    # Paso 2: Importar a PostgreSQL
    if not import_to_postgresql(cleaned_file):
        sys.exit(1)
    
    print("🎉 Migración de datos completada exitosamente!")
