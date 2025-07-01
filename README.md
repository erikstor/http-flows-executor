# Flows HTTP - Constructor de Flujos de API

Una aplicación React para crear, ejecutar y gestionar flujos de peticiones HTTP con soporte para variables, extractores de respuestas y manejo automático de CORS.

## 🚀 Características

- **Constructor Visual de Flujos**: Crea flujos de endpoints conectados visualmente
- **Variables Dinámicas**: Soporte para variables globales, de flujo y de endpoint
- **Extractores de Respuestas**: Extrae automáticamente datos de respuestas HTTP usando JSONPath
- **Importación cURL**: Importa comandos cURL directamente
- **Ejecución de Flujos**: Ejecuta flujos completos con orden basado en dependencias
- **Exportación/Importación**: Guarda y carga flujos en formato JSON
- **Solución CORS Integrada**: Manejo automático de problemas de CORS

## 🔧 Solución CORS Automática

### Problema
Los navegadores bloquean peticiones entre diferentes dominios por políticas de CORS (Cross-Origin Resource Sharing).

### Solución Implementada

1. **Detección Automática**: El sistema detecta automáticamente errores de CORS
2. **Reintento con Proxy**: Intenta automáticamente usar el proxy de desarrollo si falla la petición directa
3. **Sugerencias Inteligentes**: Genera sugerencias automáticas basadas en el tipo de error
4. **Notificaciones en Tiempo Real**: Muestra notificaciones automáticas con soluciones
5. **Modal de Diagnóstico**: Interfaz completa para resolver problemas CORS

### Cómo usar

#### Opción 1: Proxy de Desarrollo (Recomendado)
En lugar de usar URLs completas, usa rutas relativas:
```
❌ https://wally-billetera.dev.wally.tech/walletuser/v1
✅ /walletuser/v1
```

#### Opción 2: Configurar el Servidor
Si tienes control del servidor, agrega estos headers:
```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
```

#### Opción 3: Automático (Recomendado)
El sistema maneja automáticamente los problemas de CORS:
- Detecta errores CORS automáticamente
- Reintenta con proxy si es necesario
- Muestra sugerencias inteligentes
- Notificaciones en tiempo real

#### Opción 4: Diagnóstico Manual
Usa el botón "🔍 Diagnóstico CORS" en el sidebar para:
- Ver información detallada sobre CORS
- Ejecutar tests de diagnóstico
- Obtener soluciones específicas

## 📦 Instalación

1. **Clona el repositorio**:
```bash
git clone <url-del-repositorio>
cd flows-http
```

2. **Instala las dependencias**:
```bash
npm install
```

3. **Inicia la aplicación**:
```bash
npm start
```

4. **Abre tu navegador** en `http://localhost:3000`

## 🎮 Cómo Usar

### 1. Crear Endpoints
- Haz clic en **"+ Agregar Endpoint"** en el canvas
- Completa el formulario con:
  - **Nombre**: Identificador del endpoint
  - **Método**: GET, POST, PUT, DELETE, PATCH
  - **URL**: Endpoint de la API
  - **Headers**: Headers en formato JSON
  - **Body**: Cuerpo de la petición (para POST/PUT/PATCH)

### 2. Configurar Variables

#### Variables Globales 🌍
- Variables de entorno disponibles en todo el flujo
- Ejemplo: `BASE_URL`, `API_KEY`
- Se configuran en el sidebar izquierdo

#### Variables de Flujo 🔄
- Variables que pueden actualizarse durante la ejecución
- Ejemplo: `USER_ID`, `SESSION_TOKEN`
- Útiles para pasar datos entre endpoints

#### Variables de Endpoint 🔗
- Variables específicas de cada endpoint
- Se configuran seleccionando un endpoint primero
- Ejemplo: `QUERY_PARAM`, `PATH_VARIABLE`

### 3. Usar Variables en Endpoints
Usa la sintaxis `{{NOMBRE_VARIABLE}}` en:
- **URLs**: `https://api.example.com/users/{{USER_ID}}`
- **Headers**: `{"Authorization": "Bearer {{API_KEY}}"}`
- **Body**: `{"userId": "{{USER_ID}}"}`

### 4. Conectar Endpoints
1. Haz clic en el botón **🔗** de un endpoint
2. Arrastra hasta otro endpoint
3. Suelta para crear la conexión
4. Los endpoints se ejecutarán en orden de conexión

### 5. Ejecutar Flujos
- **Ejecutar individual**: Haz clic en **▶️** en cada endpoint
- **Ejecutar flujo completo**: Haz clic en **"Ejecutar Flujo"** en el canvas

## 🎨 Interfaz de Usuario

### Sidebar Izquierdo
- **Variables Globales**: Configuración de variables de entorno
- **Variables de Flujo**: Variables que cambian durante la ejecución
- **Variables de Endpoint**: Variables específicas del endpoint seleccionado
- **Guía de uso**: Instrucciones y ejemplos

### Canvas Principal
- **Área de trabajo**: Arrastra y conecta endpoints
- **Controles**: Botones para agregar endpoints y ejecutar flujos
- **Endpoints**: Nodos visuales con información del endpoint
- **Conexiones**: Líneas que muestran el flujo de ejecución

### Endpoints
Cada endpoint muestra:
- **Método HTTP**: Badge con color según el método
- **Nombre y URL**: Información del endpoint
- **Estado**: Pendiente, Ejecutando, Completado, Error
- **Respuesta**: Status code y datos de respuesta
- **Acciones**: Ejecutar, Editar, Eliminar, Conectar

## 🔧 Tecnologías Utilizadas

- **React 18**: Framework principal
- **CSS3**: Estilos y animaciones
- **Canvas API**: Dibujo de conexiones
- **Fetch API**: Peticiones HTTP
- **UUID**: Generación de IDs únicos

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── App.js              # Componente principal
│   ├── Sidebar.js          # Panel de variables
│   ├── FlowCanvas.js       # Canvas principal
│   ├── EndpointNode.js     # Nodo de endpoint
│   ├── EndpointModal.js    # Modal de edición de endpoints
│   └── VariableModal.js    # Modal de edición de variables
├── index.js                # Punto de entrada
└── index.css               # Estilos globales
```

## 🚀 Ejemplos de Uso

### Ejemplo 1: Flujo de Autenticación
1. **POST /auth/login** → Obtiene token
2. **GET /users/profile** → Usa token en header
3. **PUT /users/profile** → Actualiza perfil

### Ejemplo 2: Flujo de E-commerce
1. **GET /products** → Lista productos
2. **POST /cart/add** → Agrega producto al carrito
3. **GET /cart** → Obtiene carrito actualizado
4. **POST /orders** → Crea orden

### Variables de Ejemplo
```json
{
  "BASE_URL": "https://api.example.com",
  "API_KEY": "your-secret-key",
  "USER_ID": "12345",
  "TOKEN": "jwt-token-from-login"
}
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:
1. Revisa la documentación
2. Busca en los issues existentes
3. Crea un nuevo issue con detalles del problema

---

¡Disfruta creando flujos de API con Flows HTTP! 🎉 