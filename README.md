# MEDI-Twin

## A 3D Digital Twin for personalized biokinetic modeling
<img width="800" height="423" alt="Medi-Twin_PrecisionMedicineand3morepages-Personal-MicrosoftEdge2026-06-1301-56-26-ezgif com-video-to-gif-converter" src="https://github.com/user-attachments/assets/f38aa7d4-629b-4ef5-b601-2fbe6ae99824" />



Generic medical dosages don't account for individual differences in genetic makeup, they only account for the "average human. But there is no "average human". Medi-Twin solves this by creating a personalized digital avatar. By calculating metabolic clearance rates in real-time, I turn invisible body chemistry into an interactive 3D experience.

## Key features

* Interactive pharmacokinetic simulation powered by FastAPI and SciPy
* Real-time concentration vs. time visualization using Recharts
* Toxicity threshold detection with visual alerting
* Peak concentration marker and recovery time estimation
* Dynamic 3D digital twin responding to simulated drug levels
* Advanced metrics including Peak Time, Half-Life, AUC, and Peak Concentration

**Tech Stack**
* Frontend: React, Three.js, React Three Fiber.

* Backend: Python (FastAPI), NumPy, SciPy.


**How to Run**

(Make sure to run backend and frontend in 2 seperate terminals)

1. cd backend && uvicorn main:app --reload

2. cd frontend && npm install && npm start


