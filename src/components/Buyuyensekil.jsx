// src/components/Buyuyensekil.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import library from "../data/library.json";
import "./Buyuyensekil.css";

export default function Buyuyensekil() {
  const navigate = useNavigate();

  const [running, setRunning] = useState(false);
  const [letters, setLetters] = useState(["a", "b", "c", "d"]);
  const [size, setSize] = useState(100);
  const [intervalMs, setIntervalMs] = useState(1000);

  const randomLetter = () => {
    const pool = library.letters || [];
    return pool[Math.floor(Math.random() * pool.length)];
  };

  const newLetters = () => [
    randomLetter(),
    randomLetter(),
    randomLetter(),
    randomLetter(),
  ];

  useEffect(() => {
    let interval;
    if (running) {
      interval = setInterval(() => {
        setSize((prev) => {
          if (prev > 300) {
            setLetters(newLetters());
            return 100;
          } else {
            setLetters(newLetters());
            return prev + 20;
          }
        });
      }, intervalMs);
    }
    return () => clearInterval(interval);
  }, [running, intervalMs]);

  const handleExit = () => {
    setRunning(false);
    setLetters([]);
    navigate("/panel");
  };

  return (
    <div className="buyuyen-container">
      <h2>📏 Büyüyen Şekil Egzersizi</h2>

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
        <button className="exit-btn" onClick={handleExit}>
          ❌ Çıkış
        </button>
      </div>

      {/* Şekil */}
      <div
        className="shape"
        style={{ width: `${size}px`, height: `${size / 2}px` }}
      >
        <div className="center-dot"></div>

        <div className="letter top">{letters[0]}</div>
        <div className="letter bottom">{letters[1]}</div>
        <div className="letter left">{letters[2]}</div>
        <div className="letter right">{letters[3]}</div>
      </div>
    </div>
  );
}
