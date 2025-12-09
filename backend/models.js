const database = require('./database');

class Usuario {
    // Obtener todos los usuarios
    static async obtenerTodos() {
        const sql = 'SELECT * FROM usuarios WHERE activo = TRUE ORDER BY id_usuario DESC';
        return await database.query(sql);
    }

    // Obtener usuario por ID
    static async obtenerPorId(id) {
        const sql = 'SELECT * FROM usuarios WHERE id_usuario = ? AND activo = TRUE';
        const usuarios = await database.query(sql, [id]);
        return usuarios[0] || null;
    }

    // Crear nuevo usuario
    static async crear(datos) {
        const { nombre, apellido, email, telefono, nivel_juego = 'principiante' } = datos;
        const sql = `
            INSERT INTO usuarios (nombre, apellido, email, telefono, nivel_juego) 
            VALUES (?, ?, ?, ?, ?)
        `;
        const result = await database.execute(sql, [nombre, apellido, email, telefono, nivel_juego]);
        return result.insertId;
    }

    // Actualizar usuario
    static async actualizar(id, datos) {
        const { nombre, apellido, email, telefono, nivel_juego } = datos;
        const sql = `
            UPDATE usuarios 
            SET nombre = ?, apellido = ?, email = ?, telefono = ?, nivel_juego = ? 
            WHERE id_usuario = ?
        `;
        const result = await database.execute(sql, [nombre, apellido, email, telefono, nivel_juego, id]);
        return result.affectedRows > 0;
    }
}

class Cancha {
    // Obtener todas las canchas
    static async obtenerTodas() {
        const sql = 'SELECT * FROM canchas WHERE activa = TRUE ORDER BY nombre';
        return await database.query(sql);
    }

    // Obtener cancha por ID
    static async obtenerPorId(id) {
        const sql = 'SELECT * FROM canchas WHERE id_cancha = ? AND activa = TRUE';
        const canchas = await database.query(sql, [id]);
        return canchas[0] || null;
    }
}

class Horario {
    // Obtener todos los horarios
    static async obtenerTodos() {
        const sql = 'SELECT * FROM horarios WHERE activo = TRUE ORDER BY hora_inicio';
        return await database.query(sql);
    }

    // Obtener horarios disponibles para una cancha en una fecha
    static async obtenerDisponibles(idCancha, fecha) {
        const sql = `
            SELECT h.* FROM horarios h
            WHERE h.activo = TRUE 
            AND h.id_horario NOT IN (
                SELECT r.id_horario FROM reservas r 
                WHERE r.id_cancha = ? 
                AND r.fecha_reserva = ? 
                AND r.estado IN ('pendiente', 'confirmada')
            )
            ORDER BY h.hora_inicio
        `;
        return await database.query(sql, [idCancha, fecha]);
    }
}

class Reserva {
    // Obtener todas las reservas con información relacionada
    static async obtenerTodas() {
        const sql = `
            SELECT r.*, u.nombre, u.apellido, u.email, 
                   c.nombre as cancha_nombre, c.tipo as cancha_tipo,
                   h.hora_inicio, h.hora_fin
            FROM reservas r
            JOIN usuarios u ON r.id_usuario = u.id_usuario
            JOIN canchas c ON r.id_cancha = c.id_cancha
            JOIN horarios h ON r.id_horario = h.id_horario
            ORDER BY r.id_reserva DESC
        `;
        return await database.query(sql);
    }

    // Crear nueva reserva
    static async crear(datos) {
        const { id_usuario, id_cancha, id_horario, fecha_reserva, precio_total, observaciones } = datos;
        
        // Verificar disponibilidad primero
        const disponible = await this.verificarDisponibilidad(id_cancha, id_horario, fecha_reserva);
        if (!disponible) {
            throw new Error('El horario ya está ocupado');
        }

        const sql = `
            INSERT INTO reservas (id_usuario, id_cancha, id_horario, fecha_reserva, precio_total, observaciones) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const result = await database.execute(sql, [id_usuario, id_cancha, id_horario, fecha_reserva, precio_total, observaciones]);
        return result.insertId;
    }

    // Actualizar estado de reserva
    static async actualizarEstado(id, nuevoEstado) {
        const sql = 'UPDATE reservas SET estado = ? WHERE id_reserva = ?';
        const result = await database.execute(sql, [nuevoEstado, id]);
        return result.affectedRows > 0;
    }

    // Verificar disponibilidad
    static async verificarDisponibilidad(idCancha, idHorario, fechaReserva) {
        const sql = `
            SELECT COUNT(*) as ocupado FROM reservas 
            WHERE id_cancha = ? AND id_horario = ? AND fecha_reserva = ? 
            AND estado IN ('pendiente', 'confirmada')
        `;
        const resultado = await database.query(sql, [idCancha, idHorario, fechaReserva]);
        return resultado[0].ocupado === 0;
    }

    // Obtener reservas por usuario
    static async obtenerPorUsuario(idUsuario) {
        const sql = `
            SELECT r.*, c.nombre as cancha_nombre, h.hora_inicio, h.hora_fin
            FROM reservas r
            JOIN canchas c ON r.id_cancha = c.id_cancha
            JOIN horarios h ON r.id_horario = h.id_horario
            WHERE r.id_usuario = ?
            ORDER BY r.fecha_reserva DESC, h.hora_inicio
        `;
        return await database.query(sql, [idUsuario]);
    }

    // Obtener reserva por ID
    static async obtenerPorId(id) {
        const sql = `
            SELECT r.*, u.nombre, u.apellido, u.email, 
                   c.nombre as cancha_nombre, c.tipo as cancha_tipo,
                   h.hora_inicio, h.hora_fin
            FROM reservas r
            JOIN usuarios u ON r.id_usuario = u.id_usuario
            JOIN canchas c ON r.id_cancha = c.id_cancha
            JOIN horarios h ON r.id_horario = h.id_horario
            WHERE r.id_reserva = ?
        `;
        const resultado = await database.query(sql, [id]);
        return resultado[0] || null;
    }

    // Eliminar reserva
    static async eliminar(id) {
        const sql = 'DELETE FROM reservas WHERE id_reserva = ?';
        const result = await database.execute(sql, [id]);
        return result.affectedRows > 0;
    }
}

class Estadisticas {
    // Reservas por mes para gráfico de líneas
    static async reservasPorMes() {
        const sql = `
            SELECT 
                YEAR(fecha_reserva) as año,
                MONTH(fecha_reserva) as mes,
                MONTHNAME(fecha_reserva) as nombre_mes,
                COUNT(*) as total_reservas,
                SUM(precio_total) as ingresos_totales
            FROM reservas 
            WHERE estado = 'completada'
            GROUP BY YEAR(fecha_reserva), MONTH(fecha_reserva), MONTHNAME(fecha_reserva)
            ORDER BY año, mes
        `;
        return await database.query(sql);
    }

    // Canchas populares para gráfico de barras
    static async canchasPopulares() {
        const sql = `
            SELECT 
                c.nombre as cancha,
                c.tipo,
                COUNT(r.id_reserva) as total_reservas,
                SUM(r.precio_total) as ingresos_totales
            FROM canchas c
            LEFT JOIN reservas r ON c.id_cancha = r.id_cancha AND r.estado = 'completada'
            GROUP BY c.id_cancha, c.nombre, c.tipo
            ORDER BY total_reservas DESC
        `;
        return await database.query(sql);
    }

    // Distribución de horarios para gráfico de torta
    static async distribucionHorarios() {
        const sql = `
            SELECT 
                CASE 
                    WHEN h.hora_inicio < '12:00:00' THEN 'Mañana'
                    WHEN h.hora_inicio < '18:00:00' THEN 'Tarde'
                    ELSE 'Noche'
                END as periodo,
                COUNT(r.id_reserva) as total_reservas
            FROM horarios h
            LEFT JOIN reservas r ON h.id_horario = r.id_horario AND r.estado = 'completada'
            GROUP BY periodo
            ORDER BY total_reservas DESC
        `;
        return await database.query(sql);
    }

    // Correlación precio vs demanda para gráfico de dispersión
    static async correlacionPrecioDemanda() {
        const sql = `
            SELECT 
                c.precio_hora,
                COUNT(r.id_reserva) as total_reservas,
                c.nombre as cancha
            FROM canchas c
            LEFT JOIN reservas r ON c.id_cancha = r.id_cancha AND r.estado = 'completada'
            GROUP BY c.id_cancha, c.precio_hora, c.nombre
            ORDER BY c.precio_hora
        `;
        return await database.query(sql);
    }

    // Resumen general
    static async resumenGeneral() {
        const sql = `
            SELECT 
                (SELECT COUNT(*) FROM usuarios WHERE activo = TRUE) as total_usuarios,
                (SELECT COUNT(*) FROM canchas WHERE activa = TRUE) as total_canchas,
                (SELECT COUNT(*) FROM reservas WHERE estado = 'completada') as total_reservas,
                (SELECT COALESCE(SUM(precio_total), 0) FROM reservas WHERE estado = 'completada') as ingresos_totales,
                (SELECT COALESCE(AVG(precio_total), 0) FROM reservas WHERE estado = 'completada') as precio_promedio
        `;
        const resultado = await database.query(sql);
        return resultado[0];
    }
}

module.exports = {
    Usuario,
    Cancha,
    Horario,
    Reserva,
    Estadisticas
};