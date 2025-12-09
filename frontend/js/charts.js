// Servicio para manejo de gráficos con Chart.js
class ChartService {
    constructor() {
        this.charts = {};
        this.defaultOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: 'white',
                    bodyColor: 'white',
                    borderColor: 'rgba(255,255,255,0.2)',
                    borderWidth: 1
                }
            }
        };
    }

    // Destruir gráfico existente si existe
    destroyChart(chartId) {
        if (this.charts[chartId]) {
            this.charts[chartId].destroy();
            delete this.charts[chartId];
        }
    }

    // Crear gráfico de barras
    async crearGraficoBarras() {
        try {
            const response = await apiService.obtenerGraficoBarras();
            const datos = response.data.datos;
            
            if (!datos || datos.length === 0) {
                this.mostrarMensajeVacio('grafico-barras-container', 'No hay datos disponibles para el gráfico de barras');
                return;
            }

            this.destroyChart('grafico-barras');

            const ctx = document.getElementById('grafico-barras').getContext('2d');
            
            this.charts['grafico-barras'] = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: datos.map(item => item.cancha),
                    datasets: [{
                        label: 'Número de Reservas',
                        data: datos.map(item => item.total_reservas),
                        backgroundColor: CONFIG.CHART_COLORS.gradient.slice(0, datos.length),
                        borderColor: CONFIG.CHART_COLORS.gradient.slice(0, datos.length),
                        borderWidth: 2,
                        borderRadius: 5,
                        borderSkipped: false,
                    }]
                },
                options: {
                    ...this.defaultOptions,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Número de Reservas'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Canchas'
                            }
                        }
                    },
                    plugins: {
                        ...this.defaultOptions.plugins,
                        title: {
                            display: true,
                            text: 'Popularidad de Canchas por Número de Reservas'
                        }
                    }
                }
            });

            // Mostrar interpretación
            this.mostrarInterpretacion('interpretacion-barras', response.data.interpretacion);

        } catch (error) {
            console.error('Error creando gráfico de barras:', error);
            this.mostrarError('grafico-barras-container', 'Error al cargar el gráfico de barras');
        }
    }

    // Crear gráfico de líneas
    async crearGraficoLineas() {
        try {
            const response = await apiService.obtenerGraficoLineas();
            const datos = response.data.datos;
            
            if (!datos || datos.length === 0) {
                this.mostrarMensajeVacio('grafico-lineas-container', 'No hay datos disponibles para el gráfico de líneas');
                return;
            }

            this.destroyChart('grafico-lineas');

            const ctx = document.getElementById('grafico-lineas').getContext('2d');
            
            // Preparar datos para el gráfico
            const labels = datos.map(item => `${item.nombre_mes || 'Mes'} ${item.año}`);
            
            this.charts['grafico-lineas'] = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Reservas',
                            data: datos.map(item => item.total_reservas),
                            borderColor: CONFIG.CHART_COLORS.primary,
                            backgroundColor: CONFIG.CHART_COLORS.primary + '20',
                            fill: true,
                            tension: 0.4,
                            pointBackgroundColor: CONFIG.CHART_COLORS.primary,
                            pointBorderColor: 'white',
                            pointBorderWidth: 2,
                            pointRadius: 6
                        },
                        {
                            label: 'Ingresos ($)',
                            data: datos.map(item => item.ingresos_totales),
                            borderColor: CONFIG.CHART_COLORS.secondary,
                            backgroundColor: CONFIG.CHART_COLORS.secondary + '20',
                            fill: false,
                            tension: 0.4,
                            pointBackgroundColor: CONFIG.CHART_COLORS.secondary,
                            pointBorderColor: 'white',
                            pointBorderWidth: 2,
                            pointRadius: 6,
                            yAxisID: 'y1'
                        }
                    ]
                },
                options: {
                    ...this.defaultOptions,
                    scales: {
                        y: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            title: {
                                display: true,
                                text: 'Número de Reservas'
                            }
                        },
                        y1: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            title: {
                                display: true,
                                text: 'Ingresos ($)'
                            },
                            grid: {
                                drawOnChartArea: false,
                            },
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Período'
                            }
                        }
                    },
                    plugins: {
                        ...this.defaultOptions.plugins,
                        title: {
                            display: true,
                            text: 'Evolución Temporal de Reservas e Ingresos'
                        }
                    }
                }
            });

            // Mostrar interpretación
            this.mostrarInterpretacion('interpretacion-lineas', response.data.interpretacion);

        } catch (error) {
            console.error('Error creando gráfico de líneas:', error);
            this.mostrarError('grafico-lineas-container', 'Error al cargar el gráfico de líneas');
        }
    }

    // Crear gráfico de torta
    async crearGraficoTorta() {
        try {
            const response = await apiService.obtenerGraficoTorta();
            const datos = response.data.datos;
            
            if (!datos || datos.length === 0) {
                this.mostrarMensajeVacio('grafico-torta-container', 'No hay datos disponibles para el gráfico de torta');
                return;
            }

            this.destroyChart('grafico-torta');

            const ctx = document.getElementById('grafico-torta').getContext('2d');
            
            this.charts['grafico-torta'] = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: datos.map(item => item.periodo),
                    datasets: [{
                        data: datos.map(item => item.total_reservas),
                        backgroundColor: [
                            CONFIG.CHART_COLORS.primary,
                            CONFIG.CHART_COLORS.secondary,
                            CONFIG.CHART_COLORS.warning
                        ],
                        borderColor: 'white',
                        borderWidth: 3,
                        hoverBorderWidth: 5
                    }]
                },
                options: {
                    ...this.defaultOptions,
                    cutout: '50%',
                    plugins: {
                        ...this.defaultOptions.plugins,
                        title: {
                            display: true,
                            text: 'Distribución de Reservas por Período del Día'
                        },
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 20,
                                usePointStyle: true
                            }
                        }
                    }
                }
            });

            // Mostrar interpretación
            this.mostrarInterpretacion('interpretacion-torta', response.data.interpretacion);

        } catch (error) {
            console.error('Error creando gráfico de torta:', error);
            this.mostrarError('grafico-torta-container', 'Error al cargar el gráfico de torta');
        }
    }

    // Crear gráfico de dispersión
    async crearGraficoDispersion() {
        try {
            const response = await apiService.obtenerGraficoDispersion();
            const datos = response.data.datos;
            
            if (!datos || datos.length === 0) {
                this.mostrarMensajeVacio('grafico-dispersion-container', 'No hay datos disponibles para el gráfico de dispersión');
                return;
            }

            this.destroyChart('grafico-dispersion');

            const ctx = document.getElementById('grafico-dispersion').getContext('2d');
            
            // Preparar datos para el scatter plot
            const scatterData = datos.map(item => ({
                x: item.precio_hora,
                y: item.total_reservas,
                label: item.cancha
            }));

            this.charts['grafico-dispersion'] = new Chart(ctx, {
                type: 'scatter',
                data: {
                    datasets: [{
                        label: 'Canchas',
                        data: scatterData,
                        backgroundColor: CONFIG.CHART_COLORS.accent,
                        borderColor: CONFIG.CHART_COLORS.dark,
                        borderWidth: 2,
                        pointRadius: 8,
                        pointHoverRadius: 12
                    }]
                },
                options: {
                    ...this.defaultOptions,
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Precio por Hora ($)'
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Número de Reservas'
                            }
                        }
                    },
                    plugins: {
                        ...this.defaultOptions.plugins,
                        title: {
                            display: true,
                            text: 'Correlación entre Precio por Hora y Demanda'
                        },
                        tooltip: {
                            ...this.defaultOptions.plugins.tooltip,
                            callbacks: {
                                label: function(context) {
                                    const data = context.parsed;
                                    const cancha = scatterData[context.dataIndex].label;
                                    return `${cancha}: $${data.x} - ${data.y} reservas`;
                                }
                            }
                        }
                    }
                }
            });

            // Mostrar interpretación
            this.mostrarInterpretacion('interpretacion-dispersion', response.data.interpretacion);

        } catch (error) {
            console.error('Error creando gráfico de dispersión:', error);
            this.mostrarError('grafico-dispersion-container', 'Error al cargar el gráfico de dispersión');
        }
    }

    // Mostrar interpretación en el elemento correspondiente
    mostrarInterpretacion(elementId, interpretacion) {
        const elemento = document.getElementById(elementId);
        if (elemento && interpretacion) {
            elemento.innerHTML = `<p><strong>Interpretación:</strong> ${interpretacion}</p>`;
        }
    }

    // Mostrar mensaje de error
    mostrarError(containerId, mensaje) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="error-message" style="text-align: center; padding: 2rem; color: #e74c3c;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                    <p>${mensaje}</p>
                </div>
            `;
        }
    }

    // Mostrar mensaje de datos vacíos
    mostrarMensajeVacio(containerId, mensaje) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="empty-message" style="text-align: center; padding: 2rem; color: #7f8c8d;">
                    <i class="fas fa-chart-line" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                    <p>${mensaje}</p>
                </div>
            `;
        }
    }

    // Crear todos los gráficos
    async crearTodosLosGraficos() {
        try {
            await Promise.all([
                this.crearGraficoBarras(),
                this.crearGraficoLineas(),
                this.crearGraficoTorta(),
                this.crearGraficoDispersion()
            ]);
            
            showToast('Todos los gráficos han sido actualizados', 'success');
        } catch (error) {
            console.error('Error creando todos los gráficos:', error);
            showToast('Error al actualizar los gráficos', 'error');
        }
    }

    // Destruir todos los gráficos
    destruirTodosLosGraficos() {
        Object.keys(this.charts).forEach(chartId => {
            this.destroyChart(chartId);
        });
    }
}

// Crear instancia global del servicio de gráficos
const chartService = new ChartService();

// Función global para cargar todos los gráficos
async function cargarTodosLosGraficos() {
    await chartService.crearTodosLosGraficos();
}

// Hacer disponible globalmente
window.chartService = chartService;
window.cargarTodosLosGraficos = cargarTodosLosGraficos;