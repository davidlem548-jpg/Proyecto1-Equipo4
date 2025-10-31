from sqlmodel import SQLModel, create_engine, Session # 
import os # para manejar variables de entorno
from dotenv import load_dotenv # para cargar variables de entorno desde el .env

load_dotenv()  # Cargar variables de entorno desde el .env

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./database.db")
engine = create_engine(DATABASE_URL)

def init_db():
    from server.models import Insured, Policy, Vehicle, Incident, Claim, Case
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session


