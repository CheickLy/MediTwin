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

def pk_model(y, t, ka, ke):
    gut, blood = y

    dgut_dt = -ka * gut
    dblood_dt = ka * gut - ke * blood

    return [dgut_dt, dblood_dt]


@app.get("/simulate")
def simulate(
    weight: int = 70,
    gen_factor: float = 1.0,
    substance: str = "pill"
):

    t = np.linspace(0, 24, 200)

    if substance == "alcohol":
        ka = 2.5
        ke = 0.12 * gen_factor
        dose = 14000
        threshold = 8.0

    elif substance == "caffeine":
        ka = 3.5
        ke = 0.08 * gen_factor
        dose = 100
        threshold = 3.0

    else:
        ka = 0.8
        ke = 0.15 * gen_factor
        dose = 500
        threshold = 4.5

    v_dist = weight * 0.6

    y0 = [dose / v_dist, 0]

    sol = odeint(pk_model, y0, t, args=(ka, ke))

    blood_levels = sol[:, 1]

    peak_val = float(np.max(blood_levels))
    peak_idx = np.argmax(blood_levels)

    peak_time = float(t[peak_idx])

    auc = float(np.trapz(blood_levels, t))

    half_life = float(np.log(2) / ke)

    hours_to_safe = 0

    if peak_val > threshold:

        after_peak = blood_levels[peak_idx:]

        safe_indices = np.where(after_peak < threshold)[0]

        if len(safe_indices) > 0:
            hours_to_safe = float(
                t[safe_indices[0] + peak_idx]
            )
        else:
            hours_to_safe = 24.0

    return {
        "time": t.tolist(),
        "levels": blood_levels.tolist(),
        "peak_value": peak_val,
        "peak_time": peak_time,
        "auc": auc,
        "half_life": half_life,
        "hours_to_safe": hours_to_safe,
        "is_toxic": peak_val > threshold,
        "threshold": threshold
    }