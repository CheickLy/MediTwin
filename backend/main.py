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

# --- THE DIGESTION ENGINE ---
def pk_model(y, t, ka, ke):
    """
    Two-compartment model:
    y[0] = Concentration in the Gut (Absorption site)
    y[1] = Concentration in the Blood (Action site)
    """
    gut, blood = y
    dgut_dt = -ka * gut              # Drug leaves gut
    dblood_dt = ka * gut - ke * blood # Drug enters blood, then clears
    return [dgut_dt, dblood_dt]

@app.get("/simulate")
def simulate(weight: int = 70, gen_factor: float = 1.0, substance: str = "pill"):
    t = np.linspace(0, 24, 100) # 24-hour window
    
    # Substance-Specific Parameters
    if substance == "alcohol":
        ka = 2.5               # Fast absorption
        ke = 0.12 * gen_factor # Elimination rate
        dose = 14000           # ~1 standard drink (14g ethanol)
        threshold = 8.0        # Safety limit for alcohol
    else:
        ka = 0.8               # Slower pill digestion
        ke = 0.15 * gen_factor
        dose = 500             # 500mg pill
        threshold = 1.0        # Safety limit for medication

    v_dist = weight * 0.6
    y0 = [dose / v_dist, 0] # Start with dose in gut, 0 in blood
    
    sol = odeint(pk_model, y0, t, args=(ka, ke))
    blood_levels = sol[:, 1]
    peak_val = float(np.max(blood_levels))

    # Calculate Time to Recovery (When it falls back below threshold)
    peak_idx = np.argmax(blood_levels)
    # Search for first 'safe' index AFTER the peak has occurred
    after_peak = blood_levels[peak_idx:]
    safe_indices = np.where(after_peak < threshold)[0]
    
    hours_to_safe = 0
    if len(safe_indices) > 0 and peak_val > threshold:
        # Map the index back to the time array 't'
        hours_to_safe = float(t[safe_indices[0] + peak_idx])

    return {
        "time": t.tolist(),
        "levels": blood_levels.tolist(),
        "peak_value": peak_val,
        "hours_to_safe": hours_to_safe,
        "is_toxic": peak_val > threshold
    }