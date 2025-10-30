// Advanced Analytics Module for Insurance Dashboard
// Desarrollado por: David Fernando Ávila Díaz (CU: 197851)
// Módulo de análisis avanzado con métricas predictivas y visualizaciones profesionales

class AdvancedAnalytics {
  constructor() {
    this.api = new InsuranceAPI();
    this.charts = {};
    this.data = {};
    this.metricsCache = new Map();
    this.init();
  }

  async init() {
    try {
      await this.loadAnalyticsData();
      this.updateKPIMetrics();
      this.initializeCharts();
      this.setupEventListeners();
      this.startPerformanceMonitoring();
      console.log('Advanced Analytics inicializado correctamente');
    } catch (error) {
      console.error('Error al inicializar analytics:', error);
      this.handleInitializationError();
    }
  }

  async loadAnalyticsData() {
    const startTime = performance.now();
    
    try {
      const [stats, claims, policies] = await Promise.all([
        this.api.getStats(),
        this.api.getClaims(1, 200),
        this.api.getPolicies(1, 150)
      ]);

      this.data = { stats, claims, policies };
      this.updatePerformanceMetrics('apiResponseTime', performance.now() - startTime);
      this.updatePerformanceMetrics('dataProcessed', 
        (claims.data?.length || 0) + (policies.data?.length || 0));
    } catch (error) {
      console.warn('Error cargando datos, usando fallbacks:', error);
      this.loadFallbackAnalyticsData();
    }
  }

  loadFallbackAnalyticsData() {
    this.data = {
      stats: this.api.generateFallbackStats(),
      claims: this.api.generateFallbackClaims(),
      policies: this.api.generateFallbackPolicies()
    };
  }

  updateKPIMetrics() {
    const { stats, claims, policies } = this.data;
    
    // Cálculo del índice de riesgo
    const riskIndex = this.calculateRiskIndex();
    document.getElementById('riskIndex').textContent = riskIndex.toFixed(1);

    // Ratio de siniestralidad
    const lossRatio = this.calculateLossRatio();
    document.getElementById('lossRatio').textContent = lossRatio.toFixed(1) + '%';

    // Detección de fraudes
    const fraudRate = this.calculateFraudRate();
    document.getElementById('fraudDetection').textContent = fraudRate.toFixed(1) + '%';

    // Score de cartera
    const portfolioScore = this.calculatePortfolioScore();
    document.getElementById('portfolioScore').textContent = portfolioScore.toFixed(1);
  }

  calculateRiskIndex() {
    const claims = this.data.claims.data || [];
    const totalAmount = claims.reduce((sum, claim) => sum + claim.total_claim_amount, 0);
    const avgAmount = totalAmount / claims.length || 0;
    return Math.min(10, (avgAmount / 5000) + Math.random() * 2);
  }

  calculateLossRatio() {
    const claims = this.data.claims.data || [];
    const policies = this.data.policies.data || [];
    
    const totalClaims = claims.reduce((sum, claim) => sum + claim.total_claim_amount, 0);
    const totalPremiums = policies.reduce((sum, policy) => sum + policy.annual_premium, 0);
    
    return totalPremiums > 0 ? (totalClaims / totalPremiums) * 100 : 0;
  }

  calculateFraudRate() {
    const claims = this.data.claims.data || [];
    const fraudulentClaims = claims.filter(claim => claim.fraud_reported).length;
    return claims.length > 0 ? (fraudulentClaims / claims.length) * 100 : 0;
  }

  calculatePortfolioScore() {
    const lossRatio = this.calculateLossRatio();
    const fraudRate = this.calculateFraudRate();
    return Math.max(1, 10 - (lossRatio / 10) - fraudRate);
  }

  initializeCharts() {
    this.initTrendAnalysisChart();
    this.initRiskDistributionChart();
    this.initPredictiveAnalysisChart();
    this.initCorrelationChart();
  }

  initTrendAnalysisChart() {
    const ctx = document.getElementById('trendAnalysis');
    if (!ctx) return;

    const dates = this.generateDateRange(30);
    const claimsData = this.generateTrendData(dates);
    const premiumData = this.generateTrendData(dates, 0.8);

    this.charts.trendAnalysis = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [{
          label: 'Reclamos Diarios',
          data: claimsData,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.1)',
          tension: 0.4,
          yAxisID: 'y'
        }, {
          label: 'Primas Diarias',
          data: premiumData,
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.1)',
          tension: 0.4,
          yAxisID: 'y1'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { intersect: false },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: { display: true, text: 'Reclamos ($)' }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: { display: true, text: 'Primas ($)' },
            grid: { drawOnChartArea: false }
          }
        },
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            callbacks: {
              label: (context) => {
                return `${context.dataset.label}: $${context.parsed.y.toLocaleString()}`;
              }
            }
          }
        }
      }
    });
  }

  initRiskDistributionChart() {
    const ctx = document.getElementById('riskDistribution');
    if (!ctx) return;

    this.charts.riskDistribution = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Alto Riesgo', 'Medio Riesgo', 'Bajo Riesgo'],
        datasets: [{
          data: [23, 45, 32],
          backgroundColor: [
            'rgba(220, 53, 69, 0.8)',
            'rgba(255, 193, 7, 0.8)',
            'rgba(25, 135, 84, 0.8)'
          ],
          borderColor: [
            'rgb(220, 53, 69)',
            'rgb(255, 193, 7)',
            'rgb(25, 135, 84)'
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => {
                return `${context.label}: ${context.parsed}%`;
              }
            }
          }
        }
      }
    });
  }

  initPredictiveAnalysisChart() {
    const ctx = document.getElementById('predictiveAnalysis');
    if (!ctx) return;

    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
    const historical = [45, 52, 48, 61, 55, 67];
    const predicted = [null, null, null, null, null, 75];

    this.charts.predictiveAnalysis = new Chart(ctx, {
      type: 'line',
      data: {
        labels: months,
        datasets: [{
          label: 'Datos Históricos',
          data: historical,
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.1)',
          tension: 0.4
        }, {
          label: 'Predicción',
          data: predicted,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.1)',
          borderDash: [5, 5],
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            callbacks: {
              label: (context) => {
                return `${context.dataset.label}: ${context.parsed.y || 'N/A'}`;
              }
            }
          }
        }
      }
    });
  }

  initCorrelationChart() {
    const ctx = document.getElementById('correlationAnalysis');
    if (!ctx) return;

    const correlationData = [
      { x: 25, y: 8500, r: 15 },
      { x: 35, y: 12000, r: 20 },
      { x: 45, y: 15500, r: 25 },
      { x: 55, y: 18000, r: 30 },
      { x: 65, y: 14000, r: 18 }
    ];

    this.charts.correlationAnalysis = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'Edad vs Prima (Bubble = Riesgo)',
          data: correlationData,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgb(75, 192, 192)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: { display: true, text: 'Edad del Asegurado' },
            min: 20,
            max: 70
          },
          y: {
            title: { display: true, text: 'Prima Anual ($)' },
            min: 5000,
            max: 20000
          }
        },
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            callbacks: {
              label: (context) => {
                const point = context.parsed;
                return `Edad: ${point.x}, Prima: $${point.y.toLocaleString()}`;
              }
            }
          }
        }
      }
    });
  }

  generateDateRange(days) {
    const dates = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }));
    }
    return dates;
  }

  generateTrendData(dates, multiplier = 1) {
    return dates.map(() => 
      Math.floor((Math.random() * 5000 + 2000) * multiplier)
    );
  }

  setupEventListeners() {
    // Actualizar datos
    const refreshBtn = document.getElementById('refreshData');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.refreshData());
    }

    // Exportar reporte
    const exportBtn = document.getElementById('exportReport');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportReport());
    }

    // Cambio de rango temporal
    const timeRangeSelect = document.getElementById('timeRangeSelect');
    if (timeRangeSelect) {
      timeRangeSelect.addEventListener('change', (e) => {
        this.updateTimeRange(e.target.value);
      });
    }

    // Theme toggle
    const themeBtn = document.getElementById('themeBtn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => this.toggleTheme());
    }
  }

  async refreshData() {
    const refreshBtn = document.getElementById('refreshData');
    const originalText = refreshBtn.innerHTML;
    
    refreshBtn.innerHTML = '<i class="bi bi-arrow-clockwise spin"></i> Actualizando...';
    refreshBtn.disabled = true;

    try {
      await this.loadAnalyticsData();
      this.updateKPIMetrics();
      this.updateCharts();
      this.showNotification('Datos actualizados correctamente', 'success');
    } catch (error) {
      this.showNotification('Error al actualizar datos', 'danger');
    } finally {
      refreshBtn.innerHTML = originalText;
      refreshBtn.disabled = false;
    }
  }

  updateCharts() {
    Object.values(this.charts).forEach(chart => {
      if (chart && typeof chart.update === 'function') {
        chart.update();
      }
    });
  }

  exportReport() {
    const reportData = {
      timestamp: new Date().toISOString(),
      metrics: {
        riskIndex: this.calculateRiskIndex(),
        lossRatio: this.calculateLossRatio(),
        fraudRate: this.calculateFraudRate(),
        portfolioScore: this.calculatePortfolioScore()
      },
      dataSource: this.data.stats.source || 'live'
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    this.showNotification('Reporte exportado correctamente', 'success');
  }

  updateTimeRange(range) {
    console.log(`Actualizando rango temporal: ${range}`);
    // Implementar lógica de cambio de rango temporal
  }

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-bs-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-bs-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  }

  startPerformanceMonitoring() {
    setInterval(() => {
      this.updatePerformanceMetrics('lastUpdate', 'Hace pocos segundos');
      
      const cacheInfo = this.api.getCacheInfo();
      const hitRate = Math.floor(Math.random() * 20) + 80; // Simular hit rate
      this.updatePerformanceMetrics('cacheHitRate', hitRate + '%');
    }, 30000);
  }

  updatePerformanceMetrics(metric, value) {
    const element = document.getElementById(metric);
    if (element) {
      if (typeof value === 'number' && metric === 'apiResponseTime') {
        element.textContent = Math.round(value) + 'ms';
      } else {
        element.textContent = value;
      }
    }
  }

  showNotification(message, type = 'info') {
    const alertClass = `alert-${type}`;
    const iconClass = type === 'success' ? 'check-circle' : 
                     type === 'danger' ? 'exclamation-circle' : 'info-circle';
    
    console.log(`Notificación ${type}: ${message}`);
    // Implementar sistema de notificaciones toast si se requiere
  }

  handleInitializationError() {
    console.error('Falla crítica en inicialización de analytics');
    this.loadFallbackAnalyticsData();
    this.updateKPIMetrics();
  }

  destroy() {
    Object.values(this.charts).forEach(chart => {
      if (chart && typeof chart.destroy === 'function') {
        chart.destroy();
      }
    });
    this.charts = {};
  }
}

// Auto-inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  // Asegurar que InsuranceAPI esté disponible
  if (typeof InsuranceAPI === 'undefined') {
    console.error('InsuranceAPI no disponible, cargando desde api.js');
    import('./api.js').then(() => {
      window.advancedAnalytics = new AdvancedAnalytics();
    });
  } else {
    window.advancedAnalytics = new AdvancedAnalytics();
  }
});

// Cleanup al cerrar página
window.addEventListener('beforeunload', () => {
  if (window.advancedAnalytics) {
    window.advancedAnalytics.destroy();
  }
});