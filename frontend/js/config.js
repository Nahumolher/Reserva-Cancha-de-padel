// Configuración de la aplicación
const CONFIG = {
    // URL base de la API
    API_BASE_URL: 'http://localhost:5000/api',
    
    // Modo de prueba (usar datos simulados)
    MODO_PRUEBA: false,
    
    // Endpoints de la API
    ENDPOINTS: {
        // Usuarios
        USUARIOS: '/usuarios',
        USUARIOS_SIMULADOS: '/usuarios/simulados',
        USUARIO_BY_ID: (id) => `/usuarios/${id}`,
        
        // Canchas
        CANCHAS: '/canchas',
        CANCHA_BY_ID: (id) => `/canchas/${id}`,
        
        // Horarios
        HORARIOS: '/horarios',
        HORARIOS_DISPONIBLES: '/horarios/disponibles',
        
        // Reservas
        RESERVAS: '/reservas',
        RESERVAS_SIMULADAS: '/reservas/simuladas',
        RESERVA_BY_ID: (id) => `/reservas/${id}`,
        ACTUALIZAR_ESTADO_RESERVA: (id) => `/reservas/${id}/estado`,
        
        // Gráficos
        GRAFICO_BARRAS: '/graficos/barras',
        GRAFICO_LINEAS: '/graficos/lineas',
        GRAFICO_TORTA: '/graficos/torta',
        GRAFICO_DISPERSION: '/graficos/dispersion',
        TODOS_GRAFICOS: '/graficos/todos',
        
        // Estadísticas
        RESUMEN_ESTADISTICAS: '/estadisticas/resumen',
        
        // Health
        HEALTH: '/health',
        INFO: '/info'
    },
    
    // Configuración de gráficos
    CHART_COLORS: {
        primary: '#3498db',
        secondary: '#2ecc71',
        accent: '#e74c3c',
        warning: '#f39c12',
        dark: '#2c3e50',
        light: '#ecf0f1',
        gradient: ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c']
    },
    
    // Configuración de Chart.js
    CHART_CONFIG: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: false
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0,0,0,0.1)'
                }
            },
            x: {
                grid: {
                    color: 'rgba(0,0,0,0.1)'
                }
            }
        }
    },
    
    // Configuración de notificaciones
    TOAST_DURATION: 3000,
    
    // Estados de reserva
    ESTADOS_RESERVA: {
        'pendiente': 'Pendiente',
        'confirmada': 'Confirmada',
        'completada': 'Completada',
        'cancelada': 'Cancelada'
    },
    
    // Niveles de usuario
    NIVELES_USUARIO: {
        'principiante': 'Principiante',
        'intermedio': 'Intermedio',
        'avanzado': 'Avanzado',
        'profesional': 'Profesional'
    },
    
    // Tipos de cancha
    TIPOS_CANCHA: {
        'interior': 'Interior',
        'exterior': 'Exterior'
    },
    
    // Superficies de cancha
    SUPERFICIES_CANCHA: {
        'cesped_artificial': 'Césped Artificial',
        'cemento': 'Cemento',
        'resina': 'Resina'
    },
    
    // Configuración de loading
    LOADING_DELAY: 500,
    
    // Configuración de fechas
    DATE_FORMAT: 'YYYY-MM-DD',
    DATETIME_FORMAT: 'YYYY-MM-DD HH:mm:ss',
    
    // Mensajes de error
    ERROR_MESSAGES: {
        NETWORK_ERROR: 'Error de conexión. Por favor, verifica tu conexión a internet.',
        SERVER_ERROR: 'Error interno del servidor. Inténtalo de nuevo más tarde.',
        NOT_FOUND: 'Recurso no encontrado.',
        VALIDATION_ERROR: 'Por favor, verifica los datos ingresados.',
        GENERIC_ERROR: 'Ha ocurrido un error inesperado.'
    },
    
    // Mensajes de éxito
    SUCCESS_MESSAGES: {
        USER_CREATED: 'Usuario creado exitosamente',
        RESERVATION_CREATED: 'Reserva creada exitosamente',
        RESERVATION_UPDATED: 'Reserva actualizada exitosamente',
        DATA_LOADED: 'Datos cargados exitosamente'
    }
};

// Hacer CONFIG disponible globalmente
window.CONFIG = CONFIG;