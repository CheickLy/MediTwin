import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Float } from '@react-three/drei';

// --- VISIBLE 3D MODEL COMPONENT ---
const PatientModel = ({ isToxic, substance }) => {
  // Logic to determine color based on substance and safety
  const getBaseColor = () => {
    if (isToxic) return "#ff2d2d"; // Warning Red
    if (substance === 'caffeine') return "#00ffcc"; // Neon Mint
    if (substance === 'alcohol') return "#ffcc00"; // Amber
    return "#00d2ff"; // Clinical Blue
  };

  const activeColor = getBaseColor();
  
  return (
    // Float component adds a gentle bobbing and rotation to make the model feel alive
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <Sphere args={[1, 100, 100]} scale={1.4}>
        <MeshDistortMaterial
          color={activeColor}
          speed={isToxic ? 4 : 1.5}
          distort={isToxic ? 0.5 : 0.2}
          roughness={0.1}
          metalness={0.8}
          // Fixes the "Black Hole" effect by making the material emit light
          emissive={activeColor}
          emissiveIntensity={isToxic ? 0.6 : 0.3}
        />
      </Sphere>
    </Float>
  );
};

export default function App() {
  const [weight, setWeight] = useState(88);
  const [genFactor, setGenFactor] = useState(1.0);
  const [substance, setSubstance] = useState('pill');
  const [data, setData] = useState({ levels: [], peak_value: 0, hours_to_safe: 0, is_toxic: false });

  // Dynamic Background Aura
  const getBgColor = () => {
    if (data.is_toxic) return "rgba(255, 45, 45, 0.2)";
    if (substance === 'pill') return "rgba(0, 210, 255, 0.15)";
    if (substance === 'alcohol') return "rgba(255, 204, 0, 0.15)";
    if (substance === 'caffeine') return "rgba(0, 255, 204, 0.15)";
    return "rgba(0, 210, 255, 0.15)";
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/simulate?weight=${weight}&gen_factor=${genFactor}&substance=${substance}`);
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error("Backend offline. Ensure FastAPI is running on port 8000.");
      }
    };
    fetchData();
  }, [weight, genFactor, substance]);

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      background: '#050505', 
      color: 'white', 
      fontFamily: '"Inter", sans-serif', 
      overflow: 'hidden' 
    }}>
      
      {/* SIDEBAR */}
      <div style={{ 
        width: '350px', 
        padding: '40px', 
        borderRight: '1px solid rgba(255,255,255,0.05)', 
        background: 'rgba(10, 10, 12, 0.9)', 
        backdropFilter: 'blur(20px)',
        zIndex: 10 
      }}>
        <h2 style={{ color: '#00d2ff', margin: '0 0 5px 0', letterSpacing: '2px', fontWeight: '800' }}>MEDI-TWIN</h2>
        <p style={{ fontSize: '10px', color: '#444', marginBottom: '40px', letterSpacing: '3px' }}>ENGINE v1.0</p>

        <div style={{ marginBottom: '35px' }}>
          <label style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '12px', fontWeight: 'bold' }}>SUBSTANCE</label>
          <select 
            value={substance} 
            onChange={(e) => setSubstance(e.target.value)}
            style={{ width: '100%', padding: '15px', background: '#111', color: 'white', border: '1px solid #333', borderRadius: '8px', outline: 'none', cursor: 'pointer' }}
          >
            <option value="pill">💊 Prescription Pill</option>
            <option value="alcohol">🍺 Alcohol</option>
            <option value="caffeine">☕ Caffeine</option>
          </select>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '12px', color: '#888' }}>
            <span>Body Weight</span> <b style={{ color: 'white' }}>{weight} kg</b>
          </label>
          <input type="range" min="40" max="150" value={weight} onChange={(e) => setWeight(Number(e.target.value))} style={{ width: '100%', accentColor: '#00d2ff' }} />
        </div>

        <div style={{ marginBottom: '40px' }}>
          <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '12px', color: '#888' }}>
            <span>Metabolic Rate</span> <b style={{ color: 'white' }}>{genFactor}x</b>
          </label>
          <input type="range" min="0.5" max="2.5" step="0.1" value={genFactor} onChange={(e) => setGenFactor(Number(e.target.value))} style={{ width: '100%', accentColor: '#00d2ff' }} />
        </div>

        {data.is_toxic && (
          <div style={{ padding: '20px', borderLeft: '4px solid #ff2d2d', background: 'rgba(255, 45, 45, 0.08)', borderRadius: '4px' }}>
            <p style={{ fontSize: '12px', margin: 0, color: '#ff2d2d', fontWeight: 'bold', letterSpacing: '1px' }}>CRITICAL CONCENTRATION</p>
            <p style={{ fontSize: '10px', margin: '8px 0 0 0', color: '#777', lineHeight: '1.4' }}>Toxicity threshold reached for current physiology.</p>
          </div>
        )}
      </div>

      {/* 3D DISPLAY AREA */}
      <div style={{ 
        flex: 1, 
        position: 'relative',
        background: `radial-gradient(circle at center, ${getBgColor()} 0%, rgba(5,5,5,1) 75%)`,
        transition: 'background 1s ease'
      }}>
        <Canvas camera={{ position: [0, 0, 4] }}>
          {/* Enhanced Lighting to fix the "Black" sphere */}
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={2.5} color="white" />
          <pointLight position={[-10, -10, -10]} intensity={1.5} color={data.is_toxic ? "#ff0000" : "#00d2ff"} />
          
          <PatientModel isToxic={data.is_toxic} substance={substance} />
          <OrbitControls enableZoom={false} />
        </Canvas>

        {/* OVERLAY STATS */}
        <div style={{ position: 'absolute', top: '50px', right: '50px', textAlign: 'right' }}>
           <p style={{ color: '#555', margin: 0, fontSize: '10px', letterSpacing: '2px', fontWeight: 'bold' }}>ESTIMATED RECOVERY</p>
           <h2 style={{ fontSize: '48px', margin: 0, color: data.is_toxic ? '#ff2d2d' : '#00d2ff', fontWeight: '900' }}>
             {data.is_toxic ? `${data.hours_to_safe.toFixed(1)}h` : "STABLE"}
           </h2>
        </div>

        <div style={{ position: 'absolute', bottom: '60px', right: '60px', textAlign: 'right' }}>
          <p style={{ color: '#555', margin: 0, fontSize: '12px', letterSpacing: '1px' }}>PEAK CONCENTRATION</p>
          <h1 style={{ fontSize: '80px', margin: 0, fontWeight: '900', color: data.is_toxic ? '#ff2d2d' : '#00ffcc', lineHeight: '1' }}>
            {data.peak_value.toFixed(2)}
            <span style={{ fontSize: '24px', fontWeight: '300', color: '#222', marginLeft: '10px' }}>mg/L</span>
          </h1>
        </div>
      </div>
    </div>
  );
}