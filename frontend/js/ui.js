// Funciones para manejo de la interfaz de usuario

// ==================== NAVEGACIÓN ====================

function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remover clase active de todos los links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Agregar clase active al link clickeado
            link.classList.add('active');
            
            // Obtener la sección objetivo
            const targetSection = link.getAttribute('data-section');
            
            // Ocultar todas las secciones
            sections.forEach(section => section.classList.remove('active'));
            
            // Mostrar la sección objetivo
            const targetElement = document.getElementById(targetSection);
            if (targetElement) {
                targetElement.classList.add('active');
                
                // Cargar datos específicos de la sección
                loadSectionData(targetSection);
            }
        });
    });
}

// ==================== CARGA DE DATOS POR SECCIÓN ====================

async function loadSectionData(section) {
    switch (section) {
        case 'home':
            await cargarEstadisticasResumen();
            break;
        case 'reservas':
            await cargarReservas();
            await cargarUsuariosParaSelect();
            await cargarCanchasParaSelect();
            // Inicializar form handlers específicamente para reservas
            setTimeout(() => initFormHandlersReservas(), 100);
            break;
        case 'canchas':
            await cargarCanchas();
            break;
        case 'usuarios':
            await cargarUsuarios();
            break;
        case 'estadisticas':
            await cargarTodosLosGraficos();
            break;
    }
}

// ==================== CARGA DE ESTADÍSTICAS RESUMEN ====================

async function cargarEstadisticasResumen() {
    try {
        const response = await apiService.obtenerResumenEstadisticas();
        const stats = response.data;
        
        // Actualizar elementos en la página
        updateElement('total-usuarios', stats.total_usuarios || 0);
        updateElement('total-reservas', stats.total_reservas || 0);
        updateElement('ingresos-totales', `$${formatNumber(stats.ingresos_totales || 0)}`);
        updateElement('total-canchas', stats.total_canchas || 0);
        
    } catch (error) {
        console.error('Error cargando estadísticas:', error);
        showToast('Error al cargar estadísticas del resumen', 'error');
    }
}



// ==================== VARIABLES DE PAGINACIÓN ====================
let reservasPaginacion = {
    paginaActual: 1,
    elementosPorPagina: 15,
    totalElementos: 0,
    totalPaginas: 0,
    datos: []
};

let usuariosPaginacion = {
    paginaActual: 1,
    elementosPorPagina: 15,
    totalElementos: 0,
    totalPaginas: 0,
    datos: []
};

// ==================== FUNCIONES DE PAGINACIÓN ====================
function renderizarPaginacion(tipo) {
    const paginacion = tipo === 'reservas' ? reservasPaginacion : usuariosPaginacion;
    const containerId = tipo === 'reservas' ? 'pagination-reservas' : 'pagination-usuarios';
    const container = document.getElementById(containerId);
    
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
    `;
    
    // Botón anterior
    if (paginacion.paginaActual > 1) {
        html += `<button class="btn-pagination" onclick="cambiarPagina('${tipo}', ${paginacion.paginaActual - 1})">
                    <i class="fas fa-chevron-left"></i> Anterior
                 </button>`;
    } else {
        html += `<button class="btn-pagination" disabled>
                    <i class="fas fa-chevron-left"></i> Anterior
                 </button>`;
    }
    
    // Botones de páginas
    for (let i = 1; i <= paginacion.totalPaginas; i++) {
        if (i === paginacion.paginaActual) {
            html += `<button class="btn-pagination active">${i}</button>`;
        } else {
            html += `<button class="btn-pagination" onclick="cambiarPagina('${tipo}', ${i})">${i}</button>`;
        }
    }
    
    // Botón siguiente
    if (paginacion.paginaActual < paginacion.totalPaginas) {
        html += `<button class="btn-pagination" onclick="cambiarPagina('${tipo}', ${paginacion.paginaActual + 1})">
                    Siguiente <i class="fas fa-chevron-right"></i>
                 </button>`;
    } else {
        html += `<button class="btn-pagination" disabled>
                    Siguiente <i class="fas fa-chevron-right"></i>
                 </button>`;
    }
    
    html += `
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

function cambiarPagina(tipo, nuevaPagina) {
    if (tipo === 'reservas') {
        reservasPaginacion.paginaActual = nuevaPagina;
        cargarReservas();
    } else {
        usuariosPaginacion.paginaActual = nuevaPagina;
        cargarUsuarios();
    }
}

// ==================== CARGA DE RESERVAS ====================

async function cargarReservas() {
    try {
        // Obtener todos los datos
        let response;
        if (CONFIG.MODO_PRUEBA) {
            response = await fetch('http://localhost:5000/api/reservas/simuladas');
            const data = await response.json();
            var todasLasReservas = data.data;
        } else {
            const apiResponse = await apiService.obtenerReservas();
            var todasLasReservas = apiResponse.data;
        }
        
        // Configurar paginación
        reservasPaginacion.datos = todasLasReservas;
        reservasPaginacion.totalElementos = todasLasReservas.length;
        reservasPaginacion.totalPaginas = Math.ceil(todasLasReservas.length / reservasPaginacion.elementosPorPagina);
        
        // Obtener datos para la página actual
        const inicio = (reservasPaginacion.paginaActual - 1) * reservasPaginacion.elementosPorPagina;
        const fin = inicio + reservasPaginacion.elementosPorPagina;
        const reservasPagina = todasLasReservas.slice(inicio, fin);
        
        const tbody = document.querySelector('#tabla-reservas tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        reservasPagina.forEach(reserva => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>#${reserva.id_reserva}</strong></td>
                <td>${reserva.nombre} ${reserva.apellido}</td>
                <td>${reserva.cancha_nombre}</td>
                <td>${formatDate(reserva.fecha_reserva)}</td>
                <td>${reserva.hora_inicio} - ${reserva.hora_fin}</td>
                <td><span class="estado-${reserva.estado}">${CONFIG.ESTADOS_RESERVA[reserva.estado] || reserva.estado}</span></td>
                <td>$${formatNumber(reserva.precio_total)}</td>
                <td>
                    <div class="acciones-reserva">
                        ${generarBotonesEstado(reserva)}
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        // Renderizar controles de paginación
        renderizarPaginacion('reservas');
        
    } catch (error) {
        console.error('Error cargando reservas:', error);
        showToast('Error al cargar reservas', 'error');
    }
}

// ==================== CARGA DE CANCHAS ====================

async function cargarCanchas() {
    try {
        const response = await apiService.obtenerCanchas();
        const canchas = response.data;
        
        const grid = document.getElementById('grid-canchas');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        canchas.forEach(cancha => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h3>${cancha.nombre}</h3>
                <div class="card-info">
                    <span>Tipo:</span>
                    <span class="card-badge badge-${cancha.tipo}">${CONFIG.TIPOS_CANCHA[cancha.tipo]}</span>
                </div>
                <div class="card-info">
                    <span>Superficie:</span>
                    <span>${CONFIG.SUPERFICIES_CANCHA[cancha.superficie]}</span>
                </div>
                <div class="card-info">
                    <span>Precio por hora:</span>
                    <span><strong>$${formatNumber(cancha.precio_hora)}</strong></span>
                </div>
                <div class="card-info">
                    <span>Ubicación:</span>
                    <span>${cancha.ubicacion}</span>
                </div>
                <p style="margin-top: 1rem; color: #7f8c8d;">${cancha.descripcion}</p>
            `;
            grid.appendChild(card);
        });
        
    } catch (error) {
        console.error('Error cargando canchas:', error);
        showToast('Error al cargar canchas', 'error');
    }
}

// ==================== CARGA DE USUARIOS ====================

async function cargarUsuarios() {
    try {
        // Obtener todos los datos
        let response;
        if (CONFIG.MODO_PRUEBA) {
            response = await fetch('http://localhost:5000/api/usuarios/simulados');
            const data = await response.json();
            var todosLosUsuarios = data.data;
        } else {
            const apiResponse = await apiService.obtenerUsuarios();
            var todosLosUsuarios = apiResponse.data;
        }
        
        // Configurar paginación
        usuariosPaginacion.datos = todosLosUsuarios;
        usuariosPaginacion.totalElementos = todosLosUsuarios.length;
        usuariosPaginacion.totalPaginas = Math.ceil(todosLosUsuarios.length / usuariosPaginacion.elementosPorPagina);
        
        // Obtener datos para la página actual
        const inicio = (usuariosPaginacion.paginaActual - 1) * usuariosPaginacion.elementosPorPagina;
        const fin = inicio + usuariosPaginacion.elementosPorPagina;
        const usuariosPagina = todosLosUsuarios.slice(inicio, fin);
        
        const tbody = document.querySelector('#tabla-usuarios tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        usuariosPagina.forEach(usuario => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>#${usuario.id_usuario}</strong></td>
                <td>${usuario.nombre}</td>
                <td>${usuario.apellido}</td>
                <td>${usuario.email}</td>
                <td>${usuario.telefono || '-'}</td>
                <td>${CONFIG.NIVELES_USUARIO[usuario.nivel_juego] || usuario.nivel_juego}</td>
                <td>${formatDate(usuario.fecha_registro)}</td>
            `;
            tbody.appendChild(row);
        });
        
        // Renderizar controles de paginación
        renderizarPaginacion('usuarios');
        
    } catch (error) {
        console.error('Error cargando usuarios:', error);
        showToast('Error al cargar usuarios', 'error');
    }
}

// ==================== MANEJO DE MODALES ====================

async function abrirModalReserva() {
    document.getElementById('modal-reserva').style.display = 'block';
    
    // Cargar datos necesarios para el modal
    await inicializarModalReserva();
}

async function inicializarModalReserva() {
    try {
        await cargarUsuariosParaSelect();
        await cargarCanchasParaSelect();
        
        // Limpiar formulario
        document.getElementById('form-reserva').reset();
        
        // Establecer fecha mínima (hoy)
        const fechaInput = document.getElementById('fecha-reserva');
        if (fechaInput) {
            const hoy = new Date().toISOString().split('T')[0];
            fechaInput.min = hoy;
        }
        
        console.log('Modal de reserva inicializado correctamente');
    } catch (error) {
        console.error('Error inicializando modal de reserva:', error);
        showToast('Error al cargar datos del modal', 'error');
    }
}

function abrirModalUsuario() {
    document.getElementById('modal-usuario').style.display = 'block';
}

function cerrarModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    
    // Limpiar formularios
    const form = document.querySelector(`#${modalId} form`);
    if (form) {
        form.reset();
    }
}

// ==================== CARGA DE DATOS PARA SELECTS ====================

async function cargarUsuariosParaSelect() {
    try {
        const response = await apiService.obtenerUsuarios();
        const usuarios = response.data;
        
        const select = document.getElementById('select-usuario');
        if (!select) return;
        
        select.innerHTML = '<option value="">Seleccionar usuario</option>';
        
        usuarios.forEach(usuario => {
            const option = document.createElement('option');
            option.value = usuario.id_usuario;
            option.textContent = `${usuario.nombre} ${usuario.apellido}`;
            select.appendChild(option);
        });
        
    } catch (error) {
        console.error('Error cargando usuarios para select:', error);
    }
}

async function cargarCanchasParaSelect() {
    try {
        const response = await apiService.obtenerCanchas();
        const canchas = response.data;
        
        const select = document.getElementById('select-cancha');
        if (!select) return;
        
        select.innerHTML = '<option value="">Seleccionar cancha</option>';
        
        canchas.forEach(cancha => {
            const option = document.createElement('option');
            option.value = cancha.id_cancha;
            option.setAttribute('data-precio', cancha.precio_hora);
            option.textContent = `${cancha.nombre} - $${formatNumber(cancha.precio_hora)}/hora`;
            select.appendChild(option);
        });
        
    } catch (error) {
        console.error('Error cargando canchas para select:', error);
    }
}

async function cargarHorariosDisponibles() {
    console.log('🔄 Iniciando cargarHorariosDisponibles...');
    
    const selectCancha = document.getElementById('select-cancha');
    const fechaInput = document.getElementById('fecha-reserva');
    const selectHorario = document.getElementById('select-horario');
    
    console.log('📋 Elementos encontrados:', {
        selectCancha: !!selectCancha,
        fechaInput: !!fechaInput,
        selectHorario: !!selectHorario
    });
    
    if (!selectCancha || !fechaInput || !selectHorario) {
        console.error('❌ Elementos del formulario no encontrados');
        return;
    }
    
    console.log('📝 Valores actuales:', {
        cancha: selectCancha.value,
        fecha: fechaInput.value
    });
    
    if (!selectCancha.value || !fechaInput.value) {
        console.log('⚠️ Faltan valores - reseteando select de horario');
        selectHorario.innerHTML = '<option value="">Seleccionar horario</option>';
        return;
    }
    
    try {
        console.log('🌐 Llamando a la API directamente...');
        const url = `http://localhost:5000/api/horarios/disponibles?cancha=${selectCancha.value}&fecha=${fechaInput.value}`;
        console.log('🔗 URL:', url);
        
        const response = await fetch(url);
        console.log('� Response status:', response.status);
        
        const responseData = await response.json();
        console.log('�📥 Respuesta de la API:', responseData);
        
        if (!responseData.success) {
            throw new Error(responseData.message || 'Error en la respuesta');
        }
        
        const horarios = responseData.data;
        console.log('⏰ Horarios obtenidos:', horarios);
        
        selectHorario.innerHTML = '<option value="">Seleccionar horario</option>';
        
        horarios.forEach(horario => {
            const option = document.createElement('option');
            option.value = horario.id_horario;
            option.textContent = `${horario.hora_inicio} - ${horario.hora_fin}`;
            selectHorario.appendChild(option);
            console.log('➕ Agregado horario:', option.textContent);
        });
        
        if (horarios.length === 0) {
            console.log('❌ No hay horarios disponibles');
            selectHorario.innerHTML = '<option value="">No hay horarios disponibles</option>';
        } else {
            console.log('✅ Horarios cargados correctamente:', horarios.length);
        }
        
    } catch (error) {
        console.error('💥 Error cargando horarios disponibles:', error);
        selectHorario.innerHTML = '<option value="">Error cargando horarios</option>';
    }
}

function calcularPrecio() {
    const selectCancha = document.getElementById('select-cancha');
    const precioInput = document.getElementById('precio-total');
    
    if (selectCancha.value) {
        const precio = selectCancha.options[selectCancha.selectedIndex].getAttribute('data-precio');
        precioInput.value = precio;
    } else {
        precioInput.value = '';
    }
}

// ==================== CAMBIO DE ESTADO DE RESERVA ====================

// Variable para controlar el debounce de recarga
let recargarReservasTimeout = null;

async function cambiarEstadoReserva(idReserva, nuevoEstado) {
    try {
        showLoading(true);
        await apiService.actualizarEstadoReserva(idReserva, nuevoEstado);
        showToast('Estado de reserva actualizado exitosamente', 'success');
        
        // Debounce para evitar múltiples recargas rápidas
        if (recargarReservasTimeout) {
            clearTimeout(recargarReservasTimeout);
        }
        recargarReservasTimeout = setTimeout(async () => {
            await cargarReservas();
            showLoading(false);
        }, 500);
        
    } catch (error) {
        console.error('Error actualizando estado de reserva:', error);
        showToast(`Error al actualizar estado: ${error.message}`, 'error');
        showLoading(false);
        // No recargar en caso de error para evitar más peticiones
    }
}

function generarBotonesEstado(reserva) {
    const estadoActual = reserva.estado;
    let botones = '';
    
    // Botón para cancelar (disponible para pendiente y confirmada)
    if (estadoActual === 'pendiente' || estadoActual === 'confirmada') {
        botones += `<button class="btn btn-sm btn-danger" onclick="cambiarEstadoReserva(${reserva.id_reserva}, 'cancelada')" 
                           title="Cancelar reserva">
                        <i class="fas fa-times"></i> Cancelar
                    </button> `;
    }
    
    // Botón para confirmar (solo para pendiente)
    if (estadoActual === 'pendiente') {
        botones += `<button class="btn btn-sm btn-success" onclick="cambiarEstadoReserva(${reserva.id_reserva}, 'confirmada')" 
                           title="Confirmar reserva">
                        <i class="fas fa-check"></i> Confirmar
                    </button> `;
    }
    
    // Botón para completar (solo para confirmada)
    if (estadoActual === 'confirmada') {
        botones += `<button class="btn btn-sm btn-primary" onclick="cambiarEstadoReserva(${reserva.id_reserva}, 'completada')" 
                           title="Marcar como completada">
                        <i class="fas fa-flag-checkered"></i> Completar
                    </button> `;
    }
    
    // Botón para reactivar reservas canceladas
    if (estadoActual === 'cancelada') {
        botones = `<button class="btn btn-sm btn-warning" onclick="cambiarEstadoReserva(${reserva.id_reserva}, 'pendiente')" 
                          title="Reactivar reserva">
                       <i class="fas fa-undo"></i> Reactivar
                   </button> 
                   <span class="text-muted ms-2"><i class="fas fa-ban"></i> Cancelada</span>`;
    }
    
    // Las completadas siguen siendo finales (opcional: también se pueden reactivar)
    if (estadoActual === 'completada') {
        botones = '<span class="text-success"><i class="fas fa-check-circle"></i> Completada</span>';
    }
    
    return botones || '<span class="text-muted">Sin acciones</span>';
}

// ==================== UTILIDADES ====================

function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

function formatNumber(number) {
    return new Intl.NumberFormat('es-AR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(number);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR');
}

// ==================== LOADING Y NOTIFICACIONES ====================

function showLoading(show) {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = show ? 'flex' : 'none';
    }
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <i class="fas fa-${getToastIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;
    
    container.appendChild(toast);
    
    // Remover después de un tiempo
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, CONFIG.TOAST_DURATION);
}

function getToastIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || icons.info;
}

// ==================== FILTROS ====================

function filtrarReservas() {
    console.log('🔍 Ejecutando filtrarReservas...');
    
    const filtroFecha = document.getElementById('filtro-fecha');
    const filtroEstado = document.getElementById('filtro-estado');
    
    if (!filtroFecha || !filtroEstado) {
        console.error('❌ Elementos de filtro no encontrados');
        return;
    }
    
    const valorFecha = filtroFecha.value;
    const valorEstado = filtroEstado.value;
    
    console.log('📅 Filtro fecha:', valorFecha);
    console.log('📊 Filtro estado:', valorEstado);
    
    const tabla = document.getElementById('tabla-reservas');
    if (!tabla) {
        console.error('❌ Tabla de reservas no encontrada');
        return;
    }
    
    const rows = tabla.querySelectorAll('tbody tr');
    console.log('📋 Total de filas encontradas:', rows.length);
    
    let contadorVisible = 0;
    
    rows.forEach((row, index) => {
        const celdas = row.cells;
        if (celdas.length < 6) {
            console.log(`⚠️ Fila ${index} tiene menos de 6 columnas:`, celdas.length);
            return;
        }
        
        const fecha = celdas[3].textContent.trim();
        const estadoElement = celdas[5].querySelector('span');
        const estado = estadoElement ? 
            estadoElement.textContent.trim().toLowerCase() : 
            celdas[5].textContent.trim().toLowerCase();
        
        console.log(`📝 Fila ${index} - Fecha: "${fecha}", Estado: "${estado}"`);
        
        let mostrar = true;
        
        // Filtro por fecha - mejorado para manejar diferentes formatos
        if (valorFecha) {
            const fechaFormateada = formatDateForFilter(valorFecha);
            if (!fecha.includes(valorFecha) && !fecha.includes(fechaFormateada)) {
                mostrar = false;
                console.log(`❌ Fecha no coincide - Buscando: "${valorFecha}" o "${fechaFormateada}", Encontrado: "${fecha}"`);
            }
        }
        
        // Filtro por estado - mejorado
        if (valorEstado && mostrar) {
            const estadoComparar = valorEstado.toLowerCase();
            if (!estado.includes(estadoComparar)) {
                mostrar = false;
                console.log(`❌ Estado no coincide - Buscando: "${estadoComparar}", Encontrado: "${estado}"`);
            }
        }
        
        row.style.display = mostrar ? '' : 'none';
        if (mostrar) {
            contadorVisible++;
            console.log(`✅ Fila ${index} visible`);
        }
    });
    
    console.log(`📊 Resultado: ${contadorVisible} de ${rows.length} filas visibles`);
    
    // Mostrar mensaje si no hay resultados
    mostrarMensajeFiltro(contadorVisible, rows.length);
}

// Función auxiliar para formatear fecha para filtro
function formatDateForFilter(dateString) {
    if (!dateString) return '';
    
    // Convertir YYYY-MM-DD a DD/MM/YYYY
    const parts = dateString.split('-');
    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateString;
}

function mostrarMensajeFiltro(visible, total) {
    let mensajeElement = document.getElementById('mensaje-filtro');
    
    if (!mensajeElement) {
        mensajeElement = document.createElement('div');
        mensajeElement.id = 'mensaje-filtro';
        mensajeElement.className = 'mensaje-filtro';
        
        const tabla = document.getElementById('tabla-reservas');
        if (tabla && tabla.parentNode) {
            tabla.parentNode.insertBefore(mensajeElement, tabla.nextSibling);
        }
    }
    
    if (visible === 0 && total > 0) {
        mensajeElement.innerHTML = '<i class="fas fa-search"></i> No se encontraron reservas que coincidan con los filtros aplicados.';
        mensajeElement.style.display = 'block';
    } else if (visible < total) {
        mensajeElement.innerHTML = `<i class="fas fa-info-circle"></i> Mostrando ${visible} de ${total} reservas.`;
        mensajeElement.style.display = 'block';
    } else {
        mensajeElement.style.display = 'none';
    }
}

function limpiarFiltros() {
    const filtroFecha = document.getElementById('filtro-fecha');
    const filtroEstado = document.getElementById('filtro-estado');
    
    if (filtroFecha) filtroFecha.value = '';
    if (filtroEstado) filtroEstado.value = '';
    
    filtrarReservas();
}

// ==================== MANEJO DE FORMULARIOS ====================

function initFormHandlers() {
    console.log('Inicializando manejadores de formularios...');
    
    // Formulario de nueva reserva
    const formReserva = document.getElementById('form-reserva');
    console.log('Formulario encontrado:', formReserva);
    
    if (formReserva) {
        console.log('✅ Agregando event listener al formulario de reserva');
        
        // Remover cualquier listener previo
        const newForm = formReserva.cloneNode(true);
        formReserva.parentNode.replaceChild(newForm, formReserva);
        
        document.getElementById('form-reserva').addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('🚀 Formulario de reserva enviado - evento capturado');
            
            const formData = {
                id_usuario: parseInt(document.getElementById('select-usuario').value),
                id_cancha: parseInt(document.getElementById('select-cancha').value),
                id_horario: parseInt(document.getElementById('select-horario').value),
                fecha_reserva: document.getElementById('fecha-reserva').value,
                precio_total: parseFloat(document.getElementById('precio-total').value),
                observaciones: document.getElementById('observaciones').value
            };
            
            console.log('Datos del formulario:', formData);
            
            // Validar datos
            if (!formData.id_usuario || !formData.id_cancha || !formData.id_horario || !formData.fecha_reserva) {
                showToast('Por favor complete todos los campos obligatorios', 'error');
                return;
            }
            
            try {
                showLoading(true);
                console.log('Enviando reserva al servidor...');
                const response = await apiService.crearReserva(formData);
                console.log('Respuesta del servidor:', response);
                
                console.log('✅ Reserva creada exitosamente');
                showToast('Reserva creada exitosamente', 'success');
                cerrarModal('modal-reserva');
                console.log('🔄 Recargando lista de reservas...');
                await cargarReservas();
                console.log('✅ Lista de reservas recargada');
            } catch (error) {
                console.error('Error creando reserva:', error);
                showToast(`Error al crear la reserva: ${error.message}`, 'error');
            } finally {
                showLoading(false);
            }
        });
    } else {
        console.error('No se encontró el formulario form-reserva');
    }
    
    // Formulario de nuevo usuario
    const formUsuario = document.getElementById('form-usuario');
    if (formUsuario) {
        formUsuario.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                nombre: document.getElementById('nombre-usuario').value.trim(),
                apellido: document.getElementById('apellido-usuario').value.trim(),
                email: document.getElementById('email-usuario').value.trim(),
                telefono: document.getElementById('telefono-usuario').value.trim(),
                nivel_juego: document.getElementById('nivel-usuario').value
            };
            
            console.log('📝 Datos del usuario a crear:', formData);
            
            // Validar datos básicos
            if (!formData.nombre || !formData.apellido || !formData.email) {
                showToast('Por favor complete todos los campos obligatorios', 'error');
                return;
            }
            
            try {
                await apiService.crearUsuario(formData);
                showToast(CONFIG.SUCCESS_MESSAGES.USER_CREATED, 'success');
                cerrarModal('modal-usuario');
                await cargarUsuarios();
                await cargarUsuariosParaSelect(); // Actualizar select en modal de reservas
            } catch (error) {
                console.error('Error creando usuario:', error);
                showToast(`Error al crear el usuario: ${error.message}`, 'error');
            }
        });
    }
}

// ==================== CERRAR MODALES CON CLICK FUERA ====================

function initModalHandlers() {
    const modals = document.querySelectorAll('.modal');
    
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
}

function initFormHandlersReservas() {
    console.log('🎯 Inicializando form handlers para reservas...');
    
    const selectCancha = document.getElementById('select-cancha');
    const fechaReserva = document.getElementById('fecha-reserva');
    
    console.log('🔍 Elementos en sección reservas:', {
        selectCancha: !!selectCancha,
        fechaReserva: !!fechaReserva
    });
    
    if (selectCancha) {
        console.log('✅ Agregando listener a select-cancha (reservas)');
        // Remover listeners existentes
        selectCancha.removeEventListener('change', cargarHorariosHandler);
        // Agregar nuevo listener
        selectCancha.addEventListener('change', cargarHorariosHandler);
    } else {
        console.warn('❌ Element select-cancha no encontrado en reservas');
    }
    
    if (fechaReserva) {
        console.log('✅ Agregando listener a fecha-reserva (reservas)');
        // Remover listeners existentes
        fechaReserva.removeEventListener('change', cargarHorariosHandler);
        // Agregar nuevo listener
        fechaReserva.addEventListener('change', cargarHorariosHandler);
    } else {
        console.warn('❌ Element fecha-reserva no encontrado en reservas');
    }
}

function cargarHorariosHandler() {
    console.log('🚀 Handler ejecutado - cargando horarios...');
    cargarHorariosDisponibles();
    // También calcular precio si cambió la cancha
    if (this.id === 'select-cancha') {
        calcularPrecio();
    }
}

function initFormHandlersModal() {
    console.log('🎯 Inicializando form handlers específicos del modal...');
    
    const selectCancha = document.getElementById('select-cancha');
    const fechaReserva = document.getElementById('fecha-reserva');
    
    console.log('🔍 Elementos en modal:', {
        selectCancha: !!selectCancha,
        fechaReserva: !!fechaReserva,
        selectCanchaValue: selectCancha ? selectCancha.value : 'N/A',
        fechaReservaValue: fechaReserva ? fechaReserva.value : 'N/A'
    });
    
    if (selectCancha) {
        console.log('✅ Agregando listener a select-cancha (modal)');
        // Remover listeners existentes para evitar duplicados
        selectCancha.removeEventListener('change', cargarHorariosHandler);
        // Agregar nuevo listener
        selectCancha.addEventListener('change', cargarHorariosHandler);
        
        // También agregar listener para calcular precio
        selectCancha.addEventListener('change', calcularPrecio);
    } else {
        console.warn('❌ Element select-cancha no encontrado en modal');
    }
    
    if (fechaReserva) {
        console.log('✅ Agregando listener a fecha-reserva (modal)');
        // Remover listeners existentes para evitar duplicados
        fechaReserva.removeEventListener('change', cargarHorariosHandler);
        // Agregar nuevo listener
        fechaReserva.addEventListener('change', cargarHorariosHandler);
    } else {
        console.warn('❌ Element fecha-reserva no encontrado en modal');
    }
    
    console.log('✅ Form handlers del modal inicializados correctamente');
}

// Hacer funciones disponibles globalmente
window.abrirModalReserva = abrirModalReserva;
window.abrirModalUsuario = abrirModalUsuario;
window.cerrarModal = cerrarModal;
window.cargarHorariosDisponibles = cargarHorariosDisponibles;
window.calcularPrecio = calcularPrecio;
window.cambiarEstadoReserva = cambiarEstadoReserva;
window.filtrarReservas = filtrarReservas;
window.limpiarFiltros = limpiarFiltros;
window.initFormHandlers = initFormHandlers;
window.initFormHandlersReservas = initFormHandlersReservas;
window.initFormHandlersModal = initFormHandlersModal;
window.initNavigation = initNavigation;
window.showToast = showToast;
window.showLoading = showLoading;
window.cambiarPagina = cambiarPagina;