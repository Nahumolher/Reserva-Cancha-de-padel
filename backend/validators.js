const Joi = require('joi');

// Validación para crear usuario
const validarUsuario = Joi.object({
    nombre: Joi.string().min(2).max(100).required().messages({
        'string.min': 'El nombre debe tener al menos 2 caracteres',
        'string.max': 'El nombre no puede exceder 100 caracteres',
        'any.required': 'El nombre es requerido'
    }),
    apellido: Joi.string().min(2).max(100).required().messages({
        'string.min': 'El apellido debe tener al menos 2 caracteres',
        'string.max': 'El apellido no puede exceder 100 caracteres',
        'any.required': 'El apellido es requerido'
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Debe ser un email válido',
        'any.required': 'El email es requerido'
    }),
    telefono: Joi.string().min(10).max(20).allow('', null).messages({
        'string.min': 'El teléfono debe tener al menos 10 caracteres',
        'string.max': 'El teléfono no puede exceder 20 caracteres'
    }),
    nivel_juego: Joi.string().valid('principiante', 'intermedio', 'avanzado', 'profesional').default('principiante')
});

// Validación para crear reserva
const validarReserva = Joi.object({
    id_usuario: Joi.number().integer().positive().required().messages({
        'number.base': 'ID de usuario debe ser un número',
        'number.positive': 'ID de usuario debe ser positivo',
        'any.required': 'ID de usuario es requerido'
    }),
    id_cancha: Joi.number().integer().positive().required().messages({
        'number.base': 'ID de cancha debe ser un número',
        'number.positive': 'ID de cancha debe ser positivo',
        'any.required': 'ID de cancha es requerido'
    }),
    id_horario: Joi.number().integer().positive().required().messages({
        'number.base': 'ID de horario debe ser un número',
        'number.positive': 'ID de horario debe ser positivo',
        'any.required': 'ID de horario es requerido'
    }),
    fecha_reserva: Joi.date().min('now').required().messages({
        'date.base': 'Fecha de reserva debe ser una fecha válida',
        'date.min': 'La fecha de reserva debe ser hoy o posterior',
        'any.required': 'Fecha de reserva es requerida'
    }),
    precio_total: Joi.number().positive().required().messages({
        'number.base': 'Precio total debe ser un número',
        'number.positive': 'Precio total debe ser positivo',
        'any.required': 'Precio total es requerido'
    }),
    observaciones: Joi.string().max(500).allow('', null).messages({
        'string.max': 'Las observaciones no pueden exceder 500 caracteres'
    })
});

// Validación para actualizar estado de reserva
const validarEstadoReserva = Joi.object({
    estado: Joi.string().valid('pendiente', 'confirmada', 'cancelada', 'completada', 'eliminada').required().messages({
        'any.only': 'Estado debe ser: pendiente, confirmada, cancelada, completada o eliminada',
        'any.required': 'Estado es requerido'
    })
});

// Validación para parámetros de URL
const validarId = Joi.number().integer().positive().required().messages({
    'number.base': 'ID debe ser un número',
    'number.positive': 'ID debe ser positivo',
    'any.required': 'ID es requerido'
});

// Validación para consulta de horarios disponibles
const validarConsultaHorarios = Joi.object({
    cancha: Joi.number().integer().positive().required().messages({
        'number.base': 'ID de cancha debe ser un número',
        'number.positive': 'ID de cancha debe ser positivo',
        'any.required': 'ID de cancha es requerido'
    }),
    fecha: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required().messages({
        'string.pattern.base': 'Fecha debe tener formato YYYY-MM-DD',
        'any.required': 'Fecha es requerida'
    })
}).unknown(true); // Permitir parámetros adicionales

// Middleware de validación
const validar = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body);
        
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Error de validación',
                errors: error.details.map(detail => ({
                    field: detail.path.join('.'),
                    message: detail.message
                }))
            });
        }
        
        // Reemplazar req.body con los valores validados
        req.body = value;
        next();
    };
};

// Middleware de validación para parámetros
const validarParams = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.params);
        
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Parámetro inválido',
                errors: error.details.map(detail => ({
                    field: detail.path.join('.'),
                    message: detail.message
                }))
            });
        }
        
        req.params = value;
        next();
    };
};

// Middleware de validación para query parameters
const validarQuery = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.query);
        
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Parámetros de consulta inválidos',
                errors: error.details.map(detail => ({
                    field: detail.path.join('.'),
                    message: detail.message
                }))
            });
        }
        
        req.query = value;
        next();
    };
};

module.exports = {
    validarUsuario,
    validarReserva,
    validarEstadoReserva,
    validarId,
    validarConsultaHorarios,
    validar,
    validarParams,
    validarQuery
};