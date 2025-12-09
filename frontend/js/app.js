// Archivo principal de la aplicación

// ==================== INICIALIZACIÓN ====================

document.addEventListener('DOMContentLoaded', async function() {
    console.log('Iniciando aplicación Sistema de Reservas de Pádel...');
    
    try {
        // Inicializar componentes de la UI
        initNavigation();
        initFormHandlers(); // Manejo de submit de formularios (ui.js)
        initFormFieldHandlers(); // Manejo de campos específicos (app.js)
        initModalHandlers();
        initFilters(); // Agregar inicialización de filtros
        
        // Verificar conexión con la API
        await verificarConexionAPI();
        
        // Cargar datos iniciales
        await cargarDatosIniciales();
        
        console.log('Aplicación inicializada correctamente');
        
    } catch (error) {
        console.error('Error inicializando la aplicación:', error);
        showToast('Error al inicializar la aplicación', 'error');
    }
});

// ==================== VERIFICACIÓN DE CONEXIÓN API ====================

async function verificarConexionAPI() {
    try {
        await apiService.healthCheck();
        console.log('Conexión con la API establecida correctamente');
        showToast('Conexión establecida con el servidor', 'success');
    } catch (error) {
        console.error('Error conectando con la API:', error);
        showToast('Error de conexión con el servidor. Verifica que el backend esté ejecutándose.', 'error');
        throw error;
    }
}

// ==================== CARGA DE DATOS INICIALES ====================

async function cargarDatosIniciales() {
    try {
        // Cargar estadísticas del resumen para la página de inicio
        await cargarEstadisticasResumen();
        
        console.log('Datos iniciales cargados correctamente');
    } catch (error) {
        console.error('Error cargando datos iniciales:', error);
        showToast('Error al cargar datos iniciales', 'warning');
    }
}

// ==================== MANEJO DE ERRORES GLOBALES ====================

window.addEventListener('error', function(e) {
    console.error('Error global de la aplicación:', e.error || e.message || 'Error desconocido');
    if (e.error && e.error.message && e.error.message !== 'Script error.') {
        showToast('Ha ocurrido un error inesperado', 'error');
    }
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Promesa rechazada no manejada:', e.reason);
    showToast('Error en operación asíncrona', 'error');
    e.preventDefault();
});

// ==================== RESPONSIVE NAVIGATION ====================

function initResponsiveNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Cerrar menú al hacer click en un enlace (móvil)
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
}

// ==================== UTILIDADES DE FECHA ====================

function obtenerFechaHoy() {
    return new Date().toISOString().split('T')[0];
}

function obtenerFechaMañana() {
    const mañana = new Date();
    mañana.setDate(mañana.getDate() + 1);
    return mañana.toISOString().split('T')[0];
}

function esFechaValida(fecha) {
    const fechaObj = new Date(fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    return fechaObj >= hoy;
}

// ==================== VALIDACIONES DE FORMULARIOS ====================

function validarFormularioReserva() {
    const usuario = document.getElementById('select-usuario').value;
    const cancha = document.getElementById('select-cancha').value;
    const fecha = document.getElementById('fecha-reserva').value;
    const horario = document.getElementById('select-horario').value;
    const precio = document.getElementById('precio-total').value;
    
    if (!usuario) {
        showToast('Por favor selecciona un usuario', 'warning');
        return false;
    }
    
    if (!cancha) {
        showToast('Por favor selecciona una cancha', 'warning');
        return false;
    }
    
    if (!fecha) {
        showToast('Por favor selecciona una fecha', 'warning');
        return false;
    }
    
    if (!esFechaValida(fecha)) {
        showToast('La fecha debe ser hoy o posterior', 'warning');
        return false;
    }
    
    if (!horario) {
        showToast('Por favor selecciona un horario', 'warning');
        return false;
    }
    
    if (!precio || parseFloat(precio) <= 0) {
        showToast('El precio debe ser mayor a 0', 'warning');
        return false;
    }
    
    return true;
}

function validarFormularioUsuario() {
    const nombre = document.getElementById('nombre-usuario').value.trim();
    const apellido = document.getElementById('apellido-usuario').value.trim();
    const email = document.getElementById('email-usuario').value.trim();
    
    if (!nombre) {
        showToast('El nombre es requerido', 'warning');
        return false;
    }
    
    if (!apellido) {
        showToast('El apellido es requerido', 'warning');
        return false;
    }
    
    if (!email) {
        showToast('El email es requerido', 'warning');
        return false;
    }
    
    if (!validarEmail(email)) {
        showToast('Por favor ingresa un email válido', 'warning');
        return false;
    }
    
    return true;
}

function validarEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ==================== MANEJO DE ALMACENAMIENTO LOCAL ====================

function guardarEnLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error('Error guardando en localStorage:', error);
    }
}

function obtenerDeLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error obteniendo de localStorage:', error);
        return null;
    }
}

function limpiarLocalStorage() {
    try {
        localStorage.clear();
        showToast('Datos locales limpiados', 'info');
    } catch (error) {
        console.error('Error limpiando localStorage:', error);
    }
}

// ==================== FUNCIONES DE EXPORTACIÓN ====================

function exportarDatos(datos, nombreArchivo, tipo = 'json') {
    try {
        let contenido;
        let mimeType;
        
        switch (tipo) {
            case 'json':
                contenido = JSON.stringify(datos, null, 2);
                mimeType = 'application/json';
                nombreArchivo += '.json';
                break;
            case 'csv':
                contenido = convertirACSV(datos);
                mimeType = 'text/csv';
                nombreArchivo += '.csv';
                break;
            default:
                throw new Error('Tipo de archivo no soportado');
        }
        
        const blob = new Blob([contenido], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = nombreArchivo;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        window.URL.revokeObjectURL(url);
        
        showToast('Datos exportados exitosamente', 'success');
    } catch (error) {
        console.error('Error exportando datos:', error);
        showToast('Error al exportar datos', 'error');
    }
}

function convertirACSV(datos) {
    if (!Array.isArray(datos) || datos.length === 0) {
        return '';
    }
    
    const headers = Object.keys(datos[0]);
    const csvHeaders = headers.join(',');
    
    const csvRows = datos.map(row => {
        return headers.map(header => {
            const value = row[header];
            // Escapar comillas y agregar comillas si contiene comas
            return typeof value === 'string' && value.includes(',') 
                ? `"${value.replace(/"/g, '""')}"` 
                : value;
        }).join(',');
    });
    
    return [csvHeaders, ...csvRows].join('\n');
}

// ==================== FUNCIONES DE AYUDA ====================

function mostrarAyuda() {
    const ayudaHTML = `
        <div style="max-width: 600px; line-height: 1.6;">
            <h3 style="margin-bottom: 1rem; color: var(--primary-color);">Sistema de Reservas de Pádel - Ayuda</h3>
            
            <h4>Navegación:</h4>
            <ul>
                <li><strong>Inicio:</strong> Resumen general con estadísticas principales</li>
                <li><strong>Reservas:</strong> Gestión de reservas (crear, modificar, filtrar)</li>
                <li><strong>Canchas:</strong> Información de canchas disponibles</li>
                <li><strong>Usuarios:</strong> Gestión de usuarios registrados</li>
                <li><strong>Estadísticas:</strong> Gráficos y análisis de datos</li>
            </ul>
            
            <h4>Crear Nueva Reserva:</h4>
            <ol>
                <li>Haz clic en "Nueva Reserva" en la sección de Reservas</li>
                <li>Selecciona el usuario</li>
                <li>Selecciona la cancha</li>
                <li>Elige la fecha (hoy o posterior)</li>
                <li>Selecciona un horario disponible</li>
                <li>Verifica el precio y agrega observaciones si es necesario</li>
                <li>Haz clic en "Crear Reserva"</li>
            </ol>
            
            <h4>Gráficos:</h4>
            <ul>
                <li><strong>Barras:</strong> Comparación de popularidad entre canchas</li>
                <li><strong>Líneas:</strong> Evolución temporal de reservas e ingresos</li>
                <li><strong>Torta:</strong> Distribución de reservas por período del día</li>
                <li><strong>Dispersión:</strong> Correlación entre precio y demanda</li>
            </ul>
            
            <p style="margin-top: 1rem; font-style: italic;">
                Para más información, contacta al administrador del sistema.
            </p>
        </div>
    `;
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 700px;">
            <div class="modal-header">
                <h3>Ayuda</h3>
                <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            </div>
            <div style="padding: 2rem;">
                ${ayudaHTML}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Cerrar modal con clic fuera
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// ==================== MONITOREO DE RENDIMIENTO ====================

function iniciarMonitoreoRendimiento() {
    // Medir tiempo de carga de la página
    window.addEventListener('load', () => {
        const tiempoCarga = performance.now();
        console.log(`Página cargada en ${tiempoCarga.toFixed(2)}ms`);
        
        if (tiempoCarga > 3000) {
            console.warn('Tiempo de carga elevado detectado');
        }
    });
    
    // Monitorear memoria si está disponible
    if ('memory' in performance) {
        setInterval(() => {
            const memoria = performance.memory;
            const usoMemoria = memoria.usedJSHeapSize / memoria.jsHeapSizeLimit;
            
            if (usoMemoria > 0.8) {
                console.warn('Uso de memoria elevado:', usoMemoria);
            }
        }, 30000); // Verificar cada 30 segundos
    }
}

// ==================== FUNCIONES DE INICIALIZACIÓN ====================

function initModalHandlers() {
    // Inicializar eventos de modales
    const modales = document.querySelectorAll('.modal');
    modales.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Cerrar modales con Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modalAbierto = document.querySelector('.modal[style*="block"]');
            if (modalAbierto) {
                modalAbierto.style.display = 'none';
            }
        }
    });
    
    console.log('Modales inicializados');
}

function initFilters() {
    // Inicializar filtros automáticos
    const filtroFecha = document.getElementById('filtro-fecha');
    const filtroEstado = document.getElementById('filtro-estado');
    
    if (filtroFecha) {
        filtroFecha.addEventListener('change', filtrarReservas);
    }
    
    if (filtroEstado) {
        filtroEstado.addEventListener('change', filtrarReservas);
    }
    
    console.log('Filtros inicializados');
}

function initFormFieldHandlers() {
    console.log('🚀 Inicializando form field handlers...');
    
    // Inicializar eventos del formulario de reserva
    const selectCancha = document.getElementById('select-cancha');
    const fechaReserva = document.getElementById('fecha-reserva');
    
    console.log('🔍 Buscando elementos:', {
        selectCancha: !!selectCancha,
        fechaReserva: !!fechaReserva
    });
    
    if (selectCancha) {
        console.log('✅ Agregando listener a select-cancha');
        selectCancha.addEventListener('change', function() {
            console.log('🏟️ Cancha cambiada:', this.value);
            cargarHorariosDisponibles();
            calcularPrecio();
        });
    } else {
        console.warn('❌ Element select-cancha no encontrado');
    }
    
    if (fechaReserva) {
        console.log('✅ Agregando listener a fecha-reserva');
        fechaReserva.addEventListener('change', function() {
            console.log('📅 Fecha cambiada:', this.value);
            cargarHorariosDisponibles();
        });
    } else {
        console.warn('❌ Element fecha-reserva no encontrado');
    }
    
    console.log('✅ Form handlers inicializados');
}



// ==================== INICIALIZACIÓN FINAL ====================

// Inicializar monitoreo cuando la página esté lista
document.addEventListener('DOMContentLoaded', () => {
    iniciarMonitoreoRendimiento();
    initResponsiveNavigation();
});

// Hacer funciones disponibles globalmente para debugging
window.exportarDatos = exportarDatos;
window.mostrarAyuda = mostrarAyuda;
window.limpiarLocalStorage = limpiarLocalStorage;
window.verificarConexionAPI = verificarConexionAPI;