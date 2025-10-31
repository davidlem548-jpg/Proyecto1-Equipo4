"""
Simple FastAPI backend without SQLModel or Pydantic.
Data stored in memory using plain Python dictionaries and lists.
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import os

# Import our in-memory storage
from server import storage

app = FastAPI(title="Insurance Management API - In Memory", version="2.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    """Load data from CSV on startup"""
    csv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'insurance_claims_clean_v2.csv')
    if os.path.exists(csv_path):
        print(f"Loading data from {csv_path}...")
        stats = storage.load_data_from_csv(csv_path)
        print(f"✅ Loaded {stats['total_cases']} cases into memory!")
    else:
        print("⚠️  No CSV file found. Starting with empty data.")

@app.get("/health")
def health():
    """Health check endpoint"""
    return {"status": "ok", "storage": "in-memory"}

@app.get("/stats")
def get_stats():
    """Get overall statistics"""
    return storage.get_stats()

# ============================================
# INSURED ENDPOINTS
# ============================================
@app.get("/insureds")
def list_insureds(page: int = 1, per_page: int = 10):
    """List all insureds with pagination"""
    page = max(1, page)
    per_page = max(1, min(per_page, 100))
    skip = (page - 1) * per_page
    
    data = storage.get_all_insureds(skip=skip, limit=per_page)
    total = len(storage.insureds)
    
    return {
        "data": data,
        "page": {
            "page": page,
            "per_page": per_page,
            "total": total
        }
    }

@app.get("/insureds/{insured_id}")
def get_insured(insured_id: int):
    """Get specific insured by ID"""
    insured = storage.get_insured(insured_id)
    if not insured:
        raise HTTPException(404, "Insured not found")
    return insured

@app.post("/insureds")
def create_insured(data: dict):
    """Create new insured"""
    return storage.create_insured(data)

@app.put("/insureds/{insured_id}")
def update_insured(insured_id: int, data: dict):
    """Update insured"""
    insured = storage.update_insured(insured_id, data)
    if not insured:
        raise HTTPException(404, "Insured not found")
    return insured

# ============================================
# POLICY ENDPOINTS
# ============================================
@app.get("/policies")
def list_policies(page: int = 1, per_page: int = 10, policy_state: Optional[str] = None):
    """List all policies with pagination and optional state filter"""
    page = max(1, page)
    per_page = max(1, min(per_page, 100))
    skip = (page - 1) * per_page
    
    data = storage.get_all_policies(skip=skip, limit=per_page, policy_state=policy_state)
    
    # Count total based on filter
    if policy_state:
        total = len([p for p in storage.policies if p.get('policy_state') == policy_state])
    else:
        total = len(storage.policies)
    
    return {
        "data": data,
        "page": {
            "page": page,
            "per_page": per_page,
            "total": total
        }
    }

@app.get("/policies/{policy_id}")
def get_policy(policy_id: int):
    """Get specific policy by ID"""
    policy = storage.get_policy(policy_id)
    if not policy:
        raise HTTPException(404, "Policy not found")
    return policy

@app.post("/policies")
def create_policy(data: dict):
    """Create new policy"""
    # Check if policy_number already exists
    if any(p.get('policy_number') == data.get('policy_number') for p in storage.policies):
        raise HTTPException(400, "Policy number already exists")
    return storage.create_policy(data)

@app.put("/policies/{policy_id}")
def update_policy(policy_id: int, data: dict):
    """Update policy"""
    policy = storage.update_policy(policy_id, data)
    if not policy:
        raise HTTPException(404, "Policy not found")
    return policy

@app.get("/policies/{policy_id}/coverage-level")
def get_policy_coverage_level(policy_id: int):
    """Get policy coverage level"""
    policy = storage.get_policy(policy_id)
    if not policy:
        raise HTTPException(404, "Policy not found")
    
    # Calculate coverage level from CSL
    csl = policy.get('csl', '')
    if '/' in csl:
        parts = csl.split('/')
        per_accident = int(parts[1])
        if per_accident >= 750:
            level = "High"
        elif per_accident >= 450:
            level = "Medium"
        else:
            level = "Low"
    else:
        level = "Unknown"
    
    return {"coverage_level": level}

# ============================================
# VEHICLE ENDPOINTS
# ============================================
@app.get("/vehicles")
def list_vehicles(page: int = 1, per_page: int = 10):
    """List all vehicles with pagination"""
    page = max(1, page)
    per_page = max(1, min(per_page, 100))
    skip = (page - 1) * per_page
    
    data = storage.get_all_vehicles(skip=skip, limit=per_page)
    total = len(storage.vehicles)
    
    return {
        "data": data,
        "page": {
            "page": page,
            "per_page": per_page,
            "total": total
        }
    }

@app.get("/vehicles/{vehicle_id}")
def get_vehicle(vehicle_id: int):
    """Get specific vehicle by ID"""
    vehicle = storage.get_vehicle(vehicle_id)
    if not vehicle:
        raise HTTPException(404, "Vehicle not found")
    return vehicle

@app.post("/vehicles")
def create_vehicle(data: dict):
    """Create new vehicle"""
    return storage.create_vehicle(data)

@app.put("/vehicles/{vehicle_id}")
def update_vehicle(vehicle_id: int, data: dict):
    """Update vehicle"""
    vehicle = storage.update_vehicle(vehicle_id, data)
    if not vehicle:
        raise HTTPException(404, "Vehicle not found")
    return vehicle

# ============================================
# INCIDENT ENDPOINTS
# ============================================
@app.get("/incidents")
def list_incidents(page: int = 1, per_page: int = 10):
    """List all incidents with pagination"""
    page = max(1, page)
    per_page = max(1, min(per_page, 100))
    skip = (page - 1) * per_page
    
    data = storage.get_all_incidents(skip=skip, limit=per_page)
    total = len(storage.incidents)
    
    return {
        "data": data,
        "page": {
            "page": page,
            "per_page": per_page,
            "total": total
        }
    }

@app.get("/incidents/{incident_id}")
def get_incident(incident_id: int):
    """Get specific incident by ID"""
    incident = storage.get_incident(incident_id)
    if not incident:
        raise HTTPException(404, "Incident not found")
    return incident

@app.post("/incidents")
def create_incident(data: dict):
    """Create new incident"""
    return storage.create_incident(data)

@app.put("/incidents/{incident_id}")
def update_incident(incident_id: int, data: dict):
    """Update incident"""
    incident = storage.update_incident(incident_id, data)
    if not incident:
        raise HTTPException(404, "Incident not found")
    return incident

# ============================================
# CLAIM ENDPOINTS
# ============================================
@app.get("/claims")
def list_claims(page: int = 1, per_page: int = 10):
    """List all claims with pagination"""
    page = max(1, page)
    per_page = max(1, min(per_page, 100))
    skip = (page - 1) * per_page
    
    data = storage.get_all_claims(skip=skip, limit=per_page)
    total = len(storage.claims)
    
    return {
        "data": data,
        "page": {
            "page": page,
            "per_page": per_page,
            "total": total
        }
    }

@app.get("/claims/{claim_id}")
def get_claim(claim_id: int):
    """Get specific claim by ID"""
    claim = storage.get_claim(claim_id)
    if not claim:
        raise HTTPException(404, "Claim not found")
    return claim

@app.post("/claims")
def create_claim(data: dict):
    """Create new claim"""
    return storage.create_claim(data)

@app.put("/claims/{claim_id}")
def update_claim(claim_id: int, data: dict):
    """Update claim"""
    claim = storage.update_claim(claim_id, data)
    if not claim:
        raise HTTPException(404, "Claim not found")
    return claim

@app.get("/claims/{claim_id}/fraud-check")
def get_claim_fraud_check(claim_id: int):
    """Check if claim is fraudulent"""
    claim = storage.get_claim(claim_id)
    if not claim:
        raise HTTPException(404, "Claim not found")
    return {"fraud_reported": claim.get('fraud_reported', False)}

# ============================================
# CASE ENDPOINTS
# ============================================
@app.get("/cases")
def list_cases(page: int = 1, per_page: int = 10):
    """List all cases with pagination"""
    page = max(1, page)
    per_page = max(1, min(per_page, 100))
    skip = (page - 1) * per_page
    
    data = storage.get_all_cases(skip=skip, limit=per_page)
    total = len(storage.cases)
    
    return {
        "data": data,
        "page": {
            "page": page,
            "per_page": per_page,
            "total": total
        }
    }

@app.get("/cases/{case_id}")
def get_case(case_id: int):
    """Get specific case by ID with all related data"""
    case = storage.get_case(case_id)
    if not case:
        raise HTTPException(404, "Case not found")
    return case

@app.post("/cases")
def create_case(data: dict):
    """Create new case"""
    # Validate foreign keys exist
    if data.get('insured_id') and not storage.get_insured(data['insured_id']):
        raise HTTPException(400, "Insured does not exist")
    if data.get('policy_id') and not storage.get_policy(data['policy_id']):
        raise HTTPException(400, "Policy does not exist")
    if data.get('vehicle_id') and not storage.get_vehicle(data['vehicle_id']):
        raise HTTPException(400, "Vehicle does not exist")
    if data.get('incident_id') and not storage.get_incident(data['incident_id']):
        raise HTTPException(400, "Incident does not exist")
    if data.get('claim_id') and not storage.get_claim(data['claim_id']):
        raise HTTPException(400, "Claim does not exist")
    
    return storage.create_case(data)

@app.put("/cases/{case_id}")
def update_case(case_id: int, data: dict):
    """Update case"""
    # Validate foreign keys if being updated
    if 'insured_id' in data and data['insured_id'] and not storage.get_insured(data['insured_id']):
        raise HTTPException(400, "Insured does not exist")
    if 'policy_id' in data and data['policy_id'] and not storage.get_policy(data['policy_id']):
        raise HTTPException(400, "Policy does not exist")
    if 'vehicle_id' in data and data['vehicle_id'] and not storage.get_vehicle(data['vehicle_id']):
        raise HTTPException(400, "Vehicle does not exist")
    if 'incident_id' in data and data['incident_id'] and not storage.get_incident(data['incident_id']):
        raise HTTPException(400, "Incident does not exist")
    if 'claim_id' in data and data['claim_id'] and not storage.get_claim(data['claim_id']):
        raise HTTPException(400, "Claim does not exist")
    
    case = storage.update_case(case_id, data)
    if not case:
        raise HTTPException(404, "Case not found")
    return case
