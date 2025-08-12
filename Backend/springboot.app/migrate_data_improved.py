#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script mejorado para migrar datos de MySQL a PostgreSQL
"""

import re
import subprocess
import sys

def clean_and_convert_data(input_file, output_file):
    """Limpia y convierte datos de MySQL a PostgreSQL"""
    
    print(f"Limpiando y convirtiendo datos: {input_file}")
    
    try:
        with open(input_file, 'r', encoding='latin-1') as f:
            content = f.read()
    except Exception as e:
        print(f"Error leyendo archivo: {e}")
        return False
    
    # Remover comandos específicos de MySQL
    content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
    content = re.sub(r'--.*?\n', '\n', content)
    content = re.sub(r'SET.*?;', '', content)
    content = re.sub(r'LOCK TABLES.*?;', '', content)
    content = re.sub(r'UNLOCK TABLES;', '', content)
    content = re.sub(r'ALTER TABLE.*?;', '', content)
    
    # Convertir backticks a comillas dobles
    content = re.sub(r'`(\w+)`', r'"\1"', content)
    
    # Limpiar campos problemáticos
    content = re.sub(r'_binary \'[^\']*\'', 'NULL', content)
    content = re.sub(r'_binary \\\\0', 'NULL', content)
    
    # Remover líneas vacías múltiples
    content = re.sub(r'\n\s*\n', '\n\n', content)
    
    # Escribir archivo limpio
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
            if result.stdout.strip():
                print("Salida:", result.stdout)
            return True
        else:
            print("❌ Error durante la importación:")
            print("Error:", result.stderr)
            return False
            
    except Exception as e:
        print(f"❌ Error ejecutando comando: {e}")
        return False

def verify_data():
    """Verifica que los datos se importaron correctamente"""
    
    print("Verificando datos importados...")
    
    cmd = [
        'docker', 'exec', 'postgresSQL2',
        'psql', '-U', 'postgres', '-d', 'ElemenBarber',
        '-c', 'SELECT \'Usuario\' as tabla, COUNT(*) as registros FROM usuario UNION ALL SELECT \'Servicio\', COUNT(*) FROM servicio UNION ALL SELECT \'Cita\', COUNT(*) FROM cita UNION ALL SELECT \'Resenas\', COUNT(*) FROM resenas UNION ALL SELECT \'Portfolio\', COUNT(*) FROM portfolio;'
    ]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode == 0:
            print("📊 Conteo de registros:")
            print(result.stdout)
        else:
            print("Error verificando datos:", result.stderr)
    except Exception as e:
        print(f"Error ejecutando verificación: {e}")

if __name__ == "__main__":
    input_file = "mysql_data_only.sql"
    cleaned_file = "postgresql_clean_data_improved.sql"
    
    print("🚀 Iniciando migración mejorada de datos MySQL a PostgreSQL...")
    
    # Paso 1: Limpiar y convertir datos
    if not clean_and_convert_data(input_file, cleaned_file):
        sys.exit(1)
    
    # Paso 2: Importar a PostgreSQL
    if not import_to_postgresql(cleaned_file):
        sys.exit(1)
    
    # Paso 3: Verificar datos
    verify_data()
    
    print("🎉 Migración de datos completada exitosamente!")
