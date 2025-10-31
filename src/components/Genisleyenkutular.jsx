import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import completeExercise from "../utils/completeExercise"; // ✅ eklendi
import library from "../data/library.json";
import "./Genisleyenkutular.css";

export default function Genisleyenkutular() {
  const navigate = useNavigate();
  const student = JSON.parse(localStorage.getItem("activeStudent") || "{}");

  const [running, setRunning] = useState(false);
  const [numbers, setNumbers] = useState([1, 2, 3, 4, 5]);
  const [size, setSize] = useState(100);
  const [intervalMs, setIntervalMs] = useState(1000);
  const [time, setTime] = useState(0);
  const [duration] = useState(180); // 3 dakika

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

        setTime((prev) => {
          const newTime = prev + 1;
          if (newTime >= duration) {
            clearInterval(interval);
            setRunning(false);
            alert("📦 Genişleyen Kutular Egzersizi tamamlandı!");
            completeExercise(student.kod, student.sinif, navigate); // ✅ ilerleme kaydı
          }
          return newTime;
        });
      }, intervalMs);
    }
    return () => clearInterval(interval);
  }, [running, intervalMs, duration, navigate, student.kod, student.sinif]);

  const exitExercise = () => {
    setRunning(false);
    navigate("/panel");
  };

  return (
    <div className="genisleyen-container">
      <h2>📦 Genişleyen Kutular Egzersizi</h2>
      <p>Kutular büyüdükçe içindeki rakamları gözünle takip et.</p>

      <div className="controls">
        <label>Hız (ms): </label>
        <input
          type="number"
          value={intervalMs}
          onChange={(e) => setIntervalMs(Number(e.target.value))}
          disabled={running}
        />
        <button onClick={() => setRunning(!running)}>
          {running ? "⏸ Durdur" : "▶ Başlat"}
        </button>
        <button className="exit-btn" onClick={exitExercise}>
          ❌ Çıkış
        </button>
      </div>

      {/* Kutular */}
      <div
        className="shapes"
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        <div className="circle center">{numbers[2]}</div>
        <div className="circle top">{numbers[0]}</div>
        <div className="circle bottom">{numbers[1]}</div>
        <div className="circle left">{numbers[3]}</div>
        <div className="circle right">{numbers[4]}</div>
      </div>

      <div className="timer-box">
        <p>⏳ Kalan Süre: {duration - time} sn</p>
      </div>
    </div>
  );
}
