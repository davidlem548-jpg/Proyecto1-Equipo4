import { getClaims, createClaim, showToast, formatCurrency, formatDate } from './api.js';

// Theme toggle con localStorage
const themeBtn = document.getElementById('themeBtn');
const html = document.documentElement;

themeBtn?.addEventListener('click', () => {
  const currentTheme = html.getAttribute('data-bs-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  html.setAttribute('data-bs-theme', newTheme);
  localStorage.setItem('insurance_theme', newTheme);
});

// onLoad: Cargar tema guardado
const savedTheme = localStorage.getItem('insurance_theme') || 'light';
html.setAttribute('data-bs-theme', savedTheme);

// State management
let currentPage = 1;
let perPage = 10;
let allClaims = [];
let filteredClaims = [];

// DOM elements
const tblBody = document.getElementById('tblBody');
const pagination = document.getElementById('pagination');
const filterStatus = document.getElementById('filterStatus');
const filterPolicyId = document.getElementById('filterPolicyId');
const btnReload = document.getElementById('btnReload');
const btnAddClaim = document.getElementById('btnAddClaim');
const btnSaveClaim = document.getElementById('btnSaveClaim');
const claimModal = document.getElementById('claimModal');
const claimForm = document.getElementById('claimForm');

let bsModal; // Bootstrap modal instance

// Load claims con localStorage
async function loadClaims(forceReload = false) {
  try {
    // Si no es forzado, intentar cargar desde localStorage primero
    if (!forceReload) {
      const cachedClaims = localStorage.getItem('insurance_claims_cache');
      if (cachedClaims) {
        allClaims = JSON.parse(cachedClaims);
        applyFilters();
      }
    }

    const response = await getClaims(1, 100);
    allClaims = response.data || [];
    
    // Guardar en localStorage
    localStorage.setItem('insurance_claims_cache', JSON.stringify(allClaims));
    
    applyFilters();
    
    if (forceReload) {
      showToast('Reclamos actualizados', 'success');
    }
  } catch (error) {
    console.error('Error loading claims:', error);
    showToast('Error al cargar reclamos: ' + error.message, 'error');
    tblBody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error al cargar datos</td></tr>';
  }
}

// Apply filters
function applyFilters() {
  const statusValue = filterStatus.value;
  const policyIdValue = filterPolicyId.value;

  filteredClaims = allClaims.filter(claim => {
    // Status filter (based on fraud_reported)
    if (statusValue === 'abierto' && claim.fraud_reported) return false;
    if (statusValue === 'cerrado' && !claim.fraud_reported) return false;
    
    // Policy ID filter (simulated - we don't have direct policy_id on claim)
    if (policyIdValue) {
      const policyId = parseInt(policyIdValue);
      if (claim.id !== policyId) return false; // Using claim.id as proxy
    }

    return true;
  });

  currentPage = 1;
  renderTable();
  renderPagination();
}

// Render table
function renderTable() {
  if (filteredClaims.length === 0) {
    tblBody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No claims found</td></tr>';
    return;
  }

  const startIdx = (currentPage - 1) * perPage;
  const endIdx = startIdx + perPage;
  const pageData = filteredClaims.slice(startIdx, endIdx);

  tblBody.innerHTML = pageData.map(claim => {
    const status = claim.fraud_reported ? 'Fraud Reported' : 'Legitimate';
    const statusClass = claim.fraud_reported ? 'bg-danger' : 'bg-success';
    const policyDisplay = claim.policy_id ? `Policy #${claim.policy_id}` : `Claim #${claim.id}`;
    
    return `
      <tr>
        <td>${claim.id}</td>
        <td>${policyDisplay}</td>
        <td>${formatDate(new Date().toISOString())}</td>
        <td>${formatCurrency(claim.total_claim_amount)}</td>
        <td>
          <span class="badge ${statusClass}">${status}</span>
        </td>
      </tr>
    `;
  }).join('');
}

// Render pagination
function renderPagination() {
  const totalPages = Math.ceil(filteredClaims.length / perPage);
  
  if (totalPages <= 1) {
    pagination.innerHTML = '';
    return;
  }

  let html = '';
  
  // Previous button
  html += `
    <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
      <a class="page-link" href="#" data-page="${currentPage - 1}">Previous</a>
    </li>
  `;

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      html += `
        <li class="page-item ${i === currentPage ? 'active' : ''}">
          <a class="page-link" href="#" data-page="${i}">${i}</a>
        </li>
      `;
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      html += '<li class="page-item disabled"><span class="page-link">...</span></li>';
    }
  }

  // Next button
  html += `
    <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
      <a class="page-link" href="#" data-page="${currentPage + 1}">Next</a>
    </li>
  `;

  pagination.innerHTML = html;

  // Add click listeners
  pagination.querySelectorAll('a.page-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = parseInt(e.target.dataset.page);
      if (page >= 1 && page <= totalPages) {
        currentPage = page;
        renderTable();
        renderPagination();
      }
    });
  });
}

// Event listeners con onClick
filterStatus?.addEventListener('change', applyFilters);
filterPolicyId?.addEventListener('input', applyFilters);
btnReload?.addEventListener('click', loadClaims);

// onClick: Abrir modal para nuevo reclamo
btnAddClaim?.addEventListener('click', () => {
  claimForm.reset();
  document.getElementById('claimModalTitle').textContent = 'Nuevo Reclamo';
  if (!bsModal && claimModal) {
    bsModal = new bootstrap.Modal(claimModal);
  }
  bsModal?.show();
});

// onClick: Guardar reclamo
btnSaveClaim?.addEventListener('click', async () => {
  try {
    // Obtener valores del formulario actualizado
    const totalAmount = parseInt(document.getElementById('totalClaimAmount').value);
    const policyId = parseInt(document.getElementById('claimPolicyId').value);
    const incidentDate = document.getElementById('claimDate').value;
    const incidentType = document.getElementById('claimType').value;
    const severity = document.getElementById('claimSeverity').value;
    const isFraud = document.getElementById('fraudReported').checked;

    // Validar campos requeridos
    if (!totalAmount || !policyId || !incidentDate || !incidentType) {
      showToast('Por favor complete todos los campos requeridos (*)', 'warning');
      return;
    }

    // Crear objeto con los datos del claim
    const claimData = {
      policy_id: policyId,  // Agregar el policy_id
      total_claim_amount: totalAmount,
      injury_claim: 0,
      property_claim: 0,
      vehicle_claim: totalAmount, // Por defecto asignar todo al vehículo
      fraud_reported: isFraud
    };

    await createClaim(claimData);
    console.log('✅ Claim creado:', claimData);
    showToast('Reclamo creado exitosamente', 'success');
    bsModal?.hide();
    claimForm.reset();
    
    // Esperar un momento antes de recargar
    setTimeout(async () => {
      // Recargar lista forzando actualización desde API
      await loadClaims(true);
    }, 500);
  } catch (error) {
    console.error('Error creating claim:', error);
    showToast('Error al crear reclamo: ' + error.message, 'error');
  }
});

// onLoad: Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadClaims);
} else {
  loadClaims();
}
