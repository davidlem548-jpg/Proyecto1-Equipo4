// Main inicializador de la app 

import { initTheme, setupThemeToggle } from './theme.js';
import { saveToSession, getFromSession } from './storage.js';
import * as api from './api.js';
import * as charts from './charts.js';
import * as maps from './maps.js';
import * as tables from './tables.js';

// Estado actual de la paginación
let currentPage = {
    claims: 1,
    incidents: 1
};

// Cache para data
let cachedData = {
    claims: null,
    incidents: null,
    stats: null
};

// Inicializar dashboard
async function initDashboard() {
    console.log('Initializing Insurance Dashboard...');
    
    // Inicializar tema
    initTheme();
    setupThemeToggle();
    
    // Inicializar mapa
    const mapResult = maps.initMap();
    console.log('Map initialization result:', mapResult);
    
    // Cargar datos iniciales
    await loadKPIs();
    await loadCharts();
    await loadTables();
    
    // Configurar listeners de eventos
    setupEventListeners();
    
    console.log('Dashboard initialized');
}

// Cargar KPI's (Key Performance Indicators)
async function loadKPIs() {
    const stats = await api.fetchStats();
    if (!stats) return;
    
    cachedData.stats = stats;
    
    // Actualizar KPI's
    document.getElementById('kpiCases').textContent = (stats.total_cases || 0).toLocaleString();
    document.getElementById('kpiClaims').textContent = (stats.total_claims || 0).toLocaleString();
    
    // Calcular tasa de fraude
    const fraudRate = stats.total_claims > 0 
        ? ((stats.fraud_claims / stats.total_claims) * 100).toFixed(1) 
        : '0';
    document.getElementById('kpiFraudRate').textContent = fraudRate + '%';
    
    // Formatear importe
    const amount = (stats.total_claims_amount || 0);
    document.getElementById('kpiAmount').textContent = '$' + amount.toLocaleString();
}

// Cargar todas las gráficas
async function loadCharts() {
    // Fetch data en paralelo
    const [claimsData, incidentsData, mapData] = await Promise.all([
        api.fetchClaims(1, 100),  // Obtener más datos para las gráficas
        api.fetchIncidents(1, 100),
        api.fetchMapData()
    ]);
    
    if (claimsData) {
        cachedData.claims = claimsData;
        charts.createFraudHistogram(claimsData);
        charts.createClaimsStackedChart(claimsData);
    }
    
    if (incidentsData) {
        cachedData.incidents = incidentsData;
        charts.createSeverityChart(incidentsData);
    }
    
    // Cargar series de tiempo de fraude
    const timeSeriesData = await api.fetchTimeSeries();
    if (timeSeriesData) {
        charts.createFraudTrendsChart(timeSeriesData);
    }
    
    // Cargar marcadores del mapa
    if (mapData) {
        maps.addIncidentMarkers(mapData);
    }
}

// Cargar tablas con paginación
async function loadTables() {
    await loadClaimsTable(currentPage.claims);
    await loadIncidentsTable(currentPage.incidents);
}

// Cargar tabla de reclamos con paginación
async function loadClaimsTable(page) {
    const data = await api.fetchClaims(page, 10);
    if (data) {
        cachedData.claims = data;
        tables.renderClaimsTable(data);
        if (data.page) {
            tables.renderPagination('claimsPagination', data.page.page, 
                Math.ceil(data.page.total / data.page.per_page),
                (newPage) => {
                    currentPage.claims = newPage;
                    saveToSession('currentPage', currentPage);
                    loadClaimsTable(newPage);
                });
        }
    }
}

// Cargar tabla de incidentes con paginación
async function loadIncidentsTable(page) {
    const data = await api.fetchIncidents(page, 10);
    if (data) {
        cachedData.incidents = data;
        tables.renderIncidentsTable(data);
        if (data.page) {
            tables.renderPagination('incidentsPagination', data.page.page,
                Math.ceil(data.page.total / data.page.per_page),
                (newPage) => {
                    currentPage.incidents = newPage;
                    saveToSession('currentPage', currentPage);
                    loadIncidentsTable(newPage);
                });
        }
    }
}

// Cargar detalles de caso en modal 
async function loadCaseDetails(caseId) {
    const modal = new bootstrap.Modal(document.getElementById('caseDetailModal'));
    const content = document.getElementById('caseDetailContent');
    
    content.innerHTML = '<div class="spinner-border" role="status"><span class="visually-hidden">Cargando...</span></div>';
    modal.show();
    
    const data = await api.fetchCaseDetails(caseId);
    if (!data) {
        content.innerHTML = '<div class="alert alert-danger">Error al cargar detalles de caso</div>';
        return;
    }
    
    // Mostrar detalles de caso
    content.innerHTML = `
        <div class="row">
            <div class="col-md-6 mb-3">
                <h6 class="text-primary">Información de asegurado</h6>
                ${data.insured ? `
                    <p><strong>Edad:</strong> ${data.insured.age || '-'}</p>
                    <p><strong>Sexo:</strong> ${data.insured.sex || '-'}</p>
                    <p><strong>Educación:</strong> ${data.insured.education_level || '-'}</p>
                    <p><strong>Ocupación:</strong> ${data.insured.occupation || '-'}</p>
                ` : '<p class="text-muted">No hay datos de asegurado</p>'}
            </div>
            <div class="col-md-6 mb-3">
                <h6 class="text-success">Información de poliza</h6>
                ${data.policy ? `
                    <p><strong>Número de poliza:</strong> ${data.policy.policy_number || '-'}</p>
                    <p><strong>Estado:</strong> ${data.policy.policy_state || '-'}</p>
                    <p><strong>Prima:</strong> $${(data.policy.annual_premium || 0).toLocaleString()}</p>
                    <p><strong>Deducible:</strong> $${(data.policy.deductible || 0).toLocaleString()}</p>
                ` : '<p class="text-muted">No hay datos de poliza</p>'}
            </div>
            <div class="col-md-6 mb-3">
                <h6 class="text-info">Información de vehículo</h6>
                ${data.vehicle ? `
                    <p><strong>Marca:</strong> ${data.vehicle.make || '-'}</p>
                    <p><strong>Modelo:</strong> ${data.vehicle.model || '-'}</p>
                    <p><strong>Año:</strong> ${data.vehicle.year || '-'}</p>
                ` : '<p class="text-muted">No hay datos de vehículo</p>'}
            </div>
            <div class="col-md-6 mb-3">
                <h6 class="text-warning">Información de incidente</h6>
                ${data.incident ? `
                    <p><strong>Tipo:</strong> ${data.incident.incident_type || '-'}</p>
                    <p><strong>Severidad:</strong> ${data.incident.incident_severity || '-'}</p>
                    <p><strong>Fecha:</strong> ${data.incident.date || '-'}</p>
                    <p><strong>Ubicación:</strong> ${data.incident.incident_city || '-'}, ${data.incident.incident_state || '-'}</p>
                ` : '<p class="text-muted">No hay datos de incidente</p>'}
            </div>
            <div class="col-12 mb-3">
                <h6 class="text-danger">Información de reclamo</h6>
                ${data.claim ? `
                    <div class="row">
                        <div class="col-md-3">
                            <p><strong>Total de importe:</strong><br>$${(data.claim.total_claim_amount || 0).toLocaleString()}</p>
                        </div>
                        <div class="col-md-3">
                            <p><strong>Incurrido:</strong><br>$${(data.claim.injury_claim || 0).toLocaleString()}</p>
                        </div>
                        <div class="col-md-3">
                            <p><strong>Propiedad:</strong><br>$${(data.claim.property_claim || 0).toLocaleString()}</p>
                        </div>
                        <div class="col-md-3">
                            <p><strong>Vehículo:</strong><br>$${(data.claim.vehicle_claim || 0).toLocaleString()}</p>
                        </div>
                        <div class="col-12">
                            <span class="badge ${data.claim.fraud_reported ? 'bg-danger' : 'bg-success'}">
                                ${data.claim.fraud_reported ? 'FRAUDE DETECTADA' : 'Reclamo legítimo'}
                            </span>
                        </div>
                    </div>
                ` : '<p class="text-muted">No hay datos de reclamo</p>'}
            </div>
        </div>
    `;
}

// Configurar listeners de eventos
function setupEventListeners() {
    // Enlaces de navegación
    document.querySelectorAll('[data-section]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            showSection(section);
            
            // Actualizar enlace de navegación activo
            document.querySelectorAll('[data-section]').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
    
    
    // Auto-actualización de KPI's cada 30 segundos
    setInterval(() => loadKPIs(), 30000);
    
    // Filtros de búsqueda
    tables.setupSearchFilter('claimsSearch', 'claimsTable');
    tables.setupSearchFilter('incidentsSearch', 'incidentsTable');
    
    // Filtro de fraude en el mapa
    const fraudToggle = document.getElementById('fraudFilterToggle');
    if (fraudToggle) {
        fraudToggle.addEventListener('change', (e) => {
            maps.filterMarkersByFraud(e.target.checked);
        });
    }
    
    // Sobrescribir funciones globales de tables.js
    window.viewCaseDetails = loadCaseDetails;
    window.viewClaimDetails = loadCaseDetails; // Usa la misma función
    window.viewIncidentDetails = loadCaseDetails; // Usa la misma función
}

// Mostrar sección específica
function showSection(sectionName) {
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.add('d-none');
    });
    
    const sectionMap = {
        'overview': 'overviewSection',
        'tables': 'tablesSection',
        'map': 'mapSection'
    };
    
    const sectionId = sectionMap[sectionName];
    if (sectionId) {
        document.getElementById(sectionId).classList.remove('d-none');
        
        // Corregir renderizado del mapa cuando la sección de mapa se vuelve visible
        if (sectionName === 'map') {
            const mapInstance = maps.getMapInstance();
            if (!mapInstance) {
                // El mapa no fue inicializado, inicializarlo ahora
                maps.initMap();
            } else {
                setTimeout(() => {
                    mapInstance.invalidateSize();
                }, 100);
            }
        }
    }
}

// Cargar estado de paginación desde la sesión
function loadPaginationState() {
    const saved = getFromSession('currentPage');
    if (saved) {
        currentPage = saved;
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
    loadPaginationState();
    await initDashboard();
});

