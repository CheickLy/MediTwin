# MEDI-Twin

## A 3D Digital Twin for personalized biokinetic modeling
<img width="800" height="371" alt="VideoProject3-ezgif com-crop" src="https://github.com/user-attachments/assets/6f750207-e0f1-41d5-adb9-878de4d10840" />


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


