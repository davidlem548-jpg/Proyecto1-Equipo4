"""
In-memory storage for insurance data using plain Python data structures.
No database, no SQLModel - just dictionaries and lists.
"""

# Global in-memory storage using plain Python data structures
insureds = []
policies = []
vehicles = []
incidents = []
claims = []
cases = []

# Auto-increment IDs
_next_ids = {
    'insured': 1,
    'policy': 1,
    'vehicle': 1,
    'incident': 1,
    'claim': 1,
    'case': 1
}

def get_next_id(entity_type):
    """Get next ID for an entity type"""
    current_id = _next_ids[entity_type]
    _next_ids[entity_type] += 1
    return current_id

# Insured operations
def create_insured(data):
    """Create a new insured person"""
    insured = {
        'id': get_next_id('insured'),
        'age': data.get('age'),
        'sex': data.get('sex'),
        'education_level': data.get('education_level'),
        'occupation': data.get('occupation'),
        'hobbies': data.get('hobbies'),
        'relationships': data.get('relationships'),
        'zip_code': data.get('zip_code'),
        'months_as_customer': data.get('months_as_customer'),
        'capital_gains': data.get('capital_gains'),
        'capital_loss': data.get('capital_loss')
    }
    insureds.append(insured)
    return insured

def get_insured(insured_id):
    """Get insured by ID"""
    return next((i for i in insureds if i['id'] == insured_id), None)

def get_all_insureds(skip=0, limit=10):
    """Get paginated insureds"""
    return insureds[skip:skip + limit]

def update_insured(insured_id, data):
    """Update an insured person"""
    insured = get_insured(insured_id)
    if not insured:
        return None
    for key, value in data.items():
        if value is not None:
            insured[key] = value
    return insured

# Policy operations
def create_policy(data):
    """Create a new policy"""
    policy = {
        'id': get_next_id('policy'),
        'policy_number': data.get('policy_number'),
        'bind_date': data.get('bind_date'),
        'policy_state': data.get('policy_state'),
        'csl': data.get('csl'),
        'deductible': data.get('deductible'),
        'annual_premium': data.get('annual_premium'),
        'umbrella_limit': data.get('umbrella_limit')
    }
    policies.append(policy)
    return policy

def get_policy(policy_id):
    """Get policy by ID"""
    return next((p for p in policies if p['id'] == policy_id), None)

def get_all_policies(skip=0, limit=10, policy_state=None):
    """Get paginated policies with optional state filter"""
    filtered = policies
    if policy_state:
        filtered = [p for p in policies if p.get('policy_state') == policy_state]
    return filtered[skip:skip + limit]

def update_policy(policy_id, data):
    """Update a policy"""
    policy = get_policy(policy_id)
    if not policy:
        return None
    for key, value in data.items():
        if value is not None:
            policy[key] = value
    return policy

# Vehicle operations
def create_vehicle(data):
    """Create a new vehicle"""
    vehicle = {
        'id': get_next_id('vehicle'),
        'make': data.get('make'),
        'model': data.get('model'),
        'year': data.get('year')
    }
    vehicles.append(vehicle)
    return vehicle

def get_vehicle(vehicle_id):
    """Get vehicle by ID"""
    return next((v for v in vehicles if v['id'] == vehicle_id), None)

def get_all_vehicles(skip=0, limit=10):
    """Get paginated vehicles"""
    return vehicles[skip:skip + limit]

def update_vehicle(vehicle_id, data):
    """Update a vehicle"""
    vehicle = get_vehicle(vehicle_id)
    if not vehicle:
        return None
    for key, value in data.items():
        if value is not None:
            vehicle[key] = value
    return vehicle

# Incident operations
def create_incident(data):
    """Create a new incident"""
    incident = {
        'id': get_next_id('incident'),
        'date': data.get('date'),
        'incident_type': data.get('incident_type'),
        'collision_type': data.get('collision_type'),
        'incident_severity': data.get('incident_severity'),
        'authorities_contacted': data.get('authorities_contacted'),
        'incident_state': data.get('incident_state'),
        'incident_city': data.get('incident_city'),
        'incident_location': data.get('incident_location'),
        'hour_of_day': data.get('hour_of_day'),
        'vehicles_involved': data.get('vehicles_involved'),
        'property_damage': data.get('property_damage'),
        'bodily_injuries': data.get('bodily_injuries'),
        'witnesses': data.get('witnesses'),
        'police_report_available': data.get('police_report_available')
    }
    incidents.append(incident)
    return incident

def get_incident(incident_id):
    """Get incident by ID"""
    return next((i for i in incidents if i['id'] == incident_id), None)

def get_all_incidents(skip=0, limit=10):
    """Get paginated incidents"""
    return incidents[skip:skip + limit]

def update_incident(incident_id, data):
    """Update an incident"""
    incident = get_incident(incident_id)
    if not incident:
        return None
    for key, value in data.items():
        if value is not None:
            incident[key] = value
    return incident

# Claim operations
def create_claim(data):
    """Create a new claim"""
    claim = {
        'id': get_next_id('claim'),
        'policy_id': data.get('policy_id'),  # Agregar policy_id
        'total_claim_amount': data.get('total_claim_amount'),
        'injury_claim': data.get('injury_claim'),
        'property_claim': data.get('property_claim'),
        'vehicle_claim': data.get('vehicle_claim'),
        'fraud_reported': data.get('fraud_reported')
    }
    claims.append(claim)
    return claim

def get_claim(claim_id):
    """Get claim by ID"""
    return next((c for c in claims if c['id'] == claim_id), None)

def get_all_claims(skip=0, limit=10):
    """Get paginated claims - returns newest first"""
    # Invertir la lista para mostrar los más recientes primero
    reversed_claims = list(reversed(claims))
    return reversed_claims[skip:skip + limit]

def update_claim(claim_id, data):
    """Update a claim"""
    claim = get_claim(claim_id)
    if not claim:
        return None
    for key, value in data.items():
        if value is not None:
            claim[key] = value
    return claim

# Case operations
def create_case(data):
    """Create a new case"""
    case = {
        'id': get_next_id('case'),
        'insured_id': data.get('insured_id'),
        'policy_id': data.get('policy_id'),
        'vehicle_id': data.get('vehicle_id'),
        'incident_id': data.get('incident_id'),
        'claim_id': data.get('claim_id')
    }
    cases.append(case)
    return case

def get_case(case_id):
    """Get case by ID with all related data"""
    case = next((c for c in cases if c['id'] == case_id), None)
    if not case:
        return None
    
    # Build full case with related data
    full_case = case.copy()
    full_case['insured'] = get_insured(case.get('insured_id'))
    full_case['policy'] = get_policy(case.get('policy_id'))
    full_case['vehicle'] = get_vehicle(case.get('vehicle_id'))
    full_case['incident'] = get_incident(case.get('incident_id'))
    full_case['claim'] = get_claim(case.get('claim_id'))
    return full_case

def get_all_cases(skip=0, limit=10):
    """Get paginated cases"""
    return cases[skip:skip + limit]

def update_case(case_id, data):
    """Update a case"""
    case = next((c for c in cases if c['id'] == case_id), None)
    if not case:
        return None
    for key, value in data.items():
        if value is not None:
            case[key] = value
    return case

# Statistics
def get_stats():
    """Get overall statistics"""
    return {
        'total_insureds': len(insureds),
        'total_policies': len(policies),
        'total_vehicles': len(vehicles),
        'total_incidents': len(incidents),
        'total_claims': len(claims),
        'total_cases': len(cases),
        'fraud_claims': len([c for c in claims if c.get('fraud_reported') == True]),
        'total_claims_amount': sum(c.get('total_claim_amount', 0) or 0 for c in claims)
    }

# Data loading from CSV
def load_data_from_csv(file_path):
    """Load data from CSV file into memory"""
    import pandas as pd
    from datetime import datetime
    
    df = pd.read_csv(file_path)
    
    for _, row in df.iterrows():
        # Create insured
        insured = create_insured({
            'age': int(row['age']) if pd.notna(row['age']) else None,
            'sex': str(row['insured_sex']) if pd.notna(row['insured_sex']) else None,
            'education_level': str(row['insured_education_level']) if pd.notna(row['insured_education_level']) else None,
            'occupation': str(row['insured_occupation']) if pd.notna(row['insured_occupation']) else None,
            'hobbies': str(row['insured_hobbies']) if pd.notna(row['insured_hobbies']) else None,
            'relationships': str(row['insured_relationship']) if pd.notna(row['insured_relationship']) else None,
            'zip_code': int(row['insured_zip']) if pd.notna(row['insured_zip']) else None,
            'months_as_customer': int(row['months_as_customer']) if pd.notna(row['months_as_customer']) else None,
            'capital_gains': int(row['capital-gains']) if pd.notna(row['capital-gains']) else None,
            'capital_loss': int(row['capital-loss']) if pd.notna(row['capital-loss']) else None
        })
        
        # Create policy
        policy = create_policy({
            'policy_number': int(row['policy_number']) if pd.notna(row['policy_number']) else None,
            'bind_date': str(row['policy_bind_date']) if pd.notna(row['policy_bind_date']) else None,
            'policy_state': str(row['policy_state']) if pd.notna(row['policy_state']) else None,
            'csl': str(row['policy_csl']) if pd.notna(row['policy_csl']) else None,
            'deductible': int(row['policy_deductable']) if pd.notna(row['policy_deductable']) else None,
            'annual_premium': float(row['policy_annual_premium']) if pd.notna(row['policy_annual_premium']) else None,
            'umbrella_limit': int(row['umbrella_limit']) if pd.notna(row['umbrella_limit']) else None
        })
        
        # Create vehicle
        vehicle = create_vehicle({
            'make': str(row['auto_make']) if pd.notna(row['auto_make']) else None,
            'model': str(row['auto_model']) if pd.notna(row['auto_model']) else None,
            'year': int(row['auto_year']) if pd.notna(row['auto_year']) else None
        })
        
        # Create incident
        incident = create_incident({
            'date': str(row['incident_date']) if pd.notna(row['incident_date']) else None,
            'incident_type': str(row['incident_type']) if pd.notna(row['incident_type']) else None,
            'collision_type': str(row['collision_type']) if pd.notna(row['collision_type']) else None,
            'incident_severity': str(row['incident_severity']) if pd.notna(row['incident_severity']) else None,
            'authorities_contacted': str(row['authorities_contacted']) if pd.notna(row['authorities_contacted']) else None,
            'incident_state': str(row['incident_state']) if pd.notna(row['incident_state']) else None,
            'incident_city': str(row['incident_city']) if pd.notna(row['incident_city']) else None,
            'incident_location': str(row['incident_location']) if pd.notna(row['incident_location']) else None,
            'hour_of_day': int(row['incident_hour_of_the_day']) if pd.notna(row['incident_hour_of_the_day']) else None,
            'vehicles_involved': int(row['number_of_vehicles_involved']) if pd.notna(row['number_of_vehicles_involved']) else None,
            'property_damage': str(row['property_damage']).upper() == 'YES' if pd.notna(row['property_damage']) else None,
            'bodily_injuries': int(row['bodily_injuries']) if pd.notna(row['bodily_injuries']) else None,
            'witnesses': int(row['witnesses']) if pd.notna(row['witnesses']) else None,
            'police_report_available': str(row['police_report_available']).upper() == 'YES' if pd.notna(row['police_report_available']) else None
        })
        
        # Create claim
        claim = create_claim({
            'total_claim_amount': int(row['total_claim_amount']) if pd.notna(row['total_claim_amount']) else None,
            'injury_claim': int(row['injury_claim']) if pd.notna(row['injury_claim']) else None,
            'property_claim': int(row['property_claim']) if pd.notna(row['property_claim']) else None,
            'vehicle_claim': int(row['vehicle_claim']) if pd.notna(row['vehicle_claim']) else None,
            'fraud_reported': str(row['fraud_reported']).upper() == 'YES' if pd.notna(row['fraud_reported']) else None
        })
        
        # Create case linking everything
        create_case({
            'insured_id': insured['id'],
            'policy_id': policy['id'],
            'vehicle_id': vehicle['id'],
            'incident_id': incident['id'],
            'claim_id': claim['id']
        })
    
    return get_stats()
