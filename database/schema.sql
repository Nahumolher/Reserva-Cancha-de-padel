-- Base de datos para Sistema de Reservas de Cancha de Pádel
-- Ejecutar en MySQL Workbench

DROP DATABASE IF EXISTS padel_reservas;
CREATE DATABASE padel_reservas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE padel_reservas;

-- Tabla de usuarios
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    nivel_juego ENUM('principiante', 'intermedio', 'avanzado', 'profesional') DEFAULT 'principiante'
);

-- Tabla de canchas
CREATE TABLE canchas (
    id_cancha INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    tipo ENUM('interior', 'exterior') NOT NULL,
    superficie ENUM('cesped_artificial', 'cemento', 'resina') NOT NULL,
    precio_hora DECIMAL(8,2) NOT NULL,
    activa BOOLEAN DEFAULT TRUE,
    ubicacion VARCHAR(200),
    descripcion TEXT
);

-- Tabla de horarios disponibles
CREATE TABLE horarios (
    id_horario INT AUTO_INCREMENT PRIMARY KEY,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    activo BOOLEAN DEFAULT TRUE
);

-- Tabla de reservas
CREATE TABLE reservas (
    id_reserva INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_cancha INT NOT NULL,
    id_horario INT NOT NULL,
    fecha_reserva DATE NOT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('pendiente', 'confirmada', 'cancelada', 'completada') DEFAULT 'pendiente',
    precio_total DECIMAL(8,2) NOT NULL,
    observaciones TEXT,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_cancha) REFERENCES canchas(id_cancha),
    FOREIGN KEY (id_horario) REFERENCES horarios(id_horario),
    UNIQUE KEY unique_reserva (id_cancha, fecha_reserva, id_horario)
);

-- Tabla de pagos
CREATE TABLE pagos (
    id_pago INT AUTO_INCREMENT PRIMARY KEY,
    id_reserva INT NOT NULL,
    monto DECIMAL(8,2) NOT NULL,
    metodo_pago ENUM('efectivo', 'tarjeta', 'transferencia', 'mercadopago') NOT NULL,
    fecha_pago DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado_pago ENUM('pendiente', 'aprobado', 'rechazado') DEFAULT 'pendiente',
    FOREIGN KEY (id_reserva) REFERENCES reservas(id_reserva)
);

-- Tabla de promociones
CREATE TABLE promociones (
    id_promocion INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    descuento_porcentaje DECIMAL(5,2),
    descuento_fijo DECIMAL(8,2),
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    activa BOOLEAN DEFAULT TRUE,
    codigo_promocion VARCHAR(50) UNIQUE
);

-- Tabla de aplicación de promociones
CREATE TABLE reservas_promociones (
    id_reserva_promocion INT AUTO_INCREMENT PRIMARY KEY,
    id_reserva INT NOT NULL,
    id_promocion INT NOT NULL,
    descuento_aplicado DECIMAL(8,2) NOT NULL,
    FOREIGN KEY (id_reserva) REFERENCES reservas(id_reserva),
    FOREIGN KEY (id_promocion) REFERENCES promociones(id_promocion)
);

-- Insertar datos de ejemplo para testing y gráficos

-- Usuarios de ejemplo
INSERT INTO usuarios (nombre, apellido, email, telefono, nivel_juego, fecha_registro) VALUES
('Juan', 'Pérez', 'juan.perez@email.com', '1234567890', 'intermedio', '2024-01-15 10:30:00'),
('María', 'García', 'maria.garcia@email.com', '1234567891', 'avanzado', '2024-02-20 14:15:00'),
('Carlos', 'López', 'carlos.lopez@email.com', '1234567892', 'principiante', '2024-03-10 09:45:00'),
('Ana', 'Martínez', 'ana.martinez@email.com', '1234567893', 'intermedio', '2024-04-05 16:20:00'),
('Diego', 'Rodríguez', 'diego.rodriguez@email.com', '1234567894', 'profesional', '2024-05-12 11:30:00'),
('Laura', 'Fernández', 'laura.fernandez@email.com', '1234567895', 'avanzado', '2024-06-18 13:45:00'),
('Miguel', 'Sánchez', 'miguel.sanchez@email.com', '1234567896', 'intermedio', '2024-07-22 15:10:00'),
('Sofia', 'Torres', 'sofia.torres@email.com', '1234567897', 'principiante', '2024-08-14 12:00:00'),
('Roberto', 'Morales', 'roberto.morales@email.com', '1234567898', 'avanzado', '2024-09-03 10:15:00'),
('Valentina', 'Castro', 'valentina.castro@email.com', '1234567899', 'intermedio', '2024-09-25 17:30:00');

-- Canchas de ejemplo
INSERT INTO canchas (nombre, tipo, superficie, precio_hora, ubicacion, descripcion) VALUES
('Cancha Central', 'exterior', 'cesped_artificial', 2500.00, 'Sector Norte', 'Cancha principal con iluminación LED'),
('Cancha Norte', 'interior', 'resina', 3000.00, 'Sector Norte', 'Cancha techada climatizada'),
('Cancha Sur', 'exterior', 'cesped_artificial', 2200.00, 'Sector Sur', 'Vista panorámica a la ciudad'),
('Cancha VIP', 'interior', 'resina', 3500.00, 'Sector VIP', 'Cancha premium con vestuarios privados');

-- Horarios disponibles
INSERT INTO horarios (hora_inicio, hora_fin) VALUES
('08:00:00', '09:30:00'),
('09:30:00', '11:00:00'),
('11:00:00', '12:30:00'),
('12:30:00', '14:00:00'),
('14:00:00', '15:30:00'),
('15:30:00', '17:00:00'),
('17:00:00', '18:30:00'),
('18:30:00', '20:00:00'),
('20:00:00', '21:30:00'),
('21:30:00', '23:00:00');

-- Promociones de ejemplo
INSERT INTO promociones (nombre, descripcion, descuento_porcentaje, fecha_inicio, fecha_fin, codigo_promocion) VALUES
('Promoción Verano', 'Descuento especial de verano', 20.00, '2024-12-01', '2024-03-31', 'VERANO2024'),
('Happy Hour', 'Descuento en horarios de 14:00 a 17:00', 15.00, '2024-01-01', '2024-12-31', 'HAPPYHOUR'),
('Promo Estudiantes', 'Descuento para estudiantes', 25.00, '2025-01-01', '2025-12-31', 'ESTUDIANTE');

INSERT INTO reservas (id_usuario, id_cancha, id_horario, fecha_reserva, estado, precio_total, fecha_creacion) VALUES
-- Enero 2025
(1, 1, 1, '2025-01-15', 'completada', 2500.00, '2025-01-14 15:30:00'),
(2, 2, 3, '2025-01-16', 'completada', 3000.00, '2025-01-15 10:20:00'),
(3, 1, 5, '2025-01-20', 'completada', 2500.00, '2025-01-19 14:15:00'),
(4, 3, 7, '2025-01-25', 'completada', 2200.00, '2025-01-24 16:45:00'),
(5, 4, 8, '2025-01-28', 'completada', 3500.00, '2025-01-27 12:30:00'),
-- Febrero 2025
(1, 2, 2, '2025-02-05', 'completada', 3000.00, '2025-02-04 11:20:00'),
(2, 1, 4, '2025-02-08', 'completada', 2500.00, '2025-02-07 13:15:00'),
(3, 3, 6, '2025-02-12', 'completada', 2200.00, '2025-02-11 15:40:00'),
(4, 4, 8, '2025-02-18', 'completada', 3500.00, '2025-02-17 09:25:00'),
(5, 1, 9, '2025-02-22', 'completada', 2500.00, '2025-02-21 17:10:00'),
(6, 2, 1, '2025-02-25', 'completada', 3000.00, '2025-02-24 14:30:00'),
-- Marzo 2025
(1, 3, 3, '2025-03-03', 'completada', 2200.00, '2025-03-02 12:15:00'),
(2, 4, 5, '2025-03-07', 'completada', 3500.00, '2025-03-06 16:20:00'),
(3, 1, 7, '2025-03-10', 'completada', 2500.00, '2025-03-09 10:45:00'),
(4, 2, 2, '2025-03-15', 'completada', 3000.00, '2025-03-14 14:50:00'),
(5, 3, 4, '2025-03-20', 'completada', 2200.00, '2025-03-19 11:30:00'),
(6, 4, 6, '2025-03-25', 'completada', 3500.00, '2025-03-24 15:20:00'),
(7, 1, 8, '2025-03-28', 'completada', 2500.00, '2025-03-27 13:40:00'),
-- Abril 2025
(1, 2, 1, '2025-04-02', 'completada', 3000.00, '2025-04-01 16:15:00'),
(2, 3, 3, '2025-04-05', 'completada', 2200.00, '2025-04-04 12:25:00'),
(3, 4, 5, '2025-04-08', 'completada', 3500.00, '2025-04-07 14:35:00'),
(4, 1, 7, '2025-04-12', 'completada', 2500.00, '2025-04-11 10:20:00'),
(5, 2, 9, '2025-04-15', 'completada', 3000.00, '2025-04-14 17:45:00'),
(6, 3, 2, '2025-04-20', 'completada', 2200.00, '2025-04-19 13:15:00'),
(7, 4, 4, '2025-04-25', 'completada', 3500.00, '2025-04-24 15:30:00'),
(8, 1, 6, '2025-04-28', 'completada', 2500.00, '2025-04-27 11:45:00'),
-- Mayo 2025
(1, 3, 8, '2025-05-03', 'completada', 2200.00, '2025-05-02 14:20:00'),
(2, 4, 1, '2025-05-07', 'completada', 3500.00, '2025-05-06 16:35:00'),
(3, 1, 3, '2025-05-10', 'completada', 2500.00, '2025-05-09 12:50:00'),
(4, 2, 5, '2025-05-15', 'completada', 3000.00, '2025-05-14 10:15:00'),
(5, 3, 7, '2025-05-20', 'completada', 2200.00, '2025-05-19 15:40:00'),
(6, 4, 9, '2025-05-25', 'completada', 3500.00, '2025-05-24 13:25:00'),
(7, 1, 2, '2025-05-28', 'completada', 2500.00, '2025-05-27 17:10:00'),
(8, 2, 4, '2025-05-30', 'completada', 3000.00, '2025-05-29 11:55:00'),
-- Junio 2025
(1, 4, 6, '2025-06-05', 'completada', 3500.00, '2025-06-04 14:30:00'),
(2, 1, 8, '2025-06-08', 'completada', 2500.00, '2025-06-07 16:45:00'),
(3, 2, 1, '2025-06-12', 'completada', 3000.00, '2025-06-11 12:20:00'),
(4, 3, 3, '2025-06-15', 'completada', 2200.00, '2025-06-14 10:35:00'),
(5, 4, 5, '2025-06-20', 'completada', 3500.00, '2025-06-19 15:50:00'),
(6, 1, 7, '2025-06-25', 'completada', 2500.00, '2025-06-24 13:15:00'),
(7, 2, 9, '2025-06-28', 'completada', 3000.00, '2025-06-27 17:40:00'),
(8, 3, 2, '2025-06-30', 'completada', 2200.00, '2025-06-29 11:25:00'),
-- Julio 2025
(1, 1, 4, '2025-07-03', 'completada', 2500.00, '2025-07-02 14:45:00'),
(2, 4, 6, '2025-07-07', 'completada', 3500.00, '2025-07-06 16:20:00'),
(3, 2, 8, '2025-07-10', 'completada', 3000.00, '2025-07-09 12:35:00'),
(4, 3, 1, '2025-07-15', 'completada', 2200.00, '2025-07-14 10:50:00'),
(5, 1, 3, '2025-07-20', 'completada', 2500.00, '2025-07-19 15:15:00'),
(6, 4, 5, '2025-07-25', 'completada', 3500.00, '2025-07-24 13:40:00'),
(7, 2, 7, '2025-07-28', 'completada', 3000.00, '2025-07-27 17:25:00'),
(8, 3, 9, '2025-07-30', 'completada', 2200.00, '2025-07-29 11:10:00'),
-- Agosto 2025 (incremento del 25% - promoción de verano)
(1, 2, 2, '2025-08-02', 'completada', 2400.00, '2025-08-01 14:55:00'), -- con descuento
(2, 4, 4, '2025-08-05', 'completada', 2800.00, '2025-08-04 16:30:00'), -- con descuento
(3, 1, 6, '2025-08-08', 'completada', 2000.00, '2025-08-07 12:45:00'), -- con descuento
(4, 3, 8, '2025-08-12', 'completada', 1760.00, '2025-08-11 10:20:00'), -- con descuento
(5, 2, 1, '2025-08-15', 'completada', 2400.00, '2025-08-14 15:35:00'), -- con descuento
(6, 4, 3, '2025-08-18', 'completada', 2800.00, '2025-08-17 13:50:00'), -- con descuento
(7, 1, 5, '2025-08-22', 'completada', 2000.00, '2025-08-21 17:15:00'), -- con descuento
(8, 3, 7, '2025-08-25', 'completada', 1760.00, '2025-08-24 11:40:00'), -- con descuento
(9, 2, 9, '2025-08-28', 'completada', 2400.00, '2025-08-27 14:25:00'), -- con descuento
(10, 4, 2, '2025-08-30', 'completada', 2800.00, '2025-08-29 16:10:00'), -- con descuento
-- Más reservas de agosto para mostrar incremento
(1, 1, 4, '2025-08-03', 'completada', 2000.00, '2025-08-02 15:20:00'),
(2, 3, 6, '2025-08-06', 'completada', 1760.00, '2025-08-05 17:35:00'),
(3, 2, 8, '2025-08-09', 'completada', 2400.00, '2025-08-08 13:10:00'),
(4, 4, 1, '2025-08-13', 'completada', 2800.00, '2025-08-12 11:45:00'),
(5, 1, 3, '2025-08-16', 'completada', 2000.00, '2025-08-15 16:50:00'),
-- Octubre 2025 (reservas recientes y futuras)
(1, 1, 1, '2025-10-20', 'completada', 2500.00, '2025-10-19 15:30:00'),
(2, 2, 3, '2025-10-21', 'confirmada', 3000.00, '2025-10-20 10:20:00'),
(3, 1, 5, '2025-10-22', 'confirmada', 2500.00, '2025-10-21 14:15:00'),
(4, 3, 7, '2025-10-23', 'pendiente', 2200.00, '2025-10-22 16:45:00'),
(5, 4, 8, '2025-10-24', 'pendiente', 3500.00, '2025-10-23 12:30:00'),
(1, 2, 2, '2025-10-25', 'pendiente', 3000.00, '2025-10-24 11:20:00'),
(2, 1, 4, '2025-10-26', 'pendiente', 2500.00, '2025-10-25 13:15:00'),
(3, 3, 6, '2025-10-27', 'pendiente', 2200.00, '2025-10-26 15:40:00'),
(4, 4, 9, '2025-10-28', 'pendiente', 3500.00, '2025-10-27 09:25:00'),
(5, 1, 1, '2025-10-29', 'pendiente', 2500.00, '2025-10-28 17:10:00'),
(1, 2, 3, '2025-10-30', 'pendiente', 3000.00, '2025-10-29 14:30:00'),
(2, 3, 5, '2025-10-31', 'pendiente', 2200.00, '2025-10-30 12:15:00');

-- Pagos correspondientes a las reservas
INSERT INTO pagos (id_reserva, monto, metodo_pago, estado_pago) 
SELECT id_reserva, precio_total, 'tarjeta', 'aprobado' FROM reservas;

-- Crear vistas para análisis de datos
CREATE VIEW vista_reservas_mensuales AS
SELECT 
    YEAR(fecha_reserva) as año,
    MONTH(fecha_reserva) as mes,
    COUNT(*) as total_reservas,
    SUM(precio_total) as ingresos_totales,
    AVG(precio_total) as precio_promedio
FROM reservas 
WHERE estado = 'completada'
GROUP BY YEAR(fecha_reserva), MONTH(fecha_reserva)
ORDER BY año, mes;

CREATE VIEW vista_canchas_populares AS
SELECT 
    c.nombre as cancha,
    c.tipo,
    COUNT(r.id_reserva) as total_reservas,
    SUM(r.precio_total) as ingresos_totales
FROM canchas c
LEFT JOIN reservas r ON c.id_cancha = r.id_cancha AND r.estado = 'completada'
GROUP BY c.id_cancha, c.nombre, c.tipo
ORDER BY total_reservas DESC;

CREATE VIEW vista_horarios_populares AS
SELECT 
    h.hora_inicio,
    h.hora_fin,
    COUNT(r.id_reserva) as total_reservas,
    CASE 
        WHEN h.hora_inicio < '12:00:00' THEN 'Mañana'
        WHEN h.hora_inicio < '18:00:00' THEN 'Tarde'
        ELSE 'Noche'
    END as periodo_dia
FROM horarios h
LEFT JOIN reservas r ON h.id_horario = r.id_horario AND r.estado = 'completada'
GROUP BY h.id_horario, h.hora_inicio, h.hora_fin
ORDER BY total_reservas DESC;

-- Procedimiento almacenado para obtener estadísticas
DELIMITER //
CREATE PROCEDURE GetEstadisticasReservas(IN fecha_inicio DATE, IN fecha_fin DATE)
BEGIN
    SELECT 
        'Resumen del Período' as tipo_estadistica,
        COUNT(*) as total_reservas,
        SUM(precio_total) as ingresos_totales,
        AVG(precio_total) as precio_promedio,
        COUNT(DISTINCT id_usuario) as usuarios_unicos,
        COUNT(DISTINCT id_cancha) as canchas_utilizadas
    FROM reservas 
    WHERE fecha_reserva BETWEEN fecha_inicio AND fecha_fin 
    AND estado = 'completada';
END //
DELIMITER ;

-- Índices para optimizar consultas
CREATE INDEX idx_reservas_fecha ON reservas(fecha_reserva);
CREATE INDEX idx_reservas_estado ON reservas(estado);
CREATE INDEX idx_reservas_usuario ON reservas(id_usuario);
CREATE INDEX idx_reservas_cancha ON reservas(id_cancha);
CREATE INDEX idx_pagos_fecha ON pagos(fecha_pago);
CREATE INDEX idx_usuarios_email ON usuarios(email);

COMMIT;

-- Consultas de ejemplo para verificar los datos
SELECT 'Total de usuarios registrados:' as descripcion, COUNT(*) as cantidad FROM usuarios;
SELECT 'Total de canchas disponibles:' as descripcion, COUNT(*) as cantidad FROM canchas;
SELECT 'Total de reservas completadas:' as descripcion, COUNT(*) as cantidad FROM reservas WHERE estado = 'completada';
SELECT 'Ingresos totales:' as descripcion, CONCAT('$', FORMAT(SUM(precio_total), 2)) as cantidad FROM reservas WHERE estado = 'completada';