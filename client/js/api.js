// API Configuration
const API_BASE_URL = 'http://localhost:8000';

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

// ============================================
// HEALTH CHECK
// ============================================
export async function checkHealth() {
  return fetchAPI('/health');
}

// ============================================
// INSUREDS
// ============================================
export async function getInsureds(page = 1, perPage = 10) {
  return fetchAPI(`/insureds?page=${page}&per_page=${perPage}`);
}

export async function getInsured(id) {
  return fetchAPI(`/insureds/${id}`);
}

export async function createInsured(data) {
  return fetchAPI('/insureds', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateInsured(id, data) {
  return fetchAPI(`/insureds/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ============================================
// POLICIES
// ============================================
export async function getPolicies(page = 1, perPage = 10, policyState = null) {
  let url = `/policies?page=${page}&per_page=${perPage}`;
  if (policyState) {
    url += `&policy_state=${policyState}`;
  }
  return fetchAPI(url);
}

export async function getPolicy(id) {
  return fetchAPI(`/policies/${id}`);
}

export async function createPolicy(data) {
  return fetchAPI('/policies', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updatePolicy(id, data) {
  return fetchAPI(`/policies/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function getPolicyCoverageLevel(id) {
  return fetchAPI(`/policies/${id}/coverage-level`);
}

// ============================================
// VEHICLES
// ============================================
export async function getVehicles(page = 1, perPage = 10) {
  return fetchAPI(`/vehicles?page=${page}&per_page=${perPage}`);
}

export async function getVehicle(id) {
  return fetchAPI(`/vehicles/${id}`);
}

export async function createVehicle(data) {
  return fetchAPI('/vehicles', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateVehicle(id, data) {
  return fetchAPI(`/vehicles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ============================================
// INCIDENTS
// ============================================
export async function getIncidents(page = 1, perPage = 10) {
  return fetchAPI(`/incidents?page=${page}&per_page=${perPage}`);
}

export async function getIncident(id) {
  return fetchAPI(`/incidents/${id}`);
}

export async function createIncident(data) {
  return fetchAPI('/incidents', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateIncident(id, data) {
  return fetchAPI(`/incidents/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ============================================
// CLAIMS
// ============================================
export async function getClaims(page = 1, perPage = 10) {
  return fetchAPI(`/claims?page=${page}&per_page=${perPage}`);
}

export async function getClaim(id) {
  return fetchAPI(`/claims/${id}`);
}

export async function createClaim(data) {
  return fetchAPI('/claims', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateClaim(id, data) {
  return fetchAPI(`/claims/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function getClaimFraudCheck(id) {
  return fetchAPI(`/claims/${id}/fraud-check`);
}

// ============================================
// CASES
// ============================================
export async function getCases(page = 1, perPage = 10) {
  return fetchAPI(`/cases?page=${page}&per_page=${perPage}`);
}

export async function getCase(id) {
  return fetchAPI(`/cases/${id}`);
}

export async function createCase(data) {
  return fetchAPI('/cases', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCase(id, data) {
  return fetchAPI(`/cases/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ============================================
// STATS
// ============================================
export async function getStats() {
  return fetchAPI('/stats');
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Format currency for display
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

/**
 * Format date for display
 */
export function formatDate(dateString) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Show toast notification
 */
export function showToast(message, type = 'info') {
  const toastArea = document.getElementById('toastArea');
  if (!toastArea) return;

  const toastId = `toast-${Date.now()}`;
  const bgClass = {
    success: 'bg-success',
    error: 'bg-danger',
    warning: 'bg-warning',
    info: 'bg-info',
  }[type] || 'bg-info';

  const toast = document.createElement('div');
  toast.id = toastId;
  toast.className = `toast align-items-center text-white ${bgClass} border-0`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toast.setAttribute('aria-atomic', 'true');
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>
  `;

  toastArea.appendChild(toast);

  // Initialize Bootstrap toast (if Bootstrap 5 is loaded)
  if (window.bootstrap && bootstrap.Toast) {
    const bsToast = new bootstrap.Toast(toast, { autohide: true, delay: 3000 });
    bsToast.show();
    toast.addEventListener('hidden.bs.toast', () => toast.remove());
  } else {
    // Fallback: simple timeout
    setTimeout(() => toast.remove(), 3000);
  }
}
