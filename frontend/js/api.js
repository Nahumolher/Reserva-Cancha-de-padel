// Servicio para realizar llamadas a la API
class ApiService {
    constructor() {
        this.baseURL = CONFIG.API_BASE_URL;
    }

    // Método genérico para realizar peticiones HTTP
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const defaultOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const finalOptions = { ...defaultOptions, ...options };

        try {
            showLoading(true);
            const response = await fetch(url, finalOptions);
            
            if (!response.ok) {
                // Intentar obtener el mensaje de error del servidor
                let errorMessage = `HTTP error! status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    if (errorData.message) {
                        errorMessage = errorData.message;
                    }
                } catch (e) {
                    // Si no se puede parsear el JSON, usar el mensaje por defecto
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Error en la respuesta del servidor');
            }

            return data;
        } catch (error) {
            console.error('Error en la petición API:', error);
            throw error;
        } finally {
            showLoading(false);
        }
    }

    // Métodos GET
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    // Métodos POST
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // Métodos PUT
    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    // Métodos DELETE
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    // ==================== USUARIOS ====================
    
    async obtenerUsuarios() {
        if (CONFIG.MODO_PRUEBA) {
            return this.get(CONFIG.ENDPOINTS.USUARIOS_SIMULADOS);
        }
        return this.get(CONFIG.ENDPOINTS.USUARIOS);
    }

    async obtenerUsuario(id) {
        return this.get(CONFIG.ENDPOINTS.USUARIO_BY_ID(id));
    }

    async crearUsuario(userData) {
        return this.post(CONFIG.ENDPOINTS.USUARIOS, userData);
    }

    // ==================== CANCHAS ====================
    
    async obtenerCanchas() {
        return this.get(CONFIG.ENDPOINTS.CANCHAS);
    }

    async obtenerCancha(id) {
        return this.get(CONFIG.ENDPOINTS.CANCHA_BY_ID(id));
    }

    // ==================== HORARIOS ====================
    
    async obtenerHorarios() {
        return this.get(CONFIG.ENDPOINTS.HORARIOS);
    }

    async obtenerHorariosDisponibles(idCancha, fecha) {
        const params = new URLSearchParams({
            cancha: idCancha,
            fecha: fecha
        });
        return this.get(`${CONFIG.ENDPOINTS.HORARIOS_DISPONIBLES}?${params}`);
    }

    // ==================== RESERVAS ====================
    
    async obtenerReservas() {
        if (CONFIG.MODO_PRUEBA) {
            return this.get(CONFIG.ENDPOINTS.RESERVAS_SIMULADAS);
        }
        return this.get(CONFIG.ENDPOINTS.RESERVAS);
    }

    async crearReserva(reservaData) {
        return this.post(CONFIG.ENDPOINTS.RESERVAS, reservaData);
    }

    async actualizarEstadoReserva(id, estado) {
        return this.put(CONFIG.ENDPOINTS.ACTUALIZAR_ESTADO_RESERVA(id), { estado });
    }

    // ==================== GRÁFICOS ====================
    
    async obtenerGraficoBarras() {
        return this.get(CONFIG.ENDPOINTS.GRAFICO_BARRAS);
    }

    async obtenerGraficoLineas() {
        return this.get(CONFIG.ENDPOINTS.GRAFICO_LINEAS);
    }

    async obtenerGraficoTorta() {
        return this.get(CONFIG.ENDPOINTS.GRAFICO_TORTA);
    }

    async obtenerGraficoDispersion() {
        return this.get(CONFIG.ENDPOINTS.GRAFICO_DISPERSION);
    }

    async obtenerTodosLosGraficos() {
        return this.get(CONFIG.ENDPOINTS.TODOS_GRAFICOS);
    }

    // ==================== ESTADÍSTICAS ====================
    
    async obtenerResumenEstadisticas() {
        return this.get(CONFIG.ENDPOINTS.RESUMEN_ESTADISTICAS);
    }

    // ==================== HEALTH CHECK ====================
    
    async healthCheck() {
        return this.get(CONFIG.ENDPOINTS.HEALTH);
    }

    async obtenerInfoAPI() {
        return this.get(CONFIG.ENDPOINTS.INFO);
    }
}

// Crear instancia global del servicio API
const apiService = new ApiService();

// Hacer disponible globalmente
window.apiService = apiService;