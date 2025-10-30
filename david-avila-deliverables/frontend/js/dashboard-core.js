// Core Dashboard Functionality - Insurance Management System
// Autor: David Fernando Ávila Díaz (CU: 197851)
// Sistema base para dashboard principal con gráficas

class DashboardCore {
  constructor() {
    this.apiBaseUrl = 'http://localhost:8000';
    this.charts = {};
    this.data = {};
    this.initialized = false;
    this.init();
  }

  async init() {
    if (this.initialized) return;
    this.initialized = true;

    try {
      await this.loadDashboardData();
      this.setupThemeSystem();
      this.updateKPIDisplay();
      this.initializeCharts();
      this.setupInteractions();
      console.log('Dashboard inicializado');
    } catch (error) {
      console.error('Error en inicialización:', error);
      this.loadDemoData();
      this.updateKPIDisplay();
      this.initializeCharts();
    }
  }

  async loadDashboardData() {
    try {
      const responses = await Promise.all([
        fetch(`${this.apiBaseUrl}/stats`).catch(() => null),
        fetch(`${this.apiBaseUrl}/claims?per_page=100`).catch(() => null),
        fetch(`${this.apiBaseUrl}/policies?per_page=100`).catch(() => null)
      ]);

      if (responses[0]?.ok) this.data.stats = await responses[0].json();
      if (responses[1]?.ok) this.data.claims = await responses[1].json();
      if (responses[2]?.ok) this.data.policies = await responses[2].json();

      if (!this.data.stats) this.loadDemoData();
    } catch (error) {
      console.warn('API no disponible, usando datos demo');
      this.loadDemoData();
    }
  }

  loadDemoData() {
    this.data = {
      stats: {
        total_policies: 1247,
        total_claims: 856,
        fraud_claims: 23,
        total_claims_amount: 2840000
      },
      claims: {
        data: Array.from({ length: 50 }, (_, i) => ({
          id: i + 1,
          total_claim_amount: Math.floor(Math.random() * 50000) + 5000,
          fraud_reported: Math.random() < 0.1,
          incident_severity: ['Minor', 'Major', 'Total Loss'][Math.floor(Math.random() * 3)]
        }))
      },
      policies: {
        data: Array.from({ length: 30 }, (_, i) => ({
          id: i + 1,
          annual_premium: Math.floor(Math.random() * 25000) + 8000,
          policy_state: ['Activa', 'Pendiente', 'Cancelada'][Math.floor(Math.random() * 3)]
        }))
      }
    };
  }

  updateKPIDisplay() {
    const stats = this.data.stats;
    this.updateMetric('cardTotalPolicies', stats.total_policies);
    this.updateMetric('cardTotalClaims', stats.total_claims);
    this.updateMetric('cardActiveClaims', stats.total_claims - (stats.fraud_claims || 0));
    this.updateMetric('cardTotalPremium', stats.total_claims_amount, '$');
  }

  updateMetric(elementId, value, prefix = '') {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = prefix + value.toLocaleString();
    }
  }

  initializeCharts() {
    if (!this.charts.statusChart) this.createStatusChart();
    if (!this.charts.premiumChart) this.createPremiumChart();
  }

  createStatusChart() {
    const ctx = document.getElementById('claimsByStatus');
    if (!ctx) return;

    ctx.style.width = '100%';
    ctx.style.height = '300px';

    if (this.charts.statusChart) {
      this.charts.statusChart.destroy();
    }

    const claims = this.data.claims.data || [];
    const statusData = {
      'Aprobado': Math.floor(claims.length * 0.45),
      'Pendiente': Math.floor(claims.length * 0.25),
      'Rechazado': Math.floor(claims.length * 0.15),
      'En Revisión': Math.floor(claims.length * 0.15)
    };

    this.charts.statusChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(statusData),
        datasets: [{
          data: Object.values(statusData),
          backgroundColor: ['#198754', '#ffc107', '#dc3545', '#6c757d'],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { padding: 15, usePointStyle: true }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((context.parsed / total) * 100).toFixed(1);
                return `${context.label}: ${context.parsed} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  createPremiumChart() {
    const ctx = document.getElementById('premiumByInsurer');
    if (!ctx) return;

    ctx.style.width = '100%';
    ctx.style.height = '300px';

    if (this.charts.premiumChart) {
      this.charts.premiumChart.destroy();
    }

    const insurers = ['BBVA Seguros', 'AXA México', 'GNP Seguros', 'Mapfre', 'Zurich'];
    const premiums = insurers.map(() => Math.floor(Math.random() * 500000) + 200000);

    this.charts.premiumChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: insurers,
        datasets: [{
          label: 'Primas Totales',
          data: premiums,
          backgroundColor: [
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 99, 132, 0.8)', 
            'rgba(255, 205, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)'
          ],
          borderColor: [
            'rgb(54, 162, 235)',
            'rgb(255, 99, 132)',
            'rgb(255, 205, 86)', 
            'rgb(75, 192, 192)',
            'rgb(153, 102, 255)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return '$' + value.toLocaleString();
              }
            }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => `Primas: $${context.parsed.y.toLocaleString()}`
            }
          }
        }
      }
    });
  }

  setupThemeSystem() {
    const themeBtn = document.getElementById('themeBtn');
    if (!themeBtn) return;

    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-bs-theme', savedTheme);

    themeBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-bs-theme');
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      
      document.documentElement.setAttribute('data-bs-theme', newTheme);
      localStorage.setItem('theme', newTheme);
    });
  }

  setupInteractions() {
    // Eventos para extensibilidad del equipo
    document.addEventListener('dashboardReady', () => {
      console.log('Dashboard listo para integraciones del equipo');
    });
    
    // Disparar evento personalizado
    const event = new CustomEvent('dashboardReady', { 
      detail: { dashboard: this, data: this.data } 
    });
    document.dispatchEvent(event);
  }

  refreshData() {
    return this.loadDashboardData().then(() => {
      this.updateKPIDisplay();
      Object.values(this.charts).forEach(chart => {
        if (chart && typeof chart.update === 'function') {
          chart.update();
        }
      });
    });
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

// Auto-inicialización
document.addEventListener('DOMContentLoaded', () => {
  if (window.dashboardCore) {
    window.dashboardCore.destroy();
  }
  window.dashboardCore = new DashboardCore();
});

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DashboardCore;
}