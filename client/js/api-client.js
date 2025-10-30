// Professional API Client for Insurance System
// Autor: David Fernando Ávila Díaz (CU: 197851)
// Cliente API robusto con cache y manejo de errores

class InsuranceAPIClient {
  constructor() {
    this.baseUrl = 'http://localhost:8000';
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
    this.requestTimeout = 10000;
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const cacheKey = `${url}_${JSON.stringify(options)}`;
    
    // Verificar cache
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
      
      // Guardar en cache
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn(`Request timeout: ${endpoint}`);
      } else {
        console.warn(`API error ${endpoint}:`, error.message);
      }
      throw error;
    }
  }

  async getSystemStats() {
    try {
      return await this.makeRequest('/stats');
    } catch (error) {
      return this.createFallbackStats();
    }
  }

  async getClaimsData(page = 1, perPage = 100) {
    try {
      return await this.makeRequest(`/claims?page=${page}&per_page=${perPage}`);
    } catch (error) {
      return this.createFallbackClaims();
    }
  }

  async getPoliciesData(page = 1, perPage = 100) {
    try {
      return await this.makeRequest(`/policies?page=${page}&per_page=${perPage}`);
    } catch (error) {
      return this.createFallbackPolicies();
    }
  }

  async getInsuredData(id) {
    try {
      return await this.makeRequest(`/insureds/${id}`);
    } catch (error) {
      throw new Error(`Error obteniendo datos del asegurado: ${error.message}`);
    }
  }

  async createNewClaim(claimData) {
    try {
      return await this.makeRequest('/claims', {
        method: 'POST',
        body: JSON.stringify(claimData)
      });
    } catch (error) {
      throw new Error(`Error creando reclamo: ${error.message}`);
    }
  }

  async updatePolicy(id, policyData) {
    try {
      return await this.makeRequest(`/policies/${id}`, {
        method: 'PUT',
        body: JSON.stringify(policyData)
      });
    } catch (error) {
      throw new Error(`Error actualizando póliza: ${error.message}`);
    }
  }

  createFallbackStats() {
    return {
      total_policies: 1247,
      total_claims: 856,
      fraud_claims: 23,
      total_claims_amount: 2840000,
      generated_at: new Date().toISOString(),
      source: 'fallback'
    };
  }

  createFallbackClaims() {
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

  createFallbackPolicies() {
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

  getCacheStatus() {
    return {
      size: this.cache.size,
      timeout: this.cacheTimeout,
      entries: Array.from(this.cache.keys())
    };
  }

  // Métodos de utilidad para analytics
  async getBulkData(limits = {}) {
    const defaultLimits = {
      claims: 200,
      policies: 150,
      ...limits
    };

    try {
      const [stats, claims, policies] = await Promise.all([
        this.getSystemStats(),
        this.getClaimsData(1, defaultLimits.claims),
        this.getPoliciesData(1, defaultLimits.policies)
      ]);

      return { stats, claims, policies };
    } catch (error) {
      console.warn('Error en carga bulk, usando fallbacks');
      return {
        stats: this.createFallbackStats(),
        claims: this.createFallbackClaims(),
        policies: this.createFallbackPolicies()
      };
    }
  }
}

// Disponible globalmente
window.InsuranceAPIClient = InsuranceAPIClient;