// src/components/Genisleyenkutular.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // ✅ çıkış için
import library from "../data/library.json";
import "./Genisleyenkutular.css"; // ✅ CSS eklendi

export default function Genisleyenkutular() {
  const navigate = useNavigate();

  const [running, setRunning] = useState(false);
  const [numbers, setNumbers] = useState([1, 2, 3, 4, 5]);
  const [size, setSize] = useState(100);
  const [intervalMs, setIntervalMs] = useState(1000);

  const randomNumber = () => {
    const pool = library.numbers || [];
    return pool[Math.floor(Math.random() * pool.length)];
  };

  useEffect(() => {
    let interval;
    if (running) {
      interval = setInterval(() => {
        setSize((prev) => {
          if (prev > 300) {
            setNumbers([
              randomNumber(),
              randomNumber(),
              randomNumber(),
              randomNumber(),
              randomNumber(),
            ]);
            return 100;
          }
          return prev + 20;
        });
      }, intervalMs);
    }
    return () => clearInterval(interval);
  }, [running, intervalMs]);

  const exitExercise = () => {
    setRunning(false);
    navigate("/panel");
  };

  return (
    <div className="genisleyen-container">
      <h2>📦 Genişleyen Kutular Egzersizi</h2>

      <div className="controls">
        <label>Hız (ms): </label>
        <input
          type="number"
          value={intervalMs}
          onChange={(e) => setIntervalMs(Number(e.target.value))}
        />
        <button onClick={() => setRunning(!running)}>
          {running ? "⏸ Durdur" : "▶ Başlat"}
        </button>
        <button className="exit-btn" onClick={exitExercise}>
          ❌ Çıkış
        </button>
      </div>

      {/* Kutular */}
      <div className="shapes" style={{ width: `${size}px`, height: `${size}px` }}>
        <div className="circle center">{numbers[2]}</div>
        <div className="circle top">{numbers[0]}</div>
        <div className="circle bottom">{numbers[1]}</div>
        <div className="circle left">{numbers[3]}</div>
        <div className="circle right">{numbers[4]}</div>
      </div>
    </div>
  );
}
