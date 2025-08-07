# Gestión del Portfolio - Funcionalidad de Administrador

## 📋 Descripción

Se ha implementado una funcionalidad completa para que los administradores puedan gestionar las fotos del portfolio directamente desde la interfaz web. Los usuarios normales solo pueden ver las fotos activas, mientras que los administradores pueden añadir y eliminar fotos.

## 🎯 Funcionalidades Implementadas

### Frontend (React + TypeScript)

#### **Componente Portfolio Actualizado**
- **Ubicación**: `Front/esential-barber/src/pages/public/Portfolio/Portafolio.tsx`
- **Funcionalidades**:
  - ✅ **Carga dinámica** de fotos desde la API
  - ✅ **Detección automática** de rol de administrador
  - ✅ **Botones de admin** solo visibles para administradores
  - ✅ **Conversión automática** de imágenes a Base64
  - ✅ **Validación de archivos** (tipo y tamaño)
  - ✅ **Estados de carga** y error
  - ✅ **Modal elegante** para subir fotos

#### **Estilos CSS Responsive**
- **Ubicación**: `Front/esential-barber/src/pages/public/Portfolio/Portafolio.module.css`
- **Características**:
  - ✅ **Botones de eliminar** con hover effects
  - ✅ **Modal de admin** con diseño moderno
  - ✅ **Input de archivo** con drag & drop visual
  - ✅ **Responsive design** para todos los dispositivos
  - ✅ **Estados de carga** y error

### Backend (Spring Boot + MySQL)

#### **Entidad Portfolio**
- **Ubicación**: `Backend/springboot.app/src/main/java/com/pomelo/app/springboot/app/entity/Portfolio.java`
- **Campos**:
  - `id`: Identificador único
  - `nombre`: Nombre de la foto
  - `imagenBase64`: Imagen convertida a Base64 (LONGTEXT)
  - `urlInstagram`: URL de Instagram (opcional)
  - `fechaCreacion`: Fecha de creación automática
  - `activo`: Estado de la foto (true/false)

#### **Repositorio Portfolio**
- **Ubicación**: `Backend/springboot.app/src/main/java/com/pomelo/app/springboot/app/repository/PortfolioRepository.java`
- **Métodos**:
  - `findAllByOrderByFechaCreacionDesc()`: Todas las fotos ordenadas
  - `findByActivoTrueOrderByFechaCreacionDesc()`: Solo fotos activas
  - `countByActivoTrue()`: Contar fotos activas

#### **Servicio Portfolio**
- **Ubicación**: `Backend/springboot.app/src/main/java/com/pomelo/app/springboot/app/service/PortfolioService.java`
- **Funcionalidades**:
  - ✅ **Añadir fotos** con Base64
  - ✅ **Eliminar fotos** (marca como inactiva)
  - ✅ **Eliminar permanentemente** fotos
  - ✅ **Actualizar fotos** (nombre y URL)
  - ✅ **Obtener estadísticas** del portfolio

#### **Controlador Portfolio**
- **Ubicación**: `Backend/springboot.app/src/main/java/com/pomelo/app/springboot/app/controller/PortfolioController.java`
- **Endpoints**:
  - `GET /api/portfolio/fotos` - Fotos públicas (activas)
  - `GET /api/portfolio/admin/todas` - Todas las fotos (admin)
  - `POST /api/portfolio/admin/añadir` - Añadir foto (admin)
  - `DELETE /api/portfolio/admin/eliminar/{id}` - Eliminar foto (admin)
  - `DELETE /api/portfolio/admin/eliminar-permanente/{id}` - Eliminar permanentemente (admin)
  - `PUT /api/portfolio/admin/actualizar/{id}` - Actualizar foto (admin)
  - `GET /api/portfolio/admin/estadisticas` - Estadísticas (admin)

#### **Configuración de Seguridad**
- **Ubicación**: `Backend/springboot.app/src/main/java/com/pomelo/app/springboot/app/config/SecurityConfig.java`
- **Reglas**:
  - ✅ `/api/portfolio/fotos` - Acceso público
  - ✅ `/api/portfolio/admin/**` - Solo administradores

#### **Migración de Base de Datos**
- **Ubicación**: `Backend/springboot.app/src/main/resources/db/migration/V12__create_portfolio_table.sql`
- **Tabla**: `portfolio`
- **Índices**: Optimizados para consultas por estado y fecha

## 🔧 Características Técnicas

### **Conversión Base64**
- **Frontend**: Conversión automática de archivos a Base64
- **Backend**: Almacenamiento en LONGTEXT para imágenes grandes
- **Validación**: Máximo 5MB por imagen

### **Gestión de Estados**
- **Fotos activas**: Visibles para todos los usuarios
- **Fotos inactivas**: Solo visibles para administradores
- **Eliminación suave**: Marca como inactiva en lugar de eliminar
- **Eliminación permanente**: Elimina completamente de la base de datos

### **Seguridad**
- **Autenticación**: JWT token requerido para operaciones de admin
- **Autorización**: Verificación de rol ADMIN
- **Validación**: Tipo de archivo y tamaño en frontend y backend

### **UX/UI**
- **Botones de eliminar**: Aparecen solo al hacer hover (admin)
- **Modal elegante**: Diseño moderno para subir fotos
- **Estados de carga**: Spinner y mensajes informativos
- **Responsive**: Funciona en todos los dispositivos
- **Accesibilidad**: ARIA labels y navegación por teclado

## 📱 Interfaz de Usuario

### **Para Usuarios Normales**
- ✅ Ver fotos del portfolio
- ✅ Hacer clic en fotos con URL de Instagram
- ✅ Navegación responsive

### **Para Administradores**
- ✅ **Botón "Añadir Foto"** en la esquina inferior
- ✅ **Botones de eliminar** en cada foto (hover)
- ✅ **Modal de subida** con drag & drop visual
- ✅ **Validación en tiempo real** de archivos
- ✅ **Estados de carga** durante la subida

## 🚀 Cómo Usar

### **Para Administradores**

1. **Añadir Foto**:
   - Hacer clic en "Añadir Foto"
   - Seleccionar imagen (máximo 5MB)
   - La imagen se convierte automáticamente a Base64
   - Hacer clic en "Añadir Foto" para confirmar

2. **Eliminar Foto**:
   - Hacer hover sobre una foto
   - Hacer clic en el botón de eliminar (🗑️)
   - Confirmar la eliminación

### **Para Usuarios Normales**
- Navegar al portfolio
- Ver las fotos activas
- Hacer clic en fotos con URL de Instagram

## 🔒 Seguridad y Validaciones

### **Frontend**
- ✅ Validación de tipo de archivo (solo imágenes)
- ✅ Validación de tamaño (máximo 5MB)
- ✅ Verificación de token JWT
- ✅ Verificación de rol de administrador

### **Backend**
- ✅ Autenticación JWT requerida
- ✅ Autorización por rol ADMIN
- ✅ Validación de datos de entrada
- ✅ Manejo de errores robusto
- ✅ Logs de seguridad

## 📊 Base de Datos

### **Tabla Portfolio**
```sql
CREATE TABLE portfolio (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    imagen_base64 LONGTEXT,
    url_instagram VARCHAR(500),
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
);
```

### **Índices**
- `idx_portfolio_activo`: Para consultas de fotos activas
- `idx_portfolio_fecha_creacion`: Para ordenamiento por fecha

## 🎨 Diseño y UX

### **Colores y Estilos**
- **Botones de admin**: Gradiente azul (#64b5f6 → #42a5f5)
- **Botones de eliminar**: Rojo con transparencia
- **Modal**: Fondo oscuro con bordes azules
- **Estados de carga**: Azul con animación

### **Responsive Design**
- **Desktop**: 3 columnas de fotos
- **Tablet**: 2 columnas
- **Mobile**: 1 columna
- **Botones**: Tamaños adaptativos para touch

## 🔄 Flujo de Datos

1. **Carga inicial**: Frontend llama a `/api/portfolio/fotos`
2. **Añadir foto**: Frontend convierte a Base64 → POST a `/api/portfolio/admin/añadir`
3. **Eliminar foto**: DELETE a `/api/portfolio/admin/eliminar/{id}`
4. **Recarga**: Frontend recarga las fotos después de cambios

## 🛠️ Mantenimiento

### **Limpieza de Datos**
- Las fotos eliminadas se marcan como inactivas
- Opción de eliminación permanente disponible
- Base64 puede ocupar mucho espacio (monitorear)

### **Optimizaciones Futuras**
- Compresión de imágenes antes de Base64
- Thumbnails para vista previa
- Paginación para portfolios grandes
- Cache de imágenes en frontend

## ✅ Estado de Implementación

- ✅ **Frontend**: Completamente funcional
- ✅ **Backend**: API completa implementada
- ✅ **Base de datos**: Migración creada
- ✅ **Seguridad**: Configurada y probada
- ✅ **Responsive**: Funciona en todos los dispositivos
- ✅ **UX/UI**: Diseño moderno y accesible

¡La funcionalidad está lista para usar! 🎉 