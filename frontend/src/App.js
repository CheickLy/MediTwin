import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Sphere,
  MeshDistortMaterial,
  Float,
} from "@react-three/drei";

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

function PatientModel({ isToxic, substance, level }) {
  const getColor = () => {
    if (isToxic) return "#ff2d2d";
    if (substance === "alcohol") return "#ffb000";
    if (substance === "caffeine") return "#00ffcc";
    return "#00d2ff";
  };

  const color = getColor();

  return (
    <Float speed={2} rotationIntensity={0.4} floatIntensity={0.5}>
      <Sphere
        args={[1, 100, 100]}
        scale={1.15 + level * 0.03}
      >
        <MeshDistortMaterial
          color={color}
          speed={isToxic ? 4 : 1.5}
          distort={Math.min(level / 15, 0.7)}
          roughness={0.15}
          metalness={0.8}
          emissive={color}
          emissiveIntensity={Math.min(level / 10, 1)}
        />
      </Sphere>
    </Float>
  );
}

export default function App() {
  const [weight, setWeight] = useState(88);
  const [genFactor, setGenFactor] = useState(1.0);
  const [substance, setSubstance] = useState("pill");

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
          `http://127.0.0.1:8000/simulate?weight=${weight}&gen_factor=${genFactor}&substance=${substance}`
        );

        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [weight, genFactor, substance]);

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

  const getBackground = () => {
    if (data.is_toxic) {
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
          width: "360px",
          padding: "40px",
          background: "rgba(10,10,10,0.95)",
          borderRight: "1px solid rgba(255,255,255,0.05)",
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
            marginBottom: "40px",
          }}
        >
          DIGITAL PHARMACOKINETIC ENGINE
        </p>

        {/* Substance */}
        <div style={{ marginBottom: "30px" }}>
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
              padding: "14px",
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
        <div style={{ marginBottom: "30px" }}>
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
        <div style={{ marginBottom: "40px" }}>
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

        {data.is_toxic && (
          <div
            style={{
              background:
                "rgba(255,45,45,0.08)",
              borderLeft:
                "4px solid #ff2d2d",
              padding: "20px",
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
            height: "60%",
            width: "100%",
          }}
        >
          <Canvas camera={{ position: [0, 0, 4] }}>
            <ambientLight intensity={0.5} />
            <pointLight
              position={[10, 10, 10]}
              intensity={2}
            />

            <PatientModel
              isToxic={data.is_toxic}
              substance={substance}
              level={data.peak_value}
            />

            <OrbitControls enableZoom={false} />
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
              color: data.is_toxic
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
          <Metric label="PEAK TIME" value={`${data.peak_time.toFixed(1)} hr`} />
          <Metric label="HALF LIFE" value={`${data.half_life.toFixed(1)} hr`} />
          <Metric label="AUC" value={data.auc.toFixed(1)} />
          <Metric label="PEAK CONC." value={`${data.peak_value.toFixed(2)} mg/L`} />
        </div>

        {/* GRAPH */}
        <div
          style={{
            position: "absolute",
            left: "25px",
            right: "300px",
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
                r={8}
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