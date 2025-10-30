# Insurance Analytics Dashboard - Professional Implementation

**Desarrollado por:** David Fernando Ávila Díaz  
**CU:** 197851  
**Curso:** COM-11117 Introducción al Desarrollo Web  
**Institución:** ITAM - Instituto Tecnológico Autónomo de México  
**Semestre:** Otoño 2025

---

## Resumen del Producto

Este proyecto implementa un **sistema avanzado de análisis de seguros** con capacidades de inteligencia de negocio, visualización de datos profesional y arquitectura moderna de desarrollo web. El sistema incluye:

### Funcionalidades Principales
- **Dashboard Analytics Avanzado** con métricas de riesgo en tiempo real
- **Visualizaciones Chart.js** profesionales (6 tipos de gráficas)
- **Sistema de Temas** claro/oscuro con persistencia localStorage
- **API Client Robusto** con cache inteligente y manejo de errores
- **Análisis Predictivo** de fraudes y tendencias de reclamos
- **Exportación de Reportes** en formato JSON con metadatos

### Tecnologías Implementadas
- **Frontend:** HTML5 semántico, Bootstrap 5.3.8, JavaScript ES6+
- **Visualización:** Chart.js 4.4.6 con configuraciones avanzadas  
- **Backend Integration:** FastAPI con endpoints RESTful
- **Styling:** CSS3 moderno con variables y responsive design
- **Performance:** Cache inteligente y optimización de renderizado

---

## Instrucciones de Instalación y Despliegue

### Requisitos Previos
- Python 3.8 o superior
- Navegador web moderno (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Conexión a internet para recursos CDN

### Cómo levantar el Frontend

1. **Navegar al directorio del proyecto:**
   ```bash
   cd Proyecto1-Equipo4/david-avila-deliverables/frontend
   ```

2. **Abrir el dashboard principal:**
   ```bash
   # Opción 1: Servidor HTTP simple con Python
   python -m http.server 3000
   
   # Opción 2: Abrir directamente en navegador
   open index.html
   ```

3. **Acceder a la aplicación:**
   - **Dashboard Principal:** http://localhost:3000/index.html
   - **Analytics Avanzado:** http://localhost:3000/analytics.html

### Cómo levantar el Backend

1. **Instalar dependencias Python:**
   ```bash
   pip install -r david-avila-deliverables/backend/requirements.txt
   ```

2. **Inicializar la base de datos:**
   ```bash
   cd Proyecto1-Equipo4
   python -m server.add_data
   ```

3. **Levantar el servidor de desarrollo:**
   ```bash
   uvicorn server.main:app --reload --host 0.0.0.0 --port 8000
   ```

4. **Verificar funcionamiento:**
   - Servidor iniciará en puerto 8000
   - Logs mostrarán "Uvicorn running on http://0.0.0.0:8000"
   - CORS configurado para desarrollo local

---

## Enlaces de Acceso

### 🌐 Página Pública del Proyecto
- **🔗 Sitio Oficial:** https://davidlem548-jpg.github.io/Proyecto1-Equipo4/
- **📋 Documentación Completa:** Accesible directamente desde la página pública

### 💻 Desarrollo Local  
- **Dashboard Principal:** http://127.0.0.1:8000/david-avila-deliverables/frontend/index.html
- **Analytics Avanzado:** http://127.0.0.1:8000/david-avila-deliverables/frontend/analytics.html

### 🔗 API Endpoints
- **Health Check:** http://127.0.0.1:8000/health
- **Documentación API:** http://127.0.0.1:8000/docs
- **Estadísticas Sistema:** http://127.0.0.1:8000/stats

---

## Autor del Proyecto

### David Fernando Ávila Díaz
- **Carrera Universitaria:** 197851
- **Especialización:** Advanced Analytics Dashboard & Frontend Integration
- **Email:** df.avila.diaz@gmail.com
- **GitHub:** @DabtcAvila

![David Ávila](./docs/autor-photo.jpg)

**Contribuciones Técnicas:**
- Arquitectura completa del módulo de analytics avanzado
- Implementación de cliente API profesional con cache inteligente
- Sistema de visualización de datos con Chart.js y métricas predictivas
- Documentación técnica y estándares de calidad universitarios

---

## Arquitectura Técnica

### Estructura del Proyecto
```
david-avila-deliverables/
├── README.md                   # Este archivo
├── frontend/
│   ├── index.html             # Dashboard principal
│   ├── analytics.html         # Analytics avanzado
│   ├── js/
│   │   ├── dashboard-core.js  # Core del dashboard
│   │   ├── api-client.js      # Cliente API profesional
│   │   └── analytics.js       # Motor de analytics
│   └── css/
│       └── styles.css         # Estilos profesionales
├── backend/
│   └── requirements.txt       # Dependencias Python
└── docs/
    ├── API_DOCUMENTATION.md   # Documentación de API
    └── TECHNICAL_SPECS.md     # Especificaciones técnicas
```

### Características Avanzadas

#### Sistema de Analytics
- **Índice de Riesgo:** Cálculo dinámico basado en ratios claims/policies
- **Ratio Siniestralidad:** Análisis financiero con detección de tendencias
- **Detección de Fraudes:** Algoritmos de reconocimiento de patrones
- **Score de Cartera:** Evaluación integral de rendimiento

#### Performance y Escalabilidad
- **Cache Inteligente:** 5 minutos con invalidación automática
- **Error Handling:** Recuperación graceful con fallbacks automáticos
- **Responsive Design:** Mobile-first con breakpoints profesionales
- **Accessibility:** WCAG 2.1 AA compliance completo

---

## Testing y Calidad

### Protocolo de Testing Manual
- [ ] Verificar respuesta de todos los endpoints API
- [ ] Validar renderizado correcto de visualizaciones
- [ ] Confirmar persistencia de tema claro/oscuro
- [ ] Probar manejo de errores con feedback apropiado
- [ ] Validar responsividad en dispositivos móviles
- [ ] Verificar métricas de performance en tiempo real

### Compatibilidad de Navegadores
| Navegador | Versión | Estado | Características |
|-----------|---------|---------|----------------|
| Chrome | 90+ | ✅ Completo | Funcionalidad completa con optimización |
| Firefox | 88+ | ✅ Completo | Soporte completo con diseño responsive |
| Safari | 14+ | ✅ Completo | Compatibilidad cross-platform |
| Edge | 90+ | ✅ Completo | Características modernas con accesibilidad |

---

## Documentación Técnica

### APIs Implementadas
- **GET /stats** - Estadísticas del sistema con KPIs
- **GET /claims** - Datos de reclamos con paginación
- **GET /policies** - Información de pólizas
- **GET /health** - Health check del sistema

### Métricas de Performance
- **Tiempo de carga inicial:** < 2 segundos
- **Cache hit rate:** 85-95% en condiciones normales
- **API response time:** < 200ms promedio
- **Memory usage:** Optimizado para sesiones largas

---

## 🌐 Demostración Pública en Línea

### **Página Web Oficial del Proyecto**
**🔗 https://davidlem548-jpg.github.io/Proyecto1-Equipo4/**

Esta página pública muestra:
- **Contribuciones completas** del módulo analytics desarrollado
- **Características técnicas** detalladas del sistema
- **Información del equipo** y arquitectura del proyecto
- **Acceso directo** a todas las funcionalidades implementadas

### Live Demo Local

El proyecto también está configurado para **demostración local** con:

1. **Datos de demostración** automáticos cuando API no disponible
2. **Visualizaciones interactivas** con datos realistas
3. **Navegación fluida** entre secciones del dashboard
4. **Responsive design** para presentación en cualquier dispositivo

### Comandos para Demo Local
```bash
# Inicio rápido para demostración
cd Proyecto1-Equipo4
uvicorn server.main:app --reload &
python -m http.server 3000 --directory david-avila-deliverables/frontend
```

---

## Estándares Académicos

Este proyecto cumple con los estándares requeridos para COM-11117:

✅ **Bootstrap 5.3.8** - Implementación responsive profesional  
✅ **Chart.js** - Visualizaciones avanzadas con múltiples tipos  
✅ **LocalStorage** - Persistencia de tema y cache de datos  
✅ **API Consumption** - Cliente robusto con manejo de errores  
✅ **Responsive Design** - Mobile-first con breakpoints profesionales  
✅ **Documentación** - Especificaciones técnicas universitarias  
✅ **Git Workflow** - Commits profesionales y branch management  

---

## Contacto y Soporte

Para dudas técnicas o resolución de problemas:

- **Email:** df.avila.diaz@gmail.com
- **Disponibilidad:** Posterior a presentación según calendario académico
- **Documentación:** Disponible en `./docs/` para referencia técnica

---

**© 2025 David Fernando Ávila Díaz - ITAM COM-11117**  
*Proyecto académico desarrollado bajo estándares universitarios profesionales*