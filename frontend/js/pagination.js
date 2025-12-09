// ==================== PAGINACIÓN SIMPLE Y FUNCIONAL ====================

// Variables globales para paginación
window.paginacionReservas = {
    paginaActual: 1,
    elementosPorPagina: 15,
    totalElementos: 0,
    totalPaginas: 0,
    datos: []
};

window.paginacionUsuarios = {
    paginaActual: 1,
    elementosPorPagina: 15,
    totalElementos: 0,
    totalPaginas: 0,
    datos: []
};

// ==================== FUNCIONES DE PAGINACIÓN ====================

function configurarPaginacion(tipo, datos) {
    const paginacion = tipo === 'reservas' ? window.paginacionReservas : window.paginacionUsuarios;
    
    paginacion.datos = datos;
    paginacion.totalElementos = datos.length;
    paginacion.totalPaginas = Math.ceil(datos.length / paginacion.elementosPorPagina);
    paginacion.paginaActual = 1;
    
    console.log(`Paginación configurada para ${tipo}:`, {
        totalElementos: paginacion.totalElementos,
        totalPaginas: paginacion.totalPaginas,
        elementosPorPagina: paginacion.elementosPorPagina
    });
}

function obtenerElementosPagina(tipo) {
    const paginacion = tipo === 'reservas' ? window.paginacionReservas : window.paginacionUsuarios;
    
    const inicio = (paginacion.paginaActual - 1) * paginacion.elementosPorPagina;
    const fin = inicio + paginacion.elementosPorPagina;
    
    return paginacion.datos.slice(inicio, fin);
}

function renderizarControlesPaginacion(tipo) {
    const containerId = tipo === 'reservas' ? 'pagination-reservas' : 'pagination-usuarios';
    const container = document.getElementById(containerId);
    const paginacion = tipo === 'reservas' ? window.paginacionReservas : window.paginacionUsuarios;
    
    if (!container || paginacion.totalPaginas <= 1) {
        if (container) container.innerHTML = '';
        return;
    }
    
    const inicio = ((paginacion.paginaActual - 1) * paginacion.elementosPorPagina) + 1;
    const fin = Math.min(paginacion.paginaActual * paginacion.elementosPorPagina, paginacion.totalElementos);
    
    let html = `
        <div class="pagination-controls">
            <div class="pagination-info">
                Mostrando ${inicio} - ${fin} de ${paginacion.totalElementos} elementos
            </div>
            <div class="pagination-buttons">
                <button class="btn-pagination" ${paginacion.paginaActual === 1 ? 'disabled' : ''} 
                        onclick="cambiarPagina('${tipo}', ${paginacion.paginaActual - 1})">
                    <i class="fas fa-chevron-left"></i> Anterior
                </button>
    `;
    
    // Generar botones de páginas
    for (let i = 1; i <= paginacion.totalPaginas; i++) {
        if (i === paginacion.paginaActual) {
            html += `<button class="btn-pagination active">${i}</button>`;
        } else {
            html += `<button class="btn-pagination" onclick="cambiarPagina('${tipo}', ${i})">${i}</button>`;
        }
    }
    
    html += `
                <button class="btn-pagination" ${paginacion.paginaActual === paginacion.totalPaginas ? 'disabled' : ''} 
                        onclick="cambiarPagina('${tipo}', ${paginacion.paginaActual + 1})">
                    Siguiente <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

function cambiarPagina(tipo, nuevaPagina) {
    const paginacion = tipo === 'reservas' ? window.paginacionReservas : window.paginacionUsuarios;
    
    if (nuevaPagina >= 1 && nuevaPagina <= paginacion.totalPaginas) {
        paginacion.paginaActual = nuevaPagina;
        
        if (tipo === 'reservas') {
            cargarReservasConPaginacion();
        } else {
            cargarUsuariosConPaginacion();
        }
    }
}

// ==================== FUNCIONES DE CARGA CON PAGINACIÓN ====================

async function cargarReservasConPaginacion() {
    try {
        console.log('🔄 Cargando reservas con paginación...');
        
        // Obtener datos de la API
        let response;
        if (CONFIG.MODO_PRUEBA) {
            response = await fetch('http://localhost:5000/api/reservas/simuladas');
        } else {
            response = await fetch('http://localhost:5000/api/reservas');
        }
        
        const data = await response.json();
        console.log('📡 Datos recibidos:', data);
        
        if (!data.success) {
            throw new Error(data.message);
        }
        
        // Configurar paginación
        configurarPaginacion('reservas', data.data);
        
        // Obtener elementos de la página actual
        const reservasPagina = obtenerElementosPagina('reservas');
        
        // Renderizar tabla
        const tbody = document.querySelector('#tabla-reservas tbody');
        if (!tbody) {
            console.error('No se encontró tbody de reservas');
            return;
        }
        
        tbody.innerHTML = '';
        
        reservasPagina.forEach(reserva => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${reserva.nombre} ${reserva.apellido}</td>
                <td>${reserva.cancha_nombre}</td>
                <td>${new Date(reserva.fecha_reserva).toLocaleDateString('es-ES')}</td>
                <td>${reserva.hora_inicio} - ${reserva.hora_fin}</td>
                <td><span class="estado-${reserva.estado}">${CONFIG.ESTADOS_RESERVA[reserva.estado] || reserva.estado}</span></td>
                <td>$${reserva.precio_total.toLocaleString('es-ES')}</td>
                <td>
                    <select class="form-control" style="width: auto; display: inline-block;">
                        <option value="pendiente" ${reserva.estado === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                        <option value="confirmada" ${reserva.estado === 'confirmada' ? 'selected' : ''}>Confirmada</option>
                        <option value="completada" ${reserva.estado === 'completada' ? 'selected' : ''}>Completada</option>
                        <option value="cancelada" ${reserva.estado === 'cancelada' ? 'selected' : ''}>Cancelada</option>
                    </select>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        // Renderizar controles de paginación
        renderizarControlesPaginacion('reservas');
        
        console.log('✅ Reservas cargadas con paginación:', reservasPagina.length, 'elementos');
        
    } catch (error) {
        console.error('❌ Error cargando reservas:', error);
    }
}

async function cargarUsuariosConPaginacion() {
    try {
        console.log('🔄 Cargando usuarios con paginación...');
        
        // Obtener datos de la API
        let response;
        if (CONFIG.MODO_PRUEBA) {
            response = await fetch('http://localhost:5000/api/usuarios/simulados');
        } else {
            response = await fetch('http://localhost:5000/api/usuarios');
        }
        
        const data = await response.json();
        console.log('📡 Datos recibidos:', data);
        
        if (!data.success) {
            throw new Error(data.message);
        }
        
        // Configurar paginación
        configurarPaginacion('usuarios', data.data);
        
        // Obtener elementos de la página actual
        const usuariosPagina = obtenerElementosPagina('usuarios');
        
        // Renderizar tabla
        const tbody = document.querySelector('#tabla-usuarios tbody');
        if (!tbody) {
            console.error('No se encontró tbody de usuarios');
            return;
        }
        
        tbody.innerHTML = '';
        
        usuariosPagina.forEach(usuario => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${usuario.nombre}</td>
                <td>${usuario.apellido}</td>
                <td>${usuario.email}</td>
                <td>${usuario.telefono || '-'}</td>
                <td>${CONFIG.NIVELES_USUARIO[usuario.nivel_juego] || usuario.nivel_juego}</td>
                <td>${new Date(usuario.fecha_registro).toLocaleDateString('es-ES')}</td>
            `;
            tbody.appendChild(row);
        });
        
        // Renderizar controles de paginación
        renderizarControlesPaginacion('usuarios');
        
        console.log('✅ Usuarios cargados con paginación:', usuariosPagina.length, 'elementos');
        
    } catch (error) {
        console.error('❌ Error cargando usuarios:', error);
    }
}

// ==================== SOBRESCRIBIR FUNCIONES ORIGINALES ====================

// Sobrescribir las funciones originales para usar paginación
window.cargarReservas = cargarReservasConPaginacion;
window.cargarUsuarios = cargarUsuariosConPaginacion;
window.cambiarPagina = cambiarPagina;

console.log('📄 Módulo de paginación cargado correctamente');