from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
from scipy.integrate import odeint

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- THE DIGESTION ENGINE (Pharmacokinetics) ---
def pk_model(y, t, ka, ke):
    """
    Two-compartment model:
    y[0] = Concentration in the Gut (Depot)
    y[1] = Concentration in the Blood (Central Compartment)
    """
    gut, blood = y
    dgut_dt = -ka * gut
    dblood_dt = ka * gut - ke * blood
    return [dgut_dt, dblood_dt]

@app.get("/simulate")
def simulate(weight: int = 70, gen_factor: float = 1.0, substance: str = "pill"):
    t = np.linspace(0, 24, 200) # 24-hour simulation window
    
    # Substance-Specific Parameters
    if substance == "alcohol":
        ka = 2.5               # Fast absorption
        ke = 0.12 * gen_factor # Elimination rate
        dose = 14000           # ~1 standard drink (14g)
        threshold = 8.0        # Blood safety limit
    elif substance == "caffeine":
        ka = 3.5               # Very fast absorption
        ke = 0.08 * gen_factor # Slower clearance (half-life)
        dose = 100             # 100mg cup of coffee
        threshold = 3.0        # Jitteriness threshold
    else: # Prescription Pill
        ka = 0.8               
        ke = 0.15 * gen_factor
        dose = 500             # 500mg
        threshold = 4.5        # Therapeutic window limit

    # Volume of Distribution (Vd) - based on body water content (~60%)
    v_dist = weight * 0.6
    y0 = [dose / v_dist, 0] # Initial state: Dose in gut, 0 in blood
    
    sol = odeint(pk_model, y0, t, args=(ka, ke))
    blood_levels = sol[:, 1]
    peak_val = float(np.max(blood_levels))
    peak_idx = np.argmax(blood_levels)

    # Calculate Time to Recovery
    hours_to_safe = 0
    if peak_val > threshold:
        # Check the curve AFTER it reaches the peak
        after_peak = blood_levels[peak_idx:]
        safe_indices = np.where(after_peak < threshold)[0]
        if len(safe_indices) > 0:
            hours_to_safe = float(t[safe_indices[0] + peak_idx])
        else:
            hours_to_safe = 24.0 # Remains above threshold for full day

    return {
        "levels": blood_levels.tolist(),
        "peak_value": peak_val,
        "hours_to_safe": hours_to_safe,
        "is_toxic": peak_val > threshold
    }