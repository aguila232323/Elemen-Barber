#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para extraer solo los INSERT statements para PostgreSQL
"""

import re

def extract_insert_statements(input_file, output_file):
    """Extrae solo los INSERT statements del archivo SQL"""
    
    print(f"Extrayendo INSERT statements de {input_file}...")
    
    with open(input_file, 'r', encoding='latin-1') as f:
        content = f.read()
    
    # Encontrar todos los INSERT statements
    insert_pattern = r'INSERT INTO "[^"]+"[^;]+;'
    inserts = re.findall(insert_pattern, content, re.IGNORECASE | re.DOTALL)
    
    if not inserts:
        print("No se encontraron INSERT statements")
        return False
    
    print(f"Encontrados {len(inserts)} INSERT statements")
    
    # Escribir solo los INSERT statements
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("-- INSERT statements para PostgreSQL\n")
        f.write("-- Generado automáticamente desde MySQL\n\n")
        
        for insert in inserts:
            f.write(insert + "\n")
    
    print(f"✅ INSERT statements extraídos a: {output_file}")
    return True

if __name__ == "__main__":
    input_file = "postgresql_import.sql"
    output_file = "postgresql_inserts.sql"
    
    try:
        extract_insert_statements(input_file, output_file)
    except Exception as e:
        print(f"❌ Error: {e}")
