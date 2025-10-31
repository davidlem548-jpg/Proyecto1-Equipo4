import { getStats, getPolicies, getClaims, showToast, formatCurrency } from './api.js';

// Theme toggle con persistencia en localStorage
const themeBtn = document.getElementById('themeBtn');
const html = document.documentElement;

// onClick event para cambiar tema
themeBtn?.addEventListener('click', () => {
  const currentTheme = html.getAttribute('data-bs-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  html.setAttribute('data-bs-theme', newTheme);
  // Guardar en localStorage
  localStorage.setItem('insurance_theme', newTheme);
  showToast(`Tema cambiado a ${newTheme === 'light' ? 'claro' : 'oscuro'}`, 'info');
});

// onLoad: Cargar tema guardado desde localStorage
const savedTheme = localStorage.getItem('insurance_theme') || 'light';
html.setAttribute('data-bs-theme', savedTheme);

// Dashboard initialization con localStorage cache
async function initDashboard() {
  try {
    // Intentar cargar desde localStorage primero (cache)
    const cachedStats = localStorage.getItem('insurance_stats_cache');
    const cacheTime = localStorage.getItem('insurance_stats_cache_time');
    const now = Date.now();
    
    // Si hay cache y es reciente (menos de 5 minutos), usar cache
    if (cachedStats && cacheTime && (now - parseInt(cacheTime)) < 300000) {
      const stats = JSON.parse(cachedStats);
      updateDashboardCards(stats);
      console.log('Datos cargados desde localStorage');
    }
    
    // Cargar datos frescos de la API
    const stats = await getStats();
    
    // Guardar en localStorage
    localStorage.setItem('insurance_stats_cache', JSON.stringify(stats));
    localStorage.setItem('insurance_stats_cache_time', now.toString());
    
    // Actualizar tarjetas
    updateDashboardCards(stats);
    
    // Cargar gráficas
    await loadCharts();
    
    showToast('Dashboard cargado exitosamente', 'success');
  } catch (error) {
    console.error('Error loading dashboard:', error);
    showToast('Error al cargar dashboard: ' + error.message, 'error');
    
    // Si falla, intentar usar datos en cache
    const cachedStats = localStorage.getItem('insurance_stats_cache');
    if (cachedStats) {
      const stats = JSON.parse(cachedStats);
      updateDashboardCards(stats);
      showToast('Mostrando datos en cache', 'warning');
    }
  }
}

function updateDashboardCards(stats) {
  document.getElementById('cardTotalPolicies').textContent = stats.total_policies || 0;
  document.getElementById('cardTotalClaims').textContent = stats.total_claims || 0;
  document.getElementById('cardActiveClaims').textContent = stats.fraud_claims || 0;
  document.getElementById('cardTotalPremium').textContent = formatCurrency(stats.total_claims_amount);
}

async function loadCharts() {
  try {
    // Intentar cargar desde localStorage
    const cachedCharts = localStorage.getItem('insurance_charts_data');
    let claims = [];
    let policies = [];
    
    if (cachedCharts) {
      const data = JSON.parse(cachedCharts);
      claims = data.claims || [];
      policies = data.policies || [];
    }
    
    // Cargar datos frescos
    const claimsResponse = await getClaims(1, 100);
    const policiesResponse = await getPolicies(1, 100);
    
    claims = claimsResponse.data || [];
    policies = policiesResponse.data || [];
    
    // Guardar en localStorage
    localStorage.setItem('insurance_charts_data', JSON.stringify({ claims, policies }));

    // Claims by fraud status (gráfica de pastel)
    const fraudCount = claims.filter(c => c.fraud_reported).length;
    const legitimateCount = claims.length - fraudCount;

    const claimsByStatusCtx = document.getElementById('claimsByStatus');
    if (claimsByStatusCtx && window.Chart) {
      new Chart(claimsByStatusCtx, {
        type: 'doughnut',
        data: {
          labels: ['Legítimos', 'Fraude Reportado'],
          datasets: [{
            data: [legitimateCount, fraudCount],
            backgroundColor: ['#28a745', '#dc3545'],
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              position: 'bottom',
            }
          }
        }
      });
    }

    // Group policies by state (gráfica de barras)
    const stateGroups = {};
    policies.forEach(policy => {
      const state = policy.policy_state || 'Unknown';
      if (!stateGroups[state]) {
        stateGroups[state] = { count: 0, premium: 0 };
      }
      stateGroups[state].count++;
      stateGroups[state].premium += policy.annual_premium || 0;
    });

    const states = Object.keys(stateGroups).slice(0, 5);
    const premiums = states.map(state => stateGroups[state].premium);

    const premiumByInsurerCtx = document.getElementById('premiumByInsurer');
    if (premiumByInsurerCtx && window.Chart) {
      new Chart(premiumByInsurerCtx, {
        type: 'bar',
        data: {
          labels: states,
          datasets: [{
            label: 'Prima Total',
            data: premiums,
            backgroundColor: '#007bff',
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              display: false,
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return '$' + value.toLocaleString();
                }
              }
            }
          }
        }
      });
    }
  } catch (error) {
    console.error('Error loading charts:', error);
    showToast('Error al cargar gráficas', 'error');
  }
}

// onLoad event: Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDashboard);
} else {
  initDashboard();
}

// Evento adicional: Recargar datos cada 30 segundos
setInterval(() => {
  console.log('🔄 Actualizando datos del dashboard...');
  initDashboard();
}, 30000);
