# API Documentation - Insurance Analytics System

**Desarrollado por:** David Fernando Ávila Díaz (CU: 197851)  
**Sistema:** Insurance Analytics Dashboard

## Endpoints Implementados

### Health Check
```http
GET /health
```
**Descripción:** Verificación del estado del sistema  
**Respuesta:** 
```json
{
  "status": "healthy",
  "timestamp": "2025-10-30T22:00:00Z"
}
```

### Estadísticas del Sistema
```http
GET /stats
```
**Descripción:** Métricas generales del sistema de seguros  
**Respuesta:**
```json
{
  "total_policies": 1247,
  "total_claims": 856,
  "fraud_claims": 23,
  "total_claims_amount": 2840000
}
```

### Datos de Reclamos
```http
GET /claims?page=1&per_page=100
```
**Descripción:** Lista paginada de reclamos  
**Parámetros:**
- `page`: Número de página (default: 1)
- `per_page`: Elementos por página (default: 100)

**Respuesta:**
```json
{
  "data": [
    {
      "id": 1,
      "total_claim_amount": 15000,
      "fraud_reported": false,
      "incident_severity": "Minor"
    }
  ]
}
```

### Información de Pólizas
```http
GET /policies?page=1&per_page=100
```
**Descripción:** Lista paginada de pólizas  
**Respuesta:**
```json
{
  "data": [
    {
      "id": 1,
      "annual_premium": 12000,
      "policy_state": "Activa"
    }
  ]
}
```

## Cliente API Implementado

### Características
- **Cache inteligente** de 5 minutos
- **Timeout** de 10 segundos por request
- **Manejo de errores** robusto con fallbacks
- **Retry automático** en fallos de red

### Métodos Principales
```javascript
const api = new InsuranceAPIClient();

// Obtener estadísticas
const stats = await api.getSystemStats();

// Obtener reclamos
const claims = await api.getClaimsData(1, 50);

// Obtener pólizas
const policies = await api.getPoliciesData(1, 30);

// Carga masiva para analytics
const bulkData = await api.getBulkData({
  claims: 200,
  policies: 150
});
```