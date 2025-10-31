// Cliente API con async/await y manejo de errores

// Detectar ambiente
const isLocal = window.location.hostname === 'localhost' || 
                window.location.hostname === '127.0.0.1';

const API_BASE = isLocal 
    ? 'http://127.0.0.1:8000'
    : 'https://TU-PROYECTO.onrender.com';  // ⚠️ Cambiar esto

// Mostrar notificación de error toast
function showErrorToast(message) {
    const toastEl = document.getElementById('errorToast');
    const toastBody = toastEl.querySelector('.toast-body');
    
    if (toastBody) {
        toastBody.textContent = message;
        const toast = new bootstrap.Toast(toastEl);
        toast.show();
    }
}

// Actualizar estado de la API
function updateApiStatus(connected) {
    const statusEl = document.getElementById('apiStatus');
    if (statusEl) {
        statusEl.className = connected ? 'alert alert-success' : 'alert alert-danger';
        const icon = statusEl.querySelector('i');
        const span = statusEl.querySelector('span');
        
        if (connected) {
            icon.className = 'bi bi-circle-fill me-2';
            span.textContent = 'Conectado a la API';
        } else {
            icon.className = 'bi bi-x-circle-fill me-2';
            span.textContent = 'Error al conectar a la API';
        }
    }
}

// Función genérica de fetch con manejo de errores
async function apiFetch(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, options);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        updateApiStatus(true);
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        updateApiStatus(false);
        showErrorToast(`API Error: ${error.message}`);
        return null;
    }
}

// Fetch stats
export async function fetchStats() {
    return await apiFetch('/stats');
}

// Fetch reclamos con paginación y límite de 10
export async function fetchClaims(page = 1, perPage = 10) {
    return await apiFetch(`/claims?page=${page}&per_page=${perPage}`);
}

// Fetch casos con paginación y límite de 10
export async function fetchCases(page = 1, perPage = 10) {
    return await apiFetch(`/cases?page=${page}&per_page=${perPage}`);
}

// Fetch detalles de caso por ID (con datos anidados)
export async function fetchCaseDetails(id) {
    return await apiFetch(`/cases/${id}`);
}

// Fetch incidentes con paginación y límite de 10
export async function fetchIncidents(page = 1, perPage = 10) {
    return await apiFetch(`/incidents?page=${page}&per_page=${perPage}`);
}

// Fetch datos de mapa para incidentes
export async function fetchMapData() {
    return await apiFetch('/incidents/map-data');
}

// Fetch análisis de fraude
export async function fetchFraudAnalysis() {
    return await apiFetch('/stats/fraud-analysis');
}

// Fetch datos de series temporales
export async function fetchTimeSeries() {
    return await apiFetch('/stats/time-series');
}

// Fetch verificación de fraude para un reclamo
export async function fetchFraudCheck(claimId) {
    return await apiFetch(`/claims/${claimId}/fraud-check`);
}

// Fetch personas aseguradas con paginación y límite de 10
export async function fetchInsureds(page = 1, perPage = 10) {
    return await apiFetch(`/insureds?page=${page}&per_page=${perPage}`);
}

// Fetch polizas con paginación y límite de 10
export async function fetchPolicies(page = 1, perPage = 10) {
    return await apiFetch(`/policies?page=${page}&per_page=${perPage}`);
}

// Fetch vehículos con paginación y límite de 10
export async function fetchVehicles(page = 1, perPage = 10) {
    return await apiFetch(`/vehicles?page=${page}&per_page=${perPage}`);
}

