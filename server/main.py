from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import select, Session, func
from typing import Optional, Dict, Any, List
from pydantic import BaseModel
from datetime import date
from .db import init_db, get_session
from .models import (
    Insured, Policy, Vehicle, Incident, Claim, Case
)

# Pydantic schemas for request/response
class Page(BaseModel):
    page: int
    per_page: int
    total: int

# Insured schemas
class InsuredCreate(BaseModel):
    age: Optional[int] = None
    sex: Optional[str] = None
    education_level: Optional[str] = None
    occupation: Optional[str] = None
    hobbies: Optional[str] = None
    relationships: Optional[str] = None
    zip_code: Optional[int] = None
    months_as_customer: Optional[int] = None
    capital_gains: Optional[int] = None
    capital_loss: Optional[int] = None

class InsuredUpdate(BaseModel):
    age: Optional[int] = None
    sex: Optional[str] = None
    education_level: Optional[str] = None
    occupation: Optional[str] = None
    hobbies: Optional[str] = None
    relationships: Optional[str] = None
    zip_code: Optional[int] = None
    months_as_customer: Optional[int] = None
    capital_gains: Optional[int] = None
    capital_loss: Optional[int] = None

# Policy schemas
class PolicyCreate(BaseModel):
    policy_number: int
    bind_date: Optional[date] = None
    policy_state: Optional[str] = None
    csl: Optional[str] = None
    deductible: Optional[int] = None
    annual_premium: Optional[float] = None
    umbrella_limit: Optional[int] = None

class PolicyUpdate(BaseModel):
    policy_number: Optional[int] = None
    bind_date: Optional[date] = None
    policy_state: Optional[str] = None
    csl: Optional[str] = None
    deductible: Optional[int] = None
    annual_premium: Optional[float] = None
    umbrella_limit: Optional[int] = None

# Vehicle schemas
class VehicleCreate(BaseModel):
    make: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None

class VehicleUpdate(BaseModel):
    make: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None

# Incident schemas
class IncidentCreate(BaseModel):
    date: Optional[date] = None
    incident_type: Optional[str] = None
    collision_type: Optional[str] = None
    incident_severity: Optional[str] = None
    authorities_contacted: Optional[str] = None
    incident_state: Optional[str] = None
    incident_city: Optional[str] = None
    incident_location: Optional[str] = None
    hour_of_day: Optional[int] = None
    vehicles_involved: Optional[int] = None
    property_damage: Optional[bool] = None
    bodily_injuries: Optional[int] = None
    witnesses: Optional[int] = None
    police_report_available: Optional[bool] = None

class IncidentUpdate(BaseModel):
    date: Optional[date] = None
    incident_type: Optional[str] = None
    collision_type: Optional[str] = None
    incident_severity: Optional[str] = None
    authorities_contacted: Optional[str] = None
    incident_state: Optional[str] = None
    incident_city: Optional[str] = None
    incident_location: Optional[str] = None
    hour_of_day: Optional[int] = None
    vehicles_involved: Optional[int] = None
    property_damage: Optional[bool] = None
    bodily_injuries: Optional[int] = None
    witnesses: Optional[int] = None
    police_report_available: Optional[bool] = None

# Claim schemas
class ClaimCreate(BaseModel):
    total_claim_amount: Optional[int] = None
    injury_claim: Optional[int] = None
    property_claim: Optional[int] = None
    vehicle_claim: Optional[int] = None
    fraud_reported: Optional[bool] = None

class ClaimUpdate(BaseModel):
    total_claim_amount: Optional[int] = None
    injury_claim: Optional[int] = None
    property_claim: Optional[int] = None
    vehicle_claim: Optional[int] = None
    fraud_reported: Optional[bool] = None

# Case schemas
class CaseCreate(BaseModel):
    insured_id: Optional[int] = None
    policy_id: Optional[int] = None
    vehicle_id: Optional[int] = None
    incident_id: Optional[int] = None
    claim_id: Optional[int] = None

class CaseUpdate(BaseModel):
    insured_id: Optional[int] = None
    policy_id: Optional[int] = None
    vehicle_id: Optional[int] = None
    incident_id: Optional[int] = None
    claim_id: Optional[int] = None

# Case response with nested objects
class CaseResponse(BaseModel):  # ← Heredar de BaseModel, no de Case
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

app = FastAPI(title="Insurance Management API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "http://localhost:3000",
        "http://localhost:5173",
        "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

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
    
@app.post("/insureds", status_code=201)
def create_insured(payload: InsuredCreate, session: Session = Depends(get_session)):
    obj = Insured(**payload.model_dump())
    session.add(obj)
    session.commit()
    session.refresh(obj)
    return obj

@app.put("/insureds/{insured_id}")
def update_insured(insured_id: int, payload: InsuredUpdate, session: Session = Depends(get_session)):
    obj = session.get(Insured, insured_id)
    if not obj:
        raise HTTPException(404, "Insured not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(obj, k, v)
    session.add(obj)
    session.commit()
    session.refresh(obj)
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

@app.post("/policies", status_code=201)
def create_policy(payload: PolicyCreate, session: Session = Depends(get_session)):
    exists = session.exec(select(Policy).where(Policy.policy_number == payload.policy_number)).first()
    if exists:
        raise HTTPException(400, "Policy already exists")
    obj = Policy(**payload.model_dump())
    session.add(obj)
    session.commit()
    session.refresh(obj)
    return obj

@app.put("/policies/{policy_id}")
def update_policy(policy_id: int, payload: PolicyUpdate, session: Session = Depends(get_session)):
    obj = session.get(Policy, policy_id)
    if not obj:
        raise HTTPException(404, "Policy not found")
    
    data = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(obj, k, v)
    session.add(obj)
    session.commit()
    session.refresh(obj)
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

@app.post("/vehicles", status_code=201)
def create_vehicle(payload: VehicleCreate, session: Session = Depends(get_session)):
    obj = Vehicle(**payload.model_dump())
    session.add(obj)
    session.commit()
    session.refresh(obj)
    return obj

@app.put("/vehicles/{vehicle_id}")
def update_vehicle(vehicle_id: int, payload: VehicleUpdate, session: Session = Depends(get_session)):
    obj = session.get(Vehicle, vehicle_id)
    if not obj:
        raise HTTPException(404, "Vehicle not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(obj, k, v)
    session.add(obj)
    session.commit()
    session.refresh(obj)
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

@app.get("/incidents/{incident_id}")
def get_incident(incident_id: int, session: Session = Depends(get_session)):
    obj = session.get(Incident, incident_id)
    if not obj:
        raise HTTPException(404, "Incident not found")
    return obj

@app.post("/incidents", status_code=201)
def create_incident(payload: IncidentCreate, session: Session = Depends(get_session)):
    obj = Incident(**payload.model_dump())
    session.add(obj)
    session.commit()
    session.refresh(obj)
    return obj

@app.put("/incidents/{incident_id}")
def update_incident(incident_id: int, payload: IncidentUpdate, session: Session = Depends(get_session)):
    obj = session.get(Incident, incident_id)
    if not obj:
        raise HTTPException(404, "Incident not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(obj, k, v)
    session.add(obj)
    session.commit()
    session.refresh(obj)
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

@app.post("/claims", status_code=201)
def create_claim(payload: ClaimCreate, session: Session = Depends(get_session)):
    obj = Claim(**payload.model_dump())
    session.add(obj)
    session.commit()
    session.refresh(obj)
    return obj

@app.put("/claims/{claim_id}")
def update_claim(claim_id: int, payload: ClaimUpdate, session: Session = Depends(get_session)):
    obj = session.get(Claim, claim_id)
    if not obj:
        raise HTTPException(404, "Claim not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(obj, k, v)
    session.add(obj)
    session.commit()
    session.refresh(obj)
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

@app.post("/cases", status_code=201)
def create_case(payload: CaseCreate, session: Session = Depends(get_session)):
    # Validate foreign keys exist
    if payload.insured_id and not session.get(Insured, payload.insured_id):
        raise HTTPException(400, "Insured does not exist")
    if payload.policy_id and not session.get(Policy, payload.policy_id):
        raise HTTPException(400, "Policy does not exist")
    if payload.vehicle_id and not session.get(Vehicle, payload.vehicle_id):
        raise HTTPException(400, "Vehicle does not exist")
    if payload.incident_id and not session.get(Incident, payload.incident_id):
        raise HTTPException(400, "Incident does not exist")
    if payload.claim_id and not session.get(Claim, payload.claim_id):
        raise HTTPException(400, "Claim does not exist")
    
    obj = Case(**payload.model_dump())
    session.add(obj)
    session.commit()
    session.refresh(obj)
    return obj

@app.put("/cases/{case_id}")
def update_case(case_id: int, payload: CaseUpdate, session: Session = Depends(get_session)):
    obj = session.get(Case, case_id)
    if not obj:
        raise HTTPException(404, "Case not found")
    
    data = payload.model_dump(exclude_unset=True)
    
    # Validate foreign keys if being updated
    if "insured_id" in data and data["insured_id"] and not session.get(Insured, data["insured_id"]):
        raise HTTPException(400, "Insured does not exist")
    if "policy_id" in data and data["policy_id"] and not session.get(Policy, data["policy_id"]):
        raise HTTPException(400, "Policy does not exist")
    if "vehicle_id" in data and data["vehicle_id"] and not session.get(Vehicle, data["vehicle_id"]):
        raise HTTPException(400, "Vehicle does not exist")
    if "incident_id" in data and data["incident_id"] and not session.get(Incident, data["incident_id"]):
        raise HTTPException(400, "Incident does not exist")
    if "claim_id" in data and data["claim_id"] and not session.get(Claim, data["claim_id"]):
        raise HTTPException(400, "Claim does not exist")
    
    for k, v in data.items():
        setattr(obj, k, v)
    session.add(obj)
    session.commit()
    session.refresh(obj)
    return obj

@app.get("/stats")
def stats(session: Session = Depends(get_session)):
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
        "total_claims_amount": session.exec(
            select(func.coalesce(func.sum(Claim.total_claim_amount), 0))
        ).one()
    }

