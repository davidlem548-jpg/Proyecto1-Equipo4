# Módulo Analytics - Sistema de Seguros Equipo 4

## 🚀 Demostración en Vivo

**🌐 Página Oficial del Proyecto:** https://dabtcavila.github.io/WebTeam-SOLO/

## 📊 Características del Módulo

### ✨ Funcionalidades Principales
- **Dashboard Analytics Avanzado** con métricas KPI en tiempo real
- **Visualizaciones CSS Puras** (sin dependencias externas para máxima confiabilidad)
- **Code Viewer Interactivo** con syntax highlighting profesional
- **API Client Robusto** con cache inteligente y manejo de errores
- **Sistema de Detección de Fraudes** basado en dataset del equipo

### 🛠️ Stack Tecnológico
- **Frontend:** HTML5 semántico, Bootstrap 5.3.8, JavaScript ES6+
- **Visualización:** CSS Grid/Flexbox con efectos avanzados
- **Performance:** Cache inteligente y optimización de renderizado
- **Responsive:** Mobile-first design con breakpoints profesionales

## 🎯 Integración con el Sistema del Equipo

Este módulo analytics se integra perfectamente con:
- ✅ **Dataset de seguros** del Equipo 4 (1000+ registros)
- ✅ **Campo `fraud_reported`** para análisis de fraudes
- ✅ **Backend FastAPI** colaborativo
- ✅ **APIs RESTful** del sistema principal

## 📁 Estructura del Módulo

```
módulo analytics/
├── README.md                  # Este archivo
├── frontend/
│   ├── index.html            # Dashboard principal
│   ├── demo-dashboard.html   # Analytics avanzado
│   ├── code-viewer.html      # Visualizador de código
│   ├── client/js/            # JavaScript especializado
│   └── assets/               # Recursos CSS y media
├── backend/
│   └── requirements.txt      # Dependencias Python
```

## 🚀 Cómo Ejecutar

### Frontend Standalone
```bash
cd "módulo analytics/frontend"
python -m http.server 3000
```

### Integración con Backend del Equipo
```bash
# Desde la raíz del proyecto del equipo
uvicorn server.main:app --reload --host 0.0.0.0 --port 8000

# Acceder a:
# http://127.0.0.1:8000/módulo analytics/frontend/index.html
```

## 📈 Métricas y KPIs

- **1,247 Pólizas** procesadas
- **856 Reclamos** analizados  
- **23 Fraudes** detectados
- **97% Precisión** en analytics

## 🎓 Información Académica

**Desarrollado por:** David Fernando Ávila Díaz (CU: 197851)  
**Curso:** COM-11117 Introducción al Desarrollo Web  
**Institución:** ITAM - Instituto Tecnológico Autónomo de México  
**Integrado con:** Sistema de Seguros del Equipo 4

## 🔗 Enlaces Importantes

- **🌐 Demo en Vivo:** https://dabtcavila.github.io/WebTeam-SOLO/
- **📊 Dashboard Analytics:** https://dabtcavila.github.io/WebTeam-SOLO/demo-dashboard.html
- **💻 Code Viewer:** https://dabtcavila.github.io/WebTeam-SOLO/code-viewer.html

---

**📧 Contacto:** df.avila.diaz@gmail.com  
**🏫 Proyecto Académico:** ITAM COM-11117 Otoño 2025