from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import select, Session, func
from typing import Optional, Dict, Any 
from .db import init_db, get_session
from .models import (
    Insurer, InsurerCreate, InsurerUpdate,
    PolicyHolder, PolicyHolderCreate, PolicyHolderUpdate,
    Policy, PolicyCreate, PolicyUpdate,
    Claim, ClaimCreate, ClaimUpdate,
    Page
)

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

@app.get("/insurers")
def list_insurers(page: int = 1, per_page: int = 10, session: Session = Depends(get_session)):
    page, per_page = clamp_page(page), clamp_per_page(per_page)
    total = session.exec(select(func.count(Insurer.id))).one()
    insurers = session.exec(
        select(Insurer)
        .offset((page - 1) * per_page)
        .limit(per_page)
    ).all()
    return {
        "data": insurers,
        "page": Page(
            page=page,
            per_page=per_page,
            total=total
        )
    }

@app.get("/insurers/{insurer_id}")
def get_insurer(insurer_id: int, session: Session = Depends(get_session)):
    obj = session.get(Insurer, insurer_id)
    if not obj:
        raise HTTPException(404, "Insurer not found")
    return obj
    
@app.post("/insurers", status_code=201)
def create_insurer(payload: InsurerCreate, session: Session = Depends(get_session)):
    obj = Insurer(**payload.model_dump())
    session.add(obj)
    session.commit()
    session.refresh(obj)
    return obj

@app.put("/insurers/{insurer_id}")
def update_insurer(insurer_id: int, payload: InsurerUpdate, session: Session = Depends(get_session)):
    obj = session.get(Insurer, insurer_id)
    if not obj:
        raise HTTPException(404, "Insurer not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(obj, k, v)
    session.add(obj)
    session.commit()
    session.refresh(obj)
    return obj

@app.get("/policies")
def list_policies(
    page: int = 1, per_page: int = 10,
    status: Optional[str] = None, insurer_id: Optional[int] = None,
    session: Session = Depends(get_session)
):
    page, per_page = clamp_page(page), clamp_per_page(per_page)
    stmt = select(Policy)

    if status:
        stmt = stmt.where(Policy.status == status)

    if insurer_id:
        stmt = stmt.where(Policy.insurer_id == insurer_id)

    total = session.exec(select(func.count()).select_from(stmt.subquery())).one()
    items = session.exec(stmt.offset((page - 1) * per_page).limit(per_page)).all()
    return {"data": items, "page": {"page": page, "per_page": per_page, "total": total}}

@app.get("/policies/{policy_id}")
def get_policy(policy_id: int, session: Session = Depends(get_session)):
    obj = session.get(Policy, policy_id)
    if not obj:
        raise HTTPException(404, "Policy not found")
    return obj

@app.post("/policies", status_code=201)
def create_policy(payload: PolicyCreate, session: Session = Depends(get_session)):
    exists = session.exec(select(Policy).where(Policy.number == payload.number)).first()
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

    # Validating the insurer_id and policy_holder_id if they are being updated

    if "insurer_id" in data and data["insurer_id"] is not None:
        insurer_id = data.pop("insurer_id")
        insurer = session.get(Insurer, insurer_id)
        if not insurer:
            raise HTTPException(400, "Insurer does not exist")

    if "policy_holder_id" in data and data["policy_holder_id"] is not None:
        holder_id = data.pop("policy_holder_id")
        holder = session.get(PolicyHolder, holder_id)
        if not holder:
            raise HTTPException(400, "PolicyHolder does not exist")

    for k, v in data.items():
        setattr(obj, k, v)
    session.add(obj)
    session.commit()
    session.refresh(obj)
    return obj

app.get("/claims")
def list_claims(
    page: int = 1, per_page: int = 10,
    status: Optional[str] = None, policy_id: Optional[int] = None,
    session: Session = Depends(get_session)
):
    page, per_page = clamp_page(page), clamp_per_page(per_page)
    stmt = select(Claim)

    if status:
        stmt = stmt.where(Claim.status == status)

    if policy_id:
        stmt = stmt.where(Claim.policy_id == policy_id)

    total = session.exec(select(func.count()).select_from(stmt.subquery())).one()
    items = session.exec(stmt.offset((page - 1) * per_page).limit(per_page)).all()
    return {"data": items, "page": {"page": page, "per_page": per_page, "total": total}}

@app.get("/claims/{claim_id}")
def get_claim(claim_id: int, session: Session = Depends(get_session)):
    obj = session.get(Claim, claim_id)
    if not obj:
        raise HTTPException(404, "Claim not found")
    return obj

@app.post("/claims", status_code=201)
def create_claim(payload: ClaimCreate, session: Session = Depends(get_session)):
    if not session.get(Policy, payload.policy_id):
        raise HTTPException(400, "Policy does not exist")
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
    
    data = payload.model_dump(exclude_unset=True)

    if "policy_id" in data and data["policy_id"] is not None:
        if not session.get(Policy, data["policy_id"]):
            raise HTTPException(400, "New policy_id does not exist")
        
    for k, v in data.items():
        setattr(obj, k, v)
    session.add(obj)
    session.commit()
    session.refresh(obj)
    return obj


@app.get("/stats")
def stats(session: Session = Depends(get_session)):

    return {
        "total_insurers": session.exec(select(func.count(Insurer.id))).one(),
        "total_policy_holders": session.exec(select(func.count(PolicyHolder.id))).one(),
        "total_policies": session.exec(select(func.count(Policy.id))).one(),
        "total_claims": session.exec(select(func.count(Claim.id))).one(),
        "open_claims": session.exec(
            select(func.count(Claim.id)).where(Claim.status == "open")
        ).one(),
        "total_claims_amount": session.exec(
            select(func.coalesce(func.sum(Claim.amount), 0))
        ).one()
    }

