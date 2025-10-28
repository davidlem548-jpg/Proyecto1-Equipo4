from sqlmodel import SQLModel, create_engine, Session # 
import os # para manejar variables de entorno
from dotenv import load_dotenv # para cargar variables de entorno desde el .env

load_dotenv()  # Cargar variables de entorno desde el .env

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

def init_db():
    from .models import Insurer, PolicyHolder, Policy, Claim
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session


