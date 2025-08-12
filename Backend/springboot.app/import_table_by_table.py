#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para importar datos tabla por tabla
"""

import subprocess
import sys

def clean_sql_file(input_file, output_file):
    """Limpia un archivo SQL para PostgreSQL"""
    
    try:
        with open(input_file, 'r', encoding='latin-1') as f:
            content = f.read()
    except Exception as e:
        print(f"Error leyendo {input_file}: {e}")
        return False
    
    # Remover comentarios y comandos específicos de MySQL
    import re
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
    
    # Escribir archivo limpio
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    return True

def import_table_data(table_name, clean_file):
    """Importa datos de una tabla específica"""
    
    print(f"Importando datos de la tabla {table_name}...")
    
    cmd = [
        'docker', 'exec', '-i', 'postgresSQL2',
        'psql', '-U', 'postgres', '-d', 'ElemenBarber', '-f', '-'
    ]
    
    try:
        with open(clean_file, 'r', encoding='utf-8') as f:
            result = subprocess.run(cmd, input=f.read(), text=True, capture_output=True)
        
        if result.returncode == 0:
            print(f"✅ {table_name} importada exitosamente!")
            return True
        else:
            print(f"❌ Error importando {table_name}:")
            print(result.stderr)
            return False
            
    except Exception as e:
        print(f"❌ Error ejecutando comando para {table_name}: {e}")
        return False

def main():
    """Función principal"""
    
    print("🚀 Iniciando importación tabla por tabla...")
    
    tables = [
        ('usuario', 'usuario_data.sql', 'usuario_clean.sql'),
        ('servicio', 'servicio_data.sql', 'servicio_clean.sql')
    ]
    
    for table_name, input_file, clean_file in tables:
        print(f"\n--- Procesando tabla: {table_name} ---")
        
        # Limpiar archivo
        if not clean_sql_file(input_file, clean_file):
            print(f"❌ Error limpiando {table_name}")
            continue
        
        # Importar datos
        if not import_table_data(table_name, clean_file):
            print(f"❌ Error importando {table_name}")
            continue
    
    # Verificar datos
    print("\n📊 Verificando datos importados...")
    verify_cmd = [
        'docker', 'exec', 'postgresSQL2',
        'psql', '-U', 'postgres', '-d', 'ElemenBarber',
        '-c', 'SELECT \'Usuario\' as tabla, COUNT(*) as registros FROM usuario UNION ALL SELECT \'Servicio\', COUNT(*) FROM servicio;'
    ]
    
    try:
        result = subprocess.run(verify_cmd, capture_output=True, text=True)
        if result.returncode == 0:
            print("Conteo de registros:")
            print(result.stdout)
        else:
            print("Error verificando datos:", result.stderr)
    except Exception as e:
        print(f"Error ejecutando verificación: {e}")
    
    print("\n🎉 Proceso completado!")

if __name__ == "__main__":
    main()
