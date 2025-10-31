// Tablas

// Render pagination controls
export function renderPagination(containerId, currentPage, totalPages, onPageChange) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';

    if (totalPages <= 1) return;

    // Botón anterior
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = `
        <a class="page-link" href="#" data-page="${currentPage - 1}" ${currentPage === 1 ? 'tabindex="-1"' : ''}>Previous</a>
    `;
    container.appendChild(prevLi);

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        // Mostrar primera, última, actual y páginas alrededor de la actual
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            const li = document.createElement('li');
            li.className = `page-item ${i === currentPage ? 'active' : ''}`;
            li.innerHTML = `<a class="page-link" href="#" data-page="${i}">${i}</a>`;
            container.appendChild(li);
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            const li = document.createElement('li');
            li.className = 'page-item disabled';
            li.innerHTML = '<span class="page-link">...</span>';
            container.appendChild(li);
        }
    }

    // Botón siguiente
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextLi.innerHTML = `
        <a class="page-link" href="#" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'tabindex="-1"' : ''}>Next</a>
    `;
    container.appendChild(nextLi);

    // Agregar listeners de eventos
    container.querySelectorAll('.page-link[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = parseInt(link.dataset.page);
            if (page && page !== currentPage) {
                onPageChange(page);
            }
        });
    });
}

// Renderizar tabla de reclamos
export function renderClaimsTable(data) {
    const tbody = document.getElementById('claimsTableBody');
    if (!tbody) return;

    if (!data || !data.data || data.data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No se encontraron reclamos</td></tr>';
        return;
    }

    tbody.innerHTML = data.data.map(claim => {
        const fraudClass = claim.fraud_reported ? 'fraud-row' : '';
        return `
            <tr class="${fraudClass}">
                <td>${claim.id}</td>
                <td>$${(claim.total_claim_amount || 0).toLocaleString()}</td>
                <td>$${(claim.injury_claim || 0).toLocaleString()}</td>
                <td>$${(claim.property_claim || 0).toLocaleString()}</td>
                <td>$${(claim.vehicle_claim || 0).toLocaleString()}</td>
                <td>
                    <span class="badge ${claim.fraud_reported ? 'fraud-badge' : 'bg-success'}">
                        ${claim.fraud_reported ? 'Fraud' : 'Legitimate'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="viewClaimDetails(${claim.id})">
                        <i class="bi bi-eye"></i> View
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Renderizar tabla de casos
export function renderCasesTable(data) {
    const tbody = document.getElementById('casesTableBody');
    if (!tbody) return;

    if (!data || !data.data || data.data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No se encontraron casos</td></tr>';
        return;
    }

    tbody.innerHTML = data.data.map(case_ => {
        return `
            <tr>
                <td>${case_.id}</td>
                <td>${case_.insured_id || '-'}</td>
                <td>${case_.policy_id || '-'}</td>
                <td>${case_.vehicle_id || '-'}</td>
                <td>${case_.incident_id || '-'}</td>
                <td>${case_.claim_id || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="viewCaseDetails(${case_.id})">
                        <i class="bi bi-eye"></i> View
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Renderizar tabla de incidentes
export function renderIncidentsTable(data) {
    const tbody = document.getElementById('incidentsTableBody');
    if (!tbody) return;

    if (!data || !data.data || data.data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No se encontraron incidentes</td></tr>';
        return;
    }

    tbody.innerHTML = data.data.map(incident => {
        const date = incident.date || '-';
        return `
            <tr>
                <td>${incident.id}</td>
                <td>${date}</td>
                <td>${incident.incident_type || '-'}</td>
                <td>${incident.incident_severity || '-'}</td>
                <td>${incident.incident_city || '-'}</td>
                <td>${incident.incident_state || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="viewIncidentDetails(${incident.id})">
                        <i class="bi bi-eye"></i> View
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Configurar filtro de búsqueda para la tabla
export function setupSearchFilter(inputId, tableId) {
    const searchInput = document.getElementById(inputId);
    const table = document.getElementById(tableId);
    
    if (!searchInput || !table) return;

    searchInput.addEventListener('input', (e) => {
        const searchText = e.target.value.toLowerCase();
        const rows = table.querySelectorAll('tbody tr');

        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchText) ? '' : 'none';
        });
    });
}

// Hacer funciones globales disponibles para handlers de onclick
window.viewClaimDetails = async function(claimId) {
    // app.js
    console.log('View claim details:', claimId);
};

window.viewCaseDetails = async function(caseId) {
    // app.js
    console.log('View case details:', caseId);
};

window.viewIncidentDetails = async function(incidentId) {
    // app.js
    console.log('View incident details:', incidentId);
};

