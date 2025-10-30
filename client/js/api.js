// Professional API Client for Insurance Management System
// Desarrollado por: David Fernando Ávila Díaz (CU: 197851)
// Implementa cliente API robusto con manejo de errores y cache inteligente

class InsuranceAPI {
  constructor() {
    this.baseUrl = 'http://localhost:8000';
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
    this.requestTimeout = 10000; // 10 segundos
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const cacheKey = `${url}_${JSON.stringify(options)}`;
    
    // Verificar cache primero
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
      this.cache.delete(cacheKey);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);

      const response = await fetch(url, {
        signal: controller.signal,
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Guardar en cache respuestas exitosas
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn(`Timeout en request: ${endpoint}`);
      } else {
        console.warn(`Falla en API ${endpoint}:`, error.message);
      }
      throw error;
    }
  }

  async getStats() {
    try {
      return await this.request('/stats');
    } catch (error) {
      return this.generateFallbackStats();
    }
  }

  async getClaims(page = 1, perPage = 100) {
    try {
      return await this.request(`/claims?page=${page}&per_page=${perPage}`);
    } catch (error) {
      return this.generateFallbackClaims();
    }
  }

  async getPolicies(page = 1, perPage = 100) {
    try {
      return await this.request(`/policies?page=${page}&per_page=${perPage}`);
    } catch (error) {
      return this.generateFallbackPolicies();
    }
  }

  async getInsured(id) {
    try {
      return await this.request(`/insureds/${id}`);
    } catch (error) {
      throw new Error(`No se pudo obtener información del asegurado: ${error.message}`);
    }
  }

  async createClaim(claimData) {
    try {
      return await this.request('/claims', {
        method: 'POST',
        body: JSON.stringify(claimData)
      });
    } catch (error) {
      throw new Error(`Error al crear reclamo: ${error.message}`);
    }
  }

  generateFallbackStats() {
    return {
      total_policies: 1247,
      total_claims: 856,
      fraud_claims: 23,
      total_claims_amount: 2840000,
      generated_at: new Date().toISOString(),
      source: 'fallback'
    };
  }

  generateFallbackClaims() {
    return {
      data: Array.from({ length: 50 }, (_, i) => ({
        id: i + 1,
        total_claim_amount: Math.floor(Math.random() * 50000) + 5000,
        fraud_reported: Math.random() < 0.1,
        incident_severity: ['Minor', 'Major', 'Total Loss'][Math.floor(Math.random() * 3)],
        created_at: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString()
      })),
      source: 'fallback'
    };
  }

  generateFallbackPolicies() {
    return {
      data: Array.from({ length: 30 }, (_, i) => ({
        id: i + 1,
        annual_premium: Math.floor(Math.random() * 25000) + 8000,
        policy_state: ['Activa', 'Pendiente', 'Cancelada'][Math.floor(Math.random() * 3)],
        created_at: new Date(Date.now() - Math.random() * 86400000 * 365).toISOString()
      })),
      source: 'fallback'
    };
  }

  clearCache() {
    this.cache.clear();
  }

  getCacheInfo() {
    return {
      size: this.cache.size,
      timeout: this.cacheTimeout,
      entries: Array.from(this.cache.keys())
    };
  }
}

// Disponible globalmente para otros módulos
window.InsuranceAPI = InsuranceAPI;