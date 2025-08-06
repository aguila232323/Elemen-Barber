# Actualización de Servicios - Nuevos Campos

## Descripción
Se han agregado dos nuevos campos a la tabla `servicio` para mejorar la experiencia visual:

- **emoji**: Campo para mostrar emojis junto a los servicios en citas y pantalla de inicio
- **textoDescriptivo**: Campo para texto descriptivo personalizado en la pantalla de inicio

## Instrucciones de Actualización

### 1. Ejecutar Script SQL
Ejecuta el archivo `ADD_EMOJI_AND_TEXT_FIELDS.sql` en tu base de datos:

```sql
-- Script para agregar campos de emoji y texto descriptivo a la tabla servicio
ALTER TABLE servicio 
ADD COLUMN emoji VARCHAR(10) NULL,
ADD COLUMN texto_descriptivo VARCHAR(200) NULL;
```

### 2. Reiniciar la Aplicación
Después de ejecutar el script SQL, reinicia tanto el backend como el frontend:

```bash
# Backend (desde la carpeta Backend/springboot.app)
./mvnw spring-boot:run

# Frontend (desde la carpeta Front/esential-barber)
npm start
```

### 3. Configurar Servicios Existentes
Una vez que la aplicación esté funcionando, puedes:

1. Ir a la sección de Configuración del admin
2. Editar los servicios existentes para agregar:
   - **Emoji**: Por ejemplo, ✂️ para cortes, 🎨 para tintes, ✨ para mechas
   - **Texto Descriptivo**: Descripción personalizada para la pantalla de inicio

### 4. Nuevos Campos en el Formulario
Al añadir o editar servicios, ahora verás:
- Campo **Emoji**: Para agregar emojis (ej: ✂️, 💈, 🎨)
- Campo **Texto Descriptivo**: Para texto personalizado en la pantalla de inicio

## Cambios Implementados

### Backend
- ✅ Entidad `Servicio` actualizada con nuevos campos
- ✅ Getters y setters agregados
- ✅ Script SQL para actualizar base de datos

### Frontend
- ✅ Interfaz `Servicio` actualizada en todos los componentes
- ✅ Formularios de añadir/editar servicios actualizados
- ✅ Pantalla de inicio actualizada para usar nuevos campos
- ✅ Calendario de citas actualizado para mostrar emojis
- ✅ Modal de selección de servicios actualizado

## Beneficios
- **Mejor UX**: Emojis hacen los servicios más visuales
- **Personalización**: Texto descriptivo personalizado para cada servicio
- **Consistencia**: Los emojis aparecen en citas y pantalla de inicio
- **Flexibilidad**: Los campos son opcionales, manteniendo compatibilidad

## Notas Importantes
- Los campos son opcionales, por lo que los servicios existentes seguirán funcionando
- Si no se especifica emoji, se usa un icono por defecto
- Si no se especifica texto descriptivo, se usa la descripción normal 