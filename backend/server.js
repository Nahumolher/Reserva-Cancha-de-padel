const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const Joi = require('joi');
require('dotenv').config();

// Importar módulos locales
const database = require('./database');
const { Usuario, Cancha, Horario, Reserva, Estadisticas } = require('./models');
const ChartService = require('./chartService');
const { 
    validarUsuario, 
    validarReserva, 
    validarEstadoReserva, 
    validarId, 
    validarConsultaHorarios,
    validar, 
    validarParams, 
    validarQuery 
} = require('./validators');

// Crear aplicación Express
const app = express();
const PORT = process.env.PORT || 5000;

// ==================== MIDDLEWARES ====================

// Seguridad
app.use(helmet());

// CORS
app.use(cors({
    origin: true, // Permite todos los orígenes incluyendo null (file://)
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting (más permisivo para desarrollo)
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 1000, // máximo 1000 requests por ventana (muy permisivo para desarrollo)
    message: {
        success: false,
        message: 'Demasiadas peticiones, intenta de nuevo más tarde'
    },
    // Solo aplicar rate limiting en producción
    skip: (req) => {
        return process.env.NODE_ENV !== 'production';
    }
});
app.use(limiter);

// Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

// ==================== RUTAS DE USUARIOS ====================

// GET /api/usuarios/simulados - Datos simulados para usuarios (DEBE IR ANTES DE /:id)
app.get('/api/usuarios/simulados', (req, res) => {
    const usuariosSimulados = [];
    const nombres = ['Juan', 'María', 'Carlos', 'Ana', 'Pedro', 'Laura', 'Miguel', 'Carmen', 'David', 'Sofia'];
    const apellidos = ['García', 'López', 'Martín', 'Sánchez', 'Pérez', 'Gómez', 'Ruiz', 'Díaz', 'Moreno', 'Muñoz'];
    const niveles = ['principiante', 'intermedio', 'avanzado', 'profesional'];
    
    for (let i = 1; i <= 45; i++) {
        const nombre = nombres[Math.floor(Math.random() * nombres.length)];
        const apellido = apellidos[Math.floor(Math.random() * apellidos.length)];
        const fecha = new Date();
        fecha.setDate(fecha.getDate() - Math.floor(Math.random() * 365));
        
        usuariosSimulados.push({
            id_usuario: i,
            nombre: nombre,
            apellido: apellido,
            email: `${nombre.toLowerCase()}.${apellido.toLowerCase()}@email.com`,
            telefono: `+34 ${Math.floor(Math.random() * 900) + 600}${Math.floor(Math.random() * 900000) + 100000}`,
            nivel_juego: niveles[Math.floor(Math.random() * niveles.length)],
            fecha_registro: fecha.toISOString().split('T')[0]
        });
    }
    
    res.json({
        success: true,
        data: usuariosSimulados
    });
});

// GET /api/usuarios - Obtener todos los usuarios
app.get('/api/usuarios', async (req, res) => {
    try {
        const usuarios = await Usuario.obtenerTodos();
        res.json({
            success: true,
            data: usuarios
        });
    } catch (error) {
        console.error('Error obteniendo usuarios:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// GET /api/usuarios/:id - Obtener usuario por ID
app.get('/api/usuarios/:id', validarParams(Joi.object({ id: validarId })), async (req, res) => {
    try {
        const usuario = await Usuario.obtenerPorId(req.params.id);
        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        res.json({
            success: true,
            data: usuario
        });
    } catch (error) {
        console.error('Error obteniendo usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// POST /api/usuarios - Crear nuevo usuario
app.post('/api/usuarios', validar(validarUsuario), async (req, res) => {
    try {
        const idUsuario = await Usuario.crear(req.body);
        res.status(201).json({
            success: true,
            message: 'Usuario creado exitosamente',
            id_usuario: idUsuario
        });
    } catch (error) {
        console.error('Error creando usuario:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                message: 'El email ya está registrado'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// ==================== RUTAS DE CANCHAS ====================

// GET /api/canchas - Obtener todas las canchas
app.get('/api/canchas', async (req, res) => {
    try {
        const canchas = await Cancha.obtenerTodas();
        res.json({
            success: true,
            data: canchas
        });
    } catch (error) {
        console.error('Error obteniendo canchas:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// GET /api/canchas/:id - Obtener cancha por ID
app.get('/api/canchas/:id', validarParams(Joi.object({ id: validarId })), async (req, res) => {
    try {
        const cancha = await Cancha.obtenerPorId(req.params.id);
        if (!cancha) {
            return res.status(404).json({
                success: false,
                message: 'Cancha no encontrada'
            });
        }
        res.json({
            success: true,
            data: cancha
        });
    } catch (error) {
        console.error('Error obteniendo cancha:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// ==================== RUTAS DE HORARIOS ====================

// GET /api/horarios - Obtener todos los horarios
app.get('/api/horarios', async (req, res) => {
    try {
        const horarios = await Horario.obtenerTodos();
        res.json({
            success: true,
            data: horarios
        });
    } catch (error) {
        console.error('Error obteniendo horarios:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// GET /api/horarios/disponibles - Obtener horarios disponibles
app.get('/api/horarios/disponibles', validarQuery(validarConsultaHorarios), async (req, res) => {
    try {
        const { cancha, fecha } = req.query;
        const horarios = await Horario.obtenerDisponibles(cancha, fecha);
        res.json({
            success: true,
            data: horarios
        });
    } catch (error) {
        console.error('Error obteniendo horarios disponibles:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// ==================== RUTAS DE RESERVAS ====================

// GET /api/reservas - Obtener todas las reservas
app.get('/api/reservas', async (req, res) => {
    try {
        const reservas = await Reserva.obtenerTodas();
        res.json({
            success: true,
            data: reservas
        });
    } catch (error) {
        console.error('Error obteniendo reservas:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// POST /api/reservas - Crear nueva reserva
app.post('/api/reservas', validar(validarReserva), async (req, res) => {
    try {
        const idReserva = await Reserva.crear(req.body);
        res.status(201).json({
            success: true,
            message: 'Reserva creada exitosamente',
            id_reserva: idReserva
        });
    } catch (error) {
        console.error('Error creando reserva:', error);
        if (error.message === 'El horario ya está ocupado') {
            return res.status(409).json({
                success: false,
                message: error.message
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// PUT /api/reservas/:id/estado - Actualizar estado de reserva
app.put('/api/reservas/:id/estado', 
    validarParams(Joi.object({ id: validarId })),
    validar(validarEstadoReserva),
    async (req, res) => {
        try {
            const actualizado = await Reserva.actualizarEstado(req.params.id, req.body.estado);
            if (!actualizado) {
                return res.status(404).json({
                    success: false,
                    message: 'Reserva no encontrada'
                });
            }
            res.json({
                success: true,
                message: 'Estado de reserva actualizado exitosamente'
            });
        } catch (error) {
            console.error('Error actualizando estado de reserva:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
);

// DELETE /api/reservas/:id - Eliminar reserva
app.delete('/api/reservas/:id', 
    validarParams(['id'], validarId),
    async (req, res) => {
        try {
            const { id } = req.params;
            
            // Verificar si la reserva existe
            const reservaExiste = await Reserva.obtenerPorId(id);
            if (!reservaExiste) {
                return res.status(404).json({
                    success: false,
                    message: 'Reserva no encontrada'
                });
            }
            
            // Eliminar la reserva
            await Reserva.eliminar(id);
            
            res.json({
                success: true,
                message: 'Reserva eliminada exitosamente'
            });
        } catch (error) {
            console.error('Error eliminando reserva:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
);

// ==================== RUTAS DE GRÁFICOS ====================

// GET /api/graficos/barras - Gráfico de barras
app.get('/api/graficos/barras', async (req, res) => {
    try {
        const resultado = await ChartService.obtenerDatosBarras();
        res.json({
            success: true,
            data: resultado
        });
    } catch (error) {
        console.error('Error obteniendo gráfico de barras:', error);
        res.status(500).json({
            success: false,
            message: 'Error generando gráfico de barras'
        });
    }
});

// GET /api/graficos/lineas - Gráfico de líneas
app.get('/api/graficos/lineas', async (req, res) => {
    try {
        const resultado = await ChartService.obtenerDatosLineas();
        res.json({
            success: true,
            data: resultado
        });
    } catch (error) {
        console.error('Error obteniendo gráfico de líneas:', error);
        res.status(500).json({
            success: false,
            message: 'Error generando gráfico de líneas'
        });
    }
});

// GET /api/graficos/torta - Gráfico de torta
app.get('/api/graficos/torta', async (req, res) => {
    try {
        const resultado = await ChartService.obtenerDatosTorta();
        res.json({
            success: true,
            data: resultado
        });
    } catch (error) {
        console.error('Error obteniendo gráfico de torta:', error);
        res.status(500).json({
            success: false,
            message: 'Error generando gráfico de torta'
        });
    }
});

// GET /api/graficos/dispersion - Gráfico de dispersión
app.get('/api/graficos/dispersion', async (req, res) => {
    try {
        const resultado = await ChartService.obtenerDatosDispersion();
        res.json({
            success: true,
            data: resultado
        });
    } catch (error) {
        console.error('Error obteniendo gráfico de dispersión:', error);
        res.status(500).json({
            success: false,
            message: 'Error generando gráfico de dispersión'
        });
    }
});

// GET /api/graficos/todos - Todos los gráficos
app.get('/api/graficos/todos', async (req, res) => {
    try {
        const resultado = await ChartService.obtenerTodosLosDatos();
        res.json({
            success: true,
            data: resultado
        });
    } catch (error) {
        console.error('Error obteniendo todos los gráficos:', error);
        res.status(500).json({
            success: false,
            message: 'Error generando gráficos'
        });
    }
});

// ==================== RUTAS DE ESTADÍSTICAS ====================

// GET /api/estadisticas/resumen - Resumen general
app.get('/api/estadisticas/resumen', async (req, res) => {
    try {
        const resumen = await Estadisticas.resumenGeneral();
        res.json({
            success: true,
            data: resumen
        });
    } catch (error) {
        console.error('Error obteniendo resumen:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// ==================== RUTAS DE UTILIDAD ====================

// GET /api/health - Health check
app.get('/api/health', async (req, res) => {
    try {
        const dbStatus = await database.testConnection();
        res.json({
            success: true,
            data: {
                status: 'healthy',
                timestamp: new Date().toISOString(),
                database: dbStatus ? 'connected' : 'disconnected',
                uptime: process.uptime()
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Health check failed',
            error: error.message
        });
    }
});

// GET /api/info - Información de la API
app.get('/api/info', (req, res) => {
    res.json({
        success: true,
        data: {
            nombre: 'API Sistema de Reservas de Pádel',
            version: '1.0.0',
            descripcion: 'API REST para manejo de reservas y análisis de datos de canchas de pádel',
            tecnologias: ['Node.js', 'Express', 'MySQL'],
            endpoints: {
                usuarios: '/api/usuarios',
                canchas: '/api/canchas',
                horarios: '/api/horarios',
                reservas: '/api/reservas',
                graficos: '/api/graficos',
                estadisticas: '/api/estadisticas'
            }
        }
    });
});

// ==================== RUTAS CON DATOS SIMULADOS PARA PRUEBAS ====================

// Datos simulados para reservas
app.get('/api/reservas/simuladas', (req, res) => {
    const reservasSimuladas = [];
    const usuarios = ['Juan Pérez', 'María García', 'Carlos López', 'Ana Martín', 'Pedro Sánchez', 'Laura Ruiz', 'Miguel Torres', 'Carmen Díaz', 'David Moreno', 'Sofia Muñoz'];
    const apellidos = ['García', 'López', 'Martín', 'Sánchez', 'Pérez', 'Gómez', 'Ruiz', 'Díaz', 'Moreno', 'Muñoz'];
    const canchas = ['Cancha 1', 'Cancha 2', 'Cancha 3', 'Cancha Central', 'Cancha Norte'];
    const estados = ['pendiente', 'confirmada', 'completada', 'cancelada'];
    
    for (let i = 1; i <= 50; i++) {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() + Math.floor(Math.random() * 30) - 15);
        
        const nombreCompleto = usuarios[Math.floor(Math.random() * usuarios.length)].split(' ');
        
        reservasSimuladas.push({
            id_reserva: i,
            id_usuario: Math.floor(Math.random() * 20) + 1, // ID del usuario
            nombre: nombreCompleto[0],
            apellido: nombreCompleto[1],
            cancha_nombre: canchas[Math.floor(Math.random() * canchas.length)],
            fecha_reserva: fecha.toISOString().split('T')[0],
            hora_inicio: '09:00',
            hora_fin: '11:00',
            estado: estados[Math.floor(Math.random() * estados.length)],
            precio_total: 1500 + Math.floor(Math.random() * 1000)
        });
    }
    
    res.json({
        success: true,
        data: reservasSimuladas
    });
});



// ==================== MANEJO DE ERRORES ====================

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint no encontrado'
    });
});

// Middleware de manejo de errores
app.use((error, req, res, next) => {
    console.error('Error no manejado:', error);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
    });
});

// ==================== INICIAR SERVIDOR ====================

async function iniciarServidor() {
    try {
        // Verificar conexión a la base de datos
        const dbConnected = await database.testConnection();
        if (!dbConnected) {
            console.warn('⚠️  No se pudo conectar a la base de datos - ejecutando en modo de prueba');
        }

        // Iniciar servidor (incluso sin base de datos para pruebas)
        app.listen(PORT, () => {
            console.log('🚀 =====================================');
            console.log(`🎾 Servidor de Pádel ejecutándose en puerto ${PORT}`);
            console.log(`🌐 API disponible en: http://localhost:${PORT}/api`);
            console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
            console.log(`📊 Gráficos: http://localhost:${PORT}/api/graficos/todos`);
            if (!dbConnected) {
                console.log('⚠️  MODO DE PRUEBA - Base de datos no conectada');
            }
            console.log('=====================================');
        });

    } catch (error) {
        console.error('❌ Error iniciando servidor:', error);
        process.exit(1);
    }
}

// Manejo de cierre graceful
process.on('SIGINT', async () => {
    console.log('\n🛑 Cerrando servidor...');
    await database.close();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Cerrando servidor...');
    await database.close();
    process.exit(0);
});

// Iniciar la aplicación
iniciarServidor();

module.exports = app;