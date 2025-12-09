const { Estadisticas } = require('./models');

class ChartService {
    // Generar interpretación para gráfico de barras
    static generarInterpretacionBarras(datos) {
        if (!datos || datos.length === 0) return 'No hay datos disponibles para análisis.';
        
        const mas_popular = datos.reduce((prev, current) => 
            prev.total_reservas > current.total_reservas ? prev : current
        );
        
        const menos_popular = datos.reduce((prev, current) => 
            prev.total_reservas < current.total_reservas ? prev : current
        );
        
        return `La cancha más popular es '${mas_popular.cancha}' con ${mas_popular.total_reservas} reservas, mientras que '${menos_popular.cancha}' tiene la menor demanda con ${menos_popular.total_reservas} reservas. Esto indica una clara preferencia de los usuarios por ciertas instalaciones.`;
    }

    // Generar interpretación para gráfico de líneas
    static generarInterpretacionLineas(datos) {
        if (!datos || datos.length === 0) return 'No hay datos disponibles para análisis temporal.';
        
        // Buscar agosto para detectar promoción
        const agosto = datos.find(d => d.mes === 8);
        const julio = datos.find(d => d.mes === 7);
        
        let interpretacion = '';
        
        if (agosto && julio) {
            const incremento = ((agosto.total_reservas - julio.total_reservas) / julio.total_reservas) * 100;
            if (incremento > 20) {
                interpretacion = `Se observa un incremento del ${incremento.toFixed(1)}% en las reservas durante el mes de agosto, asociado a la promoción de verano del club. `;
            }
        }
        
        const primer_mes = datos[0];
        const ultimo_mes = datos[datos.length - 1];
        
        interpretacion += `La tendencia general muestra una evolución de ${primer_mes.total_reservas} reservas en ${primer_mes.nombre_mes} a ${ultimo_mes.total_reservas} en ${ultimo_mes.nombre_mes}.`;
        
        return interpretacion;
    }

    // Generar interpretación para gráfico de torta
    static generarInterpretacionTorta(datos) {
        if (!datos || datos.length === 0) return 'No hay datos disponibles para análisis de distribución.';
        
        const total = datos.reduce((sum, item) => sum + item.total_reservas, 0);
        const mas_popular = datos.reduce((prev, current) => 
            prev.total_reservas > current.total_reservas ? prev : current
        );
        
        const porcentaje = ((mas_popular.total_reservas / total) * 100).toFixed(1);
        
        return `El período de ${mas_popular.periodo.toLowerCase()} concentra el ${porcentaje}% de las reservas totales (${mas_popular.total_reservas} reservas), siendo el horario de mayor demanda. Esto sugiere que los usuarios prefieren este período para practicar pádel.`;
    }

    // Generar interpretación para gráfico de dispersión
    static generarInterpretacionDispersion(datos) {
        if (!datos || datos.length < 2) return 'No hay suficientes datos para análisis de correlación.';
        
        // Calcular correlación simple
        const precios = datos.map(d => parseFloat(d.precio_hora));
        const reservas = datos.map(d => parseInt(d.total_reservas));
        
        const correlacion = this.calcularCorrelacion(precios, reservas);
        
        let tipo_correlacion;
        if (correlacion > 0.3) {
            tipo_correlacion = 'positiva moderada';
        } else if (correlacion < -0.3) {
            tipo_correlacion = 'negativa moderada';
        } else {
            tipo_correlacion = 'débil';
        }
        
        return `Se observa una correlación ${tipo_correlacion} (r = ${correlacion.toFixed(2)}) entre el precio por hora y la demanda de las canchas. Las canchas con precios más altos tienden a tener ${correlacion > 0 ? 'mayor' : 'menor'} demanda, lo que puede indicar que los usuarios ${correlacion > 0 ? 'asocian precio con calidad' : 'son sensibles al precio'}.`;
    }

    // Calcular coeficiente de correlación de Pearson
    static calcularCorrelacion(x, y) {
        const n = x.length;
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.map((xi, i) => xi * y[i]).reduce((a, b) => a + b, 0);
        const sumX2 = x.map(xi => xi * xi).reduce((a, b) => a + b, 0);
        const sumY2 = y.map(yi => yi * yi).reduce((a, b) => a + b, 0);
        
        const numerador = n * sumXY - sumX * sumY;
        const denominador = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
        
        return denominador === 0 ? 0 : numerador / denominador;
    }

    // Obtener datos para gráfico de barras con interpretación
    static async obtenerDatosBarras() {
        try {
            const datos = await Estadisticas.canchasPopulares();
            const interpretacion = this.generarInterpretacionBarras(datos);
            
            return {
                datos,
                interpretacion,
                tipo: 'barras'
            };
        } catch (error) {
            console.error('Error obteniendo datos de barras:', error);
            throw error;
        }
    }

    // Obtener datos para gráfico de líneas con interpretación
    static async obtenerDatosLineas() {
        try {
            const datos = await Estadisticas.reservasPorMes();
            const interpretacion = this.generarInterpretacionLineas(datos);
            
            return {
                datos,
                interpretacion,
                tipo: 'lineas'
            };
        } catch (error) {
            console.error('Error obteniendo datos de líneas:', error);
            throw error;
        }
    }

    // Obtener datos para gráfico de torta con interpretación
    static async obtenerDatosTorta() {
        try {
            const datos = await Estadisticas.distribucionHorarios();
            const interpretacion = this.generarInterpretacionTorta(datos);
            
            return {
                datos,
                interpretacion,
                tipo: 'torta'
            };
        } catch (error) {
            console.error('Error obteniendo datos de torta:', error);
            throw error;
        }
    }

    // Obtener datos para gráfico de dispersión con interpretación
    static async obtenerDatosDispersion() {
        try {
            const datos = await Estadisticas.correlacionPrecioDemanda();
            const interpretacion = this.generarInterpretacionDispersion(datos);
            
            // Calcular correlación para incluir en respuesta
            const precios = datos.map(d => parseFloat(d.precio_hora));
            const reservas = datos.map(d => parseInt(d.total_reservas));
            const correlacion = this.calcularCorrelacion(precios, reservas);
            
            return {
                datos,
                interpretacion,
                correlacion,
                tipo: 'dispersion'
            };
        } catch (error) {
            console.error('Error obteniendo datos de dispersión:', error);
            throw error;
        }
    }

    // Obtener todos los gráficos
    static async obtenerTodosLosDatos() {
        try {
            const [barras, lineas, torta, dispersion] = await Promise.all([
                this.obtenerDatosBarras(),
                this.obtenerDatosLineas(),
                this.obtenerDatosTorta(),
                this.obtenerDatosDispersion()
            ]);

            return {
                barras,
                lineas,
                torta,
                dispersion
            };
        } catch (error) {
            console.error('Error obteniendo todos los datos de gráficos:', error);
            throw error;
        }
    }
}

module.exports = ChartService;