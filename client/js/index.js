// Dashboard Principal - Sistema de Seguros
// Desarrollado por: David Fernando Ávila Díaz (CU: 197851)
// Curso: COM-11117 Introducción al Desarrollo Web - ITAM

class DashboardManager {
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
      await this.loadData();
      this.setupTheme();
      this.updateKPIs();
      this.initCharts();
      this.setupEventListeners();
      console.log('Dashboard inicializado correctamente');
    } catch (error) {
      console.error('Error al inicializar dashboard:', error);
      this.loadFallbackData();
      this.updateKPIs();
      this.initCharts();
    }
  }

  async loadData() {
    try {
      const [statsRes, claimsRes, policiesRes] = await Promise.all([
        fetch(`${this.apiBaseUrl}/stats`).catch(() => null),
        fetch(`${this.apiBaseUrl}/claims?per_page=100`).catch(() => null),
        fetch(`${this.apiBaseUrl}/policies?per_page=100`).catch(() => null)
      ]);

      if (statsRes?.ok) this.data.stats = await statsRes.json();
      if (claimsRes?.ok) this.data.claims = await claimsRes.json();
      if (policiesRes?.ok) this.data.policies = await policiesRes.json();

      if (!this.data.stats) this.loadFallbackData();
    } catch (error) {
      console.warn('API no disponible, usando datos de demostración');
      this.loadFallbackData();
    }
  }

  loadFallbackData() {
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

  updateKPIs() {
    const stats = this.data.stats;
    this.updateKPI('cardTotalPolicies', stats.total_policies);
    this.updateKPI('cardTotalClaims', stats.total_claims);
    this.updateKPI('cardActiveClaims', stats.total_claims - (stats.fraud_claims || 0));
    this.updateKPI('cardTotalPremium', stats.total_claims_amount, '$');
  }

  updateKPI(elementId, value, prefix = '') {
    const element = document.getElementById(elementId);
    if (!element) return;
    element.textContent = prefix + value.toLocaleString();
  }

  initCharts() {
    if (!this.charts.claimsByStatus) this.initClaimsByStatusChart();
    if (!this.charts.premiumByInsurer) this.initPremiumByInsurerChart();
  }

  initClaimsByStatusChart() {
    const ctx = document.getElementById('claimsByStatus');
    if (!ctx) return;

    // Configuración de tamaño estable
    ctx.style.width = '100%';
    ctx.style.height = '300px';

    if (this.charts.claimsByStatus) {
      this.charts.claimsByStatus.destroy();
    }

    const claims = this.data.claims.data || [];
    const statusCounts = {
      'Aprobado': Math.floor(claims.length * 0.45),
      'Pendiente': Math.floor(claims.length * 0.25),
      'Rechazado': Math.floor(claims.length * 0.15),
      'En Revisión': Math.floor(claims.length * 0.15)
    };

    this.charts.claimsByStatus = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(statusCounts),
        datasets: [{
          data: Object.values(statusCounts),
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

  initPremiumByInsurerChart() {
    const ctx = document.getElementById('premiumByInsurer');
    if (!ctx) return;

    ctx.style.width = '100%';
    ctx.style.height = '300px';

    if (this.charts.premiumByInsurer) {
      this.charts.premiumByInsurer.destroy();
    }

    const insurers = ['BBVA Seguros', 'AXA México', 'GNP Seguros', 'Mapfre', 'Zurich'];
    const premiums = insurers.map(() => Math.floor(Math.random() * 500000) + 200000);

    this.charts.premiumByInsurer = new Chart(ctx, {
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

  setupTheme() {
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

  setupEventListeners() {
    // Configuración de eventos adicionales para extensibilidad
    console.log('Dashboard listo para extensiones del equipo');
  }

  destroy() {
    Object.values(this.charts).forEach(chart => {
      if (chart) chart.destroy();
    });
  }
}

// Inicialización automática
document.addEventListener('DOMContentLoaded', () => {
  if (window.dashboardManager) {
    window.dashboardManager.destroy();
  }
  window.dashboardManager = new DashboardManager();
});

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DashboardManager;
}