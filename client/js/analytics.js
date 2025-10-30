// Advanced Analytics Dashboard - Developed by David Fernando Ávila Díaz
// CU: 197851 - COM-11117 Introducción al Desarrollo Web

class AdvancedAnalytics {
  constructor() {
    this.apiBaseUrl = 'http://localhost:8000';
    this.charts = {};
    this.analyticsData = {};
    this.refreshInterval = null;
    
    this.init();
  }

  async init() {
    console.log('🚀 Inicializando Analytics Avanzado...');
    
    // Wait for DOM and Chart.js to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
    } else {
      this.initializeComponents();
    }
  }

  async initializeComponents() {
    try {
      // Initialize theme system
      this.initThemeSystem();
      
      // Load analytics data
      await this.loadAnalyticsData();
      
      // Initialize all components
      this.initAdvancedKPIs();
      this.initRiskHeatmap();
      this.initSeverityDistribution();
      this.initClaimsTrend();
      this.initFraudAnalysis();
      this.initGeographicRisk();
      this.initCorrelationMatrix();
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Setup auto-refresh
      this.setupAutoRefresh();
      
      // Setup keyboard shortcuts
      this.setupKeyboardShortcuts();
      
      console.log('✅ Analytics Dashboard inicializado correctamente');
      this.showSuccessToast('Analytics avanzado cargado exitosamente');
      
    } catch (error) {
      console.error('❌ Error inicializando analytics:', error);
      this.showErrorToast('Error cargando analytics avanzado');
    }
  }

  async loadAnalyticsData() {
    try {
      console.log('📊 Cargando datos de analytics...');
      
      // Check localStorage first
      const cachedData = localStorage.getItem('analyticsData');
      const cacheTimestamp = localStorage.getItem('analyticsDataTimestamp');
      const now = Date.now();
      
      // Use cache if less than 5 minutes old
      if (cachedData && cacheTimestamp && (now - parseInt(cacheTimestamp)) < 300000) {
        this.analyticsData = JSON.parse(cachedData);
        console.log('📦 Usando datos en caché');
        return;
      }

      // Fetch fresh data
      const [statsResponse, claimsResponse, policiesResponse] = await Promise.all([
        fetch(`${this.apiBaseUrl}/stats`),
        fetch(`${this.apiBaseUrl}/claims?per_page=1000`),
        fetch(`${this.apiBaseUrl}/policies?per_page=1000`)
      ]);

      if (!statsResponse.ok || !claimsResponse.ok || !policiesResponse.ok) {
        throw new Error('API request failed');
      }

      const stats = await statsResponse.json();
      const claims = await claimsResponse.json();
      const policies = await policiesResponse.json();

      // Process and enhance data
      this.analyticsData = {
        stats,
        claims: claims.data || [],
        policies: policies.data || [],
        processedAt: now,
        riskMetrics: this.calculateRiskMetrics(claims.data, policies.data),
        trends: this.calculateTrends(claims.data),
        predictions: this.generatePredictions(claims.data)
      };

      // Cache the data
      localStorage.setItem('analyticsData', JSON.stringify(this.analyticsData));
      localStorage.setItem('analyticsDataTimestamp', now.toString());
      
      console.log('✅ Datos de analytics cargados y procesados');
      
    } catch (error) {
      console.error('❌ Error cargando datos:', error);
      
      // Fallback to demo data
      this.analyticsData = this.generateDemoData();
      this.showWarningToast('Usando datos de demostración');
    }
  }

  calculateRiskMetrics(claims, policies) {
    if (!claims || !policies || claims.length === 0) {
      return this.getDefaultRiskMetrics();
    }

    const totalClaims = claims.length;
    const totalPolicies = policies.length;
    const fraudClaims = claims.filter(c => c.fraud_reported).length;
    const totalClaimAmount = claims.reduce((sum, c) => sum + (c.total_claim_amount || 0), 0);
    const totalPremium = policies.reduce((sum, p) => sum + (p.annual_premium || 0), 0);

    return {
      riskIndex: Math.round((totalClaims / totalPolicies) * 100),
      lossRatio: totalPremium > 0 ? Math.round((totalClaimAmount / totalPremium) * 100) / 100 : 0,
      fraudRate: totalClaims > 0 ? Math.round((fraudClaims / totalClaims) * 100) : 0,
      portfolioScore: Math.max(0, 100 - Math.round((totalClaimAmount / totalPremium) * 50)),
      claimFrequency: totalPolicies > 0 ? Math.round((totalClaims / totalPolicies) * 1000) / 10 : 0
    };
  }

  calculateTrends(claims) {
    if (!claims || claims.length === 0) {
      return this.getDefaultTrends();
    }

    // Simulate trend calculations
    const last30Days = claims.slice(-30);
    const previous30Days = claims.slice(-60, -30);
    
    const currentAvg = last30Days.reduce((sum, c) => sum + (c.total_claim_amount || 0), 0) / Math.max(last30Days.length, 1);
    const previousAvg = previous30Days.reduce((sum, c) => sum + (c.total_claim_amount || 0), 0) / Math.max(previous30Days.length, 1);
    
    const trendChange = previousAvg > 0 ? ((currentAvg - previousAvg) / previousAvg) * 100 : 0;

    return {
      riskTrend: Math.random() > 0.5 ? 2.3 : -1.8,
      lossRatioTrend: Math.random() > 0.5 ? -1.8 : 3.2,
      fraudTrend: Math.random() > 0.3 ? 5.2 : -2.1,
      portfolioTrend: Math.random() > 0.4 ? 7.1 : -3.4,
      claimsTrend: trendChange
    };
  }

  generatePredictions(claims) {
    if (!claims || claims.length === 0) {
      return this.getDefaultPredictions();
    }

    // Simulate ML predictions
    return {
      nextMonthClaims: Math.round(claims.length * (1 + Math.random() * 0.2 - 0.1)),
      fraudProbability: Math.round(Math.random() * 15 + 5),
      riskForecast: ['Alto', 'Medio', 'Bajo'][Math.floor(Math.random() * 3)],
      seasonalityFactor: Math.round((Math.sin(Date.now() / (1000 * 60 * 60 * 24 * 30)) + 1) * 50)
    };
  }

  initAdvancedKPIs() {
    const { riskMetrics, trends } = this.analyticsData;
    
    // Update KPI values with animations
    this.animateValue('riskIndex', riskMetrics.riskIndex, '%');
    this.animateValue('lossRatio', riskMetrics.lossRatio, '');
    this.animateValue('fraudPrediction', riskMetrics.fraudRate, '%');
    this.animateValue('portfolioScore', riskMetrics.portfolioScore, '');

    // Update trends
    this.updateTrend('riskTrend', trends.riskTrend);
    this.updateTrend('lossRatioTrend', trends.lossRatioTrend);
    this.updateTrend('fraudTrend', trends.fraudTrend);
    this.updateTrend('portfolioTrend', trends.portfolioTrend);
  }

  animateValue(elementId, targetValue, suffix = '') {
    const element = document.getElementById(elementId);
    if (!element) return;

    let currentValue = 0;
    const increment = targetValue / 60; // 60 frames animation
    const timer = setInterval(() => {
      currentValue += increment;
      if (currentValue >= targetValue) {
        currentValue = targetValue;
        clearInterval(timer);
      }
      element.textContent = Math.round(currentValue) + suffix;
    }, 16); // ~60fps
  }

  updateTrend(elementId, value) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const isPositive = value > 0;
    const arrow = isPositive ? '↗' : '↘';
    const colorClass = isPositive ? 'text-success' : 'text-danger';
    
    element.className = `small ${colorClass}`;
    element.textContent = `${arrow} ${Math.abs(value).toFixed(1)}%`;
  }

  initRiskHeatmap() {
    const ctx = document.getElementById('riskHeatmap');
    if (!ctx) return;

    // Generate heatmap data
    const ages = ['18-25', '26-35', '36-45', '46-55', '56-65', '65+'];
    const occupations = ['Estudiante', 'Profesional', 'Ejecutivo', 'Operario', 'Retirado'];
    const data = [];

    ages.forEach((age, i) => {
      occupations.forEach((occupation, j) => {
        const riskValue = Math.random() * 100;
        data.push({
          x: i,
          y: j,
          v: riskValue,
          age,
          occupation,
          risk: riskValue
        });
      });
    });

    this.charts.heatmap = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'Nivel de Riesgo',
          data: data,
          backgroundColor: (context) => {
            const value = context.parsed.v;
            const alpha = value / 100;
            if (value < 33) return `rgba(25, 135, 84, ${alpha})`;
            if (value < 66) return `rgba(255, 193, 7, ${alpha})`;
            return `rgba(220, 53, 69, ${alpha})`;
          },
          borderColor: 'rgba(255, 255, 255, 0.8)',
          borderWidth: 1,
          pointRadius: 15,
          pointHoverRadius: 18
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'linear',
            position: 'bottom',
            min: -0.5,
            max: 5.5,
            ticks: {
              stepSize: 1,
              callback: (value) => ages[value] || ''
            },
            title: {
              display: true,
              text: 'Rango de Edad'
            }
          },
          y: {
            min: -0.5,
            max: 4.5,
            ticks: {
              stepSize: 1,
              callback: (value) => occupations[value] || ''
            },
            title: {
              display: true,
              text: 'Ocupación'
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              title: () => 'Análisis de Riesgo',
              label: (context) => {
                const point = context.raw;
                return [
                  `Edad: ${point.age}`,
                  `Ocupación: ${point.occupation}`,
                  `Nivel de Riesgo: ${point.risk.toFixed(1)}%`
                ];
              }
            }
          },
          legend: {
            display: false
          }
        },
        animation: {
          duration: 2000,
          easing: 'easeInOutQuart'
        }
      }
    });
  }

  initSeverityDistribution() {
    const ctx = document.getElementById('severityDistribution');
    if (!ctx) return;

    const data = {
      labels: ['Bajo', 'Medio', 'Alto'],
      datasets: [{
        data: [32, 45, 23],
        backgroundColor: [
          'rgba(25, 135, 84, 0.8)',
          'rgba(255, 193, 7, 0.8)',
          'rgba(220, 53, 69, 0.8)'
        ],
        borderColor: [
          'rgb(25, 135, 84)',
          'rgb(255, 193, 7)',
          'rgb(220, 53, 69)'
        ],
        borderWidth: 2,
        hoverOffset: 10
      }]
    };

    this.charts.severity = new Chart(ctx, {
      type: 'doughnut',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label;
                const value = context.parsed;
                return `${label}: ${value}% de riesgo`;
              }
            }
          }
        },
        animation: {
          animateRotate: true,
          animateScale: true,
          duration: 2000
        }
      }
    });
  }

  initClaimsTrend() {
    const ctx = document.getElementById('claimsTrend');
    if (!ctx) return;

    // Generate trend data for last 30 days
    const labels = [];
    const claimsData = [];
    const amountData = [];
    const now = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }));
      
      // Simulate realistic data with trends and seasonality
      const baseValue = 15 + Math.sin(i / 7) * 5; // Weekly pattern
      const randomness = (Math.random() - 0.5) * 8;
      claimsData.push(Math.max(0, Math.round(baseValue + randomness)));
      
      const baseAmount = 45000 + Math.sin(i / 10) * 15000;
      const amountRandomness = (Math.random() - 0.5) * 20000;
      amountData.push(Math.max(0, Math.round(baseAmount + amountRandomness)));
    }

    this.charts.trend = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Número de Reclamos',
          data: claimsData,
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.1)',
          fill: true,
          tension: 0.4,
          yAxisID: 'y'
        }, {
          label: 'Monto Total ($)',
          data: amountData,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.1)',
          fill: true,
          tension: 0.4,
          yAxisID: 'y1'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Fecha'
            }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Número de Reclamos'
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Monto ($)'
            },
            grid: {
              drawOnChartArea: false,
            },
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              afterLabel: (context) => {
                if (context.datasetIndex === 1) {
                  return `Promedio: $${(context.parsed.y / claimsData[context.dataIndex]).toLocaleString()}`;
                }
                return '';
              }
            }
          }
        },
        animation: {
          duration: 2000,
          easing: 'easeInOutQuart'
        }
      }
    });
  }

  initFraudAnalysis() {
    const ctx = document.getElementById('fraudAnalysis');
    if (!ctx) return;

    const data = {
      labels: ['Legítimos', 'Sospechosos', 'Confirmados'],
      datasets: [{
        label: 'Casos de Fraude',
        data: [78, 15, 7],
        backgroundColor: [
          'rgba(25, 135, 84, 0.8)',
          'rgba(255, 193, 7, 0.8)',
          'rgba(220, 53, 69, 0.8)'
        ],
        borderColor: [
          'rgb(25, 135, 84)',
          'rgb(255, 193, 7)',
          'rgb(220, 53, 69)'
        ],
        borderWidth: 2
      }]
    };

    this.charts.fraud = new Chart(ctx, {
      type: 'bar',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Porcentaje (%)'
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                return `${context.label}: ${context.parsed.y}% de casos`;
              }
            }
          }
        },
        animation: {
          duration: 2000,
          easing: 'easeInOutBounce'
        }
      }
    });
  }

  initGeographicRisk() {
    const ctx = document.getElementById('geographicRisk');
    if (!ctx) return;

    // Simulate geographic data
    const states = ['CDMX', 'JAL', 'NL', 'BC', 'CHIH', 'SON', 'COAH', 'TAM'];
    const riskLevels = states.map(() => Math.random() * 100);
    const colors = riskLevels.map(level => {
      if (level < 33) return 'rgba(25, 135, 84, 0.8)';
      if (level < 66) return 'rgba(255, 193, 7, 0.8)';
      return 'rgba(220, 53, 69, 0.8)';
    });

    this.charts.geographic = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: states,
        datasets: [{
          label: 'Nivel de Riesgo por Estado',
          data: riskLevels,
          backgroundColor: colors,
          borderColor: colors.map(color => color.replace('0.8', '1')),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        scales: {
          x: {
            beginAtZero: true,
            max: 100,
            title: {
              display: true,
              text: 'Índice de Riesgo'
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.parsed.x;
                let riskLevel = 'Bajo';
                if (value >= 66) riskLevel = 'Alto';
                else if (value >= 33) riskLevel = 'Medio';
                return [
                  `Índice: ${value.toFixed(1)}`,
                  `Riesgo: ${riskLevel}`
                ];
              }
            }
          }
        },
        animation: {
          duration: 2000,
          easing: 'easeInOutQuart'
        }
      }
    });
  }

  initCorrelationMatrix() {
    const ctx = document.getElementById('correlationMatrix');
    if (!ctx) return;

    const variables = ['Edad', 'Experiencia', 'Tipo Vehículo', 'Ubicación', 'Historial'];
    const correlationData = [];

    // Generate correlation matrix data
    variables.forEach((varX, i) => {
      variables.forEach((varY, j) => {
        const correlation = i === j ? 1 : (Math.random() - 0.5) * 2;
        correlationData.push({
          x: i,
          y: j,
          v: correlation,
          varX,
          varY,
          correlation
        });
      });
    });

    this.charts.correlation = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'Correlación',
          data: correlationData,
          backgroundColor: (context) => {
            const value = context.parsed.v;
            const alpha = Math.abs(value);
            if (value > 0) return `rgba(25, 135, 84, ${alpha})`;
            return `rgba(220, 53, 69, ${alpha})`;
          },
          borderColor: 'rgba(255, 255, 255, 0.8)',
          borderWidth: 1,
          pointRadius: 20,
          pointHoverRadius: 25
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'linear',
            min: -0.5,
            max: 4.5,
            ticks: {
              stepSize: 1,
              callback: (value) => variables[value] || ''
            }
          },
          y: {
            min: -0.5,
            max: 4.5,
            ticks: {
              stepSize: 1,
              callback: (value) => variables[value] || ''
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              title: () => 'Correlación de Variables',
              label: (context) => {
                const point = context.raw;
                const corrValue = point.correlation.toFixed(3);
                const strength = Math.abs(point.correlation) > 0.7 ? 'Fuerte' : 
                               Math.abs(point.correlation) > 0.3 ? 'Moderada' : 'Débil';
                return [
                  `${point.varX} vs ${point.varY}`,
                  `Correlación: ${corrValue}`,
                  `Fuerza: ${strength}`
                ];
              }
            }
          },
          legend: {
            display: false
          }
        },
        animation: {
          duration: 2000,
          easing: 'easeInOutQuart'
        }
      }
    });
  }

  setupEventListeners() {
    // Refresh button
    const refreshBtn = document.getElementById('refreshAnalytics');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.refreshAnalytics());
    }

    // Export button
    const exportBtn = document.getElementById('exportReport');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportReport());
    }

    // Time range selector
    const timeRangeSelect = document.getElementById('timeRangeSelect');
    if (timeRangeSelect) {
      timeRangeSelect.addEventListener('change', (e) => this.updateTimeRange(e.target.value));
    }

    // Heatmap view toggle
    const heatmapRadios = document.querySelectorAll('input[name="heatmapView"]');
    heatmapRadios.forEach(radio => {
      radio.addEventListener('change', (e) => this.updateHeatmapView(e.target.id));
    });

    // Map controls
    const mapReset = document.getElementById('mapReset');
    if (mapReset) {
      mapReset.addEventListener('click', () => this.resetGeographicMap());
    }

    const mapFullscreen = document.getElementById('mapFullscreen');
    if (mapFullscreen) {
      mapFullscreen.addEventListener('click', () => this.toggleMapFullscreen());
    }
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + R: Refresh analytics
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        this.refreshAnalytics();
      }
      
      // Ctrl/Cmd + E: Export report
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        this.exportReport();
      }
      
      // Ctrl/Cmd + F: Toggle fullscreen
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        this.toggleMapFullscreen();
      }
    });
  }

  setupAutoRefresh() {
    // Auto-refresh every 5 minutes
    this.refreshInterval = setInterval(() => {
      this.refreshAnalytics(true);
    }, 300000);
  }

  async refreshAnalytics(silent = false) {
    if (!silent) {
      this.showInfoToast('Actualizando analytics...');
    }

    try {
      // Clear cache
      localStorage.removeItem('analyticsData');
      localStorage.removeItem('analyticsDataTimestamp');
      
      // Reload data
      await this.loadAnalyticsData();
      
      // Update all components
      this.initAdvancedKPIs();
      this.updateAllCharts();
      
      if (!silent) {
        this.showSuccessToast('Analytics actualizado correctamente');
      }
      
    } catch (error) {
      console.error('Error refreshing analytics:', error);
      this.showErrorToast('Error actualizando analytics');
    }
  }

  updateAllCharts() {
    Object.keys(this.charts).forEach(chartKey => {
      if (this.charts[chartKey]) {
        this.charts[chartKey].update('active');
      }
    });
  }

  exportReport() {
    this.showInfoToast('Generando reporte...');
    
    // Simulate report generation
    setTimeout(() => {
      const reportData = {
        timestamp: new Date().toISOString(),
        analytics: this.analyticsData,
        charts: Object.keys(this.charts),
        generatedBy: 'David Fernando Ávila Díaz - CU: 197851'
      };
      
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      this.showSuccessToast('Reporte exportado exitosamente');
    }, 1500);
  }

  updateTimeRange(range) {
    this.showInfoToast(`Actualizando rango: ${range}`);
    // Here you would update the trend chart with new data
    if (this.charts.trend) {
      this.charts.trend.update('active');
    }
  }

  updateHeatmapView(viewType) {
    const isRiskView = viewType === 'riskView';
    this.showInfoToast(isRiskView ? 'Vista: Análisis de Riesgo' : 'Vista: Distribución de Reclamos');
    
    if (this.charts.heatmap) {
      // Update heatmap data based on view type
      this.charts.heatmap.update('active');
    }
  }

  resetGeographicMap() {
    if (this.charts.geographic) {
      this.charts.geographic.resetZoom();
      this.showInfoToast('Mapa restablecido');
    }
  }

  toggleMapFullscreen() {
    const mapCard = document.querySelector('#geographicRisk').closest('.card');
    if (mapCard) {
      mapCard.classList.toggle('fullscreen-map');
      this.showInfoToast('Modo pantalla completa activado');
    }
  }

  initThemeSystem() {
    const themeBtn = document.getElementById('themeBtn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-bs-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        html.setAttribute('data-bs-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Update all charts for new theme
        setTimeout(() => this.updateAllCharts(), 100);
        
        this.showInfoToast(`Tema ${newTheme === 'dark' ? 'oscuro' : 'claro'} activado`);
      });
    }

    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-bs-theme', savedTheme);
    }
  }

  // Toast notification system
  showSuccessToast(message) {
    this.showToast(message, 'success');
  }

  showErrorToast(message) {
    this.showToast(message, 'danger');
  }

  showWarningToast(message) {
    this.showToast(message, 'warning');
  }

  showInfoToast(message) {
    this.showToast(message, 'info');
  }

  showToast(message, type = 'info') {
    const toastArea = document.getElementById('toastArea');
    if (!toastArea) return;

    const toastId = 'toast-' + Date.now();
    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = `toast`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
      <div class="toast-header">
        <div class="rounded me-2 bg-${type}" style="width: 20px; height: 20px;"></div>
        <strong class="me-auto">Analytics</strong>
        <small>ahora</small>
        <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
      </div>
      <div class="toast-body">${message}</div>
    `;

    toastArea.appendChild(toast);
    
    // Initialize and show toast
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();

    // Remove from DOM after hiding
    toast.addEventListener('hidden.bs.toast', () => {
      toast.remove();
    });
  }

  // Demo data generators
  generateDemoData() {
    return {
      stats: {
        total_claims: 1250,
        total_policies: 3400,
        fraud_claims: 89,
        total_claims_amount: 12500000
      },
      claims: Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        total_claim_amount: Math.floor(Math.random() * 100000) + 10000,
        fraud_reported: Math.random() < 0.1
      })),
      policies: Array.from({ length: 200 }, (_, i) => ({
        id: i + 1,
        annual_premium: Math.floor(Math.random() * 50000) + 5000
      })),
      processedAt: Date.now(),
      riskMetrics: this.getDefaultRiskMetrics(),
      trends: this.getDefaultTrends(),
      predictions: this.getDefaultPredictions()
    };
  }

  getDefaultRiskMetrics() {
    return {
      riskIndex: 67,
      lossRatio: 0.73,
      fraudRate: 12,
      portfolioScore: 84,
      claimFrequency: 18.5
    };
  }

  getDefaultTrends() {
    return {
      riskTrend: 2.3,
      lossRatioTrend: -1.8,
      fraudTrend: 5.2,
      portfolioTrend: 7.1,
      claimsTrend: 3.4
    };
  }

  getDefaultPredictions() {
    return {
      nextMonthClaims: 95,
      fraudProbability: 8,
      riskForecast: 'Medio',
      seasonalityFactor: 73
    };
  }

  // Cleanup method
  destroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    
    Object.keys(this.charts).forEach(chartKey => {
      if (this.charts[chartKey]) {
        this.charts[chartKey].destroy();
      }
    });
  }
}

// Initialize when DOM is ready
const analytics = new AdvancedAnalytics();