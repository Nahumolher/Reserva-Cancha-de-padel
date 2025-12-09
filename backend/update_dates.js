const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateDatesTo2025() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'padel_reservas',
        port: process.env.DB_PORT || 3306
    });

    try {
        console.log('🔄 Actualizando fechas de 2024 a 2025...');

        // Actualizar fechas de reservas
        const [result1] = await connection.execute(`
            UPDATE reservas 
            SET fecha_reserva = DATE_ADD(fecha_reserva, INTERVAL 1 YEAR),
                fecha_creacion = DATE_ADD(fecha_creacion, INTERVAL 1 YEAR)
            WHERE YEAR(fecha_reserva) = 2024
        `);
        console.log(`✅ Actualizadas ${result1.affectedRows} reservas`);

        // Actualizar promociones
        const [result2] = await connection.execute(`
            UPDATE promociones 
            SET fecha_inicio = DATE_ADD(fecha_inicio, INTERVAL 1 YEAR),
                fecha_fin = DATE_ADD(fecha_fin, INTERVAL 1 YEAR)
            WHERE YEAR(fecha_inicio) = 2024
        `);
        console.log(`✅ Actualizadas ${result2.affectedRows} promociones`);

        // Agregar reservas de octubre 2025
        const reservas2025 = [
            [1, 1, 1, '2025-10-20', 'completada', 2500.00, '2025-10-19 15:30:00'],
            [2, 2, 3, '2025-10-21', 'confirmada', 3000.00, '2025-10-20 10:20:00'],
            [3, 1, 5, '2025-10-22', 'confirmada', 2500.00, '2025-10-21 14:15:00'],
            [4, 3, 7, '2025-10-23', 'pendiente', 2200.00, '2025-10-22 16:45:00'],
            [5, 4, 8, '2025-10-24', 'pendiente', 3500.00, '2025-10-23 12:30:00'],
            [1, 2, 2, '2025-10-25', 'pendiente', 3000.00, '2025-10-24 11:20:00'],
            [2, 1, 4, '2025-10-26', 'pendiente', 2500.00, '2025-10-25 13:15:00'],
            [3, 3, 6, '2025-10-27', 'pendiente', 2200.00, '2025-10-26 15:40:00'],
            [4, 4, 9, '2025-10-28', 'pendiente', 3500.00, '2025-10-27 09:25:00'],
            [5, 1, 1, '2025-10-29', 'pendiente', 2500.00, '2025-10-28 17:10:00'],
            [1, 2, 3, '2025-10-30', 'pendiente', 3000.00, '2025-10-29 14:30:00'],
            [2, 3, 5, '2025-10-31', 'pendiente', 2200.00, '2025-10-30 12:15:00']
        ];

        for (const reserva of reservas2025) {
            try {
                await connection.execute(`
                    INSERT INTO reservas (id_usuario, id_cancha, id_horario, fecha_reserva, estado, precio_total, fecha_creacion) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `, reserva);
            } catch (err) {
                // Ignorar duplicados
                if (!err.message.includes('Duplicate')) {
                    console.log('⚠️ Error insertando reserva:', err.message);
                }
            }
        }
        console.log('✅ Agregadas reservas de octubre 2025');

        // Verificar cambios
        const [verificacion] = await connection.execute(`
            SELECT YEAR(fecha_reserva) as año, COUNT(*) as cantidad
            FROM reservas 
            GROUP BY YEAR(fecha_reserva) 
            ORDER BY año
        `);
        
        console.log('📊 Reservas por año:');
        verificacion.forEach(row => {
            console.log(`   ${row.año}: ${row.cantidad} reservas`);
        });

        console.log('🎉 ¡Actualización completada exitosamente!');

    } catch (error) {
        console.error('❌ Error actualizando fechas:', error);
    } finally {
        await connection.end();
    }
}

updateDatesTo2025();