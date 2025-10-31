from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import select, Session, func
from typing import Optional, Dict
from pydantic import BaseModel
from .db import init_db, get_session
from .models import (
    Insured, Policy, Vehicle, Incident, Claim, Case
)

# Pydantic schemas para request/response
class Page(BaseModel):
    page: int
    per_page: int
    total: int

# Case response para obtener los datos de los objetos relacionados
class CaseResponse(BaseModel): 
    id: Optional[int] = None
    insured_id: Optional[int] = None
    policy_id: Optional[int] = None
    vehicle_id: Optional[int] = None
    incident_id: Optional[int] = None
    claim_id: Optional[int] = None
    insured: Optional[Insured] = None
    policy: Optional[Policy] = None
    vehicle: Optional[Vehicle] = None
    incident: Optional[Incident] = None
    claim: Optional[Claim] = None

app = FastAPI(title="API de Seguros", version="1.0.0")

app.add_middleware( # Para permitir solicitudes desde el frontend
    CORSMiddleware, 
    allow_origins=[ 
        "http://127.0.0.1:5500", 
        "http://localhost:5500", 
        "http://localhost:3000", 
        "http://localhost:5173", 
        "https://BraulioLoz.github.io/Dashboard-Seguros",
        "*"], # Permite cualquier origen
    allow_credentials=True,
    allow_methods=["*"], # Permite cualquier método
    allow_headers=["*"], # Permite cualquier encabezado
)

@app.on_event("startup") # Se ejecuta al inicio de la aplicación
def on_startup(): 
    init_db() 
    
@app.get("/")
def root():
    return {
        "message": "API de Seguros",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "health": "/health",
            "documentation": "/docs",
            "stats": "/stats",
            "insureds": "/insureds",
            "policies": "/policies",
            "vehicles": "/vehicles",
            "incidents": "/incidents",
            "claims": "/claims",
            "cases": "/cases"
        }
    }

@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok"}

def clamp_page(page: int) -> int:
    return 1 if page < 1 else page

def clamp_per_page(per_page: int) -> int:
    # evita abuso y asegura experiencia estable
    if per_page < 1: return 10
    if per_page > 100: return 100
    return per_page

# Insured endpoints
@app.get("/insureds") 
def list_insureds(page: int = 1, per_page: int = 10, session: Session = Depends(get_session)):
    page, per_page = clamp_page(page), clamp_per_page(per_page)
    total = session.exec(select(func.count(Insured.id))).one()
    insureds = session.exec(
        select(Insured)
        .offset((page - 1) * per_page)
        .limit(per_page)
    ).all()
    return {
        "data": insureds,
        "page": Page(
            page=page,
            per_page=per_page,
            total=total
        )
    }

@app.get("/insureds/{insured_id}")
def get_insured(insured_id: int, session: Session = Depends(get_session)):
    obj = session.get(Insured, insured_id)
    if not obj:
        raise HTTPException(404, "Insured not found")
    return obj


# Policy endpoints
@app.get("/policies")
def list_policies(
    page: int = 1, per_page: int = 10,
    policy_state: Optional[str] = None,
    session: Session = Depends(get_session)
):
    page, per_page = clamp_page(page), clamp_per_page(per_page)
    stmt = select(Policy)

    if policy_state:
        stmt = stmt.where(Policy.policy_state == policy_state)

    total = session.exec(select(func.count()).select_from(stmt.subquery())).one()
    items = session.exec(stmt.offset((page - 1) * per_page).limit(per_page)).all()
    return {"data": items, "page": Page(page=page, per_page=per_page, total=total)}

@app.get("/policies/{policy_id}")
def get_policy(policy_id: int, session: Session = Depends(get_session)):
    obj = session.get(Policy, policy_id)
    if not obj:
        raise HTTPException(404, "Policy not found")
    return obj


@app.get("/policies/{policy_id}/coverage-level")
def get_policy_coverage_level(policy_id: int, session: Session = Depends(get_session)):
    obj = session.get(Policy, policy_id)
    if not obj:
        raise HTTPException(404, "Policy not found")
    return {"coverage_level": obj.coverageLevel()}

# Vehicle endpoints
@app.get("/vehicles")
def list_vehicles(page: int = 1, per_page: int = 10, session: Session = Depends(get_session)):
    page, per_page = clamp_page(page), clamp_per_page(per_page)
    total = session.exec(select(func.count(Vehicle.id))).one()
    vehicles = session.exec(
        select(Vehicle)
        .offset((page - 1) * per_page)
        .limit(per_page)
    ).all()
    return {
        "data": vehicles,
        "page": Page(page=page, per_page=per_page, total=total)
    }

@app.get("/vehicles/{vehicle_id}")
def get_vehicle(vehicle_id: int, session: Session = Depends(get_session)):
    obj = session.get(Vehicle, vehicle_id)
    if not obj:
        raise HTTPException(404, "Vehicle not found")
    return obj


# Incident endpoints
@app.get("/incidents")
def list_incidents(page: int = 1, per_page: int = 10, session: Session = Depends(get_session)):
    page, per_page = clamp_page(page), clamp_per_page(per_page)
    total = session.exec(select(func.count(Incident.id))).one()
    incidents = session.exec(
        select(Incident)
        .offset((page - 1) * per_page)
        .limit(per_page)
    ).all()
    return {
        "data": incidents,
        "page": Page(page=page, per_page=per_page, total=total)
    }

@app.get("/incidents/map-data")
def get_incident_map_data(session: Session = Depends(get_session)):
    """Regresa los incidents con datos de ubicación para visualización en el mapa"""
    try:
        # Obtener todos los casos con sus relaciones
        cases = session.exec(
            select(Case, Incident, Claim)
            .join(Incident, Case.incident_id == Incident.id)
            .join(Claim, Case.claim_id == Claim.id)
        ).all()
        
        result = []
        for case, incident, claim in cases:
            incident_data = {
                "id": incident.id,
                "state": incident.incident_state or "",
                "city": incident.incident_city or "",
                "location": incident.incident_location or "",
                "severity": incident.incident_severity or "",
                "type": incident.incident_type or "",
                "fraud_reported": claim.fraud_reported if claim else False  # ✅ Añadir fraude
            }
            if incident.date:
                incident_data["date"] = incident.date.isoformat()
            result.append(incident_data)
        return result
    except Exception as e:
        print(f"Error in /incidents/map-data: {e}")
        return []

@app.get("/incidents/{incident_id}")
def get_incident(incident_id: int, session: Session = Depends(get_session)):
    obj = session.get(Incident, incident_id)
    if not obj:
        raise HTTPException(404, "Incident not found")
    return obj


# Claim endpoints
@app.get("/claims")
def list_claims(page: int = 1, per_page: int = 10, session: Session = Depends(get_session)):
    page, per_page = clamp_page(page), clamp_per_page(per_page)
    total = session.exec(select(func.count(Claim.id))).one()
    claims = session.exec(
        select(Claim)
        .offset((page - 1) * per_page)
        .limit(per_page)
    ).all()
    return {
        "data": claims,
        "page": Page(page=page, per_page=per_page, total=total)
    }

@app.get("/claims/{claim_id}")
def get_claim(claim_id: int, session: Session = Depends(get_session)):
    obj = session.get(Claim, claim_id)
    if not obj:
        raise HTTPException(404, "Claim not found")
    return obj



@app.get("/claims/{claim_id}/fraud-check")
def get_claim_fraud_check(claim_id: int, session: Session = Depends(get_session)):
    obj = session.get(Claim, claim_id)
    if not obj:
        raise HTTPException(404, "Claim not found")
    return {"fraud_reported": obj.fraud_reported}

# Case endpoints
@app.get("/cases")
def list_cases(page: int = 1, per_page: int = 10, session: Session = Depends(get_session)):
    page, per_page = clamp_page(page), clamp_per_page(per_page)
    total = session.exec(select(func.count(Case.id))).one()
    cases = session.exec(
        select(Case)
        .offset((page - 1) * per_page)
        .limit(per_page)
    ).all()
    return {
        "data": cases,
        "page": Page(page=page, per_page=per_page, total=total)
    }

@app.get("/cases/{case_id}")
def get_case(case_id: int, session: Session = Depends(get_session)):
    obj = session.get(Case, case_id)
    if not obj:
        raise HTTPException(404, "Case not found")
    
    # Load related objects
    session.refresh(obj)
    return CaseResponse(
        id=obj.id,
        insured_id=obj.insured_id,
        policy_id=obj.policy_id,
        vehicle_id=obj.vehicle_id,
        incident_id=obj.incident_id,
        claim_id=obj.claim_id,
        insured=obj.insured,
        policy=obj.policy,
        vehicle=obj.vehicle,
        incident=obj.incident,
        claim=obj.claim
    )


@app.get("/stats")
def stats(session: Session = Depends(get_session)):
    claims_amount = session.exec(
        select(func.coalesce(func.sum(Claim.total_claim_amount), 0)) 
    ).one()
    claims_amount_with_fraud = session.exec(
        select(func.coalesce(func.sum(Claim.total_claim_amount), 0)).where(Claim.fraud_reported == True)
    ).one()
    
    return {
        "total_insureds": session.exec(select(func.count(Insured.id))).one(),
        "total_policies": session.exec(select(func.count(Policy.id))).one(),
        "total_vehicles": session.exec(select(func.count(Vehicle.id))).one(),
        "total_incidents": session.exec(select(func.count(Incident.id))).one(),
        "total_claims": session.exec(select(func.count(Claim.id))).one(),
        "total_cases": session.exec(select(func.count(Case.id))).one(),
        "fraud_claims": session.exec(
            select(func.count(Claim.id)).where(Claim.fraud_reported == True)
        ).one(),
        "total_claims_amount": claims_amount - claims_amount_with_fraud
    }

# New endpoints for dashboard

@app.get("/stats/fraud-analysis")
def fraud_analysis(session: Session = Depends(get_session)):
    """Estadísticas detalladas de fraude"""
    # Get all cases with related claims
    cases = session.exec(select(Case)).all()
    
    # Group by severity
    severity_counts = {}
    state_counts = {}
    type_counts = {}
    
    for case in cases:
        if case.incident_id and case.claim_id:
            # Get incident and claim
            incident = session.get(Incident, case.incident_id)
            claim = session.get(Claim, case.claim_id)
            
            if incident and claim and claim.fraud_reported:
                # By severity
                severity = incident.incident_severity or "Unknown"
                severity_counts[severity] = severity_counts.get(severity, 0) + 1
                
                # By state
                state = incident.incident_state or "Unknown"
                state_counts[state] = state_counts.get(state, 0) + 1
                
                # By type
                incident_type = incident.incident_type or "Unknown"
                type_counts[incident_type] = type_counts.get(incident_type, 0) + 1
    
    return {
        "by_severity": severity_counts,
        "by_state": state_counts,
        "by_type": type_counts
    }

@app.get("/stats/time-series")
def time_series(session: Session = Depends(get_session)):
    """Pólizas a lo largo del tiempo para tendencias"""
    # Get all cases
    cases = session.exec(select(Case)).all()
    
    # Group by month
    monthly_data = {}
    fraud_monthly = {}
    
    for case in cases:
        if case.incident_id and case.claim_id:
            # Get incident and claim
            incident = session.get(Incident, case.incident_id)
            claim = session.get(Claim, case.claim_id)
            
            if incident and incident.date:
                month_key = incident.date.strftime('%Y-%m')
                monthly_data[month_key] = monthly_data.get(month_key, 0) + 1
                if claim and claim.fraud_reported:
                    fraud_monthly[month_key] = fraud_monthly.get(month_key, 0) + 1
    
    # Sort by date
    sorted_months = sorted(monthly_data.keys())
    
    return {
        "dates": sorted_months,
        "counts": [monthly_data[m] for m in sorted_months],
        "fraud_counts": [fraud_monthly.get(m, 0) for m in sorted_months],
        "fraud_rates": [
            round((fraud_monthly.get(m, 0) / monthly_data[m] * 100), 1) if monthly_data[m] > 0 else 0
            for m in sorted_months
        ]
    }

