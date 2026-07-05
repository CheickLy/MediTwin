import React, { useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
//useFrame for rotation animation, of human model
import {
  OrbitControls,
  useGLTF,
} from "@react-three/drei";

import "./index.css";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
  ReferenceDot,
} from "recharts";

function Metric({ label, value }) {
  return (
    <div
      style={{
        marginBottom: "20px",
        textAlign: "right",
      }}
    >
      <div
        style={{
          fontSize: "11px",
          color: "#666",
          letterSpacing: "2px",
          marginBottom: "4px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: "22px",
          fontWeight: 600,
          color: "#fff",
        }}
      >
        {value}
      </div>
    </div>
  );
}


import { useRef } from "react";

function HumanModel({ isToxic }) {
  const { scene } = useGLTF("/models/human.glb");
  const meshRef = useRef();

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
    }
  });

  scene.traverse((child) => {
    if (child.isMesh) {
      child.material.color.set( 
        isToxic ? "#ff2d2d" : "#00d2ff"
      );

        child.material.emissive.set(
          isToxic ? "#ff2d2d" : "#00d2ff"
        );

        child.material.emissiveIntensity = 
        isToxic ? 0.6 : 0.25;
    }
  });

  return (
    <primitive
      ref={meshRef}
      object={scene}
      scale={5}
      position={[0, -0.5, 0]}
    />
  );
}

export default function App() {
  const API_URL = import.meta.env.REACT_APP_API_URL;
  
  const [weight, setWeight] = useState(88);
  const [genFactor, setGenFactor] = useState(1.0);
  const [substance, setSubstance] = useState("pill");
  const [dose, setDose] = useState(500);
  const [age, setAge] = useState(18);
  const [liverHealth, setLiverHealth] = useState(1.0);
  const [timeIndex, setTimeIndex] = useState(0);

  const [data, setData] = useState({
    time: [],
    levels: [],
    peak_value: 0,
    peak_time: 0,
    half_life: 0,
    auc: 0,
    hours_to_safe: 0,
    threshold: 0,
    is_toxic: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `${API_URL}/simulate?weight=${weight}&gen_factor=${genFactor}&substance=${substance}&dose=${dose}&age=${age}&liver_health=${liverHealth}`
        );

        const result = await res.json();
        setData(result);
        setTimeIndex(0);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [weight, genFactor, substance, dose, age, liverHealth]);

  const chartData = data.levels.map((level, i) => ({
    time: data.time[i],
    concentration: level,

    safe: 
    level <= data.threshold
      ? level
      : null,

    toxic:  
    level > data.threshold
      ? level
      : null,
  }));

  const currentTime = data.time?.[timeIndex] || 0;
  const currentLevel = data.levels?.[timeIndex] || 0;
  const currentIsToxic = currentLevel > (data.threshold || 0);

  const getBackground = () => {
    if (currentIsToxic) {
      return "radial-gradient(circle at center, rgba(255,45,45,0.12) 0%, #050505 75%)";
    }

    return "radial-gradient(circle at center, rgba(0,210,255,0.10) 0%, #050505 75%)";
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "#050505",
        color: "#fff",
        fontFamily: "'Inter', sans-serif",
        overflow: "hidden",
      }}
    >
      {/* LEFT PANEL */}
      <div
        style={{
          width: "400px",
          padding: "25px",
          background: "rgba(10,10,10,0.95)",
          borderRight: "1px solid rgba(255,255,255,0.01)",
          backdropFilter: "blur(20px)",
          zIndex: 5,

        }}
      >
        <h1
          style={{
            margin: 0,
            color: "#00d2ff",
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "36px",
            fontWeight: 700,
            letterSpacing: "2px",
          }}
        >
          MEDI-TWIN
        </h1>

        <p
          style={{
            color: "#555",
            fontSize: "11px",
            letterSpacing: "3px",
            marginBottom: "10px",
          }}
        >
          DIGITAL PHARMACOKINETIC ENGINE
        </p>

        {/* Substance */}
        <div style={{ marginBottom: "15px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "10px",
              color: "#777",
              fontSize: "12px",
            }}
          >
            SUBSTANCE
          </label>

          <select
            value={substance}
            onChange={(e) => setSubstance(e.target.value)}
            style={{
              width: "100%",
              padding: "13px",
              background: "#111",
              color: "#fff",
              border: "1px solid #222",
              borderRadius: "10px",
            }}
          >
            <option value="pill">💊 Prescription Pill</option>
            <option value="alcohol">🍺 Alcohol</option>
            <option value="caffeine">☕ Caffeine</option>
          </select>
        </div>

        {/* Weight */}
        <div style={{ marginBottom: "15px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "10px",
            }}
          >
            <span style={{ color: "#777" }}>Body Weight</span>

            <span
              style={{
                color: "#00d2ff",
                fontFamily: "'IBM Plex Mono'",
              }}
            >
              {weight} kg
            </span>
          </div>

          <input
            type="range"
            min="40"
            max="150"
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            style={{
              width: "100%",
              accentColor: "#00d2ff",
            }}
          />
        </div>

        {/* Metabolism */}
        <div style={{ marginBottom: "15px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "10px",
            }}
          >
            <span style={{ color: "#777" }}>
              Metabolic Rate
            </span>

            <span
              style={{
                color: "#00d2ff",
                fontFamily: "'IBM Plex Mono'",
              }}
            >
              {genFactor.toFixed(1)}x
            </span>
          </div>

          <input
            type="range"
            min="0.5"
            max="2.5"
            step="0.1"
            value={genFactor}
            onChange={(e) =>
              setGenFactor(Number(e.target.value))
            }
            style={{
              width: "100%",
              accentColor: "#00d2ff",
            }}
          />
        </div>
        
        {/* Dosage */}
        <div style={{ marginBottom: "15px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
            <span style={{ color: "#777" }}>Dosage</span>
            <span style={{ color: "#00d2ff", fontFamily: "'IBM Plex Mono'" }}>
              {dose} mg
            </span>
          </div>

          <input
            type="range"
            min="50"
            max="1000"
            step="50"
            value={dose}
            onChange={(e) => setDose(Number(e.target.value))}
            style={{ width: "100%", accentColor: "#00d2ff" }}
          />
        </div>
        
        {/*Age*/}
        <div style={{ marginBottom: "15px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
            <span style={{ color: "#777" }}>Age</span>
            <span style={{ color: "#00d2ff", fontFamily: "'IBM Plex Mono'" }}>
              {age} years
            </span>
          </div>

          <input
            type="range"
            min= "12"
            max="90"
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            style={{ width: "100%", accentColor: "#00d2ff" }}
          />
        </div>

        {/* Liver Health */}
        <div style={{ marginBottom: "15px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
            <span style={{ color: "#777" }}>Liver Health</span>
            <span style={{ color: "#00d2ff", fontFamily: "'IBM Plex Mono'" }}>
              {liverHealth.toFixed(1)}x
            </span>
          </div>

          <input
            type="range"
            min="0.4"
            max="1.4"
            step="0.1"
            value={liverHealth}
            onChange={(e) => setLiverHealth(Number(e.target.value))}
            style={{ width: "100%", accentColor: "#00d2ff" }}
          />
        </div>

        {currentIsToxic && (
          <div
            style={{
              background:
                "rgba(255,45,45,0.08)",
              borderLeft:
                "4px solid #ff2d2d",
              padding: "10px",
              borderRadius: "8px",
            }}
          >
            <div
              style={{
                color: "#ff2d2d",
                fontWeight: 700,
                marginBottom: "6px",
              }}
            >
              TOXICITY ALERT
            </div>

            <div
              style={{
                fontSize: "12px",
                color: "#999",
              }}
            >
              Predicted concentration exceeds
              therapeutic threshold.
            </div>
          </div>
        )}
      </div>

  
    


      {/* MAIN PANEL */}
      <div
        style={{
          flex: 1,
          position: "relative",
          background: getBackground(),
        }}
      >
        {/* 3D MODEL */}
        <div
          style={{
            height: "100%",
            width: "100%",
          }}
        >
          <Canvas camera={{ position: [0, 0, 4] }}>
            <ambientLight intensity={1} />
            <pointLight
              position={[0, 3, 3]}
              intensity={5}
              color={data.is_toxic ? "#ff2d2d" : "#00d2ff"}
            />

            <HumanModel 
            isToxic={currentIsToxic} 
            />

            {/* <OrbitControls enableZoom={false} /> */}
          </Canvas>
        </div>

        {/* Recovery Time */}
        <div
          style={{
            position: "absolute",
            top: "40px",
            right: "50px",
            textAlign: "right",
          }}
        >
          <div
            style={{
              color: "#666",
              fontSize: "11px",
              letterSpacing: "2px",
            }}
          >
            RECOVERY TIME
          </div>

          <div
            style={{
              fontFamily:
                "'Space Grotesk', sans-serif",
              fontSize: "56px",
              fontWeight: 700,
              color: currentIsToxic
                ? "#ff2d2d"
                : "#00d2ff",
            }}
          >
            {data.is_toxic
              ? `${data.hours_to_safe.toFixed(
                  1
                )}H`
              : "SAFE"}
          </div>
        </div>

        {/* Analytics */}
        <div
          style={{
            position: "absolute", 
            top: "165px",
            right: "50px",
            width: "190px",
            zIndex: 3,
          }}
        > 
          <Metric label="CURRENT" value={`${currentLevel.toFixed(2)} mg/L`} />
          <Metric label="PEAK TIME" value={`${data.peak_time.toFixed(1)} hr`} />
          <Metric label="HALF LIFE" value={`${data.half_life.toFixed(1)} hr`} />
          <Metric label="AUC" value={data.auc.toFixed(1)} />
          <Metric label="PEAK CONC." value={`${data.peak_value.toFixed(2)} mg/L`} />
        </div>

        <div
          style={{
            position: "absolute",
            right: "50px",
            bottom: "40px",
            width: "220px",
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "14px",
            padding: "15px",
            zIndex: 4,
          }}
        >
          <div
            style={{
              color: "#666",
              fontSize: "11px",
              letterSpacing: "2px",
              marginBottom: "10px",
            }}
          >
            SIMULATION TIME
          </div>

          <div
            style={{
              color: currentIsToxic ? "#ff2d2d" : "#00d2ff",
              fontFamily: "'IBM Plex Mono'",
              marginBottom: "10px",
            }}
          >
            {currentTime.toFixed(1)} hr
          </div>

          <input
            type="range"
            min="0"
            max={Math.max(data.levels.length - 1, 0)}
            value={timeIndex}
            onChange={(e) => setTimeIndex(Number(e.target.value))}
            style={{
              width: "100%",
              accentColor: currentIsToxic ? "#ff2d2d" : "#00d2ff",
            }}
          />
        </div>


        {/* GRAPH */}
        <div
          style={{
            position: "absolute",
            left: "25px",
            right: "585px",
            bottom: "25px",
            height: "260px",
            background:
              "rgba(0,0,0,0.45)",
            backdropFilter: "blur(20px)",
            border:
              "1px solid rgba(255,255,255,0.06)",
            borderRadius: "18px",
            padding: "15px",
          }}
        >
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <AreaChart data={chartData}>
              <ReferenceArea
                y1={data.threshold}
                y2={data.peak_value + 10}
                fill="#ff2d2d"
                fillOpacity={0.08}
              />

              <ReferenceLine
                y={data.threshold}
                stroke="#ff2d2d"
                strokeDasharray="5 5"
              />

              <ReferenceDot
                x={data.peak_time}
                y={data.peak_value}
                r={6}
                fill="#ffffff"
                stroke="#00d2ff"
                strokeWidth={3}
                label={{
                  value: `Peak ${data.peak_value.toFixed(2)} mg/L`,
                  position: 'top',
                  fill: '#ffffff',
                  fontSize: 12,
                }}
              />

              <ReferenceDot
                x={currentTime}
                y={currentLevel}
                r={6}
                fill={currentIsToxic ? "#ff2d2d" : "#00d2ff"}
                stroke="#ffffff"
                strokeWidth={2}
                label={{
                  value: `Now ${currentLevel.toFixed(2)}`,
                  position: "bottom",
                  fill: currentIsToxic ? "#ff2d2d" : "#00d2ff",
                  fontSize: 11,
              }}
            />

              <XAxis
                dataKey="time"
                stroke="#777"
                tickFormatter={(value) => `${value.toFixed(0)} h`}
                ticks={[0,4,8,12,16,20,24]}
              />

              <YAxis stroke="#777" />

              <Tooltip />

              <Area
                type="monotone"
                dataKey="concentration"
                stroke="#00d2ff"
                fill="#00d2ff"
                fillOpacity={0.15}
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
