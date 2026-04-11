import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Float } from '@react-three/drei';

const PatientModel = ({ peakValue, substance, isToxic }) => {
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <Sphere args={[1, 100, 100]} scale={1.4}>
        <MeshDistortMaterial
          color={isToxic ? "#ff2d2d" : "#00d2ff"}
          speed={isToxic ? 5 : 1.5}
          distort={isToxic ? 0.6 : 0.2}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
    </Float>
  );
};

export default function App() {
  const [weight, setWeight] = useState(80);
  const [genFactor, setGenFactor] = useState(1.0);
  const [substance, setSubstance] = useState('pill');
  const [data, setData] = useState({ levels: [], peak_value: 0, hours_to_safe: 0, is_toxic: false });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/simulate?weight=${weight}&gen_factor=${genFactor}&substance=${substance}`);
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error("Backend offline. Ensure FastAPI is running.");
      }
    };
    fetchData();
  }, [weight, genFactor, substance]);

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0a0a0c', color: 'white', fontFamily: 'sans-serif', overflow: 'hidden' }}>
      
      {/* SIDEBAR */}
      <div style={{ width: '350px', padding: '40px', borderRight: '1px solid #333', background: '#111', zIndex: 10 }}>
        <h2 style={{ color: '#00d2ff', margin: '0 0 5px 0' }}>Medi-Twin Engine</h2>
        <p style={{ fontSize: '12px', color: '#666', marginBottom: '30px' }}>Digital twin pharmacology simulation</p>

        <div style={{ marginBottom: '30px' }}>
          <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '8px' }}>SUBSTANCE TYPE</label>
          <select 
            value={substance} 
            onChange={(e) => setSubstance(e.target.value)}
            style={{ width: '100%', padding: '12px', background: '#222', color: 'white', border: '1px solid #444', borderRadius: '4px' }}
          >
            <option value="pill">💊 Prescription Pill (500mg)</option>
            <option value="alcohol">🍺 Alcohol (1 Standard Drink)</option>
          </select>
        </div>

        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', marginBottom: '10px' }}>Weight: <b>{weight} kg</b></label>
          <input type="range" min="40" max="150" value={weight} onChange={(e) => setWeight(e.target.value)} style={{ width: '100%' }} />
        </div>

        <div style={{ marginBottom: '40px' }}>
          <label style={{ display: 'block', marginBottom: '10px' }}>Metabolic Rate: <b>{genFactor}x</b></label>
          <input type="range" min="0.5" max="2.5" step="0.1" value={genFactor} onChange={(e) => setGenFactor(e.target.value)} style={{ width: '100%' }} />
        </div>

        {data.is_toxic && (
          <div style={{ padding: '15px', background: 'rgba(255, 45, 45, 0.1)', border: '1px solid #ff2d2d', borderRadius: '8px' }}>
            <span style={{ color: '#ff2d2d', fontWeight: 'bold' }}>⚠️ TOXICITY WARNING</span>
            <p style={{ fontSize: '12px', margin: '5px 0 0 0', color: '#aaa' }}>Current physiology cannot safely process this dosage.</p>
          </div>
        )}
      </div>

      {/* 3D VISUALIZER AREA */}
      <div style={{ flex: 1, position: 'relative' }}>
        <Canvas camera={{ position: [0, 0, 4] }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1.5} />
          <PatientModel peakValue={data.peak_value} substance={substance} isToxic={data.is_toxic} />
          <OrbitControls enableZoom={false} />
        </Canvas>

        {/* TOP RIGHT: RECOVERY STAT */}
        <div style={{ position: 'absolute', top: '40px', right: '40px', textAlign: 'right' }}>
           <div style={{ background: 'rgba(0,0,0,0.6)', padding: '20px', borderRadius: '12px', border: '1px solid #222', backdropFilter: 'blur(10px)' }}>
              <p style={{ color: '#888', margin: 0, fontSize: '12px' }}>ESTIMATED RECOVERY</p>
              <h2 style={{ fontSize: '32px', margin: '5px 0', color: data.is_toxic ? '#ff2d2d' : '#00d2ff' }}>
                {data.is_toxic ? `${data.hours_to_safe.toFixed(1)} hrs` : "Stable"}
              </h2>
              <p style={{ fontSize: '10px', color: '#555' }}>Time until metabolic safety</p>
           </div>
        </div>

        {/* BOTTOM RIGHT: PEAK CONCENTRATION */}
        <div style={{ position: 'absolute', bottom: '40px', right: '40px', textAlign: 'right' }}>
          <p style={{ color: '#888', margin: 0 }}>Peak Concentration</p>
          <h1 style={{ fontSize: '64px', margin: 0, color: data.is_toxic ? '#ff2d2d' : '#00d2ff', fontWeight: '800' }}>
            {data.peak_value.toFixed(2)} <span style={{ fontSize: '20px', fontWeight: '300' }}>mg/L</span>
          </h1>
        </div>
      </div>
    </div>
  );
}