import { getPolicies, createPolicy, showToast, formatCurrency, formatDate } from './api.js';

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
let allPolicies = [];
let filteredPolicies = [];

// DOM elements
const tblBody = document.getElementById('tblBody');
const pagination = document.getElementById('pagination');
const filterStatus = document.getElementById('filterStatus');
const filterInsurer = document.getElementById('filterInsurer');
const btnReload = document.getElementById('btnReload');
const btnAddPolicy = document.getElementById('btnAddPolicy');
const btnSavePolicy = document.getElementById('btnSavePolicy');
const policyModal = document.getElementById('policyModal');
const policyForm = document.getElementById('policyForm');

let bsModal; // Bootstrap modal instance

// Load policies con localStorage
async function loadPolicies() {
  try {
    // Intentar cargar desde localStorage primero
    const cachedPolicies = localStorage.getItem('insurance_policies_cache');
    if (cachedPolicies) {
      allPolicies = JSON.parse(cachedPolicies);
      populateFilters();
      applyFilters();
    }

    const response = await getPolicies(1, 100);
    allPolicies = response.data || [];
    
    // Guardar en localStorage
    localStorage.setItem('insurance_policies_cache', JSON.stringify(allPolicies));
    
    populateFilters();
    applyFilters();
    showToast('Pólizas cargadas exitosamente', 'success');
  } catch (error) {
    console.error('Error loading policies:', error);
    showToast('Error al cargar pólizas: ' + error.message, 'error');
    tblBody.innerHTML = '<tr><td colspan="8" class="text-center text-danger">Error al cargar datos</td></tr>';
  }
}

function populateFilters() {
  // Populate state filter
  const states = [...new Set(allPolicies.map(p => p.policy_state).filter(Boolean))];
  filterInsurer.innerHTML = '<option value="">Todas</option>';
  states.forEach(state => {
    const option = document.createElement('option');
    option.value = state;
    option.textContent = state;
    filterInsurer.appendChild(option);
  });
}

// Apply filters
function applyFilters() {
  const statusValue = filterStatus.value;
  const insurerValue = filterInsurer.value;

  filteredPolicies = allPolicies.filter(policy => {
    // Status filter (simulated based on dates)
    if (statusValue) {
      const bindDate = policy.bind_date ? new Date(policy.bind_date) : null;
      const now = new Date();
      const oneYearFromBind = bindDate ? new Date(bindDate.getTime() + 365 * 24 * 60 * 60 * 1000) : null;
      
      if (statusValue === 'activa' && (!oneYearFromBind || oneYearFromBind < now)) return false;
      if (statusValue === 'vencida' && (!oneYearFromBind || oneYearFromBind >= now)) return false;
    }

    // Insurer (state) filter
    if (insurerValue && policy.policy_state !== insurerValue) return false;

    return true;
  });

  currentPage = 1;
  renderTable();
  renderPagination();
}

// Render table
function renderTable() {
  if (filteredPolicies.length === 0) {
    tblBody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">No policies found</td></tr>';
    return;
  }

  const startIdx = (currentPage - 1) * perPage;
  const endIdx = startIdx + perPage;
  const pageData = filteredPolicies.slice(startIdx, endIdx);

  tblBody.innerHTML = pageData.map(policy => {
    const bindDate = policy.bind_date ? new Date(policy.bind_date) : null;
    const endDate = bindDate ? new Date(bindDate.getTime() + 365 * 24 * 60 * 60 * 1000) : null;
    const isActive = endDate && endDate > new Date();
    
    return `
      <tr>
        <td>${policy.id}</td>
        <td>${policy.policy_state || 'N/A'}</td>
        <td>Insured #${policy.id}</td>
        <td>${policy.policy_number}</td>
        <td>${formatCurrency(policy.annual_premium)}</td>
        <td>${formatDate(policy.bind_date)}</td>
        <td>${endDate ? formatDate(endDate.toISOString().split('T')[0]) : 'N/A'}</td>
        <td>
          <span class="badge ${isActive ? 'bg-success' : 'bg-secondary'}">
            ${isActive ? 'Active' : 'Expired'}
          </span>
        </td>
      </tr>
    `;
  }).join('');
}

// Render pagination
function renderPagination() {
  const totalPages = Math.ceil(filteredPolicies.length / perPage);
  
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
filterInsurer?.addEventListener('change', applyFilters);
btnReload?.addEventListener('click', loadPolicies);

// onClick: Abrir modal para nueva póliza
btnAddPolicy?.addEventListener('click', () => {
  policyForm.reset();
  document.getElementById('policyModalTitle').textContent = 'Nueva Póliza';
  if (!bsModal && policyModal) {
    bsModal = new bootstrap.Modal(policyModal);
  }
  bsModal?.show();
});

// onClick: Guardar póliza
btnSavePolicy?.addEventListener('click', async () => {
  try {
    const policyData = {
      policy_number: parseInt(document.getElementById('policyNumber').value),
      policy_state: document.getElementById('policyState').value,
      bind_date: document.getElementById('bindDate').value || null,
      csl: document.getElementById('csl').value || null,
      deductible: parseInt(document.getElementById('deductible').value) || null,
      annual_premium: parseFloat(document.getElementById('annualPremium').value),
      umbrella_limit: parseInt(document.getElementById('umbrellaLimit').value) || null
    };

    if (!policyData.policy_number || !policyData.policy_state || !policyData.annual_premium) {
      showToast('Por favor complete los campos requeridos', 'warning');
      return;
    }

    await createPolicy(policyData);
    showToast('Póliza creada exitosamente', 'success');
    bsModal?.hide();
    policyForm.reset();
    
    // Recargar lista
    await loadPolicies();
  } catch (error) {
    console.error('Error creating policy:', error);
    showToast('Error al crear póliza: ' + error.message, 'error');
  }
});

// onLoad: Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadPolicies);
} else {
  loadPolicies();
}
