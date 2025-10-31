// Chart.js 

let charts = {};

// Crear histograma de fraude (fraude vs no fraude por rangos de importe)
export function createFraudHistogram(claimsData) {
    const canvas = document.getElementById('fraudHistogramChart');
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');

    // Destruir gráfica existente si existe
    if (charts.fraudHistogram) {
        charts.fraudHistogram.destroy();
    }

    // Crear bins para importes de reclamo
    const bins = [0, 10000, 20000, 30000, 40000, 50000, 100000, Infinity];
    const binLabels = ['0-10k', '10k-20k', '20k-30k', '30k-40k', '40k-50k', '50k-100k', '100k+'];
    
    const fraudCounts = new Array(bins.length - 1).fill(0);
    const nonFraudCounts = new Array(bins.length - 1).fill(0);

    claimsData.data.forEach(claim => {
        const amount = claim.total_claim_amount || 0;
        const binIndex = bins.findIndex((threshold, idx) => 
            idx > 0 && amount >= bins[idx - 1] && amount < threshold
        ) - 1;
        
        if (binIndex >= 0) {
            if (claim.fraud_reported) {
                fraudCounts[binIndex]++;
            } else {
                nonFraudCounts[binIndex]++;
            }
        }
    });

    charts.fraudHistogram = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: binLabels,
            datasets: [
                {
                    label: 'Reclamos de fraude',
                    data: fraudCounts,
                    backgroundColor: 'rgba(220, 53, 69, 0.7)',
                    borderColor: 'rgba(220, 53, 69, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Reclamos legítimos',
                    data: nonFraudCounts,
                    backgroundColor: 'rgba(40, 167, 69, 0.7)',
                    borderColor: 'rgba(40, 167, 69, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: true },
                title: {
                    display: false
                }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });

    return charts.fraudHistogram;
}

// Crear gráfica de barras apiladas para el desglose de reclamos
export function createClaimsStackedChart(claimsData) {
    const canvas = document.getElementById('claimsStackedChart');
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');

    if (charts.claimsStacked) {
        charts.claimsStacked.destroy();
    }

    // Aggregate por fecha (o usar todos los datos)
    const totalInjury = claimsData.data.reduce((sum, c) => sum + (c.injury_claim || 0), 0);
    const totalProperty = claimsData.data.reduce((sum, c) => sum + (c.property_claim || 0), 0);
    const totalVehicle = claimsData.data.reduce((sum, c) => sum + (c.vehicle_claim || 0), 0);

    charts.claimsStacked = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Total de reclamos'],
            datasets: [
                {
                    label: 'Reclamos de lesiones',
                    data: [totalInjury],
                    backgroundColor: 'rgba(54, 162, 235, 0.8)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Reclamos de propiedad',
                    data: [totalProperty],
                    backgroundColor: 'rgba(255, 159, 64, 0.8)',
                    borderColor: 'rgba(255, 159, 64, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Reclamos de vehículo',
                    data: [totalVehicle],
                    backgroundColor: 'rgba(153, 102, 255, 0.8)',
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: true },
                tooltip: {
                    callbacks: {
                        footer: (items) => {
                            const total = items.reduce((sum, item) => sum + item.raw, 0);
                            return `Total: $${total.toLocaleString()}`;
                        }
                    }
                }
            },
            scales: {
                x: { stacked: true },
                y: { beginAtZero: true, stacked: true }
            }
        }
    });

    return charts.claimsStacked;
}

// Crear gráfica de tendencias de fraude
export function createFraudTrendsChart(timeSeriesData) {
    const canvas = document.getElementById('fraudTrendsChart');
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');

    if (charts.fraudTrends) {
        charts.fraudTrends.destroy();
    }

    // Si no hay datos de series temporales, crear datos de prueba o retornar
    if (!timeSeriesData || !timeSeriesData.dates) {
        charts.fraudTrends = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: []
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
        return charts.fraudTrends;
    }

    charts.fraudTrends = new Chart(ctx, {
        type: 'line',
        data: {
            labels: timeSeriesData.dates,
            datasets: [
                {
                    label: 'Fraud Rate (%)',
                    data: timeSeriesData.fraud_rates,
                    borderColor: 'rgba(220, 53, 69, 1)',
                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: true }
            },
            scales: {
                y: { beginAtZero: true, max: 100 }
            }
        }
    });

    return charts.fraudTrends;
}

// Crear gráfica de barras de severidad
export function createSeverityChart(incidentsData) {
    const canvas = document.getElementById('severityChart');
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');

    if (charts.severity) {
        charts.severity.destroy();
    }

    // Contar incidentes por severidad
    const severityCounts = {};
    incidentsData.data.forEach(incident => {
        const severity = incident.incident_severity || 'Unknown';
        severityCounts[severity] = (severityCounts[severity] || 0) + 1;
    });

    const severityColors = {
        'Trivial Damage': 'rgba(40, 167, 69, 0.8)',
        'Minor Damage': 'rgba(255, 193, 7, 0.8)',
        'Major Damage': 'rgba(255, 87, 34, 0.8)',
        'Total Loss': 'rgba(220, 53, 69, 0.8)'
    };

    const labels = Object.keys(severityCounts);
    const data = Object.values(severityCounts);
    const colors = labels.map(label => severityColors[label]);

    charts.severity = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Incidentes',
                data: data,
                backgroundColor: colors,
                borderColor: colors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });

    return charts.severity;
}

