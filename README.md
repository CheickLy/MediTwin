# MEDI-Twin

## A 3D Digital Twin for personalized biokinetic modeling
![MediTwinGif-ezgif com-video-to-gif-converter](https://github.com/user-attachments/assets/653d7a5c-a739-4dc2-baec-c74a6ccd54fc)


Generic medical dosages don't account for individual differences in genetic makeup, they only account for the "average human. But there is no "average human". Medi-Twin solves this by creating a personalized digital avatar. By calculating metabolic clearance rates in real-time, I turn invisible body chemistry into an interactive 3D experience.

## Key features

* Personalized Simulation: Adjusts based on weight and metabolic factor.
* Real-Time Math: Uses SciPy to solve differential equations on every slider change.
* Bio-Visual Feedback: A Three.js model that distorts and changes color based on toxicity levels.

**Tech Stack**
Frontend: React, Three.js, React Three Fiber.

Backend: Python (FastAPI), NumPy, SciPy.


** How to Run **

(Make sure to run backend and frontend in 2 seperate terminals)

1. cd backend && uvicorn main:app --reload

2. cd frontend && npm install && npm start


