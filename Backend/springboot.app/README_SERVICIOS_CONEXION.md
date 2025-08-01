# 🎯 Conexión de Servicios - Frontend con Backend

## 📋 Descripción

Se ha conectado la tabla de servicios que aparece en la página principal con la base de datos. Ahora los servicios se cargan dinámicamente desde la API del backend.

## 🔄 Cambios Realizados

### ✅ Frontend (React)
- **`useServicios.ts`**: Hook personalizado para manejar servicios
- **`Inicio.tsx`**: Modificado para usar datos dinámicos
- **Estados de carga**: Loading, error y datos vacíos
- **Diseño responsivo**: Mantiene el diseño original

### ✅ Backend (Spring Boot)
- **`ServicioController.java`**: Endpoint GET `/api/servicios`
- **`Servicio.java`**: Entidad con campos: id, nombre, descripción, precio, duración
- **`ServicioService.java`**: Lógica de negocio para servicios

### ✅ Base de Datos
- **Tabla `servicio`**: Almacena todos los servicios
- **Scripts SQL**: Para insertar servicios de ejemplo
- **Datos dinámicos**: Se actualizan desde el panel de administración

## 🏗️ Arquitectura

### Flujo de Datos
```
1. Usuario visita la página principal
2. React hace fetch a /api/servicios
3. Spring Boot consulta la base de datos
4. Los servicios se muestran en la página
```

### Estructura de Datos
```typescript
interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  duracionMinutos: number;
}
```

## 🚀 Configuración

### 1. Hook Personalizado
```typescript
// useServicios.ts
export const useServicios = () => {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch automático al montar el componente
  useEffect(() => {
    fetchServicios();
  }, []);
  
  return { servicios, loading, error };
};
```

### 2. Uso en Componente
```typescript
// Inicio.tsx
const { servicios, loading, error } = useServicios();

// Renderizado condicional
{loading ? (
  <div>Cargando servicios...</div>
) : error ? (
  <div>Error: {error}</div>
) : (
  <div>Servicios: {servicios.map(...)}</div>
)}
```

## 📧 API Endpoints

### GET /api/servicios
```json
// Response
[
  {
    "id": 1,
    "nombre": "Corte de pelo",
    "descripcion": "Corte personalizado adaptado a tus gustos",
    "precio": 15.0,
    "duracionMinutos": 30
  }
]
```

## 🧪 Pruebas

### Script de Prueba
```bash
# Ejecutar el script de servicios de ejemplo
.\insert_servicios_ejemplo.bat
```

### Verificación Manual
```bash
# Verificar que la API funciona
curl http://localhost:8080/api/servicios
```

## 📊 Servicios de Ejemplo

### Incluidos en el Script
- **Corte de pelo**: 15€ - 30 min
- **Corte a máquina**: 12€ - 25 min
- **Arreglo de barba**: 8€ - 20 min
- **Afeitado facial**: 10€ - 25 min
- **Corte + Barba**: 20€ - 45 min
- **Lavado de pelo**: 5€ - 15 min
- **Secador de pelo**: 8€ - 20 min
- **Coloración**: 25€ - 60 min
- **Arreglo de bigote**: 6€ - 15 min
- **Tratamiento capilar**: 15€ - 30 min

## 🎨 Diseño Frontend

### Estados de UI
- **Loading**: ⏳ "Cargando servicios..."
- **Error**: ❌ "Error al cargar los servicios"
- **Vacío**: 📋 "No hay servicios disponibles"
- **Datos**: Lista de servicios con precio y descripción

### Layout Responsivo
- **Dos columnas** en pantallas grandes
- **Una columna** en móviles
- **Diseño original** mantenido
- **Precios formateados** con símbolo €

## 🔧 Personalización

### Agregar Nuevos Servicios
1. **Panel de Administración**: Usar la interfaz web
2. **SQL Directo**: Ejecutar INSERT en MySQL
3. **API REST**: POST a /api/servicios

### Modificar Servicios
1. **Panel de Administración**: Editar desde la web
2. **API REST**: PUT a /api/servicios/{id}

### Eliminar Servicios
1. **Panel de Administración**: Eliminar desde la web
2. **API REST**: DELETE a /api/servicios/{id}

## 📈 Beneficios

### ✅ Dinámico
- **Datos actualizados** en tiempo real
- **Sin recargar** la página
- **Gestión centralizada** desde el backend

### ✅ Escalable
- **Fácil agregar** nuevos servicios
- **Modificar precios** sin tocar código
- **Gestión desde admin** panel

### ✅ Mantenible
- **Separación de responsabilidades**
- **Código limpio** y organizado
- **Fácil debugging**

## 🛡️ Seguridad

### ✅ Validación
- **Datos sanitizados** en el backend
- **Validación de tipos** en TypeScript
- **Manejo de errores** robusto

### ✅ Performance
- **Carga eficiente** de datos
- **Cache automático** del navegador
- **Optimización** de consultas

## 📝 Casos de Uso

### Escenario 1: Usuario Visita la Página
1. Se carga la página principal
2. Se hace fetch a /api/servicios
3. Se muestran los servicios disponibles
4. Usuario ve precios y descripciones actualizados

### Escenario 2: Admin Agrega Servicio
1. Admin usa el panel de administración
2. Agrega nuevo servicio con precio y descripción
3. Servicio aparece automáticamente en la página principal
4. No se necesita modificar código

### Escenario 3: Error de Conexión
1. Se muestra estado de loading
2. Si falla, se muestra mensaje de error
3. Usuario puede intentar recargar
4. Sistema es resiliente a fallos

## 🔄 Flujo Completo

```
1. Usuario abre la página principal
2. React monta el componente Inicio
3. useServicios hook se ejecuta
4. Fetch a http://localhost:8080/api/servicios
5. Spring Boot consulta la base de datos
6. Se devuelven los servicios en JSON
7. React actualiza el estado
8. Se renderizan los servicios en la UI
```

## 📋 Checklist de Implementación

- [x] **Hook personalizado** creado
- [x] **Componente actualizado** para usar datos dinámicos
- [x] **Estados de UI** implementados (loading, error, datos)
- [x] **API endpoint** funcionando
- [x] **Scripts de ejemplo** creados
- [x] **Documentación** completa
- [x] **Diseño responsivo** mantenido
- [x] **Manejo de errores** implementado

## 🎉 Conclusión

La conexión entre la página principal y la base de datos de servicios está completa. Ahora los servicios se cargan dinámicamente y pueden ser gestionados desde el panel de administración sin necesidad de modificar código. 