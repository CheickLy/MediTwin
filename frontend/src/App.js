import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Float } from '@react-three/drei';

// --- SLEEK 3D MODEL COMPONENT ---
const PatientModel = ({ isToxic, substance }) => {
  // We keep the sphere simple and high-tech
  const baseColor = isToxic ? "#ff2d2d" : "#00d2ff";
  
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <Sphere args={[1, 100, 100]} scale={1.4}>
        <MeshDistortMaterial
          color={baseColor}
          speed={isToxic ? 4 : 1.5}
          distort={isToxic ? 0.5 : 0.2}
          roughness={0.1}
          metalness={0.9}
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

  // Define background colors for each substance
  const bgColors = {
    pill: isToxic => isToxic ? "rgba(255, 0, 0, 0.93)" : "rgba(0, 60, 255, 0.97)",
    alcohol: isToxic => isToxic ? "rgba(255, 0, 0, 0.97)" : "rgba(0, 255, 13, 0.95)",
    caffeine: isToxic => isToxic ? "rgb(238, 73, 8)" : "rgb(0, 102, 255)"
  };

  const currentBg = bgColors[substance](data.is_toxic);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/simulate?weight=${weight}&gen_factor=${genFactor}&substance=${substance}`);
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error("Backend offline.");
      }
    };
    fetchData();
  }, [weight, genFactor, substance]);

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      background: '#050505', // Deep black base
      color: 'white', 
      fontFamily: 'sans-serif', 
      overflow: 'hidden',
      transition: 'background 0.8s ease' // Smooth transition when color changes
    }}>
      
      {/* SIDEBAR */}
      <div style={{ 
        width: '350px', 
        padding: '40px', 
        borderRight: '1px solid rgba(255,255,255,0.05)', 
        background: 'rgba(10, 10, 12, 0.8)', 
        backdropFilter: 'blur(20px)',
        zIndex: 10 
      }}>
        <h2 style={{ color: '#00d2ff', margin: '0 0 5px 0', letterSpacing: '1px' }}>MEDI-TWIN</h2>
        <p style={{ fontSize: '10px', color: '#444', marginBottom: '40px', letterSpacing: '2px' }}>ENGINE v1.0</p>

        <div style={{ marginBottom: '35px' }}>
          <label style={{ fontSize: '13px', color: '#0ef1e6f5', display: 'block', marginBottom: '10px' }}>SUBSTANCE</label>
          <select 
            value={substance} 
            onChange={(e) => setSubstance(e.target.value)}
            style={{ width: '100%', padding: '12px', background: '#111', color: 'white', border: '1px solid #333', borderRadius: '4px' }}
          >
            <option value="pill">💊 Prescription Pill</option>
            <option value="alcohol">🍺 Alcohol</option>
            <option value="caffeine">☕ Caffeine</option>
          </select>
        </div>

        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '10px' }}>
            <span>Weight</span> <b>{weight}kg</b>
          </label>
          <input type="range" min="40" max="150" value={weight} onChange={(e) => setWeight(Number(e.target.value))} style={{ width: '100%' }} />
        </div>

        <div style={{ marginBottom: '40px' }}>
          <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '10px' }}>
            <span>Metabolic Rate</span> <b>{genFactor}x</b>
          </label>
          <input type="range" min="0.5" max="2.5" step="0.1" value={genFactor} onChange={(e) => setGenFactor(Number(e.target.value))} style={{ width: '100%' }} />
        </div>

        {data.is_toxic && (
          <div style={{ padding: '15px', borderLeft: '3px solid #ff2d2d', background: 'rgba(255, 45, 45, 0.05)' }}>
            <p style={{ fontSize: '12px', margin: 0, color: '#ff2d2d', fontWeight: 'bold' }}>CRITICAL CONCENTRATION</p>
          </div>
        )}
      </div>

      {/* 3D AREA WITH DYNAMIC BACKGROUND */}
      <div style={{ 
        flex: 1, 
        position: 'relative',
        // This creates the dynamic "glow" behind the sphere
        background: `radial-gradient(circle at center, ${currentBg} 0%, rgba(5,5,5,1) 70%)`,
        transition: 'background 1s ease'
      }}>
        <Canvas camera={{ position: [0, 0, 4] }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <PatientModel isToxic={data.is_toxic} substance={substance} />
          <OrbitControls enableZoom={false} />
        </Canvas>

        {/* HUD STATS */}
        <div style={{ position: 'absolute', top: '40px', right: '40px', textAlign: 'right' }}>
           <p style={{ color: '#444', margin: 0, fontSize: '10px', letterSpacing: '1px' }}>ESTIMATED RECOVERY</p>
           <h2 style={{ fontSize: '32px', margin: 0, color: data.is_toxic ? '#ff2d2d' : '#00d2ff' }}>
             {data.is_toxic ? `${data.hours_to_safe.toFixed(1)}h` : "STABLE"}
           </h2>
        </div>

        <div style={{ position: 'absolute', bottom: '40px', right: '40px', textAlign: 'right' }}>
          <p style={{ color: '#444', margin: 0, fontSize: '10px' }}>PEAK CONCENTRATION</p>
          <h1 style={{ fontSize: '60px', margin: 0, fontWeight: '900', color: data.is_toxic ? '#ff2d2d' : '#00d2ff' }}>
            {data.peak_value.toFixed(2)}<span style={{ fontSize: '18px', fontWeight: 'normal', color: '#222' }}>mg/L</span>
          </h1>
        </div>
      </div>
    </div>
  );
}