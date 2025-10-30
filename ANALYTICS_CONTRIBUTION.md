# Módulo Analytics - Análisis Avanzado

**Desarrollado por:** David Fernando Ávila Díaz (CU: 197851)  
**Componente:** Analytics y visualización de datos

## Descripción

Este módulo agrega capacidades de análisis avanzado al dashboard de seguros, implementando métricas de riesgo, análisis predictivo y visualizaciones complementarias para el sistema.

## Archivos aportados

### Componentes del módulo analytics:
- `client/js/dashboard-core.js` - Core funcional con Chart.js
- `client/js/api-client.js` - Cliente API con cache inteligente
- `client/js/analytics.js` - Motor de análisis avanzado
- `client/analytics.html` - Interfaz de análisis complementario
- `client/css/analytics.css` - Estilos para visualizaciones
- `ANALYTICS_MODULE.md` - Documentación técnica detallada

### Arquitectura del sistema:
- Integración con backend FastAPI existente
- Compatibilidad con estructura de datos del proyecto
- Extensión de funcionalidades sin modificar archivos base

## Características técnicas

### Análisis implementados:
- **Índice de Riesgo:** Cálculo dinámico basado en claims/policies ratio
- **Ratio Siniestralidad:** Análisis financiero con detección de tendencias  
- **Detección de Fraudes:** Algoritmos de reconocimiento de patrones
- **Score de Cartera:** Evaluación integral de performance

### Stack tecnológico:
- **Frontend:** HTML5, Bootstrap 5.3.8, JavaScript ES6+
- **Visualización:** Chart.js 4.4.6 con configuraciones avanzadas
- **API Integration:** Cliente robusto con cache de 5 minutos
- **Styling:** CSS moderno con variables y responsive design

### Características avanzadas:
- Cache inteligente con invalidación automática
- Manejo robusto de errores con fallbacks
- Diseño responsive mobile-first
- Compatibilidad cross-browser

## Enlaces del proyecto

### 🌐 Página pública del proyecto:
**🔗 https://davidlem548-jpg.github.io/Proyecto1-Equipo4/**

### Interfaces del sistema:
- **Dashboard principal:** http://127.0.0.1:8000/client/index.html
- **Analytics complementario:** http://127.0.0.1:8000/client/analytics.html
- **Gestión de pólizas:** http://127.0.0.1:8000/client/policies.html  
- **Gestión de reclamos:** http://127.0.0.1:8000/client/claims.html

### API endpoints utilizados:
- **Health Check:** http://127.0.0.1:8000/health
- **Documentación:** http://127.0.0.1:8000/docs
- **Estadísticas:** http://127.0.0.1:8000/stats

## Instalación

Seguir las instrucciones estándar del proyecto:

```bash
# Instalar dependencias
pip install -r server/requirements.txt

# Levantar servidor  
uvicorn server.main:app --reload
```

## Integración del proyecto

Este módulo se integra con la arquitectura existente del sistema, utilizando las APIs y estructura de datos ya implementadas.

**Integrantes del equipo:**
- José David Lemarroy Acuña - Backend y arquitectura
- Braulio Alejandro Lozano Cuevas - Frontend y interfaz
- Mariana Márquez Gil - Experiencia de usuario
- David Ávila - Módulo de analytics

---

*Contribución desarrollada para COM-11117 - ITAM 2025*  
*Proyecto colaborativo del Equipo 4*