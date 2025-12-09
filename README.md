# 🏸 Sistema de Reservas de Pádel

Un sistema completo de gestión de reservas para canchas de pádel desarrollado con **Node.js**, **Express**, **MySQL** y **JavaScript vanilla**. Diseñado para proporcionar una experiencia moderna y eficiente tanto para administradores como para usuarios.

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [API Endpoints](#-api-endpoints)
- [Base de Datos](#-base-de-datos)
- [Funcionalidades](#-funcionalidades)
- [Capturas de Pantalla](#-capturas-de-pantalla)
- [Contribución](#-contribución)
- [Licencia](#-licencia)

## ✨ Características

### 🎯 Gestión de Reservas
- **Creación intuitiva** de nuevas reservas con validación en tiempo real
- **Gestión de estados** flexible: Pendiente → Confirmada → Completada/Cancelada
- **Reactivación** de reservas canceladas
- **Paginación** de 15 elementos por página para mejor rendimiento
- **Ordenamiento** automático por ID descendente (más recientes primero)

### 👥 Gestión de Usuarios
- **Registro** de nuevos usuarios con validación completa
- **Niveles de juego**: Principiante, Intermedio, Avanzado, Profesional
- **Validación de email** único y formato correcto
- **Visualización** paginada y organizada

### 🏟️ Gestión de Canchas
- **Múltiples tipos** de cancha: Interior/Exterior
- **Diferentes superficies**: Césped artificial, Resina
- **Precios diferenciados** por cancha y horario
- **Estado activo/inactivo** para disponibilidad

### 📊 Dashboard y Reportes
- **Gráficos interactivos** de reservas por mes
- **Estadísticas** de estados de reservas
- **Visualización** de tendencias y métricas importantes

### 🎨 Interfaz de Usuario
- **Diseño responsivo** adaptable a cualquier dispositivo
- **Navegación intuitiva** con pestañas organizadas
- **Feedback visual** con notificaciones toast
- **Loading states** para mejor experiencia de usuario

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web minimalista
- **MySQL2** - Driver para base de datos MySQL
- **Joi** - Validación de esquemas de datos
- **Helmet** - Seguridad HTTP
- **CORS** - Manejo de peticiones cross-origin
- **Express Rate Limit** - Limitación de peticiones

### Frontend
- **HTML5** - Estructura semántica
- **CSS3** - Estilos modernos con Flexbox y Grid
- **JavaScript ES6+** - Lógica del frontend
- **Font Awesome** - Iconografía
- **Chart.js** - Gráficos interactivos

### Base de Datos
- **MySQL 8.0+** - Sistema de gestión de base de datos relacional

## 🚀 Instalación

### Prerrequisitos
- Node.js 16+ instalado
- MySQL 8.0+ instalado y configurado
- npm o yarn como gestor de paquetes

### Paso 1: Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/sistema-reservas-padel.git
cd sistema-reservas-padel
```

### Paso 2: Instalar dependencias del backend
```bash
cd backend
npm install
```

### Paso 3: Configurar la base de datos
```bash
# Ejecutar el script de creación de base de datos
mysql -u root -p < ../database/schema.sql
```

### Paso 4: Configurar variables de entorno
```bash
# Crear archivo .env en el directorio backend
cp .env.example .env
```

Editar el archivo `.env` con tus credenciales:
```env
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=padel_reservas
DB_PORT=3306
PORT=5000
NODE_ENV=development
```

### Paso 5: Iniciar el servidor
```bash
npm start
# o para desarrollo:
npm run dev
```

### Paso 6: Acceder a la aplicación
Abrir el navegador y navegar a: `http://localhost:5000`

## ⚙️ Configuración

### Configuración de Base de Datos
El archivo `database/schema.sql` contiene:
- Estructura completa de tablas
- Datos de ejemplo para pruebas
- Índices para optimización de consultas

### Configuración del Frontend
El archivo `frontend/js/config.js` permite ajustar:
```javascript
const CONFIG = {
    API_BASE_URL: 'http://localhost:5000/api',
    MODO_PRUEBA: false, // true para datos simulados
    ELEMENTOS_POR_PAGINA: 15
};
```

## 📖 Uso

### 1. Gestión de Reservas
1. **Crear Reserva**: Click en "Nueva Reserva" → Completar formulario → "Crear Reserva"
2. **Cambiar Estado**: Usar botones de acción en cada fila de la tabla
3. **Filtrar**: Usar filtros por fecha y estado para encontrar reservas específicas

### 2. Gestión de Usuarios
1. **Agregar Usuario**: Click en "Nuevo Usuario" → Completar datos → "Crear Usuario"
2. **Ver Usuarios**: Navegar con paginación, 15 usuarios por página

### 3. Visualización de Datos
1. **Dashboard**: Ver gráficos y estadísticas en tiempo real
2. **Filtros**: Aplicar filtros para análisis específicos

## 📁 Estructura del Proyecto

```
sistema-reservas-padel/
├── 📁 backend/                 # Servidor Node.js
│   ├── 📄 server.js           # Servidor principal
│   ├── 📄 database.js         # Configuración de BD
│   ├── 📄 models.js           # Modelos de datos
│   ├── 📄 validators.js       # Validaciones Joi
│   ├── 📄 chartService.js     # Servicio de gráficos
│   ├── 📄 update_dates.js     # Utilidades de fechas
│   └── 📄 package.json        # Dependencias backend
├── 📁 frontend/               # Cliente web
│   ├── 📄 index.html          # Página principal
│   ├── 📁 css/
│   │   └── 📄 styles.css      # Estilos globales
│   └── 📁 js/
│       ├── 📄 app.js          # Aplicación principal
│       ├── 📄 ui.js           # Interfaz de usuario
│       ├── 📄 api.js          # Cliente API
│       ├── 📄 config.js       # Configuración
│       └── 📄 charts.js       # Gráficos
├── 📁 database/
│   └── 📄 schema.sql          # Esquema de base de datos
└── 📄 README.md               # Este archivo
```

## 🔗 API Endpoints

### Usuarios
- `GET /api/usuarios` - Obtener todos los usuarios
- `POST /api/usuarios` - Crear nuevo usuario
- `GET /api/usuarios/:id` - Obtener usuario por ID

### Reservas
- `GET /api/reservas` - Obtener todas las reservas
- `POST /api/reservas` - Crear nueva reserva
- `PUT /api/reservas/:id/estado` - Actualizar estado de reserva

### Canchas
- `GET /api/canchas` - Obtener todas las canchas
- `GET /api/canchas/:id` - Obtener cancha por ID

### Horarios
- `GET /api/horarios` - Obtener todos los horarios
- `GET /api/horarios/disponibles` - Obtener horarios disponibles

### Gráficos
- `GET /api/grafico-barras` - Datos para gráfico de barras
- `GET /api/grafico-circular` - Datos para gráfico circular

## 🗄️ Base de Datos

### Tablas Principales

#### `usuarios`
```sql
- id_usuario (INT, PK, AUTO_INCREMENT)
- nombre (VARCHAR(100))
- apellido (VARCHAR(100))
- email (VARCHAR(255), UNIQUE)
- telefono (VARCHAR(20))
- nivel_juego (ENUM)
- fecha_registro (TIMESTAMP)
```

#### `reservas`
```sql
- id_reserva (INT, PK, AUTO_INCREMENT)
- id_usuario (INT, FK)
- id_cancha (INT, FK)
- id_horario (INT, FK)
- fecha_reserva (DATE)
- fecha_creacion (TIMESTAMP)
- estado (ENUM: 'pendiente', 'confirmada', 'completada', 'cancelada')
- precio_total (DECIMAL(10,2))
- observaciones (TEXT)
```

#### `canchas`
```sql
- id_cancha (INT, PK, AUTO_INCREMENT)
- nombre (VARCHAR(100))
- tipo (ENUM: 'interior', 'exterior')
- superficie (VARCHAR(50))
- precio_hora (DECIMAL(8,2))
- activa (BOOLEAN)
```

#### `horarios`
```sql
- id_horario (INT, PK, AUTO_INCREMENT)
- hora_inicio (TIME)
- hora_fin (TIME)
- activo (BOOLEAN)
```

## 🎯 Funcionalidades

### ✅ Completadas
- [x] **Sistema de paginación** (15 elementos por página)
- [x] **Gestión de estados** de reservas con botones intuitivos
- [x] **Reactivación** de reservas canceladas
- [x] **Creación** de usuarios y reservas con validación
- [x] **Ordenamiento** automático por ID descendente
- [x] **API RESTful** completa y documentada
- [x] **Interfaz responsiva** y moderna
- [x] **Rate limiting** optimizado para desarrollo
- [x] **Manejo de errores** robusto
- [x] **Gráficos interactivos** con Chart.js

### 🔄 Estados de Reserva

| Estado Actual | Acciones Disponibles |
|---------------|---------------------|
| **Pendiente** | Confirmar, Cancelar |
| **Confirmada** | Completar, Cancelar |
| **Cancelada** | Reactivar |
| **Completada** | Sin acciones (estado final) |

### 🎨 Características de UI

- **Navegación por pestañas**: Dashboard, Reservas, Usuarios, Canchas
- **Notificaciones toast**: Feedback inmediato para todas las acciones
- **Loading states**: Indicadores visuales durante operaciones asíncronas
- **Formularios validados**: Validación en tiempo real con mensajes específicos
- **Tabla responsiva**: Se adapta a diferentes tamaños de pantalla
- **Filtros avanzados**: Por fecha, estado y otros criterios

## 📱 Capturas de Pantalla

### Dashboard Principal
- Vista general con métricas y gráficos
- Acceso rápido a todas las secciones

### Gestión de Reservas
- Tabla paginada con todas las reservas
- Botones de acción según el estado
- Filtros por fecha y estado

### Creación de Reservas
- Modal intuitivo con validación
- Selección de usuario, cancha y horario
- Cálculo automático de precios

### Gestión de Usuarios
- Lista paginada de usuarios registrados
- Formulario de registro simplificado

## 🤝 Contribución

### Cómo Contribuir
1. **Fork** el repositorio
2. **Crear** una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. **Commit** tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. **Push** a la rama (`git push origin feature/nueva-funcionalidad`)
5. **Abrir** un Pull Request

### Guías de Desarrollo
- Seguir las convenciones de nomenclatura establecidas
- Documentar nuevas funciones y endpoints
- Añadir pruebas para nuevas funcionalidades
- Mantener el README actualizado

### Reportar Problemas
- Usar el sistema de Issues de GitHub
- Incluir detalles del error y pasos para reproducir
- Especificar versión del navegador y sistema operativo

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

## 👨‍💻 Desarrollo

### Scripts Disponibles
```bash
# Iniciar servidor de desarrollo
npm run dev

# Iniciar servidor de producción
npm start

# Verificar sintaxis
npm run lint

# Ejecutar pruebas
npm test
```

### Configuración de Desarrollo
- **Nodemon**: Reinicio automático en cambios
- **Rate Limiting**: Deshabilitado en desarrollo
- **Logging**: Detallado para debugging
- **CORS**: Permisivo para desarrollo local

---
**Desarrollado con ❤️ para la comunidad de pádel**

#   R e s e r v a - C a n c h a - d e - p a d e l  
 