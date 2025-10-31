# Insurance Management System

A full-stack web application for managing insurance policies, claims, and cases.

### Step 1: Install Dependencies

```powershell
cd server
pip install fastapi uvicorn pandas
```

### Step 2: Start the Backend

```powershell
python -m uvicorn server.main:app --reload
```

The API will be available at: **http://localhost:8000**
Data loads automatically from CSV into memory on startup.

### Step 3: Start the Frontend

Open a new terminal:
```powershell
cd client
python -m http.server 5500
```

### Step 4: Open the Application

Visit **http://localhost:5500** in your browser


## Architecture

### Backend (`server/`)
- `main.py` - FastAPI app with plain dict endpoints
- `storage.py` - In-memory storage using Python lists/dicts


### Frontend (`client/`)
- `index.html` - Dashboard with charts
- `policies.html` - Browse policies
- `claims.html` - View claims
- `js/api.js` - API client
- `css/styles.css` - Custom styles

### Data (`data/`)
- `insurance_claims_clean.csv` - Source data (1,000 records)

## How It Works

1. **Startup**: Server reads CSV and loads into Python lists
2. **Storage**: All data in memory (`insureds = []`, `policies = []`, etc.)
3. **API**: FastAPI serves data as JSON
4. **Frontend**: JavaScript fetches and displays data


Repositorio del primer proyecto de la clase de Introducción al Desarrollo Web

Integrantes:

José David Lemarroy Acuña

David Fernando Avila Díaz

Braulio Alejandro Lozano Cuevas

Mariana Marquez Gil


Para correrlo uvicorn server.main:app --reload

Para probar que funciona:

* Documentación automática: **http://127.0.0.1:8000/docs**
* Estadísticas: **http://127.0.0.1:8000/stats**
* Casos: **http://127.0.0.1:8000/cases**
* Insureds: **http://127.0.0.1:8000/insureds**
