from typing import Optional,List
from sqlmodel import SQLModel, Field, Relationship
from datetime import date


# -----------------------------
# Clase: Insured
# -----------------------------
class Insured(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    age: Optional[int]
    sex: Optional[str]
    education_level: Optional[str]
    occupation: Optional[str]
    hobbies: Optional[str]
    relationships: Optional[str] # [1] "husband"        "other-relative" "own-child"      "unmarried"      "wife"           "not-in-family" 
    zip_code: Optional[int] # 5 digitos
    months_as_customer: Optional[int]
    capital_gains: Optional[int]
    capital_loss: Optional[int]
    # Relación 1:N con Case.
    cases: List["Case"] = Relationship(back_populates="insured")
    
    # metodo financialScore()
    def financialScore(self):
        gains = self.capital_gains or 0
        loss = self.capital_loss or 0
        return gains - loss

# -----------------------------
# Clase: Policy
# -----------------------------
class Policy(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    policy_number: int = Field(index=True)
    bind_date: Optional[date]
    policy_state: Optional[str]
    csl: Optional[str] # Por ejemplo, [1] "250/500"  "100/300"  "500/1000"
    deductible: Optional[int]
    annual_premium: Optional[float]
    umbrella_limit: Optional[int]
    # Relación 1:N con Case.
    cases: List["Case"] = Relationship(back_populates="policy")
    
    def parseCsl(self):
        if not self.csl:
            return {"perPerson": 0, "perAccident": 0}
        parts = self.csl.split("/")
        return {
            "perPerson": int(parts[0]), # cobertura de responsabilidad civil
            "perAccident": int(parts[1]) # cobertura de daños a terceros
        }
        
    def coverageLevel(self): # nivel de cobertura
        csl = self.parseCsl()
        if csl["perAccident"] >= 750:
            return "High"
        elif csl["perAccident"] >= 450:
            return "Medium"
        else:
            return "Low"
        
    # premiumToCoverageRatio()
    
    

# -----------------------------
# Clase: Vehículo
# -----------------------------
class Vehicle(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    make: Optional[str] # marca, como "Toyota", "Ford", "Chevrolet", etc.
    model: Optional[str]
    year: Optional[int]
    # Relación 1:N con Case.
    cases: List["Case"] = Relationship(back_populates="vehicle")

# -----------------------------
# Clase: Incident
# -----------------------------
class Incident(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    date: Optional[date]
    incident_type: Optional[str] # [1] "Single Vehicle Collision" "Vehicle Theft"  "Multi-vehicle Collision"  "Parked Car"
    collision_type: Optional[str] # [1] "Side Collision"  "?"   "Rear Collision"  "Front Collision"
    incident_severity: Optional[str] # [1] "Major Damage"   "Minor Damage"   "Total Loss"     "Trivial Damage"
    authorities_contacted: Optional[str]
    incident_state: Optional[str]
    incident_city: Optional[str]
    incident_location: Optional[str]
    hour_of_day: Optional[int]
    vehicles_involved: Optional[int]
    property_damage: Optional[bool]
    bodily_injuries: Optional[int]
    witnesses: Optional[int]
    police_report_available: Optional[bool]
    # Relación 1:N con Case.
    cases: List["Case"] = Relationship(back_populates="incident")
    
    # Métodos
    # isNight() boolean (22-5 h)
    # isSevere() boolean (severity == "High" or "Medium")
    # hasLowCredibility() boolean (no testigos, no reportes, de noche)
    
# -----------------------------
# Clase: Claim
# -----------------------------
class Claim(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    total_claim_amount: Optional[int]
    injury_claim: Optional[int]
    property_claim: Optional[int]
    vehicle_claim: Optional[int]
    fraud_reported: Optional[bool]
    # Relación 1:N con Case.
    cases: List["Case"] = Relationship(back_populates="claim")
    
    # Métodos
    # isFraud() boolean (fraud_reported == "Y")
    # componentsSum() float (injury_claim + property_claim + vehicle_claim)
    # severityScore() 
    # deductibleRatio() float (deductible / componentsSum())
    
    
# -----------------------------
# Clase: Case (Agrega todas las relaciones anteriores)
# -----------------------------
class Case(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    insured_id: Optional[int] = Field(default=None, foreign_key="insured.id")
    policy_id: Optional[int] = Field(default=None, foreign_key="policy.id")
    vehicle_id: Optional[int] = Field(default=None, foreign_key="vehicle.id")
    incident_id: Optional[int] = Field(default=None, foreign_key="incident.id")
    claim_id: Optional[int] = Field(default=None, foreign_key="claim.id")
    # Relaciones inversas
    insured: Optional["Insured"] = Relationship(back_populates="cases")
    policy: Optional["Policy"] = Relationship(back_populates="cases")
    vehicle: Optional["Vehicle"] = Relationship(back_populates="cases")
    incident: Optional["Incident"] = Relationship(back_populates="cases")
    claim: Optional["Claim"] = Relationship(back_populates="cases")
    
    # Métodos
    # lossRatio() float (claim.componentsSum() / policy.annual_premium)
    # bindToIncidentDays() int (days between bind_date and incident.date)
    # riskSignals() list (list of risk signals)