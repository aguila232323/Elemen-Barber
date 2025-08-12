#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para convertir datos de MySQL exportados a formato PostgreSQL
"""

import re
import sys

def convert_mysql_to_postgresql(input_file, output_file):
    """Convierte un archivo SQL de MySQL a formato PostgreSQL"""
    
    print(f"Convirtiendo {input_file} a {output_file}...")
    
    # Intentar diferentes codificaciones
    encodings = ['utf-8', 'latin-1', 'cp1252', 'iso-8859-1']
    content = None
    
    for encoding in encodings:
        try:
            with open(input_file, 'r', encoding=encoding) as f:
                content = f.read()
            print(f"Archivo leído con codificación: {encoding}")
            break
        except UnicodeDecodeError:
            continue
    
    if content is None:
        raise Exception("No se pudo leer el archivo con ninguna codificación")
    
    # Remover comentarios y comandos específicos de MySQL
    content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
    content = re.sub(r'--.*?\n', '\n', content)
    
    # Remover comandos específicos de MySQL
    content = re.sub(r'SET.*?;', '', content)
    content = re.sub(r'LOCK TABLES.*?;', '', content)
    content = re.sub(r'UNLOCK TABLES;', '', content)
    content = re.sub(r'DROP TABLE IF EXISTS.*?;', '', content)
    
    # Convertir tipos de datos
    content = re.sub(r'`(\w+)`', r'"\1"', content)  # Cambiar backticks por comillas dobles
    
    # Convertir sintaxis específica de MySQL
    content = re.sub(r'ENGINE=\w+', '', content)
    content = re.sub(r'DEFAULT CHARSET=\w+', '', content)
    content = re.sub(r'COLLATE=\w+', '', content)
    
    # Remover AUTO_INCREMENT (PostgreSQL usa SERIAL)
    content = re.sub(r'AUTO_INCREMENT=\d+', '', content)
    
    # Convertir INSERT statements
    content = re.sub(r'INSERT INTO `(\w+)`', r'INSERT INTO "\1"', content)
    
    # Remover líneas vacías múltiples
    content = re.sub(r'\n\s*\n', '\n\n', content)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Conversión completada: {output_file}")
    return True

if __name__ == "__main__":
    input_file = "mysql_export.sql"
    output_file = "postgresql_import.sql"
    
    try:
        convert_mysql_to_postgresql(input_file, output_file)
        print("✅ Conversión exitosa!")
    except Exception as e:
        print(f"❌ Error durante la conversión: {e}")
        sys.exit(1)
