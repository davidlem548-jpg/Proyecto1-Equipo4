// Leaflet map integration for incident locations

let map;
let markers = [];
let markerGroup;

// Get map instance
export function getMapInstance() {
    return map;
}

// Initialize Leaflet map
export function initMap() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return null;
    // Para el este de USA las coordenadas son 
    map = L.map('map').setView([38.332854, -80.624731], 5);  // latitud, longitud, nivel de zoom

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Inicializar markerGroup aquí cuando L esté garantizado
    if (!markerGroup) {
        markerGroup = L.layerGroup();
    }
    markerGroup.addTo(map);
    
    return map;
}
// Almacenar datos originales y estado del filtro
let originalIncidents = [];
let showFraudOnly = false;

// Agregar marcadores de incidentes al mapa
export function addIncidentMarkers(incidents) {
    console.log('addIncidentMarkers called with:', incidents);
    console.log('Number of incidents:', incidents?.length);
    console.log('map:', map);
    console.log('markerGroup:', markerGroup);
    console.log('markerGroup type:', typeof markerGroup);
    
    if (!map || !incidents || !markerGroup) {
        console.warn('Map, incidents, or markerGroup not available');
        return;
    }

    // Guardar los datos originales
    originalIncidents = incidents;
    
    // Aplicar filtro si está activo
    if (showFraudOnly) {
        incidents = incidents.filter(incident => incident.fraud_reported === true);
    }
    
    // Usar la función auxiliar para agregar marcadores
    addIncidentMarkersWithoutFilter(incidents);
}

// Filtrar marcadores por estado de fraude
export function filterMarkersByFraud(showFraudOnlyValue) {
    showFraudOnly = showFraudOnlyValue;
    
    // Recargar marcadores con el filtro aplicado
    if (originalIncidents.length > 0) {
        clearMarkers();
        
        let incidentsToShow = showFraudOnly 
            ? originalIncidents.filter(incident => incident.fraud_reported === true)
            : originalIncidents;
            
        addIncidentMarkersWithoutFilter(incidentsToShow);
    } else {
        console.warn('No incident data available to filter');
    }
}

// Función auxiliar para agregar marcadores sin guardar datos (evita loop infinito)
function addIncidentMarkersWithoutFilter(incidents) {
    if (!map || !incidents || !markerGroup) {
        console.warn('Map, incidents, or markerGroup not available');
        return;
    }

    clearMarkers();

    let markersAdded = 0;
    incidents.forEach(incident => {
        const coords = getStateCoordinates(incident.state);
        console.log(`Processing incident:`, incident);
        console.log(`State: ${incident.state}, Coords:`, coords);
        
        if (coords) {
            // Usar color diferente para fraude
            const markerColor = incident.fraud_reported 
                ? 'red'  // Fraude = rojo
                : 'blue'; // Normal = azul
            
            // Crear marcador con icono personalizado
            const marker = L.marker(coords, {
                icon: L.divIcon({
                    className: 'custom-marker',
                    html: `<div style="background-color: ${markerColor}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
                    iconSize: [12, 12]
                })
            }).addTo(markerGroup);
            
            // Add popup with incident details
            const severityColors = {
                'Trivial Damage': 'success',
                'Minor Damage': 'warning',
                'Major Damage': 'danger',
                'Total Loss': 'danger'
            };
            
            const severityColor = severityColors[incident.severity] || 'secondary';
            
            // Añadir información de fraude al popup
            marker.bindPopup(`
                <div>
                    <h6>Incident #${incident.id}</h6>
                    <p><strong>Type:</strong> ${incident.type || 'Unknown'}</p>
                    <p><strong>Severity:</strong> 
                        <span class="badge bg-${severityColor}">${incident.severity || 'Unknown'}</span>
                    </p>
                    <p><strong>Fraud Reported:</strong> 
                        <span class="badge bg-${incident.fraud_reported ? 'danger' : 'success'}">
                            ${incident.fraud_reported ? 'Yes' : 'No'}
                        </span>
                    </p>
                    <p><strong>Location:</strong> ${incident.city || 'Unknown'}, ${incident.state || 'Unknown'}</p>
                    ${incident.location ? `<p><small>${incident.location}</small></p>` : ''}
                </div>
            `);
            
            markers.push(marker);
            markersAdded++;
        }
    });
    
    console.log(`Total markers added: ${markersAdded}`);
    
    // Autoajustar el mapa para mostrar todos los marcadores
    if (markerGroup && markerGroup.getLayers && markerGroup.getLayers().length > 0 && markerGroup.getBounds) {
        try {
            map.fitBounds(markerGroup.getBounds(), { padding: [50, 50] });
        } catch (e) {
            console.error('Error fitting bounds:', e);
        }
    }
}

// Limpiar todos los marcadores
export function clearMarkers() {
    if (markerGroup && markerGroup.clearLayers) {
        markerGroup.clearLayers();
    }
    markers = [];
}

// Obtener coordenadas aproximadas para los estados de USA
// Los uniques estados son: 'SC', 'VA', 'NY', 'OH', 'WV', 'NC', 'PA'
function getStateCoordinates(state) {
    const stateCoords = {
        'OH': [40.3888, -82.7649], // Ohio
        'VA': [37.7693, -78.1699], // Virginia
        'NY': [42.1657, -74.9481], // New York
        'NC': [35.7596, -79.0193], // North Carolina
        'PA': [40.5908, -77.2098], // Pennsylvania
        'SC': [33.8569, -80.9450], // South Carolina
        'WV': [38.3498, -81.6326], // West Virginia
    };
    
    // Add some randomness to spread markers
    const baseCoords = stateCoords[state];
    if (!baseCoords) return null;
    
    const offset = () => (Math.random() - 0.5) * 0.5;
    return [baseCoords[0] + offset(), baseCoords[1] + offset()];
}
