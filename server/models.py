from typing import Optional,List
from sqlmodel import SQLModel, Field, Relationship
from datetime import date

class Insurer(SQLModel, talble = True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    country : str
    policies: List["Policy"] = Relationship(back_populates="insurer")

class PolicyHolder(SQLModel, table = True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    birth_date: date
    policies: List["Policy"] = Relationship(back_populates="holder")

class Policy(SQLModel, table = True):

    id: Optional[int] = Field(default=None, primary_key=True)
    policy_number: str = Field(index=True, unique=True)
    premium: float = 0.0

    holder_id: Optional[int] = Field(default=None, foreign_key="policyholder.id")
    insurer_id: Optional[int] = Field(default=None, foreign_key="insurer.id")
    insurer: Optional[Insurer] = Relationship(back_populates="policies")
    holder: Optional[PolicyHolder] = Relationship(back_populates="policies")

    start_date: date
    end_date: date

    status: str = Field(default="activa", index=True) 

class Claim(SQLModel, table = True):
    id: Optional[int] = Field(default=None, primary_key=True)
    policy_id: Optional[int] = Field(default=None, foreign_key="policy.id")
    policy: Optional[Policy] = Relationship()
    claim_date: date
    amount: float
    description: str
    status: str = Field(default="pendiente", index=True)
    

# JSON validation and data transfer objects (DTOs)
class Page(SQLModel):
    page:int
    per_page:int
    total:int

class InsurerCreate(SQLModel):
    name: str
    country: str
class InsurerUpdate(SQLModel):
    name: Optional[str] = None
    country: Optional[str] = None
    
class PolicyHolderCreate(SQLModel):
    name: str
    birth_date: date
class PolicyHolderUpdate(SQLModel):
    name: Optional[str] = None
    birth_date: Optional[date] = None

class PolicyCreate(SQLModel):
    policy_number: str
    premium: float
    holder_id: int
    insurer_id: int
    start_date: date
    end_date: date

class PolicyUpdate(SQLModel):
    policy_number: Optional[str] = None
    premium: Optional[float] = None
    holder_id: Optional[int] = None
    insurer_id: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[str] = None

class ClaimCreate(SQLModel):
    policy_id: int
    claim_date: date
    amount: float
    description: str

class ClaimUpdate(SQLModel):
    policy_id: Optional[int] = None
    claim_date: Optional[date] = None
    amount: Optional[float] = None
    description: Optional[str] = None
    status: Optional[str] = None





