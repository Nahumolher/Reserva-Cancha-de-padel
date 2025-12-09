const mysql = require('mysql2/promise');
require('dotenv').config();

class Database {
    constructor() {
        this.config = {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'padel_reservas',
            port: process.env.DB_PORT || 3306,
            charset: 'utf8mb4',
            timezone: '+00:00',
            acquireTimeout: 60000,
            timeout: 60000,
            reconnect: true
        };
        this.pool = null;
        this.init();
    }

    // Inicializar pool de conexiones
    init() {
        try {
            this.pool = mysql.createPool({
                ...this.config,
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0
            });
            console.log('✅ Pool de conexiones MySQL creado exitosamente');
        } catch (error) {
            console.error('❌ Error creando pool de conexiones:', error);
            throw error;
        }
    }

    // Verificar conexión
    async testConnection() {
        try {
            const connection = await this.pool.getConnection();
            await connection.ping();
            connection.release();
            console.log('✅ Conexión a MySQL exitosa');
            return true;
        } catch (error) {
            console.error('❌ Error conectando a MySQL:', error);
            return false;
        }
    }

    // Ejecutar consulta SELECT
    async query(sql, params = []) {
        try {
            const [rows] = await this.pool.execute(sql, params);
            return rows;
        } catch (error) {
            console.error('❌ Error en consulta:', error);
            throw error;
        }
    }

    // Ejecutar consulta INSERT/UPDATE/DELETE
    async execute(sql, params = []) {
        try {
            const [result] = await this.pool.execute(sql, params);
            return result;
        } catch (error) {
            console.error('❌ Error ejecutando consulta:', error);
            throw error;
        }
    }

    // Cerrar pool de conexiones
    async close() {
        if (this.pool) {
            await this.pool.end();
            console.log('🔒 Pool de conexiones cerrado');
        }
    }
}

// Crear instancia única (Singleton)
const database = new Database();

module.exports = database;