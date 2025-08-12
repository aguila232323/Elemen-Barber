#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para probar la validación de números de teléfono
"""

import re

def clean_phone_number(phone):
    """Limpia un número de teléfono removiendo todos los caracteres no numéricos"""
    if phone is None:
        return ""
    return re.sub(r'\D', '', phone)

def validate_phone(phone):
    """Valida si un número de teléfono tiene el formato correcto (internacional)"""
    if phone is None or phone.strip() == "":
        return False

    clean_phone = clean_phone_number(phone)
    
    # Validación básica: entre 7 y 15 dígitos
    if len(clean_phone) < 7 or len(clean_phone) > 15:
        return False
    
    # Para números españoles (9 dígitos), verificar que empiece por 6, 7 o 9
    if len(clean_phone) == 9:
        return re.match(r'^[679]\d{8}$', clean_phone) is not None
    
    # Para números con prefijo internacional, verificar formato
    if clean_phone.startswith("34") and len(clean_phone) == 11:
        return re.match(r'^34[679]\d{8}$', clean_phone) is not None
    
    # Para otros prefijos internacionales, solo verificar longitud
    return True

def test_phone_numbers():
    """Prueba diferentes formatos de números de teléfono"""
    
    test_cases = [
        # Números españoles válidos
        ("612345678", "Número español 9 dígitos"),
        ("712345678", "Número español 9 dígitos"),
        ("912345678", "Número español 9 dígitos"),
        ("+34612345678", "Número español con +34"),
        ("0034612345678", "Número español con 0034"),
        
        # Números internacionales válidos
        ("1234567890", "Número de 10 dígitos"),
        ("123456789012", "Número de 12 dígitos"),
        ("+11234567890", "Número con +1"),
        ("+44123456789", "Número con +44"),
        
        # Números inválidos
        ("123456", "Muy corto (6 dígitos)"),
        ("1234567890123456", "Muy largo (16 dígitos)"),
        ("812345678", "Español empezando por 8"),
        ("", "Vacío"),
        (None, "Null"),
    ]
    
    print("🧪 Probando validación de números de teléfono")
    print("=" * 60)
    
    for phone, description in test_cases:
        is_valid = validate_phone(phone)
        status = "✅ VÁLIDO" if is_valid else "❌ INVÁLIDO"
        print(f"{status} | {phone or 'None':<15} | {description}")
    
    print("\n📱 Ahora puedes probar con tu número de teléfono!")

if __name__ == "__main__":
    test_phone_numbers()
