import pandas as pd
from sqlmodel import Session, select
from datetime import datetime, date
import logging
from typing import Optional, Dict, Any
from server.db import engine, init_db
from server.models import Case, Insured, Policy, Vehicle, Incident, Claim

# Configure logging
# logging es para ver que pasa en el codigo
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def clean_date(value: Any) -> Optional[date]:
    """Clean date values, handling NaN and empty strings"""
    if pd.isna(value) or value == "":
        return None
    return datetime.strptime(str(value), "%Y-%m-%d").date()

# Necesitamos tener proper booleans
def clean_boolean(value: str) -> bool:
    """Convert YES/NO strings a booleanos"""
    if pd.isna(value):
        return None
    return str(value).upper() == "YES"

# el clasico trim 
def clean_string(value: Any) -> Optional[str]:
    """Clean string values, handling NaN and empty strings"""
    if pd.isna(value) or value == "":
        return None
    return str(value).strip()

def clean_integer(value: Any) -> Optional[int]:
    """Clean integer values, handling NaN and empty strings"""
    if pd.isna(value) or value == "":
        return None
    return int(value)

def clean_float(value: Any) -> Optional[float]:
    """Clean float values, handling NaN and empty strings"""
    if pd.isna(value) or value == "":
        return None
    return float(value)

def get_or_create_insured(session: Session, row: Dict[str, Any]) -> Insured:
    """Get or create Insured record based on demographic combination"""
    # Check for existing insured with similar profile
    age = clean_integer(row.get('age'))
    sex = clean_string(row.get('insured_sex'))
    education = clean_string(row.get('insured_education_level'))
    occupation = clean_string(row.get('insured_occupation'))
    zip_code = clean_integer(row.get('insured_zip'))
    
    # Try to find existing insured with matching demographics
    existing = session.exec(
        select(Insured).where(
            Insured.age == age,
            Insured.sex == sex,
            Insured.education_level == education,
            Insured.occupation == occupation,
            Insured.zip_code == zip_code
        )
    ).first()
    
    if existing:
        return existing
    
    # Create new insured
    insured = Insured(
        age=age,
        sex=sex,
        education_level=education,
        occupation=occupation,
        hobbies=clean_string(row.get('insured_hobbies')),
        relationships=clean_string(row.get('insured_relationship')),
        zip_code=zip_code,
        months_as_customer=clean_integer(row.get('months_as_customer')),
        capital_gains=clean_integer(row.get('capital-gains')),
        capital_loss=clean_integer(row.get('capital-loss'))
    )
    
    session.add(insured)
    session.commit()
    session.refresh(insured)
    return insured

def get_or_create_policy(session: Session, row: Dict[str, Any]) -> Policy:
    """Get or create Policy record based on policy_number"""
    policy_number = int(row.get('policy_number'))
    
    # Check for existing policy
    existing = session.exec(
        select(Policy).where(Policy.policy_number == policy_number)
    ).first()
    
    if existing:
        return existing
    
    # Create new policy
    policy = Policy(
        policy_number=policy_number,
        bind_date=clean_date(row.get('policy_bind_date')),
        policy_state=clean_string(row.get('policy_state')),
        csl=clean_string(row.get('policy_csl')),
        deductible=clean_integer(row.get('policy_deductable')), 
        annual_premium=clean_float(row.get('policy_annual_premium')),
        umbrella_limit=clean_integer(row.get('umbrella_limit'))
    )
    
    session.add(policy)
    session.commit()
    session.refresh(policy)
    return policy

def get_or_create_vehicle(session: Session, row: Dict[str, Any]) -> Vehicle:
    """Get or create Vehicle record based on make + model + year"""
    make = clean_string(row.get('auto_make'))
    model = clean_string(row.get('auto_model'))
    year = clean_integer(row.get('auto_year'))
    
    # Check for existing vehicle
    existing = session.exec(
        select(Vehicle).where(
            Vehicle.make == make,
            Vehicle.model == model,
            Vehicle.year == year
        )
    ).first()
    
    if existing:
        return existing
    
    # Create new vehicle
    vehicle = Vehicle(
        make=make,
        model=model,
        year=year
    )
    
    session.add(vehicle)
    session.commit()
    session.refresh(vehicle)
    return vehicle

def create_incident(session: Session, row: Dict[str, Any]) -> Incident:
    """Create new Incident record (incidents are unique per case)"""
    incident = Incident(
        date=clean_date(row.get('incident_date')),
        incident_type=clean_string(row.get('incident_type')),
        collision_type=clean_string(row.get('collision_type')),
        incident_severity=clean_string(row.get('incident_severity')),
        authorities_contacted=clean_string(row.get('authorities_contacted')),
        incident_state=clean_string(row.get('incident_state')),
        incident_city=clean_string(row.get('incident_city')),
        incident_location=clean_string(row.get('incident_location')),
        hour_of_day=clean_integer(row.get('incident_hour_of_the_day')),
        vehicles_involved=clean_integer(row.get('number_of_vehicles_involved')),
        property_damage=clean_boolean(row.get('property_damage')),
        bodily_injuries=clean_integer(row.get('bodily_injuries')),
        witnesses=clean_integer(row.get('witnesses')),
        police_report_available=clean_boolean(row.get('police_report_available'))
    )
    
    session.add(incident)
    session.commit()
    session.refresh(incident)
    return incident

def create_claim(session: Session, row: Dict[str, Any]) -> Claim:
    """Create new Claim record (claims are unique per case)"""
    claim = Claim(
        total_claim_amount=clean_integer(row.get('total_claim_amount')),
        injury_claim=clean_integer(row.get('injury_claim')),
        property_claim=clean_integer(row.get('property_claim')),
        vehicle_claim=clean_integer(row.get('vehicle_claim')),
        fraud_reported=clean_boolean(row.get('fraud_reported'))
    )
    
    session.add(claim)
    session.commit()
    session.refresh(claim)
    return claim

def load_to_database(file_path: str = "data/insurance_claims_clean.csv") -> Dict[str, Any]:
    """
    Main function to load CSV data into database
    Returns summary of import results
    """
    try:
        # Initialize database
        init_db()
        
        # Read CSV file
        logger.info(f"Reading CSV file: {file_path}")
        df = pd.read_csv(file_path)
        logger.info(f"Loaded {len(df)} rows from CSV")
        
        # Initialize counters
        stats = {
            "rows_processed": 0,
            "insureds_created": 0,
            "policies_created": 0,
            "vehicles_created": 0,
            "incidents_created": 0,
            "claims_created": 0,
            "cases_created": 0,
            "errors": []
        }
        
        with Session(engine) as session:
            for index, row in df.iterrows():
                try:
                    logger.info(f"Processing row {index + 1}/{len(df)}")
                    
                    # Get or create related entities
                    insured = get_or_create_insured(session, row.to_dict())
                    if insured.id is not None:
                        stats["insureds_created"] += 1
                    
                    policy = get_or_create_policy(session, row.to_dict())
                    if policy.id is not None:
                        stats["policies_created"] += 1
                    
                    vehicle = get_or_create_vehicle(session, row.to_dict())
                    if vehicle.id is not None:
                        stats["vehicles_created"] += 1
                    
                    # Create new incident and claim for each case
                    incident = create_incident(session, row.to_dict())
                    stats["incidents_created"] += 1
                    
                    claim = create_claim(session, row.to_dict())
                    stats["claims_created"] += 1
                    
                    # Create case linking all entities
                    case = Case(
                        insured_id=insured.id,
                        policy_id=policy.id,
                        vehicle_id=vehicle.id,
                        incident_id=incident.id,
                        claim_id=claim.id
                    )
                    session.add(case)
                    session.commit()
                    session.refresh(case)
                    stats["cases_created"] += 1
                    stats["rows_processed"] += 1
                    
                except Exception as e:
                    error_msg = f"Error processing row {index + 1}: {str(e)}"
                    logger.error(error_msg)
                    stats["errors"].append(error_msg)
                    continue
        
        logger.info("Data loading completed successfully")
        logger.info(f"Summary: {stats}")
        return stats
        
    except Exception as e:
        error_msg = f"Fatal error during data loading: {str(e)}"
        logger.error(error_msg)
        return {"error": error_msg, "rows_processed": 0}

if __name__ == "__main__":
    """Command-line execution"""
    import sys
    
    # Get file path from command line argument or use default
    file_path = sys.argv[1] if len(sys.argv) > 1 else "data/insurance_claims_clean.csv"
    
    print(f"Starting data import from: {file_path}")
    print("=" * 50)
    
    # Run the import
    result = load_to_database(file_path)
    
    print("=" * 50)
    print("IMPORT COMPLETED")
    print("=" * 50)
    
    if "error" in result:
        print(f"FATAL ERROR: {result['error']}")
        sys.exit(1)
    else:
        print(f"Rows processed: {result['rows_processed']}")
        print(f"Insureds created: {result['insureds_created']}")
        print(f"Policies created: {result['policies_created']}")
        print(f"Vehicles created: {result['vehicles_created']}")
        print(f"Incidents created: {result['incidents_created']}")
        print(f"Claims created: {result['claims_created']}")
        print(f"Cases created: {result['cases_created']}")
        
        if result['errors']:
            print(f"Errors encountered: {len(result['errors'])}")
            for error in result['errors'][:5]:  # Show first 5 errors
                print(f"   - {error}")
            if len(result['errors']) > 5:
                print(f"   ... and {len(result['errors']) - 5} more errors")
        
        print("=" * 50)
        print("Data import completed successfully!")
